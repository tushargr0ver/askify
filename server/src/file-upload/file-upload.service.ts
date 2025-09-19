
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';


@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    @InjectQueue('file-processing') private fileProcessingQueue: Queue,
  ) {}

  async handleFileUpload(file: Express.Multer.File, chatId: string) {
    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }
    this.logger.log(`Queuing file for processing: ${file.originalname}, size: ${file.size}`);

    const job = await this.fileProcessingQueue.add('process-file',{
        filename: file.originalname,
        destination: file.destination,
        path: file.path,
        chatId: chatId
    })

    const response = {
      message: 'File queued for processing!',
      originalName: file.originalname,
      filename: file.filename,
      filePath: `/file-upload/${file.filename}`,
      jobId: job.id
    };

    return response;
  }

  async getJobStatus(jobId: string) {
    const job = await this.fileProcessingQueue.getJob(jobId);
    
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