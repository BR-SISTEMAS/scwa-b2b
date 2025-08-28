/**
 * [S3][T3.005] - DTO para persistência de mensagens
 * Define a estrutura de dados para salvar mensagens como JSON
 */

import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  SYSTEM = 'system',
  NOTIFICATION = 'notification',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export class MessageMetadata {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileSize?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  duration?: string; // For audio/video

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsObject()
  dimensions?: {
    width: number;
    height: number;
  };

  @IsOptional()
  @IsString()
  transcript?: string; // For audio messages

  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export class SaveMessageDto {
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsEnum(['client', 'agent', 'system'])
  senderType: string;

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @Type(() => MessageMetadata)
  metadata?: MessageMetadata;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsString()
  replyToId?: string;

  @IsOptional()
  @IsObject()
  reactions?: Record<string, string[]>; // emoji -> userIds

  @IsOptional()
  @IsObject()
  mentions?: string[]; // userIds mentioned

  @IsOptional()
  @IsString()
  editedAt?: string;

  @IsOptional()
  @IsString()
  deletedAt?: string;
}

export class MessageContentJson {
  type: MessageType;
  content: string;
  metadata?: MessageMetadata;
  status: MessageStatus;
  replyTo?: {
    messageId: string;
    preview: string;
  };
  reactions?: Record<string, string[]>;
  mentions?: string[];
  edited?: {
    at: string;
    by: string;
  };
  deleted?: {
    at: string;
    by: string;
  };
  timestamps: {
    sent: string;
    delivered?: string;
    read?: string;
  };
  version: number;
}
