import { AuditAction } from '../dto/create-audit-log.dto_T1.005';

export interface AuditLog {
  id: string;
  actorId: string;
  action: AuditAction;
  payload: Record<string, any>;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  companyId?: string;
  createdAt: Date;
}

export interface AuditLogWithRelations extends AuditLog {
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  company?: {
    id: string;
    name: string;
  };
}
