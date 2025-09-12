// src/repository/repository.controller.ts
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { RepositoryUrlDto } from './dto/repository-url.dto';

@Controller('repository')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @Post()
  async processRepository(@Body(ValidationPipe) repoDto: RepositoryUrlDto) {
    return this.repositoryService.processRepositoryUrl(repoDto);
  }
}