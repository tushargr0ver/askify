import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RepositoryService } from './repository.service';
import { RepositoryController } from './repository.controller';
import { RepositoryProcessorWorker } from './repository-processor.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'repository-processing',
    }),
  ],
  controllers: [RepositoryController],
  providers: [RepositoryService, RepositoryProcessorWorker],
  exports: [RepositoryService],
})
export class RepositoryModule {}
