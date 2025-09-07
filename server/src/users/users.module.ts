import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // Export the service so it can be used in the AuthModule
})
export class UsersModule {}