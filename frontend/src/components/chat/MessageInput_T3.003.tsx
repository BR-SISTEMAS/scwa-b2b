'use client'

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { Send, Paperclip, Smile, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'audio') => void
  onStartTyping?: () => void
  onStopTyping?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput_T3_003({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = 'Digite sua mensagem...'
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    onSendMessage(trimmedMessage)
    setMessage('')
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      onStopTyping?.()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }

    // Keep focus on input
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    // Typing indicator logic
    if (e.target.value && !isTyping) {
      setIsTyping(true)
      onStartTyping?.()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    if (e.target.value) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false)
          onStopTyping?.()
        }
      }, 1000)
    } else {
      // Immediately stop typing if input is empty
      if (isTyping) {
        setIsTyping(false)
        onStopTyping?.()
      }
    }
  }

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log('File upload not yet implemented')
  }

  const handleEmojiPicker = () => {
    // TODO: Implement emoji picker
    console.log('Emoji picker not yet implemented')
  }

  const handleVoiceMessage = () => {
    // TODO: Implement voice message
    console.log('Voice message not yet implemented')
  }

  return (
    <div className="border-t bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileUpload}
          disabled={disabled}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleEmojiPicker}
          disabled={disabled}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <Smile className="w-5 h-5" />
        </Button>

        <Input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleVoiceMessage}
          disabled={disabled}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <Mic className="w-5 h-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            'transition-colors',
            message.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
          )}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* File upload preview area (future implementation) */}
      <div id="file-preview" className="mt-2 hidden">
        {/* Files will be shown here */}
      </div>
    </div>
  )
}
