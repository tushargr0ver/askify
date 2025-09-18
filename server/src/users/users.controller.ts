import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { AVAILABLE_MODELS, getDefaultModel } from '../chat/models.config';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('preferences')
  async getPreferences(@Request() req) {
    const preferences = await this.usersService.getPreferences(req.user.userId);
    return {
      ...preferences,
      availableModels: AVAILABLE_MODELS,
      defaultModel: getDefaultModel(),
    };
  }

  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() updatePreferencesDto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.userId, updatePreferencesDto);
  }
}
