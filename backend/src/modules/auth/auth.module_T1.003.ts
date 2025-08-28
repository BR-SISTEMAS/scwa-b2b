import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy_T1.003';
import { LocalStrategy } from './local.strategy_T1.003';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, LocalStrategy],
  exports: [JwtStrategy, LocalStrategy, JwtModule, PassportModule],
})
export class AuthModule_T1_003 {}

