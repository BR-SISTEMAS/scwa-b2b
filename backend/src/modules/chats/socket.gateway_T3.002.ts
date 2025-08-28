import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets'
import { Logger, UseGuards, Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { ChatsService_T3_001 } from './chats.service_T3.001'
import { PrismaService } from '../../prisma/prisma.service_T1.002'
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  SocketData,
  MessageData,
  SendMessageData,
  JoinResponse,
  MessageResponse
} from './interfaces/socket-events.interface_T3.002'
import { SOCKET_EVENTS, ROOM_PREFIX, ERROR_CODES } from './events_T3.002'

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/chat',
})
export class SocketGateway_T3_002 
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>

  private readonly logger = new Logger(SocketGateway_T3_002.name)
  private readonly connectedUsers = new Map<string, Set<string>>() // userId -> socketIds
  private readonly socketToUser = new Map<string, string>() // socketId -> userId
  private readonly typingUsers = new Map<string, Set<string>>() // conversationId -> userIds

  constructor(
    private readonly chatsService: ChatsService_T3_001,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Socket.IO server initialized')
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    
    // TODO: Validar token JWT do handshake
    const token = client.handshake.auth?.token
    if (!token) {
      client.emit(SOCKET_EVENTS.ERROR, {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Authentication required',
      })
      client.disconnect()
      return
    }

    // TODO: Decodificar token e obter userId
    const userId = client.handshake.query.userId as string
    if (userId) {
      this.addUserConnection(userId, client.id)
      client.data.userId = userId
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    
    const userId = client.data.userId
    if (userId) {
      this.removeUserConnection(userId, client.id)
      
      // Limpar typing status
      const conversationId = client.data.conversationId
      if (conversationId) {
        this.handleStopTyping(client, conversationId)
      }
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN)
  async handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<JoinResponse> {
    try {
      this.logger.log(`User ${client.data.userId} joining conversation ${conversationId}`)
      
      // Verificar se a conversa existe
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          client: true,
          agent: true,
        },
      })

      if (!conversation) {
        throw new WsException({
          code: ERROR_CODES.CONVERSATION_NOT_FOUND,
          message: 'Conversation not found',
        })
      }

      // Adicionar cliente à sala
      const roomName = `${ROOM_PREFIX.CONVERSATION}${conversationId}`
      await client.join(roomName)
      client.data.conversationId = conversationId

      // Notificar outros participantes
      client.to(roomName).emit(SOCKET_EVENTS.USER_JOINED, {
        userId: client.data.userId,
        userName: client.data.userName || 'User',
        role: client.data.role || 'client',
      })

      // Preparar resposta
      const messages: MessageData[] = conversation.messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId || 'system',
        senderName: msg.senderType === 'agent' 
          ? conversation.agent?.name || 'Agent'
          : conversation.client?.name || 'Client',
        senderType: msg.senderType,
        content: msg.contentText,
        contentType: 'text',
        timestamp: msg.createdAt.toISOString(),
        metadata: msg.contentJson as any,
      }))

      return {
        success: true,
        conversationId,
        messages,
        participants: [
          ...(conversation.client ? [{
            userId: conversation.client.id,
            userName: conversation.client.name,
            role: 'client' as const,
            isOnline: this.isUserOnline(conversation.client.id),
          }] : []),
          ...(conversation.agent ? [{
            userId: conversation.agent.id,
            userName: conversation.agent.name,
            role: 'agent' as const,
            isOnline: this.isUserOnline(conversation.agent.id),
          }] : []),
        ],
      }
    } catch (error) {
      this.logger.error(`Error joining conversation: ${error.message}`)
      return {
        success: false,
        conversationId,
        error: error.message,
      }
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE)
  async handleLeave(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `${ROOM_PREFIX.CONVERSATION}${conversationId}`
    await client.leave(roomName)
    
    // Notificar outros participantes
    client.to(roomName).emit(SOCKET_EVENTS.USER_LEFT, client.data.userId)
    
    delete client.data.conversationId
  }

  @SubscribeMessage(SOCKET_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() data: SendMessageData,
    @ConnectedSocket() client: Socket,
  ): Promise<MessageResponse> {
    try {
      this.logger.log(`Message from ${client.data.userId} to conversation ${data.conversationId}`)
      
      // Validar dados
      if (!data.content || !data.conversationId) {
        throw new WsException({
          code: ERROR_CODES.INVALID_MESSAGE,
          message: 'Invalid message data',
        })
      }

      // Salvar mensagem no banco
      const message = await this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: client.data.userId,
          senderType: client.data.role || 'client',
          contentText: data.content,
          contentJson: {
            type: data.contentType || 'text',
            content: data.content,
            metadata: data.metadata,
            timestamp: new Date().toISOString(),
          },
        },
        include: {
          sender: true,
        },
      })

      // Preparar dados da mensagem
      const messageData: MessageData = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId || 'system',
        senderName: message.sender?.name || 'User',
        senderType: message.senderType,
        content: message.contentText,
        contentType: data.contentType || 'text',
        timestamp: message.createdAt.toISOString(),
        metadata: data.metadata,
      }

      // Enviar mensagem para todos na sala
      const roomName = `${ROOM_PREFIX.CONVERSATION}${data.conversationId}`
      this.server.to(roomName).emit(SOCKET_EVENTS.MESSAGE, messageData)

      // Limpar typing status
      this.handleStopTyping(client, data.conversationId)

      return {
        success: true,
        messageId: message.id,
        timestamp: message.createdAt.toISOString(),
      }
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.MARK_AS_READ)
  async handleMarkAsRead(
    @MessageBody() messageId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // TODO: Implementar marcação de leitura
    const roomName = `${ROOM_PREFIX.CONVERSATION}${client.data.conversationId}`
    client.to(roomName).emit(SOCKET_EVENTS.MESSAGE_READ, messageId)
  }

  @SubscribeMessage(SOCKET_EVENTS.START_TYPING)
  async handleStartTyping(@ConnectedSocket() client: Socket) {
    const conversationId = client.data.conversationId
    if (!conversationId) return

    const typingSet = this.typingUsers.get(conversationId) || new Set()
    typingSet.add(client.data.userId)
    this.typingUsers.set(conversationId, typingSet)

    const roomName = `${ROOM_PREFIX.CONVERSATION}${conversationId}`
    client.to(roomName).emit(SOCKET_EVENTS.TYPING, {
      userId: client.data.userId,
      isTyping: true,
    })
  }

  @SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    conversationId?: string,
  ) {
    const convId = conversationId || client.data.conversationId
    if (!convId) return

    const typingSet = this.typingUsers.get(convId)
    if (typingSet) {
      typingSet.delete(client.data.userId)
      if (typingSet.size === 0) {
        this.typingUsers.delete(convId)
      }
    }

    const roomName = `${ROOM_PREFIX.CONVERSATION}${convId}`
    client.to(roomName).emit(SOCKET_EVENTS.TYPING, {
      userId: client.data.userId,
      isTyping: false,
    })
  }

  @SubscribeMessage(SOCKET_EVENTS.GET_QUEUE_POSITION)
  async handleGetQueuePosition(
    @ConnectedSocket() client: Socket,
  ): Promise<number> {
    const conversationId = client.data.conversationId
    if (!conversationId) return -1

    const status = await this.chatsService.getQueueStatus(conversationId)
    return status.queuePosition || 0
  }

  // Métodos auxiliares
  private addUserConnection(userId: string, socketId: string) {
    const connections = this.connectedUsers.get(userId) || new Set()
    connections.add(socketId)
    this.connectedUsers.set(userId, connections)
    this.socketToUser.set(socketId, userId)
  }

  private removeUserConnection(userId: string, socketId: string) {
    const connections = this.connectedUsers.get(userId)
    if (connections) {
      connections.delete(socketId)
      if (connections.size === 0) {
        this.connectedUsers.delete(userId)
      }
    }
    this.socketToUser.delete(socketId)
  }

  private isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }

  // Métodos públicos para outros serviços
  public notifyConversationAssigned(
    conversationId: string,
    agentId: string,
    agentName: string,
  ) {
    const roomName = `${ROOM_PREFIX.CONVERSATION}${conversationId}`
    this.server.to(roomName).emit(SOCKET_EVENTS.CONVERSATION_ASSIGNED, {
      conversationId,
      agentId,
      agentName,
    })
  }

  public notifyQueueUpdate(conversationId: string, position: number, estimatedWait: number) {
    const roomName = `${ROOM_PREFIX.CONVERSATION}${conversationId}`
    this.server.to(roomName).emit(SOCKET_EVENTS.QUEUE_UPDATE, {
      position,
      estimatedWait,
    })
  }
}
