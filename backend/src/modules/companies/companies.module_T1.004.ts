import { Module } from '@nestjs/common';
import { CompaniesService_T1_004 } from './companies.service_T1.004';
import { CompaniesController_T1_004 } from './companies.controller_T1.004';
import { PrismaModule } from '../../prisma/prisma.module_T1.002';

@Module({
  imports: [PrismaModule],
  controllers: [CompaniesController_T1_004],
  providers: [CompaniesService_T1_004],
  exports: [CompaniesService_T1_004],
})
export class CompaniesModule_T1_004 {}
