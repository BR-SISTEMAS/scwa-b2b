'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface Message {
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

interface QueueStatus {
  position: number
  estimatedWait: number
}

interface TypingUser {
  userId: string
  userName: string
  isTyping: boolean
}

interface UseSocketOptions {
  conversationId?: string
  token?: string
  onMessage?: (message: Message) => void
  onQueueUpdate?: (status: QueueStatus) => void
  onTyping?: (user: TypingUser) => void
  onError?: (error: Error) => void
}

export function useSocket_T3_003({
  conversationId,
  token,
  onMessage,
  onQueueUpdate,
  onTyping,
  onError,
}: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const [isReconnecting, setIsReconnecting] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    if (!conversationId) return

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000/chat', {
      auth: { token },
      query: { userId: 'user-' + Math.random().toString(36).substr(2, 9) }, // TODO: Get from auth
      transports: ['websocket'],
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      setIsReconnecting(false)
      
      // Join conversation room
      socket.emit('join', conversationId, (response: any) => {
        if (response.success) {
          setMessages(response.messages || [])
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      onError?.(error)
    })

    socket.on('reconnect_attempt', () => {
      setIsReconnecting(true)
    })

    // Message events
    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
      onMessage?.(message)
    })

    socket.on('messageDelivered', (messageId: string) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, delivered: true } : msg
        )
      )
    })

    socket.on('messageRead', (messageId: string) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      )
    })

    // Queue events
    socket.on('queueUpdate', (status: QueueStatus) => {
      setQueueStatus(status)
      onQueueUpdate?.(status)
    })

    socket.on('conversationAssigned', (data: { agentId: string; agentName: string }) => {
      setQueueStatus(null)
      setMessages(prev => [
        ...prev,
        {
          id: 'system-' + Date.now(),
          conversationId: conversationId!,
          senderId: 'system',
          senderName: 'Sistema',
          senderType: 'system',
          content: `${data.agentName} entrou na conversa`,
          contentType: 'text',
          timestamp: new Date().toISOString(),
        },
      ])
    })

    // Typing events
    socket.on('typing', (data: { userId: string; userName?: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const updated = new Map(prev)
        if (data.isTyping) {
          updated.set(data.userId, {
            userId: data.userId,
            userName: data.userName || 'Usuário',
            isTyping: true,
          })
        } else {
          updated.delete(data.userId)
        }
        return updated
      })
      
      onTyping?.({
        userId: data.userId,
        userName: data.userName || 'Usuário',
        isTyping: data.isTyping,
      })
    })

    // User events
    socket.on('userJoined', (data: { userId: string; userName: string }) => {
      setMessages(prev => [
        ...prev,
        {
          id: 'system-' + Date.now(),
          conversationId: conversationId!,
          senderId: 'system',
          senderName: 'Sistema',
          senderType: 'system',
          content: `${data.userName} entrou na conversa`,
          contentType: 'text',
          timestamp: new Date().toISOString(),
        },
      ])
    })

    socket.on('userLeft', (userId: string) => {
      setTypingUsers(prev => {
        const updated = new Map(prev)
        updated.delete(userId)
        return updated
      })
    })

    return () => {
      if (socket.connected) {
        socket.emit('leave', conversationId)
      }
      socket.disconnect()
    }
  }, [conversationId, token, onMessage, onQueueUpdate, onTyping, onError])

  // Send message
  const sendMessage = useCallback((content: string, contentType: 'text' | 'image' | 'file' | 'audio' = 'text') => {
    if (!socketRef.current || !conversationId) return

    socketRef.current.emit(
      'sendMessage',
      {
        conversationId,
        content,
        contentType,
      },
      (response: any) => {
        if (!response.success) {
          console.error('Failed to send message:', response.error)
          onError?.(new Error(response.error))
        }
      }
    )
  }, [conversationId, onError])

  // Typing indicators
  const startTyping = useCallback(() => {
    socketRef.current?.emit('startTyping')
  }, [])

  const stopTyping = useCallback(() => {
    socketRef.current?.emit('stopTyping')
  }, [])

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    socketRef.current?.emit('markAsRead', messageId)
  }, [])

  // Get queue position
  const getQueuePosition = useCallback(() => {
    return new Promise<number>((resolve) => {
      socketRef.current?.emit('getQueuePosition', (position: number) => {
        resolve(position)
      })
    })
  }, [])

  return {
    isConnected,
    isReconnecting,
    messages,
    queueStatus,
    typingUsers: Array.from(typingUsers.values()),
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    getQueuePosition,
  }
}
