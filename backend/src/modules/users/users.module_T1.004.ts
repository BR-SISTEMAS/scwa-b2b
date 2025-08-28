import { Module } from '@nestjs/common';
import { UsersService_T1_004 } from './users.service_T1.004';
import { UsersController_T1_004 } from './users.controller_T1.004';
import { PrismaModule } from '../../prisma/prisma.module_T1.002';
import { AuthModule_T1_003 } from '../auth/auth.module_T1.003';
import { AuthService_T1_004 } from '../auth/auth.service_T1.004';

@Module({
  imports: [PrismaModule, AuthModule_T1_003],
  controllers: [UsersController_T1_004],
  providers: [UsersService_T1_004, AuthService_T1_004],
  exports: [UsersService_T1_004],
})
export class UsersModule_T1_004 {}
