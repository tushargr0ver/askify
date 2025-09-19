import { Controller, Get, Patch, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateLimitsDto } from './dto/update-limits.dto';
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

  @Get('usage')
  async getUserUsage(@Request() req) {
    return this.usersService.getUserUsage(req.user.userId);
  }

  @Patch(':userId/limits')
  async updateUserLimits(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateLimitsDto: UpdateLimitsDto
  ) {
    return this.usersService.updateUserLimits(userId, updateLimitsDto);
  }

  @Get(':userId/usage')
  async getUserUsageById(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.getUserUsage(userId);
  }
}
