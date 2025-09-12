// src/repository/repository-processor.worker.ts
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from '@langchain/core/documents';

const execAsync = promisify(exec);

@Processor('repository-processing')
export class RepositoryProcessorWorker {
  private readonly logger = new Logger(RepositoryProcessorWorker.name);
  private readonly tempDir = path.join(process.cwd(), 'temp-repos');

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  @Process('process-repository')
  async processRepository(job: Job<any>) {
    try {
      const { url } = job.data;
      this.logger.log(`Processing repository: ${url}`);

      // Extract repo name from URL
      const repoName = url.split('/').pop();
      const repoDir = path.join(this.tempDir, `${repoName}-${Date.now()}`);

      // Clone the repository
      await job.progress(10);
      this.logger.log(`Cloning repository to ${repoDir}`);
      await execAsync(`git clone ${url} ${repoDir}`);
      
      // Read code files
      await job.progress(30);
      const codeFiles = await this.getCodeFiles(repoDir);
      this.logger.log(`Found ${codeFiles.length} code files`);
      
      // Process files into documents
      await job.progress(50);
      const docs = await this.processFiles(codeFiles, repoDir);
      
      // Store in vector database
      await job.progress(70);
      await this.storeVectors(docs);
      
      // Cleanup
      await job.progress(90);
      fs.rmSync(repoDir, { recursive: true, force: true });
      
      await job.progress(100);
      this.logger.log(`Repository processing complete: ${url}`);
      
      return { 
        success: true, 
        filesProcessed: codeFiles.length 
      };
    } catch (error) {
      this.logger.error(`Error processing repository: ${error.message}`);
      throw error;
    }
  }

  private async getCodeFiles(dir: string): Promise<string[]> {
    // Get all code files recursively (skip node_modules, .git, etc.)
    const { stdout } = await execAsync(
      `find ${dir} -type f -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" -o -name "*.go" | grep -v "node_modules" | grep -v ".git"`
    );
    return stdout.split('\n').filter(Boolean);
  }

  private async processFiles(files: string[], baseDir: string): Promise<Document[]> {
    const docs: Document[] = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(baseDir, file);
        
        docs.push(
          new Document({
            pageContent: content,
            metadata: {
              source: relativePath,
              type: path.extname(file).substring(1), // Remove dot from extension
            },
          })
        );
      } catch (error) {
        this.logger.warn(`Error processing file ${file}: ${error.message}`);
      }
    }
    
    return docs;
  }

  private async storeVectors(docs: Document[]) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: 'http://localhost:6333',
        collectionName: 'documents',
      }
    );

    await vectorStore.addDocuments(docs);
    this.logger.log(`Added ${docs.length} documents to vector store`);
  }
}