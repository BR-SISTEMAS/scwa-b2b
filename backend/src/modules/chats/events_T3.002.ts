// Constantes de eventos Socket.IO para T3.002
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN: 'join',
  LEAVE: 'leave',
  SEND_MESSAGE: 'sendMessage',
  MARK_AS_READ: 'markAsRead',
  START_TYPING: 'startTyping',
  STOP_TYPING: 'stopTyping',
  GET_QUEUE_POSITION: 'getQueuePosition',
  
  // Server to Client
  MESSAGE: 'message',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_READ: 'messageRead',
  CONVERSATION_ASSIGNED: 'conversationAssigned',
  CONVERSATION_CLOSED: 'conversationClosed',
  QUEUE_UPDATE: 'queueUpdate',
  TYPING: 'typing',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  ERROR: 'error',
  
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
} as const

export const ROOM_PREFIX = {
  CONVERSATION: 'conversation:',
  COMPANY: 'company:',
  USER: 'user:',
} as const

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
