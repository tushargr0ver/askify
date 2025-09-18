import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Request, Response } from 'express';
import {OpenAI} from 'openai';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { getModelById, getDefaultModel, getRecommendedModel, AVAILABLE_MODELS } from './models.config';


@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createChat(userId: number, createChatDto: CreateChatDto) {
    const chat = await this.prisma.chat.create({
      data: {
        title: createChatDto.title || `New ${createChatDto.type.toLowerCase()} chat`,
        type: createChatDto.type,
        userId,
      },
      include: {
        messages: true,
      },
    });

    return chat;
  }

  async getUserChats(userId: number) {
    const chats = await this.prisma.chat.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get last message for preview
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return chats;
  }

  async getChat(chatId: string, userId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: { 
        id: chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

 async sendMessage(chatId: string, userId: number, sendMessageDto: SendMessageDto) {
    // Verify chat belongs to user and get user preferences
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { user: true }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Determine which model to use
    let selectedModel = sendMessageDto.model || chat.user.preferredModel || getDefaultModel().id;
    
    // Validate model exists
    const modelConfig = getModelById(selectedModel);
    if (!modelConfig) {
      this.logger.warn(`Invalid model ${selectedModel}, falling back to default`);
      selectedModel = getDefaultModel().id;
    }

    // Save user message
    const userMessage = await this.prisma.message.create({
      data: {
        content: sendMessageDto.content,
        role: 'USER',
        chatId,
      },
    });

    // Process the message based on chat type - pass chatId and model
    let response: string;
    if (chat.type === 'DOCUMENT') {
      response = await this.processDocumentChat(sendMessageDto.content, chatId, selectedModel);
    } else {
      response = await this.processRepositoryChat(sendMessageDto.content, chatId, selectedModel);
    }

    // Save assistant message with model info
    const assistantMessage = await this.prisma.message.create({
      data: {
        content: response,
        role: 'ASSISTANT',
        model: selectedModel,
        chatId,
      },
    });

    // Update chat timestamp
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

   async deleteChat(chatId: string, userId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Clean up the Qdrant collection
    await this.cleanupChatCollection(chatId);

    await this.prisma.chat.delete({
      where: { id: chatId },
    });

    return { message: 'Chat deleted successfully' };
  }

  private async cleanupChatCollection(chatId: string) {
    try {
      const response = await fetch(`http://localhost:6333/collections/chat_${chatId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        this.logger.log(`Deleted Qdrant collection for chat ${chatId}`);
      } else {
        this.logger.warn(`Collection chat_${chatId} may not exist or already deleted`);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete Qdrant collection for chat ${chatId}: ${error.message}`);
      // Don't throw - we still want to delete the chat from DB
    }
  }

  private async getOrCreateVectorStore(chatId: string) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const collectionName = `chat_${chatId}`;
    
    try {
      return await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: 'http://localhost:6333',
        collectionName,
      });
    } catch (error) {
      this.logger.warn(`Collection ${collectionName} doesn't exist yet. Creating empty collection.`);
      // Create empty collection - user needs to upload files/repo first
      return await QdrantVectorStore.fromDocuments(
        [],
        embeddings,
        {
          url: 'http://localhost:6333',
          collectionName,
        }
      );
    }
  }

  private async processDocumentChat(query: string, chatId: string, model: string): Promise<string> {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await this.getOrCreateVectorStore(chatId);
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(query);

    // Check if we have any context
    if (!result || result.length === 0) {
      return "I don't have any documents uploaded for this chat yet. Please upload some documents first.";
    }

    const SYSTEM_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Context:
    ${JSON.stringify(result)}`;

    // Get model config to determine provider
    const modelConfig = getModelById(model);
    if (!modelConfig) {
      throw new Error(`Invalid model: ${model}`);
    }

    let chatResult;
    if (modelConfig.provider === 'gemini') {
      // For Gemini models, we can use OpenAI SDK with Gemini endpoint
      // This requires setting up a proxy or using a service that bridges Gemini to OpenAI format
      // For now, we'll fall back to a compatible OpenAI model
      this.logger.warn(`Gemini model ${model} not yet implemented, falling back to gpt-4o-mini`);
      chatResult = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
      });
    } else {
      // OpenAI models
      chatResult = await client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
      });
    }

    return chatResult.choices[0].message.content ? chatResult.choices[0].message.content : 'Sorry, I could not generate a response.';
  }

  private async processRepositoryChat(query: string, chatId: string, model: string): Promise<string> {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await this.getOrCreateVectorStore(chatId);
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(query);

    // Check if we have any context
    if (!result || result.length === 0) {
      return "I don't have any repository code uploaded for this chat yet. Please process a repository first.";
    }

    const SYSTEM_PROMPT = `You are a helpful AI assistant for programming. Use the following pieces of codebase to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Context:
    ${JSON.stringify(result)}`;

    // Get model config to determine provider
    const modelConfig = getModelById(model);
    if (!modelConfig) {
      throw new Error(`Invalid model: ${model}`);
    }

    let chatResult;
    if (modelConfig.provider === 'gemini') {
      // For Gemini models, we can use OpenAI SDK with Gemini endpoint
      // This requires setting up a proxy or using a service that bridges Gemini to OpenAI format
      // For now, we'll fall back to a compatible OpenAI model
      this.logger.warn(`Gemini model ${model} not yet implemented, falling back to gpt-4o-mini`);
      chatResult = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
      });
    } else {
      // OpenAI models
      chatResult = await client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
      });
    }

    return chatResult.choices[0].message.content ? chatResult.choices[0].message.content : 'Sorry, I could not generate a response.';
  }
}