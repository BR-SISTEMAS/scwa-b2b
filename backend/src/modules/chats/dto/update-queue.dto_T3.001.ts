import { IsEnum, IsOptional, IsNumber, IsUUID } from 'class-validator'

export enum ConversationStatus {
  OPEN = 'open',
  WAITING = 'waiting',
  ASSIGNED = 'assigned',
  CLOSED = 'closed'
}

export class UpdateQueueDto_T3_001 {
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus

  @IsOptional()
  @IsNumber()
  queuePosition?: number

  @IsOptional()
  @IsUUID()
  agentUserId?: string
}
