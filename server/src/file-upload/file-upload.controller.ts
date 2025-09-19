
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Get,
  Param,
  Res,
  Body,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { of } from 'rxjs';
import type { Response } from 'express';
import { FileUploadService } from './file-upload.service';
import { UsersService } from '../users/users.service';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const docFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
    return callback(new BadRequestException('Only document files are allowed!'), false);
  }
  callback(null, true);
};

@Controller('file-upload')
@UseGuards(AuthGuard('jwt'))
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: docFileFilter,
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('chatId') chatId: string, @Request() req) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const usageCheck = await this.usersService.canSendMessage(req.user.userId);
    if (!usageCheck.canSend) {
      throw new BadRequestException({
        message: usageCheck.reason,
        usage: usageCheck.usage,
        code: 'USAGE_LIMIT_EXCEEDED'
      });
    }

    await this.usersService.incrementUploadUsage(req.user.userId);

    const result = await this.fileUploadService.handleFileUpload(file, chatId);

    const updatedUsage = await this.usersService.getUserUsage(req.user.userId);

    return {
      ...result,
      usage: updatedUsage,
    };
  }

  @Get('job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.fileUploadService.getJobStatus(jobId);
  }
  
  @Get(':filename')
  seeUploadedFile(@Param('filename') filename: string, @Res() res: Response) {
    return of(res.sendFile(join(process.cwd(), 'uploads/' + filename)));
  }
}