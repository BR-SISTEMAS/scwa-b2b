/**
 * [S3][T3.005] - AppModule consolidado
 * Módulo principal da aplicação com todos os módulos integrados
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Base modules
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Database
import { PrismaModule } from './prisma/prisma.module_T1.002';

// Authentication
import { AuthModule } from './modules/auth/auth.module_T1.003';

// Business modules
import { UsersModule } from './modules/users/users.module_T1.004';
import { CompaniesModule } from './modules/companies/companies.module_T1.004';
import { ChatsModule } from './modules/chats/chats.module_T3.005';
import { AuditModule } from './modules/audit/audit.module_T1.005';

// Jobs
import { JobsModule } from './jobs/jobs.module_T3.005';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Scheduling and Events
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    
    // Database
    PrismaModule,
    
    // Authentication
    AuthModule,
    
    // Business modules
    UsersModule,
    CompaniesModule,
    ChatsModule,
    AuditModule,
    
    // Background jobs
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
