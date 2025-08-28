/**
 * [S3][T3.005] - ChatsModule consolidado
 * Integra todos os serviços de chat: conversas, mensagens, websockets e anexos
 */

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Controllers
import { ChatsController_T3_001 } from './chats.controller_T3.001';
import { AttachmentsController_T3_004 } from './attachments.controller_T3.004';

// Services
import { ChatsService_T3_001 } from './chats.service_T3.001';
import { MessagesService } from './messages.service_T3.005';
import { AttachmentsService_T3_004 } from './attachments.service_T3.004';

// Gateway
import { SocketGateway_T3_002 } from './socket.gateway_T3.002';

// Dependencies
import { PrismaModule } from '../../prisma/prisma.module_T1.002';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
    MulterModule.register({
      dest: './uploads', // Temporary upload directory
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  ],
  controllers: [
    ChatsController_T3_001,
    AttachmentsController_T3_004,
  ],
  providers: [
    ChatsService_T3_001,
    MessagesService,
    AttachmentsService_T3_004,
    SocketGateway_T3_002,
  ],
  exports: [
    ChatsService_T3_001,
    MessagesService,
    AttachmentsService_T3_004,
    SocketGateway_T3_002,
  ],
})
export class ChatsModule {}
