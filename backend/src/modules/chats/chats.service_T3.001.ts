import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service_T1.002'
import { StartConversationDto_T3_001 } from './dto/start-conversation.dto_T3.001'
import { UpdateQueueDto_T3_001, ConversationStatus } from './dto/update-queue.dto_T3.001'

@Injectable()
export class ChatsService_T3_001 {
  private readonly logger = new Logger(ChatsService_T3_001.name)

  constructor(private prisma: PrismaService) {}

  async startConversation(
    dto: StartConversationDto_T3_001,
    companyId: string
  ) {
    this.logger.log('Starting new conversation for company: ' + companyId)

    // Calcular posição na fila
    const queuePosition = await this.calculateQueuePosition(companyId)

    // Criar conversação
    const conversation = await this.prisma.conversation.create({
      data: {
        companyId,
        clientUserId: dto.clientUserId || null,
        status: ConversationStatus.WAITING,
        queuePosition,
        startedAt: new Date(),
        metadata: dto.metadata || {},
      },
      include: {
        company: true,
      },
    })

    // Se houver mensagem inicial, criar
    if (dto.initialMessage) {
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: dto.clientUserId || null,
          senderType: 'client',
          contentText: dto.initialMessage,
          contentJson: {
            type: 'text',
            content: dto.initialMessage,
            timestamp: new Date().toISOString(),
          },
        },
      })
    }

    this.logger.log(`Conversation ${conversation.id} created at position ${queuePosition}`)
    
    return {
      conversationId: conversation.id,
      queuePosition,
      status: conversation.status,
      estimatedWaitTime: this.estimateWaitTime(queuePosition),
    }
  }

  async getQueueStatus(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        agent: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    return {
      conversationId: conversation.id,
      status: conversation.status,
      queuePosition: conversation.queuePosition,
      agentName: conversation.agent?.name,
      lastMessage: conversation.messages[0] || null,
      estimatedWaitTime: conversation.status === ConversationStatus.WAITING 
        ? this.estimateWaitTime(conversation.queuePosition || 0)
        : null,
    }
  }

  async updateQueuePosition(
    conversationId: string,
    dto: UpdateQueueDto_T3_001
  ) {
    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: dto.status,
        queuePosition: dto.queuePosition,
        agentUserId: dto.agentUserId,
        ...(dto.status === ConversationStatus.CLOSED && {
          closedAt: new Date(),
        }),
      },
    })

    // Se atribuído a agente, remover da fila
    if (dto.status === ConversationStatus.ASSIGNED && dto.agentUserId) {
      await this.reorganizeQueue(updated.companyId)
    }

    return updated
  }

  async getActiveQueue(companyId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        companyId,
        status: {
          in: [ConversationStatus.WAITING, ConversationStatus.OPEN],
        },
      },
      orderBy: {
        queuePosition: 'asc',
      },
      include: {
        client: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return conversations.map((conv, index) => ({
      conversationId: conv.id,
      position: index + 1,
      clientName: conv.client?.name || 'Anônimo',
      startedAt: conv.startedAt,
      lastMessage: conv.messages[0]?.contentText || null,
      status: conv.status,
    }))
  }

  private async calculateQueuePosition(companyId: string): Promise<number> {
    const lastInQueue = await this.prisma.conversation.findFirst({
      where: {
        companyId,
        status: {
          in: [ConversationStatus.WAITING, ConversationStatus.OPEN],
        },
      },
      orderBy: {
        queuePosition: 'desc',
      },
    })

    return (lastInQueue?.queuePosition || 0) + 1
  }

  private async reorganizeQueue(companyId: string) {
    const waitingConversations = await this.prisma.conversation.findMany({
      where: {
        companyId,
        status: ConversationStatus.WAITING,
      },
      orderBy: {
        startedAt: 'asc',
      },
    })

    // Reordenar posições
    for (let i = 0; i < waitingConversations.length; i++) {
      await this.prisma.conversation.update({
        where: { id: waitingConversations[i].id },
        data: { queuePosition: i + 1 },
      })
    }

    this.logger.log(`Queue reorganized for company ${companyId}`)
  }

  private estimateWaitTime(position: number): number {
    // Estimativa simples: 5 minutos por posição na fila
    const minutesPerPosition = 5
    return position * minutesPerPosition
  }
}
