// src/file-upload/file-upload.service.ts

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';


@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    @InjectQueue('file-processing') private fileProcessingQueue: Queue,
  ) {}

  // This is where your business logic for the uploaded file will go.
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
}