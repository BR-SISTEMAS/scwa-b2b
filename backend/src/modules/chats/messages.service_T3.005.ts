/**
 * [S3][T3.005] - Serviço de persistência de mensagens
 * Gerencia o salvamento de mensagens como JSON no banco de dados
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  SaveMessageDto, 
  MessageContentJson, 
  MessageStatus, 
  MessageType 
} from './dto/save-message.dto_T3.005';
import { ConversationTranscript, TranscriptMessage } from './interfaces/transcript.interface_T3.005';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Salva uma mensagem no banco de dados como JSON
   */
  async saveMessage(dto: SaveMessageDto): Promise<any> {
    try {
      // Verifica se a conversa existe
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: dto.conversationId },
      });

      if (!conversation) {
        throw new NotFoundException(`Conversation ${dto.conversationId} not found`);
      }

      // Prepara o conteúdo JSON da mensagem
      const contentJson: MessageContentJson = {
        type: dto.type,
        content: dto.content,
        metadata: dto.metadata,
        status: dto.status || MessageStatus.SENT,
        reactions: dto.reactions || {},
        mentions: dto.mentions || [],
        timestamps: {
          sent: new Date().toISOString(),
        },
        version: 1,
      };

      // Adiciona informações de reply se houver
      if (dto.replyToId) {
        const replyToMessage = await this.prisma.message.findUnique({
          where: { id: dto.replyToId },
          select: { contentText: true },
        });

        if (replyToMessage) {
          contentJson.replyTo = {
            messageId: dto.replyToId,
            preview: replyToMessage.contentText.substring(0, 100),
          };
        }
      }

      // Cria a mensagem no banco
      const message = await this.prisma.message.create({
        data: {
          conversationId: dto.conversationId,
          senderId: dto.senderId,
          senderType: dto.senderType as any,
          contentText: dto.content,
          contentJson: contentJson as any,
          attachments: dto.metadata?.fileName ? 
            [{ 
              name: dto.metadata.fileName, 
              size: dto.metadata.fileSize,
              type: dto.metadata.mimeType 
            }] as any : undefined,
          audioUrl: dto.type === MessageType.AUDIO ? dto.metadata?.fileName : null,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Atualiza o status da conversa se necessário
      if (conversation.status === 'waiting' && dto.senderType === 'agent') {
        await this.prisma.conversation.update({
          where: { id: dto.conversationId },
          data: { 
            status: 'assigned',
            agentUserId: dto.senderId,
          },
        });
      }

      // Emite evento para websocket e outros listeners
      this.eventEmitter.emit('message.created', {
        conversationId: dto.conversationId,
        message,
      });

      this.logger.log(`Message saved: ${message.id} in conversation ${dto.conversationId}`);

      return {
        id: message.id,
        conversationId: message.conversationId,
        sender: (message as any).sender,
        contentJson: message.contentJson,
        createdAt: message.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to save message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Atualiza o status de uma mensagem
   */
  async updateMessageStatus(
    messageId: string, 
    status: MessageStatus,
    userId?: string,
  ): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    const contentJson = message.contentJson as any;
    contentJson.status = status;

    // Atualiza timestamps baseado no status
    const now = new Date().toISOString();
    if (status === MessageStatus.DELIVERED) {
      contentJson.timestamps.delivered = now;
    } else if (status === MessageStatus.READ) {
      contentJson.timestamps.read = now;
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { contentJson },
    });

    // Emite evento de atualização de status
    this.eventEmitter.emit('message.status.updated', {
      messageId,
      status,
      userId,
    });

    this.logger.log(`Message ${messageId} status updated to ${status}`);
  }

  /**
   * Marca mensagem como editada
   */
  async editMessage(
    messageId: string,
    newContent: string,
    editedBy: string,
  ): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    // Verifica se o usuário pode editar
    if (message.senderId !== editedBy) {
      throw new BadRequestException('You can only edit your own messages');
    }

    const contentJson = message.contentJson as any;
    contentJson.content = newContent;
    contentJson.edited = {
      at: new Date().toISOString(),
      by: editedBy,
    };
    contentJson.version = (contentJson.version || 1) + 1;

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        contentText: newContent,
        contentJson,
      },
    });

    this.eventEmitter.emit('message.edited', {
      messageId,
      newContent,
      editedBy,
    });

    this.logger.log(`Message ${messageId} edited by ${editedBy}`);
  }

  /**
   * Adiciona reação a uma mensagem
   */
  async addReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    const contentJson = message.contentJson as any;
    if (!contentJson.reactions) {
      contentJson.reactions = {};
    }

    if (!contentJson.reactions[emoji]) {
      contentJson.reactions[emoji] = [];
    }

    // Adiciona userId se ainda não existir
    if (!contentJson.reactions[emoji].includes(userId)) {
      contentJson.reactions[emoji].push(userId);
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { contentJson },
    });

    this.eventEmitter.emit('message.reaction.added', {
      messageId,
      emoji,
      userId,
    });
  }

  /**
   * Remove reação de uma mensagem
   */
  async removeReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    const contentJson = message.contentJson as any;
    if (contentJson.reactions && contentJson.reactions[emoji]) {
      contentJson.reactions[emoji] = contentJson.reactions[emoji].filter(
        (id: string) => id !== userId
      );

      // Remove emoji se não houver mais reações
      if (contentJson.reactions[emoji].length === 0) {
        delete contentJson.reactions[emoji];
      }
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { contentJson },
    });

    this.eventEmitter.emit('message.reaction.removed', {
      messageId,
      emoji,
      userId,
    });
  }

  /**
   * Busca mensagens de uma conversa
   */
  async getConversationMessages(
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeDeleted?: boolean;
    },
  ): Promise<any[]> {
    const where: any = {
      conversationId,
    };

    // Filtra mensagens deletadas por padrão
    if (!options?.includeDeleted) {
      where.contentJson = {
        path: ['deleted'],
        equals: undefined,
      };
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    return messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      sender: msg.sender,
      contentJson: msg.contentJson,
      createdAt: msg.createdAt,
    }));
  }

  /**
   * Gera transcrição básica de uma conversa
   */
  async generateBasicTranscript(conversationId: string): Promise<ConversationTranscript> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        company: true,
        client: true,
        agent: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: true,
          },
        },
        evaluations: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    // Prepara participantes
    const participants: any[] = [];
    if (conversation.client) {
      participants.push({
        id: conversation.client.id,
        name: conversation.client.name,
        email: conversation.client.email,
        type: 'client' as const,
        joinedAt: conversation.startedAt.toISOString(),
        leftAt: conversation.closedAt?.toISOString(),
        messages: conversation.messages.filter(m => m.senderId === conversation.client?.id).length,
      });
    }
    if (conversation.agent) {
      participants.push({
        id: conversation.agent.id,
        name: conversation.agent.name,
        email: conversation.agent.email,
        type: 'agent' as const,
        joinedAt: conversation.startedAt.toISOString(),
        leftAt: conversation.closedAt?.toISOString(),
        messages: conversation.messages.filter(m => m.senderId === conversation.agent?.id).length,
      });
    }

    // Prepara mensagens
    const transcriptMessages: TranscriptMessage[] = conversation.messages.map(msg => {
      const contentJson = msg.contentJson as any;
      return {
        id: msg.id,
        timestamp: msg.createdAt.toISOString(),
        sender: {
          id: msg.senderId || 'system',
          name: msg.sender?.name || 'System',
          type: msg.senderType as any,
        },
        content: msg.contentText,
        type: contentJson?.type || 'text',
        metadata: contentJson?.metadata,
        attachments: msg.attachments as any,
      };
    });

    // Calcula métricas
    const metrics = {
      totalMessages: conversation.messages.length,
      duration: conversation.closedAt 
        ? Math.floor((conversation.closedAt.getTime() - conversation.startedAt.getTime()) / 1000)
        : Math.floor((Date.now() - conversation.startedAt.getTime()) / 1000),
      averageResponseTime: 0, // TODO: Calcular tempo médio de resposta
      firstResponseTime: 0, // TODO: Calcular tempo da primeira resposta
      resolutionTime: conversation.closedAt
        ? Math.floor((conversation.closedAt.getTime() - conversation.startedAt.getTime()) / 1000)
        : undefined,
      messagesByType: {} as Record<string, number>,
      messagesBySender: {} as Record<string, number>,
    };

    // Conta mensagens por tipo e remetente
    conversation.messages.forEach(msg => {
      const contentJson = msg.contentJson as any;
      const type = contentJson?.type || 'text';
      metrics.messagesByType[type] = (metrics.messagesByType[type] || 0) + 1;
      
      const senderId = msg.senderId || 'system';
      metrics.messagesBySender[senderId] = (metrics.messagesBySender[senderId] || 0) + 1;
    });

    const transcript: ConversationTranscript = {
      conversationId,
      companyId: conversation.companyId,
      createdAt: conversation.startedAt.toISOString(),
      updatedAt: new Date().toISOString(),
      status: conversation.status as any,
      participants,
      messages: transcriptMessages,
      metrics,
      metadata: {
        version: '1.0',
        format: 'json',
        generatedAt: new Date().toISOString(),
        generatedBy: 'system',
      },
    };

    // Adiciona avaliação se disponível
    if (conversation.evaluations.length > 0) {
      const evaluation = conversation.evaluations[0];
      transcript.evaluation = {
        rating: evaluation.rating,
        comment: evaluation.comment || undefined,
        evaluatedAt: evaluation.createdAt.toISOString(),
        evaluatedBy: conversation.clientUserId || '',
      };
    }

    // Adiciona informações da fila se disponível
    if (conversation.queuePosition) {
      transcript.queueInfo = {
        initialPosition: conversation.queuePosition,
        waitTime: 0, // TODO: Calcular tempo de espera real
        assignedAt: conversation.agent ? conversation.startedAt.toISOString() : undefined,
        assignedTo: conversation.agent?.id,
      };
    }

    return transcript;
  }
}
