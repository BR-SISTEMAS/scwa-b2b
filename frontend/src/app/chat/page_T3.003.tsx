'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ChatWindow_T3_003 } from '@/components/chat/ChatWindow_T3.003'
import { Toaster } from '@/components/ui/sonner'

function ChatContent() {
  const searchParams = useSearchParams()
  
  // Get conversation ID from URL params or create a demo one
  const conversationId = searchParams.get('id') || `demo-${Date.now()}`
  const companyName = searchParams.get('company') || 'Demo Company'
  
  // TODO: Get user ID and token from auth context
  const userId = 'user-demo-123'
  const token = 'demo-token'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto h-[calc(100vh-2rem)]">
        <ChatWindow_T3_003
          conversationId={conversationId}
          userId={userId}
          token={token}
          companyName={companyName}
        />
      </div>
      <Toaster position="top-center" />
    </div>
  )
}

export default function ChatPage_T3_003() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando chat...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
