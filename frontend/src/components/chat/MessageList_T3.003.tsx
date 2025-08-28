'use client'

import { useEffect, useRef } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bot, User, CheckCheck, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderType: 'client' | 'agent' | 'system'
  content: string
  contentType: 'text' | 'image' | 'file' | 'audio'
  timestamp: string
  delivered?: boolean
  read?: boolean
}

interface TypingUser {
  userId: string
  userName: string
}

interface MessageListProps {
  messages: Message[]
  typingUsers?: TypingUser[]
  currentUserId?: string
}

function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ptBR })
  } else if (isYesterday(date)) {
    return `Ontem ${format(date, 'HH:mm', { locale: ptBR })}`
  }
  return format(date, 'dd/MM HH:mm', { locale: ptBR })
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const isSystem = message.senderType === 'system'
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <Badge variant="secondary" className="text-xs">
          {message.content}
        </Badge>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-2 mb-4',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
            {message.senderType === 'agent' ? (
              <Bot className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
        </Avatar>
      )}
      
      <div className={cn('max-w-[70%]', isOwn && 'flex flex-col items-end')}>
        {!isOwn && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {message.senderName}
          </p>
        )}
        
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatMessageTime(message.timestamp)}
          </span>
          {isOwn && (
            <>
              {message.read ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : message.delivered ? (
                <CheckCheck className="w-3 h-3 text-gray-400" />
              ) : (
                <Check className="w-3 h-3 text-gray-400" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function MessageList_T3_003({ messages, typingUsers = [], currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <Bot className="w-12 h-12 mb-2" />
          <p className="text-sm">Nenhuma mensagem ainda</p>
          <p className="text-xs mt-1">Envie uma mensagem para começar</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}

      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          </div>
          <span className="text-xs">
            {typingUsers.map(u => u.userName).join(', ')} está digitando...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
