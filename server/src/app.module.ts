import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
// No longer need to import the controller directly
import { FileUploadModule } from './file-upload/file-upload.module';
import { BullModule } from '@nestjs/bull';
import { ChatModule } from './chat/chat.module';
import { RepositoryModule } from './repository/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make .env variables available everywhere
    }),
    BullModule.forRoot({
      redis: { host: 'localhost', port: 6379 },
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    FileUploadModule,
    ChatModule,
    RepositoryModule, // This module provides the FileUploadController
  ],
  // The controllers array in AppModule should only contain controllers
  // that belong directly to AppModule, not those from other modules.
  // Since you don't have any, it can be empty or removed.
  controllers: [], 
})
export class AppModule {}
