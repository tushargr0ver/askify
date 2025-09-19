import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RepositoryService } from './repository.service';
import { ProcessRepositoryDto } from './dto/repository-url.dto';
import { UsersService } from '../users/users.service';

@Controller('repository')
@UseGuards(AuthGuard('jwt'))
export class RepositoryController {
  constructor(
    private readonly repositoryService: RepositoryService,
    private readonly usersService: UsersService,
  ) {}

  @Post('process')
  async processRepository(
    @Body(ValidationPipe) processRepositoryDto: ProcessRepositoryDto,
    @Request() req,
  ) {
    const usageCheck = await this.usersService.canSendMessage(req.user.userId);
    if (!usageCheck.canSend) {
      throw new BadRequestException({
        message: usageCheck.reason,
        usage: usageCheck.usage,
        code: 'USAGE_LIMIT_EXCEEDED'
      });
    }

    await this.usersService.incrementRepoUsage(req.user.userId);

    const result = await this.repositoryService.processRepository(
      processRepositoryDto.url,
      processRepositoryDto.chatId,
    );

    const updatedUsage = await this.usersService.getUserUsage(req.user.userId);

    return {
      ...result,
      usage: updatedUsage,
    };
  }

  @Get('job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.repositoryService.getJobStatus(jobId);
  }
}