// src/repository/repository.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RepositoryService } from './repository.service';
import { ProcessRepositoryDto } from './dto/repository-url.dto';

@Controller('repository')
@UseGuards(AuthGuard('jwt'))
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @Post('process')
  async processRepository(
    @Body(ValidationPipe) processRepositoryDto: ProcessRepositoryDto,
  ) {
    return this.repositoryService.processRepository(
      processRepositoryDto.url,
      processRepositoryDto.chatId,
    );
  }

  @Get('job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.repositoryService.getJobStatus(jobId);
  }
}