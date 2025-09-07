import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  // The AuthGuard('local') will trigger our LocalStrategy
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // req.user is populated by Passport from the LocalStrategy's validate() method
    return this.authService.login(req.user);
  }

  // The AuthGuard('jwt') will trigger our JwtStrategy
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    // req.user is populated by Passport from the JwtStrategy's validate() method
    return req.user;
  }
}