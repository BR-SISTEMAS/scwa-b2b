import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto, AuditAction } from './dto/create-audit-log.dto_T1.005';
import { AuditLog, AuditLogWithRelations } from './entities/audit-log.entity_T1.005';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo log de auditoria
   */
  async createLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          actorId: createAuditLogDto.actorId,
          action: createAuditLogDto.action,
          payload: createAuditLogDto.payload,
          targetId: createAuditLogDto.targetId,
          targetType: createAuditLogDto.targetType,
          ipAddress: createAuditLogDto.ipAddress,
          userAgent: createAuditLogDto.userAgent,
          companyId: createAuditLogDto.companyId,
        },
      });

      this.logger.log(`Audit log created: ${createAuditLogDto.action} by ${createAuditLogDto.actorId}`);
      return auditLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Log de criação de usuário
   */
  async logUserCreate(actorId: string, userId: string, userData: any, metadata?: any): Promise<void> {
    await this.createLog({
      actorId,
      action: AuditAction.USER_CREATE,
      targetId: userId,
      targetType: 'USER',
      payload: {
        userData,
        ...metadata,
      },
    });
  }

  /**
   * Log de login de usuário
   */
  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.createLog({
      actorId: userId,
      action: AuditAction.USER_LOGIN,
      ipAddress,
      userAgent,
      payload: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de logout de usuário
   */
  async logUserLogout(userId: string): Promise<void> {
    await this.createLog({
      actorId: userId,
      action: AuditAction.USER_LOGOUT,
      payload: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de atribuição de conversa
   */
  async logConversationAssign(agentId: string, conversationId: string, clientId?: string): Promise<void> {
    await this.createLog({
      actorId: agentId,
      action: AuditAction.CONVERSATION_ASSIGN,
      targetId: conversationId,
      targetType: 'CONVERSATION',
      payload: {
        clientId,
        assignedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de transferência de conversa
   */
  async logConversationTransfer(fromAgentId: string, toAgentId: string, conversationId: string): Promise<void> {
    await this.createLog({
      actorId: fromAgentId,
      action: AuditAction.CONVERSATION_TRANSFER,
      targetId: conversationId,
      targetType: 'CONVERSATION',
      payload: {
        fromAgentId,
        toAgentId,
        transferredAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de exportação de dados (PDF)
   */
  async logExportPdf(userId: string, conversationId: string): Promise<void> {
    await this.createLog({
      actorId: userId,
      action: AuditAction.EXPORT_PDF,
      targetId: conversationId,
      targetType: 'CONVERSATION',
      payload: {
        format: 'PDF',
        exportedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de exportação de dados (XML)
   */
  async logExportXml(userId: string, conversationId: string): Promise<void> {
    await this.createLog({
      actorId: userId,
      action: AuditAction.EXPORT_XML,
      targetId: conversationId,
      targetType: 'CONVERSATION',
      payload: {
        format: 'XML',
        exportedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de exportação de dados pessoais (LGPD)
   */
  async logDataExport(userId: string, targetUserId: string): Promise<void> {
    await this.createLog({
      actorId: userId,
      action: AuditAction.DATA_EXPORT,
      targetId: targetUserId,
      targetType: 'USER',
      payload: {
        reason: 'LGPD_REQUEST',
        exportedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log de exclusão de dados pessoais (LGPD)
   */
  async logDataDelete(userId: string, targetUserId: string, reason: string = 'USER_REQUEST'): Promise<void> {
    await this.createLog({
      actorId: userId,
      action: AuditAction.DATA_DELETE,
      targetId: targetUserId,
      targetType: 'USER',
      payload: {
        reason,
        deletedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async findLogs(filters: {
    actorId?: string;
    action?: AuditAction;
    targetId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogWithRelations[]> {
    const where: any = {};

    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.action) where.action = filters.action;
    if (filters.targetId) where.targetId = filters.targetId;
    if (filters.companyId) where.companyId = filters.companyId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      take: filters.limit || 100,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Busca logs por ação e período
   */
  async getLogsByActionAndPeriod(
    action: AuditAction,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        action,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Conta logs por ação
   */
  async countLogsByAction(action: AuditAction, companyId?: string): Promise<number> {
    return this.prisma.auditLog.count({
      where: {
        action,
        ...(companyId && { companyId }),
      },
    });
  }

  /**
   * Limpa logs antigos (executado periodicamente)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldLogs(): Promise<void> {
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          // Preserva logs críticos de LGPD
          action: {
            notIn: [AuditAction.DATA_EXPORT, AuditAction.DATA_DELETE],
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old audit logs older than ${retentionDays} days`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old audit logs: ${error.message}`, error.stack);
    }
  }

  /**
   * Gera relatório de auditoria
   */
  async generateAuditReport(companyId: string, startDate: Date, endDate: Date): Promise<any> {
    const logs = await this.findLogs({
      companyId,
      startDate,
      endDate,
    });

    const summary = {
      totalLogs: logs.length,
      period: {
        start: startDate,
        end: endDate,
      },
      actionBreakdown: {} as Record<string, number>,
      topActors: [] as Array<{ actorId: string; count: number; name?: string }>,
    };

    // Contagem por ação
    logs.forEach((log) => {
      if (!summary.actionBreakdown[log.action]) {
        summary.actionBreakdown[log.action] = 0;
      }
      summary.actionBreakdown[log.action]++;
    });

    // Top atores
    const actorCounts = new Map<string, { count: number; name?: string }>();
    logs.forEach((log) => {
      const current = actorCounts.get(log.actorId) || { count: 0, name: log.actor?.name };
      actorCounts.set(log.actorId, { count: current.count + 1, name: current.name });
    });

    summary.topActors = Array.from(actorCounts.entries())
      .map(([actorId, data]) => ({ actorId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      summary,
      logs: logs.slice(0, 1000), // Limita a 1000 logs no relatório
    };
  }
}
