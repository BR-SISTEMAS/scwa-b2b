/**
 * [S3][T3.004] - Serviço de anexos
 * Gerenciamento de upload, download e processamento de arquivos
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service_T1.002';
import { AttachmentType, AttachmentResponseDto, AudioRecordingDto } from './dto/upload-attachment.dto_T3.004';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  
  // Allowed MIME types per attachment type
  private readonly allowedMimeTypes = {
    [AttachmentType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    [AttachmentType.DOCUMENT]: ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/json', 'application/xml'],
    [AttachmentType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'],
    [AttachmentType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  };

  constructor(private prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File, type: AttachmentType): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Check MIME type
    const allowedTypes = this.allowedMimeTypes[type] || [];
    if (type !== AttachmentType.OTHER && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types for ${type}: ${allowedTypes.join(', ')}`
      );
    }

    // Additional security checks
    const forbiddenExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.dll'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (forbiddenExtensions.includes(fileExt)) {
      throw new BadRequestException('This file type is not allowed for security reasons');
    }
  }

  /**
   * Upload attachment for a conversation
   */
  async uploadAttachment(
    file: Express.Multer.File,
    conversationId: string,
    userId: string,
    type: AttachmentType,
    description?: string,
  ): Promise<AttachmentResponseDto> {
    // Validate conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Validate file
    this.validateFile(file, type);

    // Generate unique filename
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${conversationId}_${timestamp}_${hash}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      // Save file to disk
      await fs.writeFile(filepath, file.buffer);

      // Save attachment record to database
      const attachment = await this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          senderType: 'client', // Will be determined by auth context
          contentText: description || `Uploaded ${type}: ${file.originalname}`,
          contentJson: {
            type: 'attachment',
            attachmentType: type,
            filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: filepath,
            url: `/api/attachments/${filename}`,
            uploadedAt: new Date().toISOString(),
            status: 'sent',
          },
        },
      });

      // Log the upload
      this.logger.log(`File uploaded: ${filename} for conversation ${conversationId}`);

      // Return response DTO
      return {
        id: attachment.id,
        conversationId: attachment.conversationId,
        messageId: attachment.id,
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        type,
        url: `/api/attachments/${filename}`,
        thumbnailUrl: type === AttachmentType.IMAGE ? `/api/attachments/thumb/${filename}` : undefined,
        uploadedAt: attachment.createdAt,
        uploadedBy: userId,
      };
    } catch (error) {
      // Clean up file if database save fails
      try {
        await fs.unlink(filepath);
      } catch {}
      
      this.logger.error(`Failed to upload attachment: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload attachment');
    }
  }

  /**
   * Upload audio recording
   */
  async uploadAudioRecording(
    file: Express.Multer.File,
    conversationId: string,
    userId: string,
    audioData: AudioRecordingDto,
  ): Promise<AttachmentResponseDto> {
    // Validate audio file
    this.validateFile(file, AttachmentType.AUDIO);

    // Upload as attachment with audio-specific metadata
    const result = await this.uploadAttachment(
      file,
      conversationId,
      userId,
      AttachmentType.AUDIO,
      `Audio message (${audioData.duration}s)`,
    );

    // Update message with audio-specific data
    await this.prisma.message.update({
      where: { id: result.messageId },
      data: {
        contentJson: {
          ...(await this.prisma.message.findUnique({ 
            where: { id: result.messageId },
            select: { contentJson: true }
          }))?.contentJson as any,
          duration: audioData.duration,
          format: audioData.format || 'webm',
          transcript: audioData.transcript,
        },
      },
    });

    return result;
  }

  /**
   * Get attachment by filename
   */
  async getAttachment(filename: string): Promise<{ path: string; mimetype: string }> {
    // Find message with this attachment
    const message = await this.prisma.message.findFirst({
      where: {
        contentJson: {
          path: '$.type',
          equals: 'attachment',
        },
        AND: {
          contentJson: {
            path: '$.filename',
            equals: filename,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Attachment not found');
    }

    const attachmentData = message.contentJson as any;
    const filepath = path.join(this.uploadDir, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      throw new NotFoundException('Attachment file not found on disk');
    }

    return {
      path: filepath,
      mimetype: attachmentData.mimetype || 'application/octet-stream',
    };
  }

  /**
   * List attachments for a conversation
   */
  async listAttachments(
    conversationId: string,
    type?: AttachmentType,
  ): Promise<AttachmentResponseDto[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        contentJson: {
          path: '$.type',
          equals: 'attachment',
        },
        ...(type && {
          AND: {
            contentJson: {
              path: '$.attachmentType',
              equals: type,
            },
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return messages.map(msg => {
      const data = msg.contentJson as any;
      return {
        id: msg.id,
        conversationId: msg.conversationId,
        messageId: msg.id,
        filename: data.filename,
        originalName: data.originalName,
        mimetype: data.mimetype,
        size: data.size,
        type: data.attachmentType,
        url: data.url,
        thumbnailUrl: data.attachmentType === AttachmentType.IMAGE ? `/api/attachments/thumb/${data.filename}` : undefined,
        uploadedAt: msg.createdAt,
        uploadedBy: msg.senderId || '',
      };
    });
  }

  /**
   * Delete attachment (soft delete)
   */
  async deleteAttachment(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Attachment not found');
    }

    // Check if user has permission to delete
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own attachments');
    }

    // Mark as deleted in contentJson
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        contentJson: {
          ...(message.contentJson as any),
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        contentText: '[Attachment deleted]',
      },
    });

    // Note: Physical file deletion would be handled by retention job
    this.logger.log(`Attachment marked as deleted: ${messageId}`);
  }

  /**
   * Generate thumbnail for images (placeholder - actual implementation would use sharp or similar)
   */
  async generateThumbnail(filename: string): Promise<Buffer> {
    // This is a placeholder - in production, use a library like sharp to generate actual thumbnails
    const filepath = path.join(this.uploadDir, filename);
    
    try {
      // For now, just return the original image
      return await fs.readFile(filepath);
    } catch {
      throw new NotFoundException('Image not found');
    }
  }
}
