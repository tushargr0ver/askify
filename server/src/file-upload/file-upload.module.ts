// src/file-upload/file-upload.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileProcessorWorker } from './file-processor.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'file-processing',
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileProcessorWorker],
})
export class FileUploadModule {}