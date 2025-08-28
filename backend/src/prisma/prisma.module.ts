import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service_T1.002';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
