import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class RepositoryService {
  private readonly logger = new Logger(RepositoryService.name);

  constructor(
    @InjectQueue('repository-processing')
    private repositoryProcessingQueue: Queue,
  ) {}

  async processRepository(url: string, chatId: string) {
    this.logger.log(`Queuing repository processing for: ${url}, chat: ${chatId}`);
    
    const job = await this.repositoryProcessingQueue.add('process-repository', {
      url,
      chatId,
    });

    return {
      message: 'Repository processing started',
      jobId: job.id,
      url,
      chatId,
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.repositoryProcessingQueue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
    };
  }
}