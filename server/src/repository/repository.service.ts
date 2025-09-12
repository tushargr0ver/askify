// src/repository/repository.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { RepositoryUrlDto } from './dto/repository-url.dto';

@Injectable()
export class RepositoryService {
  private readonly logger = new Logger(RepositoryService.name);

  constructor(
    @InjectQueue('repository-processing') private repoProcessingQueue: Queue,
  ) {}

  async processRepositoryUrl(repoDto: RepositoryUrlDto) {
    this.logger.log(`Queueing repository for processing: ${repoDto.url}`);

    const job = await this.repoProcessingQueue.add('process-repository', {
      url: repoDto.url,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Repository queued for processing!',
      url: repoDto.url,
      jobId: job.id,
    };
  }
}