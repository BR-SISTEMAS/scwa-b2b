import { IsString, IsUUID, IsObject, IsOptional, IsEnum } from 'class-validator';

export enum AuditAction {
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  CONVERSATION_START = 'CONVERSATION_START',
  CONVERSATION_ASSIGN = 'CONVERSATION_ASSIGN',
  CONVERSATION_TRANSFER = 'CONVERSATION_TRANSFER',
  CONVERSATION_CLOSE = 'CONVERSATION_CLOSE',
  CONVERSATION_REOPEN = 'CONVERSATION_REOPEN',
  MESSAGE_SEND = 'MESSAGE_SEND',
  FILE_UPLOAD = 'FILE_UPLOAD',
  EXPORT_PDF = 'EXPORT_PDF',
  EXPORT_XML = 'EXPORT_XML',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DELETE = 'DATA_DELETE',
  AGENT_CREATE = 'AGENT_CREATE',
  AGENT_UPDATE = 'AGENT_UPDATE',
  COMPANY_CREATE = 'COMPANY_CREATE',
  COMPANY_UPDATE = 'COMPANY_UPDATE',
}

export class CreateAuditLogDto {
  @IsUUID()
  actorId: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsObject()
  payload: Record<string, any>;

  @IsOptional()
  @IsUUID()
  targetId?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
