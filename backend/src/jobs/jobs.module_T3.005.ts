/**
 * [S3][T3.005] - JobsModule atualizado
 * Inclui todos os jobs: retenção de dados e salvamento de transcrições
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Jobs
import { RetentionJob } from './retention.job_T1.005';
import { TranscriptSaveJob } from './transcript_save.job_T3.005';

// Controllers
import { JobsController } from './jobs.controller_T1.005';

// Dependencies
import { PrismaModule } from '../prisma/prisma.module_T1.002';
import { AuditModule } from '../modules/audit/audit.module_T1.005';
import { ChatsModule } from '../modules/chats/chats.module_T3.005';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuditModule,
    ChatsModule, // Necessário para o MessagesService
  ],
  controllers: [JobsController],
  providers: [
    RetentionJob,
    TranscriptSaveJob,
  ],
  exports: [
    RetentionJob,
    TranscriptSaveJob,
  ],
})
export class JobsModule {}
