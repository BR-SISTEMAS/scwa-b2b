import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: 'user' | 'agent' | 'manager' | 'admin';
  companyId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    // This will be attached to the request as req.user
    return { 
      userId: payload.sub, 
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId
    };
  }
}
