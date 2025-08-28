'use client'

import { Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface QueueStatusProps {
  position?: number | null
  estimatedWait?: number | null
  isConnected: boolean
}

export function QueueStatus_T3_003({ position, estimatedWait, isConnected }: QueueStatusProps) {
  if (!position || position === 0) return null

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
            Aguardando atendimento
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Posição na fila: <span className="font-bold">{position}</span>
            </p>
            {estimatedWait && (
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Tempo estimado: <span className="font-medium">{estimatedWait} min</span>
              </p>
            )}
          </div>
          {!isConnected && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Reconectando...
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
