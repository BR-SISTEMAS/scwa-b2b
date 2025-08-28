import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator'

export class StartConversationDto_T3_001 {
  @IsOptional()
  @IsUUID()
  clientUserId?: string

  @IsOptional()
  @IsString()
  clientName?: string

  @IsOptional()
  @IsString()
  clientEmail?: string

  @IsOptional()
  @IsString()
  initialMessage?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
