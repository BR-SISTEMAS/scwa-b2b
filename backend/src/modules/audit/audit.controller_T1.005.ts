import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuditService } from './audit.service_T1.005';
import { CreateAuditLogDto, AuditAction } from './dto/create-audit-log.dto_T1.005';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Cria um novo log de auditoria
   * Endpoint interno usado pelos outros serviços
   */
  @Post('log')
  @Roles('agent', 'manager', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async createLog(@Body() createAuditLogDto: CreateAuditLogDto, @Request() req) {
    // Adiciona informações do request se não fornecidas
    if (!createAuditLogDto.ipAddress) {
      createAuditLogDto.ipAddress = req.ip;
    }
    if (!createAuditLogDto.userAgent) {
      createAuditLogDto.userAgent = req.headers['user-agent'];
    }
    if (!createAuditLogDto.actorId && req.user) {
      createAuditLogDto.actorId = req.user.id;
    }
    if (!createAuditLogDto.companyId && req.user?.companyId) {
      createAuditLogDto.companyId = req.user.companyId;
    }

    return this.auditService.createLog(createAuditLogDto);
  }

  /**
   * Busca logs de auditoria
   * Acesso restrito para managers e admins
   */
  @Get('logs')
  @Roles('manager', 'admin')
  async getLogs(
    @Query('actorId') actorId?: string,
    @Query('action') action?: AuditAction,
    @Query('targetId') targetId?: string,
    @Query('companyId') companyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?,
  ) {
    // Managers só podem ver logs da própria empresa
    if (req.user.role === 'manager' && req.user.companyId) {
      companyId = req.user.companyId;
    }

    const filters = {
      actorId,
      action,
      targetId,
      companyId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    // Validação de datas
    if (filters.startDate && isNaN(filters.startDate.getTime())) {
      throw new BadRequestException('Invalid startDate format');
    }
    if (filters.endDate && isNaN(filters.endDate.getTime())) {
      throw new BadRequestException('Invalid endDate format');
    }

    return this.auditService.findLogs(filters);
  }

  /**
   * Gera relatório de auditoria para uma empresa
   */
  @Get('report')
  @Roles('manager', 'admin')
  async generateReport(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    // Managers só podem gerar relatórios da própria empresa
    if (req.user.role === 'manager' && req.user.companyId !== companyId) {
      throw new BadRequestException('Unauthorized to generate report for this company');
    }

    if (!companyId || !startDate || !endDate) {
      throw new BadRequestException('companyId, startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.auditService.generateAuditReport(companyId, start, end);
  }

  /**
   * Conta logs por ação
   */
  @Get('stats/action-count')
  @Roles('manager', 'admin')
  async getActionCount(
    @Query('action') action: AuditAction,
    @Query('companyId') companyId?: string,
    @Request() req?,
  ) {
    // Managers só podem ver estatísticas da própria empresa
    if (req.user.role === 'manager' && req.user.companyId) {
      companyId = req.user.companyId;
    }

    if (!action) {
      throw new BadRequestException('action parameter is required');
    }

    const count = await this.auditService.countLogsByAction(action, companyId);
    return {
      action,
      companyId,
      count,
    };
  }

  /**
   * Log de evento de login (chamado pelo auth service)
   */
  @Post('events/login')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logLogin(@Request() req) {
    await this.auditService.logUserLogin(
      req.user.id,
      req.ip,
      req.headers['user-agent'],
    );
  }

  /**
   * Log de evento de logout
   */
  @Post('events/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logLogout(@Request() req) {
    await this.auditService.logUserLogout(req.user.id);
  }

  /**
   * Log de exportação de PDF
   */
  @Post('events/export-pdf')
  @Roles('agent', 'manager', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logExportPdf(
    @Body('conversationId') conversationId: string,
    @Request() req,
  ) {
    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }
    await this.auditService.logExportPdf(req.user.id, conversationId);
  }

  /**
   * Log de exportação de XML
   */
  @Post('events/export-xml')
  @Roles('agent', 'manager', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logExportXml(
    @Body('conversationId') conversationId: string,
    @Request() req,
  ) {
    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }
    await this.auditService.logExportXml(req.user.id, conversationId);
  }

  /**
   * Log de exportação de dados pessoais (LGPD)
   */
  @Post('events/data-export')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logDataExport(
    @Body('targetUserId') targetUserId: string,
    @Request() req,
  ) {
    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }
    await this.auditService.logDataExport(req.user.id, targetUserId);
  }

  /**
   * Log de exclusão de dados pessoais (LGPD)
   */
  @Post('events/data-delete')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logDataDelete(
    @Body('targetUserId') targetUserId: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }
    await this.auditService.logDataDelete(req.user.id, targetUserId, reason);
  }
}
