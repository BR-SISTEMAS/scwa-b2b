import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module_T1.002';
import { ChatsModule_T3_001 } from './modules/chats/chats.module_T3.001';

@Module({
  imports: [PrismaModule, ChatsModule_T3_001],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
