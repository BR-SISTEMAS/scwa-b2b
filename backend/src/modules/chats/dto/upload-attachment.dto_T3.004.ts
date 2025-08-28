/**
 * [S3][T3.004] - DTO para upload de anexos
 * Validação de arquivos permitidos e metadados
 */

import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Max } from 'class-validator';

export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  OTHER = 'other',
}

export class UploadAttachmentDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  mimetype: string;

  @IsNumber()
  @Max(50 * 1024 * 1024) // Max 50MB
  size: number;

  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AttachmentResponseDto {
  id: string;
  conversationId: string;
  messageId?: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: AttachmentType;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export class AudioRecordingDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNumber()
  duration: number; // in seconds

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  transcript?: string; // Optional auto-transcription
}
