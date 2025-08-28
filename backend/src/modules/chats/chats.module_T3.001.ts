import { Module } from '@nestjs/common'
import { ChatsController_T3_001 } from './chats.controller_T3.001'
import { ChatsService_T3_001 } from './chats.service_T3.001'
import { PrismaModule } from '../../prisma/prisma.module_T1.002'

@Module({
  imports: [PrismaModule],
  controllers: [ChatsController_T3_001],
  providers: [ChatsService_T3_001],
  exports: [ChatsService_T3_001],
})
export class ChatsModule_T3_001 {}

