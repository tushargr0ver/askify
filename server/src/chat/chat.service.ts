import { Injectable } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Request, Response } from 'express';
import {OpenAI} from 'openai';


@Injectable()
export class ChatService {
    
    async docChat(req: Request, res: Response) {

        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        const embeddings = new OpenAIEmbeddings({
                  model: 'text-embedding-3-small',
                  openAIApiKey: process.env.OPENAI_API_KEY
                });

        const userQuery = req.body.query;
        
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
      url: 'http://localhost:6333',
      collectionName: 'documents',
        }
  );

    const ret = vectorStore.asRetriever({
        k: 2,
  });
    const result = await ret.invoke(userQuery);

    const SYSTEM_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Context:
    ${JSON.stringify(result)}`

    const chatResult = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userQuery },
        ],
      });

    return res.json({
        message: chatResult.choices[0].message.content,
        docs: result,
    })
    }

    async repoChat(req: Request, res: Response) {
      const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        const embeddings = new OpenAIEmbeddings({
                  model: 'text-embedding-3-small',
                  openAIApiKey: process.env.OPENAI_API_KEY
                });

        const userQuery = req.body.query;
        
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
      url: 'http://localhost:6333',
      collectionName: 'documents',
        }
  );

    const ret = vectorStore.asRetriever({
        k: 2,
  });
    const result = await ret.invoke(userQuery);

    const SYSTEM_PROMPT = `You are a helpful AI assistant for programming. Use the following pieces of codebase to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Context:
    ${JSON.stringify(result)}`

    const chatResult = await client.chat.completions.create({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userQuery },
        ],
      });

    return res.json({
        message: chatResult.choices[0].message.content,
        // docs: result,
    })
    }
}
