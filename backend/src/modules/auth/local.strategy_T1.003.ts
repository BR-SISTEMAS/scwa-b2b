import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    // Placeholder validation for scaffolding T1.003
    // Replace with AuthService.validateUser(email, password)
    if (!email || !password) {
      throw new UnauthorizedException();
    }
    return { userId: 'placeholder', email };
  }
}

