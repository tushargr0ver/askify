// src/file-upload/file-upload.controller.ts

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Res,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { of } from 'rxjs';
import type { Response } from 'express';
import { FileUploadService } from './file-upload.service'; // Import the service

// We can keep these helpers here or move them to a separate utils file
export const editFileName = (req, file, callback) => {
  // ... (same as before)
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const docFileFilter = (req, file, callback) => {
  // ... (same as before)
  if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
    return callback(new BadRequestException('Only document files are allowed!'), false);
  }
  callback(null, true);
};

@Controller('file-upload')
export class FileUploadController {
  // Inject the service through the constructor
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: docFileFilter,
      limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body('chatId') chatId: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Delegate the logic to the service
    return this.fileUploadService.handleFileUpload(file, chatId);
  }
  
  // This endpoint can remain as it is
  @Get(':filename')
  seeUploadedFile(@Param('filename') filename: string, @Res() res: Response) {
    return of(res.sendFile(join(process.cwd(), 'uploads/' + filename)));
  }
}