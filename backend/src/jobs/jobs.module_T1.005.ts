import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RetentionJob } from './retention.job_T1.005';
import { JobsController } from './jobs.controller_T1.005';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../modules/audit/audit.module_T1.005';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuditModule,
  ],
  controllers: [JobsController],
  providers: [RetentionJob],
  exports: [RetentionJob],
})
export class JobsModule {}
