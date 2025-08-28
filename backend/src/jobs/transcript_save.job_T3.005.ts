/**
 * [S3][T3.005] - Job para salvar transcrições
 * Gera e salva transcrições de conversas em formato JSON
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../modules/chats/messages.service_T3.005';
import { 
  ConversationTranscript, 
  TranscriptExport,
  TranscriptGenerationOptions 
} from '../modules/chats/interfaces/transcript.interface_T3.005';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TranscriptSaveJob {
  private readonly logger = new Logger(TranscriptSaveJob.name);
  private readonly transcriptDir: string;
  private activeExports: Map<string, TranscriptExport> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
  ) {
    this.transcriptDir = path.join(process.cwd(), 'transcripts');
    this.ensureTranscriptDir();
  }

  private async ensureTranscriptDir() {
    try {
      await fs.access(this.transcriptDir);
    } catch {
      await fs.mkdir(this.transcriptDir, { recursive: true });
      this.logger.log(`Created transcript directory: ${this.transcriptDir}`);
    }
  }

  /**
   * Job scheduled para gerar transcrições de conversas encerradas
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async generateScheduledTranscripts() {
    this.logger.log('Starting scheduled transcript generation');
    const startTime = Date.now();

    try {
      // Busca conversas encerradas sem transcrição gerada
      const conversations = await this.prisma.conversation.findMany({
        where: {
          status: 'closed',
          closedAt: {
            not: null,
            // Conversas encerradas nas últimas 2 horas
            gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          companyId: true,
        },
      });

      this.logger.log(`Found ${conversations.length} conversations to process`);

      let successCount = 0;
      let errorCount = 0;

      for (const conversation of conversations) {
        try {
          // Verifica se já existe transcrição
          const existingTranscript = await this.checkExistingTranscript(conversation.id);
          if (existingTranscript) {
            this.logger.debug(`Transcript already exists for conversation ${conversation.id}`);
            continue;
          }

          // Gera e salva a transcrição
          await this.generateAndSaveTranscript(conversation.id);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to generate transcript for conversation ${conversation.id}: ${error.message}`,
            error.stack,
          );
          errorCount++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Transcript generation completed in ${duration}ms. Success: ${successCount}, Errors: ${errorCount}`,
      );

      // Salva métricas do job
      await this.saveJobMetrics({
        jobName: 'transcript_generation',
        startTime,
        duration,
        processedCount: conversations.length,
        successCount,
        errorCount,
      });
    } catch (error) {
      this.logger.error('Failed to run transcript generation job', error.stack);
    }
  }

  /**
   * Gera e salva transcrição de uma conversa
   */
  async generateAndSaveTranscript(
    conversationId: string,
    options?: TranscriptGenerationOptions,
  ): Promise<string> {
    this.logger.log(`Generating transcript for conversation ${conversationId}`);

    // Gera a transcrição
    const transcript = await this.messagesService.generateBasicTranscript(conversationId);

    // Aplica opções se fornecidas
    const processedTranscript = this.applyTranscriptOptions(transcript, options);

    // Salva em arquivo JSON
    const filename = await this.saveTranscriptToFile(processedTranscript);

    // Salva referência no banco de dados
    await this.saveTranscriptReference(conversationId, filename, processedTranscript);

    this.logger.log(`Transcript saved: ${filename}`);
    return filename;
  }

  /**
   * Aplica opções de geração à transcrição
   */
  private applyTranscriptOptions(
    transcript: ConversationTranscript,
    options?: TranscriptGenerationOptions,
  ): ConversationTranscript {
    if (!options) return transcript;

    const processed = { ...transcript };

    // Filtra mensagens do sistema se não incluir
    if (!options.includeSystemMessages) {
      processed.messages = processed.messages.filter(
        msg => msg.sender.type !== 'system'
      );
    }

    // Remove mensagens deletadas se não incluir
    if (!options.includeDeletedMessages) {
      processed.messages = processed.messages.filter(msg => {
        const metadata = msg.metadata as any;
        return !metadata?.deleted;
      });
    }

    // Remove anexos se não incluir
    if (!options.includeAttachments) {
      processed.messages = processed.messages.map(msg => ({
        ...msg,
        attachments: undefined,
      }));
    }

    // Remove métricas se não incluir
    if (!options.includeMetrics) {
      delete (processed as any).metrics;
    }

    // Aplica filtro de data se especificado
    if (options.dateRange) {
      processed.messages = processed.messages.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= options.dateRange!.start && msgDate <= options.dateRange!.end;
      });
    }

    return processed;
  }

  /**
   * Salva transcrição em arquivo
   */
  private async saveTranscriptToFile(transcript: ConversationTranscript): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `transcript_${transcript.conversationId}_${timestamp}.json`;
    const filepath = path.join(this.transcriptDir, filename);

    const content = JSON.stringify(transcript, null, 2);
    await fs.writeFile(filepath, content, 'utf-8');

    return filename;
  }

  /**
   * Salva referência da transcrição no banco de dados
   */
  private async saveTranscriptReference(
    conversationId: string,
    filename: string,
    transcript: ConversationTranscript,
  ) {
    // Salva metadata da transcrição na conversa
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        metadata: {
          ...(await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { metadata: true },
          }))?.metadata as any,
          transcript: {
            filename,
            generatedAt: transcript.metadata.generatedAt,
            messageCount: transcript.messages.length,
            duration: transcript.metrics?.duration,
            format: 'json',
          },
        },
      },
    });
  }

  /**
   * Verifica se já existe transcrição para a conversa
   */
  private async checkExistingTranscript(conversationId: string): Promise<boolean> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { metadata: true },
    });

    const metadata = conversation?.metadata as any;
    return metadata?.transcript !== undefined;
  }

  /**
   * Cria exportação em lote de transcrições
   */
  async createBatchExport(
    conversationIds: string[],
    requestedBy: string,
    options: TranscriptGenerationOptions,
  ): Promise<string> {
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const exportData: TranscriptExport = {
      id: exportId,
      conversationIds,
      format: options.format || 'json',
      status: 'pending',
      requestedBy,
      requestedAt: new Date().toISOString(),
      options,
    };

    this.activeExports.set(exportId, exportData);

    // Processa exportação em background
    this.processBatchExport(exportId).catch(error => {
      this.logger.error(`Failed to process batch export ${exportId}`, error.stack);
      this.updateExportStatus(exportId, 'failed', error.message);
    });

    return exportId;
  }

  /**
   * Processa exportação em lote
   */
  private async processBatchExport(exportId: string) {
    const exportData = this.activeExports.get(exportId);
    if (!exportData) {
      throw new Error(`Export ${exportId} not found`);
    }

    this.updateExportStatus(exportId, 'processing');

    const transcripts: ConversationTranscript[] = [];
    
    for (const conversationId of exportData.conversationIds) {
      try {
        const transcript = await this.messagesService.generateBasicTranscript(conversationId);
        const processed = this.applyTranscriptOptions(transcript, exportData.options);
        transcripts.push(processed);
      } catch (error) {
        this.logger.error(`Failed to generate transcript for ${conversationId}`, error.stack);
      }
    }

    // Salva arquivo de exportação
    const filename = await this.saveBatchExport(exportId, transcripts, exportData.format);
    
    // Atualiza status
    this.updateExportStatus(exportId, 'completed', undefined, filename);
  }

  /**
   * Salva arquivo de exportação em lote
   */
  private async saveBatchExport(
    exportId: string,
    transcripts: ConversationTranscript[],
    format: string,
  ): Promise<string> {
    const filename = `${exportId}.${format}`;
    const filepath = path.join(this.transcriptDir, 'exports', filename);

    // Garante que o diretório existe
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    if (format === 'json') {
      await fs.writeFile(filepath, JSON.stringify(transcripts, null, 2), 'utf-8');
    } else if (format === 'csv') {
      const csv = this.convertTranscriptsToCSV(transcripts);
      await fs.writeFile(filepath, csv, 'utf-8');
    } else if (format === 'html') {
      const html = this.convertTranscriptsToHTML(transcripts);
      await fs.writeFile(filepath, html, 'utf-8');
    }

    return filename;
  }

  /**
   * Converte transcrições para CSV
   */
  private convertTranscriptsToCSV(transcripts: ConversationTranscript[]): string {
    const headers = ['Conversation ID', 'Timestamp', 'Sender', 'Type', 'Content'];
    const rows = [headers.join(',')];

    for (const transcript of transcripts) {
      for (const message of transcript.messages) {
        const row = [
          transcript.conversationId,
          message.timestamp,
          message.sender.name,
          message.type,
          `"${message.content.replace(/"/g, '""')}"`,
        ];
        rows.push(row.join(','));
      }
    }

    return rows.join('\n');
  }

  /**
   * Converte transcrições para HTML
   */
  private convertTranscriptsToHTML(transcripts: ConversationTranscript[]): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Chat Transcripts Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .conversation { border: 1px solid #ddd; margin: 20px 0; padding: 20px; }
        .message { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .sender { font-weight: bold; color: #333; }
        .timestamp { color: #666; font-size: 0.9em; }
        .content { margin-top: 5px; }
        h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Chat Transcripts Export</h1>
`;

    for (const transcript of transcripts) {
      html += `
    <div class="conversation">
        <h2>Conversation: ${transcript.conversationId}</h2>
        <p><strong>Status:</strong> ${transcript.status}</p>
        <p><strong>Created:</strong> ${transcript.createdAt}</p>
        <div class="messages">
`;

      for (const message of transcript.messages) {
        html += `
            <div class="message">
                <span class="sender">${message.sender.name}</span>
                <span class="timestamp">${message.timestamp}</span>
                <div class="content">${this.escapeHtml(message.content)}</div>
            </div>
`;
      }

      html += `
        </div>
    </div>
`;
    }

    html += `
</body>
</html>
`;

    return html;
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    const map: any = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Atualiza status da exportação
   */
  private updateExportStatus(
    exportId: string,
    status: TranscriptExport['status'],
    error?: string,
    filename?: string,
  ) {
    const exportData = this.activeExports.get(exportId);
    if (!exportData) return;

    exportData.status = status;
    if (error) exportData.error = error;
    if (filename) {
      exportData.downloadUrl = `/api/transcripts/download/${filename}`;
      exportData.completedAt = new Date().toISOString();
      exportData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias
    }

    this.activeExports.set(exportId, exportData);
  }

  /**
   * Obtém status de uma exportação
   */
  getExportStatus(exportId: string): TranscriptExport | undefined {
    return this.activeExports.get(exportId);
  }

  /**
   * Limpa exportações antigas
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldExports() {
    this.logger.log('Starting cleanup of old exports');

    // Remove exportações da memória após 24 horas
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [exportId, exportData] of this.activeExports.entries()) {
      const requestedAt = new Date(exportData.requestedAt).getTime();
      if (requestedAt < cutoff) {
        this.activeExports.delete(exportId);
      }
    }

    // Remove arquivos de exportação após 7 dias
    try {
      const exportsDir = path.join(this.transcriptDir, 'exports');
      const files = await fs.readdir(exportsDir);
      
      for (const file of files) {
        const filepath = path.join(exportsDir, file);
        const stats = await fs.stat(filepath);
        const age = Date.now() - stats.mtime.getTime();
        
        if (age > 7 * 24 * 60 * 60 * 1000) {
          await fs.unlink(filepath);
          this.logger.log(`Deleted old export file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old exports', error.stack);
    }
  }

  /**
   * Salva métricas do job
   */
  private async saveJobMetrics(metrics: any) {
    await this.prisma.metricsCache.upsert({
      where: { key: 'transcript_job_metrics' },
      update: {
        value: metrics,
      },
      create: {
        key: 'transcript_job_metrics',
        value: metrics,
      },
    });
  }
}
