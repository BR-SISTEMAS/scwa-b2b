import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { RetentionJob } from './retention.job_T1.005';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';

@Controller('api/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly retentionJob: RetentionJob) {}

  /**
   * Executa manualmente o job de retenção
   * Apenas admins podem executar
   */
  @Post('retention/execute')
  @Roles('admin')
  @HttpCode(HttpStatus.ACCEPTED)
  async executeRetentionJob(@Query('entity') entity?: string) {
    const result = await this.retentionJob.manualCleanup(entity);
    return {
      message: 'Retention job executed successfully',
      result,
    };
  }

  /**
   * Obtém estatísticas de retenção
   */
  @Get('retention/stats')
  @Roles('admin')
  async getRetentionStats() {
    return this.retentionJob.getRetentionStats();
  }

  /**
   * Verifica conformidade LGPD de um usuário
   */
  @Get('retention/lgpd-compliance/:userId')
  @Roles('admin')
  async checkUserLGPDCompliance(@Param('userId') userId: string) {
    return this.retentionJob.checkLGPDCompliance(userId);
  }
}
