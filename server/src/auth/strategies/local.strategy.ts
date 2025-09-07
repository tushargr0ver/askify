import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // By default, passport-local expects 'username' and 'password'.
    // We are overriding it to use 'email' instead of 'username'.
    super({ usernameField: 'email' });
  }

  /**
   * This method is automatically called by the @UseGuards(AuthGuard('local')) decorator.
   * Passport takes the credentials (email and password from the request body) and invokes this function.
   * @param email The email extracted from the request body.
   * @param pass The password extracted from the request body.
   * @returns The user object if validation is successful, or throws an exception.
   */
  async validate(email: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}