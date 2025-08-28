/**
 * [S3][T3.004] - Controller de anexos
 * Endpoints para upload, download e gerenciamento de arquivos
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  ParseFilePipeBuilder,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AttachmentsService } from './attachments.service_T3.004';
import {
  AttachmentType,
  AttachmentResponseDto,
  AudioRecordingDto,
} from './dto/upload-attachment.dto_T3.004';
import * as fs from 'fs/promises';

@Controller('api/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Upload a file attachment
   * POST /api/attachments/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  }))
  async uploadAttachment(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 50 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body('conversationId') conversationId: string,
    @Body('type') type: AttachmentType = AttachmentType.OTHER,
    @Body('description') description?: string,
  ): Promise<AttachmentResponseDto> {
    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    // TODO: Get userId from auth context
    const userId = 'temp-user-id';

    return this.attachmentsService.uploadAttachment(
      file,
      conversationId,
      userId,
      type,
      description,
    );
  }

  /**
   * Upload an audio recording
   * POST /api/attachments/audio
   */
  @Post('audio')
  @UseInterceptors(FileInterceptor('audio', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB for audio
    },
  }))
  async uploadAudioRecording(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() audioData: AudioRecordingDto,
  ): Promise<AttachmentResponseDto> {
    if (!audioData.conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    // TODO: Get userId from auth context
    const userId = 'temp-user-id';

    return this.attachmentsService.uploadAudioRecording(
      file,
      audioData.conversationId,
      userId,
      audioData,
    );
  }

  /**
   * Download an attachment
   * GET /api/attachments/:filename
   */
  @Get(':filename')
  async downloadAttachment(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const attachment = await this.attachmentsService.getAttachment(filename);
    
    // Set appropriate headers
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileContent = await fs.readFile(attachment.path);
    res.send(fileContent);
  }

  /**
   * Get thumbnail for image attachments
   * GET /api/attachments/thumb/:filename
   */
  @Get('thumb/:filename')
  async getThumbnail(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const thumbnail = await this.attachmentsService.generateThumbnail(filename);
    
    // Set appropriate headers for image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    res.send(thumbnail);
  }

  /**
   * List attachments for a conversation
   * GET /api/attachments/conversation/:conversationId
   */
  @Get('conversation/:conversationId')
  async listAttachments(
    @Param('conversationId') conversationId: string,
    @Query('type') type?: AttachmentType,
  ): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.listAttachments(conversationId, type);
  }

  /**
   * Delete an attachment (soft delete)
   * DELETE /api/attachments/:messageId
   */
  @Delete(':messageId')
  async deleteAttachment(
    @Param('messageId') messageId: string,
  ): Promise<{ message: string }> {
    // TODO: Get userId from auth context
    const userId = 'temp-user-id';

    await this.attachmentsService.deleteAttachment(messageId, userId);
    
    return {
      message: 'Attachment deleted successfully',
    };
  }

  /**
   * Get upload constraints (for client information)
   * GET /api/attachments/constraints
   */
  @Get('constraints')
  getUploadConstraints() {
    return {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxAudioSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: {
        [AttachmentType.IMAGE]: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
        [AttachmentType.DOCUMENT]: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'json', 'xml'],
        [AttachmentType.AUDIO]: ['mp3', 'wav', 'webm', 'ogg', 'm4a'],
        [AttachmentType.VIDEO]: ['mp4', 'webm', 'ogg', 'mov'],
      },
      supportedMimeTypes: {
        [AttachmentType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        [AttachmentType.DOCUMENT]: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'application/json',
          'application/xml',
        ],
        [AttachmentType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'],
        [AttachmentType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
      },
    };
  }
}
