'use client'

import { useEffect, useState } from 'react'
import { MessageList_T3_003 } from './MessageList_T3.003'
import { MessageInput_T3_003 } from './MessageInput_T3.003'
import { QueueStatus_T3_003 } from './QueueStatus_T3.003'
import { useSocket_T3_003 } from '@/hooks/useSocket_T3.003'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface ChatWindowProps {
  conversationId: string
  userId?: string
  token?: string
  companyName?: string
}

export function ChatWindow_T3_003({
  conversationId,
  userId = 'user-demo',
  token,
  companyName = 'Empresa'
}: ChatWindowProps) {
  const [hasError, setHasError] = useState(false)

  const {
    isConnected,
    isReconnecting,
    messages,
    queueStatus,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
  } = useSocket_T3_003({
    conversationId,
    token,
    onError: (error) => {
      console.error('Socket error:', error)
      setHasError(true)
      toast.error('Erro de conexão. Tentando reconectar...')
    },
    onMessage: (message) => {
      // Play notification sound for new messages
      if (message.senderId !== userId) {
        // TODO: Play sound
        toast.info(`Nova mensagem de ${message.senderName}`)
      }
    },
    onQueueUpdate: (status) => {
      toast.info(`Posição na fila: ${status.position}`)
    },
  })

  useEffect(() => {
    if (isConnected && hasError) {
      setHasError(false)
      toast.success('Conexão reestabelecida')
    }
  }, [isConnected, hasError])

  return (
    <Card className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <CardHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-semibold text-lg">{companyName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Suporte ao Cliente
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isReconnecting ? (
              <Badge variant="outline" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Reconectando...
              </Badge>
            ) : isConnected ? (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                <Wifi className="w-3 h-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-red-600 border-red-600">
                <WifiOff className="w-3 h-3" />
                Offline
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {queueStatus && (
          <div className="px-4 pt-4">
            <QueueStatus_T3_003
              position={queueStatus.position}
              estimatedWait={queueStatus.estimatedWait}
              isConnected={isConnected}
            />
          </div>
        )}

        <MessageList_T3_003
          messages={messages}
          typingUsers={typingUsers}
          currentUserId={userId}
        />
      </CardContent>

      <CardFooter className="p-0">
        <MessageInput_T3_003
          onSendMessage={sendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          disabled={!isConnected}
          placeholder={
            !isConnected
              ? 'Aguardando conexão...'
              : queueStatus
              ? 'Digite sua mensagem (você está na fila)...'
              : 'Digite sua mensagem...'
          }
        />
      </CardFooter>
    </Card>
  )
}
