import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Request, Response } from 'express';
import {OpenAI} from 'openai';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { getModelById, getDefaultModel, getRecommendedModel, AVAILABLE_MODELS } from './models.config';


@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  /**
   * Get a friendly model display name for user-facing messages
   */
  private getModelDisplayName(modelId: string): string {
    const modelConfig = getModelById(modelId);
    return modelConfig?.name || modelId;
  }

  /**
   * Generate a polished error message with Askify branding
   */
  private generateErrorMessage(modelId: string, context: 'document' | 'repository'): string {
    const modelName = this.getModelDisplayName(modelId);
    const contextEmoji = context === 'document' ? '📄' : '💻';
    
    return `${contextEmoji} I apologize, but I'm having trouble generating a response right now. This could be due to:

• Temporary API issues
• Network connectivity problems  
• Model availability

Please try:
✓ Asking your question again in a moment
✓ Using a different approach or rephrasing
✓ Switching to a different AI model

*Powered by Askify with ${modelName}*`;
  }

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
          take: 1,
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
    const usageCheck = await this.usersService.canSendMessage(userId);
    if (!usageCheck.canSend) {
      throw new BadRequestException({
        message: usageCheck.reason,
        usage: usageCheck.usage,
        code: 'USAGE_LIMIT_EXCEEDED'
      });
    }

    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { user: true }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    let selectedModel = sendMessageDto.model || chat.user.preferredModel || getDefaultModel().id;
    
    const modelConfig = getModelById(selectedModel);
    if (!modelConfig) {
      this.logger.warn(`Invalid model ${selectedModel}, falling back to default`);
      selectedModel = getDefaultModel().id;
    }

    await this.usersService.incrementUsage(userId);

    const userMessage = await this.prisma.message.create({
      data: {
        content: sendMessageDto.content,
        role: 'USER',
        chatId,
      },
    });

    let response: string;
    try {
      if (chat.type === 'DOCUMENT') {
        response = await this.processDocumentChat(sendMessageDto.content, chatId, selectedModel);
      } else {
        response = await this.processRepositoryChat(sendMessageDto.content, chatId, selectedModel);
      }
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      response = this.generateErrorMessage(selectedModel, chat.type === 'DOCUMENT' ? 'document' : 'repository');
    }

    const assistantMessage = await this.prisma.message.create({
      data: {
        content: response,
        role: 'ASSISTANT',
        model: selectedModel,
        chatId,
      },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const updatedUsage = await this.usersService.getUserUsage(userId);

    return {
      userMessage,
      assistantMessage,
      usage: updatedUsage,
    };
  }

   async deleteChat(chatId: string, userId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

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
    const vectorStore = await this.getOrCreateVectorStore(chatId);
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(query);

    if (!result || result.length === 0) {
      const modelConfig = getModelById(model);
      const modelName = modelConfig?.name || model;
      return `👋 Hi! I'm **Askify**, powered by **${modelName}**. 

I don't see any documents uploaded for this chat yet. Please upload some documents first, and I'll be happy to help you analyze and answer questions about them!

📄 You can upload PDFs, text files, and other documents to get started.`;
    }

    const modelConfig = getModelById(model);
    const modelName = modelConfig?.name || model;
    const SYSTEM_PROMPT = `You are Askify, an intelligent AI assistant powered by ${modelName}. You specialize in helping users understand and analyze their documents with precision and clarity.

🎯 Your core capabilities:
- Analyze and summarize documents with accuracy
- Answer questions based on document content
- Explain complex concepts in accessible terms
- Provide insights, key takeaways, and actionable advice
- Always cite relevant sections when possible
- Support multiple document formats and languages

📋 Response guidelines:
- Be helpful, accurate, and professional
- Use markdown formatting for enhanced readability
- Structure responses with headers, lists, and emphasis when appropriate
- If information isn't in the provided context, clearly state the limitation
- Focus on the user's specific question while providing comprehensive answers
- When appropriate, suggest follow-up questions or related topics

🔍 Context from uploaded documents:
${JSON.stringify(result)}

Remember: You are Askify powered by ${modelName}, always ready to help users unlock insights from their documents.`;

    if (!modelConfig) {
      throw new Error(`Invalid model: ${model}`);
    }

    let client: OpenAI;
    let requestModel: string;

    if (modelConfig.provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        this.logger.warn('GEMINI_API_KEY not configured, falling back to OpenAI');
        client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        requestModel = 'gpt-4o-mini';
      } else {
        client = new OpenAI({
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        requestModel = model;
      }
    } else {
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      requestModel = model;
    }

    const chatResult = await client.chat.completions.create({
      model: requestModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    });

    return chatResult.choices[0].message.content ? chatResult.choices[0].message.content : this.generateErrorMessage(model, 'document');
  }

  private async processRepositoryChat(query: string, chatId: string, model: string): Promise<string> {
    const vectorStore = await this.getOrCreateVectorStore(chatId);
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(query);

    if (!result || result.length === 0) {
      const modelConfig = getModelById(model);
      const modelName = modelConfig?.name || model;
      return `👋 Hi! I'm **Askify**, powered by **${modelName}**. 

I don't see any repository code uploaded for this chat yet. Please process a repository first, and I'll be ready to help you understand the codebase!

🔗 You can add a GitHub repository URL to get started with code analysis and Q&A.`;
    }

    const modelConfig = getModelById(model);
    const modelName = modelConfig?.name || model;
    const SYSTEM_PROMPT = `You are Askify, an intelligent AI coding assistant powered by ${modelName}. You specialize in helping developers understand and work with codebases efficiently and effectively.

💻 Your core capabilities:
- Analyze code structure, architecture, and design patterns
- Explain code functionality, logic, and algorithms
- Help with debugging, optimization, and performance improvements
- Suggest best practices and modern development approaches
- Answer questions about specific implementations and techniques
- Provide code examples, snippets, and detailed explanations
- Review code quality and suggest refactoring opportunities

🛠️ Response guidelines:
- Be technical yet clear and accessible in your explanations
- Use markdown formatting with proper code syntax highlighting
- Reference specific files, functions, classes, or code sections when relevant
- If information isn't in the provided codebase, clearly state the limitation
- Focus on practical, actionable advice that developers can implement
- Structure responses with clear headings, code blocks, and explanations
- When appropriate, suggest related improvements or considerations

🔍 Codebase context:
${JSON.stringify(result)}

Remember: You are Askify powered by ${modelName}, your trusted coding companion for understanding and improving codebases.`;

    if (!modelConfig) {
      throw new Error(`Invalid model: ${model}`);
    }

    let client: OpenAI;
    let requestModel: string;

    if (modelConfig.provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        this.logger.warn('GEMINI_API_KEY not configured, falling back to OpenAI');
        client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        requestModel = 'gpt-4o-mini';
      } else {
        client = new OpenAI({
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        requestModel = model;
      }
    } else {
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      requestModel = model;
    }

    const chatResult = await client.chat.completions.create({
      model: requestModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    });

    return chatResult.choices[0].message.content ? chatResult.choices[0].message.content : this.generateErrorMessage(model, 'repository');
  }
}