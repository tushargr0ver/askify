import { Module } from '@nestjs/common';
import { RepositoryController } from './repository.controller';
import { RepositoryService } from './repository.service';
import { BullModule } from '@nestjs/bull';
import { RepositoryProcessorWorker } from './repository-processor.worker';


@Module({
  imports:[
    BullModule.registerQueue({
      name: 'repository-processing',
    }),
  ],
  controllers: [RepositoryController],
  providers: [RepositoryService, RepositoryProcessorWorker],
})
export class RepositoryModule {}
