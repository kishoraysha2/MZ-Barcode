import { QueryBuilder } from './queryBuilder';
import { AuditLogInsertSchema } from '../../shared/databaseSchemas';
import { logger } from '../logger';

export interface AuditLogEntry {
  username?: string;
  role?: string;
  action: string;
  category: 'AUTHENTICATION' | 'BARCODE' | 'LICENSE' | 'SYSTEM' | 'BACKUP';
  details?: string;
  ipAddress?: string;
}

export class AuditFramework {
  public static log(entry: AuditLogEntry): void {
    const record = {
      timestamp: new Date().toISOString(),
      username: entry.username || 'SYSTEM',
      role: entry.role || 'ADMIN',
      action: entry.action,
      category: entry.category,
      details: entry.details || '',
      ip_address: entry.ipAddress || '127.0.0.1',
    };

    const validated = AuditLogInsertSchema.safeParse(record);
    if (!validated.success) {
      logger.error('[Audit Framework] Invalid audit log entry format:', validated.error.format());
      return;
    }

    try {
      QueryBuilder.insert('audit_logs', validated.data);
      logger.info(`[Audit Log] [${validated.data.category}] ${validated.data.action} by ${validated.data.username}`);
    } catch (err) {
      logger.error('[Audit Framework] Failed to persist audit log:', err);
    }
  }
}
