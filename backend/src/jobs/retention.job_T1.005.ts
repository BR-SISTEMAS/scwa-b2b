import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../modules/audit/audit.service_T1.005';
import { AuditAction } from '../modules/audit/dto/create-audit-log.dto_T1.005';

export interface RetentionPolicy {
  entity: string;
  retentionDays: number;
  field?: string;
  conditions?: any;
}

@Injectable()
export class RetentionJob {
  private readonly logger = new Logger(RetentionJob.name);
  private retentionPolicies: RetentionPolicy[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    this.initializeRetentionPolicies();
  }

  /**
   * Inicializa as políticas de retenção baseadas em configurações
   */
  private initializeRetentionPolicies() {
    // Políticas padrão de retenção em dias
    this.retentionPolicies = [
      {
        entity: 'messages',
        retentionDays: parseInt(process.env.MESSAGE_RETENTION_DAYS || '365', 10),
      },
      {
        entity: 'conversations',
        retentionDays: parseInt(process.env.CONVERSATION_RETENTION_DAYS || '730', 10),
        conditions: { status: 'closed' },
      },
      {
        entity: 'auditLogs',
        retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10),
        // Logs de LGPD são preservados por mais tempo
        conditions: {
          action: {
            notIn: [AuditAction.DATA_EXPORT, AuditAction.DATA_DELETE],
          },
        },
      },
      {
        entity: 'evaluations',
        retentionDays: parseInt(process.env.EVALUATION_RETENTION_DAYS || '180', 10),
      },
      {
        entity: 'tickets',
        retentionDays: parseInt(process.env.TICKET_RETENTION_DAYS || '365', 10),
        conditions: { status: 'closed' },
      },
    ];

