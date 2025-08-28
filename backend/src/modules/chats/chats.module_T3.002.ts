import { Module } from '@nestjs/common'
import { ChatsController_T3_001 } from './chats.controller_T3.001'
import { ChatsService_T3_001 } from './chats.service_T3.001'
import { SocketGateway_T3_002 } from './socket.gateway_T3.002'
import { PrismaModule } from '../../prisma/prisma.module_T1.002'

@Module({
  imports: [PrismaModule],
  controllers: [ChatsController_T3_001],
  providers: [
    ChatsService_T3_001,
    SocketGateway_T3_002,
  ],
  exports: [
    ChatsService_T3_001,
    SocketGateway_T3_002,
  ],
})
export class ChatsModule_T3_002 {}
