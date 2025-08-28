// Interface de eventos do Socket.IO para T3.002
export interface ServerToClientEvents {
  // Mensagens
  message: (data: MessageData) => void
  messageDelivered: (messageId: string) => void
  messageRead: (messageId: string) => void
  
  // Status da conversa
  conversationAssigned: (data: { conversationId: string; agentId: string; agentName: string }) => void
  conversationClosed: (conversationId: string) => void
  queueUpdate: (data: { position: number; estimatedWait: number }) => void
  
  // Indicadores
  typing: (data: { userId: string; isTyping: boolean }) => void
  userJoined: (data: { userId: string; userName: string; role: string }) => void
  userLeft: (userId: string) => void
  
  // Erros
  error: (data: { code: string; message: string }) => void
}

export interface ClientToServerEvents {
  // Conexão
  join: (conversationId: string, callback?: (response: JoinResponse) => void) => void
  leave: (conversationId: string) => void
  
  // Mensagens
  sendMessage: (data: SendMessageData, callback?: (response: MessageResponse) => void) => void
  markAsRead: (messageId: string) => void
  
  // Indicadores
  startTyping: () => void
  stopTyping: () => void
  
  // Status
  getQueuePosition: (callback: (position: number) => void) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
  conversationId: string
  role: 'client' | 'agent' | 'manager'
  companyId: string
}

// DTOs
export interface MessageData {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: 'client' | 'agent' | 'system'
  content: string
  contentType: 'text' | 'image' | 'file' | 'audio'
  timestamp: string
  metadata?: Record<string, any>
}

export interface SendMessageData {
  conversationId: string
  content: string
  contentType?: 'text' | 'image' | 'file' | 'audio'
  metadata?: Record<string, any>
}

export interface JoinResponse {
  success: boolean
  conversationId: string
  messages?: MessageData[]
  participants?: Array<{
    userId: string
    userName: string
    role: string
    isOnline: boolean
  }>
  error?: string
}

export interface MessageResponse {
  success: boolean
  messageId?: string
  timestamp?: string
  error?: string
}