    // Políticas especiais para LGPD
    if (process.env.ENABLE_LGPD_AUTO_DELETE === 'true') {
      this.retentionPolicies.push({
        entity: 'users',
        retentionDays: parseInt(process.env.USER_DATA_RETENTION_DAYS || '1095', 10), // 3 anos
        field: 'lastActivityAt',
        conditions: { isDeleted: false, role: 'client' },
      });
    }
  }

  /**
   * Job principal de retenção - executa diariamente às 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async executeRetentionPolicies() {
    this.logger.log('Starting retention job execution');
    const startTime = Date.now();
    const results = [];

    for (const policy of this.retentionPolicies) {
      try {
        const result = await this.applyRetentionPolicy(policy);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to apply retention policy for ${policy.entity}: ${error.message}`,
          error.stack,
        );
      }
    }

    const duration = Date.now() - startTime;
    this.logger.log(`Retention job completed in ${duration}ms`);

    // Log de auditoria para execução do job
    await this.auditService.createLog({
      actorId: 'SYSTEM',
      action: 'RETENTION_JOB_EXECUTED' as any,
      payload: {
        duration,
        results,
        timestamp: new Date().toISOString(),
      },
    });

    return results;
  }

  /**
   * Aplica uma política de retenção específica
   */
  private async applyRetentionPolicy(policy: RetentionPolicy) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    const dateField = policy.field || 'createdAt';
    const where: any = {
      [dateField]: { lt: cutoffDate },
    };

    // Adiciona condições adicionais se existirem
    if (policy.conditions) {
      Object.assign(where, policy.conditions);
    }

    let deletedCount = 0;

    switch (policy.entity) {
      case 'messages':
        deletedCount = await this.deleteMessages(where);
        break;
      case 'conversations':
        deletedCount = await this.deleteConversations(where);
        break;
      case 'auditLogs':
        deletedCount = await this.deleteAuditLogs(where);
        break;
      case 'evaluations':
        deletedCount = await this.deleteEvaluations(where);
        break;
      case 'tickets':
        deletedCount = await this.deleteTickets(where);
        break;
      case 'users':
        deletedCount = await this.anonymizeInactiveUsers(where);
        break;
    }

    this.logger.log(
      `Deleted/anonymized ${deletedCount} records from ${policy.entity} older than ${policy.retentionDays} days`,
    );

    return {
      entity: policy.entity,
      deletedCount,
      retentionDays: policy.retentionDays,
      cutoffDate: cutoffDate.toISOString(),
    };
  }

  /**
   * Deleta mensagens antigas
   */
  private async deleteMessages(where: any): Promise<number> {
    // Primeiro, deleta anexos associados
    const messages = await this.prisma.message.findMany({
      where,
      select: { id: true, attachments: true, audioUrl: true },
    });

    // TODO: Implementar exclusão de arquivos físicos do storage
    for (const message of messages) {
      if (message.attachments || message.audioUrl) {
        await this.deleteAttachments(message.attachments as any, message.audioUrl);
      }
    }

    const result = await this.prisma.message.deleteMany({ where });
    return result.count;
  }

  /**
   * Deleta conversas antigas e mensagens relacionadas
   */
  private async deleteConversations(where: any): Promise<number> {
    // Busca conversas para deletar
    const conversations = await this.prisma.conversation.findMany({
      where,
      select: { id: true },
    });

    const conversationIds = conversations.map(c => c.id);

    if (conversationIds.length === 0) {
      return 0;
    }

    // Deleta mensagens relacionadas primeiro
    await this.prisma.message.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    // Deleta avaliações relacionadas
    await this.prisma.evaluation.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    // Deleta tickets relacionados
    await this.prisma.ticket.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    // Finalmente, deleta as conversas
    const result = await this.prisma.conversation.deleteMany({
      where: { id: { in: conversationIds } },
    });

    return result.count;
  }

  /**
   * Deleta logs de auditoria antigos (exceto logs críticos)
   */
  private async deleteAuditLogs(where: any): Promise<number> {
    const result = await this.prisma.auditLog.deleteMany({ where });
    return result.count;
  }

  /**
   * Deleta avaliações antigas
   */
  private async deleteEvaluations(where: any): Promise<number> {
    const result = await this.prisma.evaluation.deleteMany({ where });
    return result.count;
  }

  /**
   * Deleta tickets antigos
   */
  private async deleteTickets(where: any): Promise<number> {
    const result = await this.prisma.ticket.deleteMany({ where });
    return result.count;
  }

  /**
   * Anonimiza usuários inativos (LGPD)
   */
  private async anonymizeInactiveUsers(where: any): Promise<number> {
    // Busca usuários para anonimizar
    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true },
    });

    let anonymizedCount = 0;

    for (const user of users) {
      try {
        // Anonimiza dados pessoais
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            email: `deleted_${user.id}@anonymized.local`,
            name: 'Usuário Removido',
            passwordHash: 'DELETED',
            profilePhotoUrl: null,
            isDeleted: true,
            deletedAt: new Date(),
          },
        });

        // Log de auditoria para anonimização
        await this.auditService.logDataDelete(
          'SYSTEM',
          user.id,
          'AUTOMATIC_RETENTION_POLICY',
        );

        anonymizedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to anonymize user ${user.id}: ${error.message}`,
          error.stack,
        );
      }
    }

    return anonymizedCount;
  }

  /**
   * Deleta anexos físicos do storage
   */
  private async deleteAttachments(attachments: any[], audioUrl?: string) {
    // TODO: Implementar exclusão de arquivos do S3 ou storage local
    // Por enquanto, apenas registra no log
    if (attachments && attachments.length > 0) {
      this.logger.log(`Marked ${attachments.length} attachments for deletion`);
    }
    if (audioUrl) {
      this.logger.log(`Marked audio file for deletion: ${audioUrl}`);
    }
  }

  /**
   * Executa limpeza manual de dados (pode ser chamado via API admin)
   */
  async manualCleanup(entityType?: string): Promise<any> {
    this.logger.log(`Manual cleanup requested for: ${entityType || 'all entities'}`);

    if (entityType) {
      const policy = this.retentionPolicies.find(p => p.entity === entityType);
      if (policy) {
        return await this.applyRetentionPolicy(policy);
      } else {
        throw new Error(`No retention policy found for entity: ${entityType}`);
      }
    }

    // Executa todas as políticas
    return await this.executeRetentionPolicies();
  }

  /**
   * Obtém estatísticas de retenção
   */
  async getRetentionStats(): Promise<any> {
    const stats: any = {
      policies: this.retentionPolicies,
      counts: {},
      oldestRecords: {},
    };

    // Conta registros para cada entidade
    stats.counts.messages = await this.prisma.message.count();
    stats.counts.conversations = await this.prisma.conversation.count();
    stats.counts.auditLogs = await this.prisma.auditLog.count();
    stats.counts.evaluations = await this.prisma.evaluation.count();
    stats.counts.tickets = await this.prisma.ticket.count();
    stats.counts.users = await this.prisma.user.count({ where: { isDeleted: false } });
    stats.counts.deletedUsers = await this.prisma.user.count({ where: { isDeleted: true } });

    // Busca registros mais antigos
    const oldestMessage = await this.prisma.message.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    stats.oldestRecords.message = oldestMessage?.createdAt;

    const oldestConversation = await this.prisma.conversation.findFirst({
      orderBy: { startedAt: 'asc' },
      select: { startedAt: true },
    });
    stats.oldestRecords.conversation = oldestConversation?.startedAt;

    const oldestAuditLog = await this.prisma.auditLog.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    stats.oldestRecords.auditLog = oldestAuditLog?.createdAt;

    return stats;
  }

  /**
   * Verifica conformidade LGPD para um usuário específico
   */
  async checkLGPDCompliance(userId: string): Promise<any> {
    const compliance = {
      userId,
      dataFound: {},
      recommendations: [],
    };

    // Verifica dados do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        conversations: true,
        messages: true,
      },
    });

    if (user) {
      compliance.dataFound.user = {
        exists: true,
        isDeleted: user.isDeleted,
        deletedAt: user.deletedAt,
      };

      compliance.dataFound.conversations = user.conversations.length;
      compliance.dataFound.messages = user.messages.length;

      // Recomendações baseadas nos dados encontrados
      if (!user.isDeleted && user.conversations.length > 0) {
        compliance.recommendations.push(
          'Usuário tem conversas ativas. Considere anonimização se inativo.',
        );
      }

      if (user.messages.length > 100) {
        compliance.recommendations.push(
          'Usuário tem muitas mensagens. Considere aplicar política de retenção.',
        );
      }
    } else {
      compliance.dataFound.user = { exists: false };
    }

    // Verifica logs de auditoria
    const auditLogs = await this.prisma.auditLog.count({
      where: { actorId: userId },
    });
    compliance.dataFound.auditLogs = auditLogs;

    return compliance;
  }
}
