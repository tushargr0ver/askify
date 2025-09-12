import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import type { AttributeInfo } from "langchain/chains/query_constructor";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from 'langchain/text_splitter';

@Processor('file-processing')
export class FileProcessorWorker {
  private readonly logger = new Logger(FileProcessorWorker.name);

  @Process('process-file')
  async processFile(job: Job<any>) {
        const {path} = job.data
        this.logger.log(`Processing file at path: ${path}`);

        const loader = new PDFLoader(path)
        const docs = await loader.load()

        // const textSplitter = new CharacterTextSplitter({
        //     chunkSize: 300,
        //     chunkOverlap: 0
        // });

        // const texts = await textSplitter.splitDocuments(docs);

         this.logger.log(docs);

        const embeddings = new OpenAIEmbeddings({
          model: 'text-embedding-3-small',
          openAIApiKey: process.env.OPENAI_API_KEY
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          {
            url: 'http://localhost:6333',
            collectionName: 'documents',
          }
        )

        await vectorStore.addDocuments(docs);

        this.logger.log(`All docs are added to the vector store.`);
       
 
}
}