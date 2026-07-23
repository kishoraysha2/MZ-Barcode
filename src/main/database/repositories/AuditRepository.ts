import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { AuditLogInsertSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface AuditLogRow {
  id: number;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  category: string;
  details: string;
  ip_address: string;
}

export class AuditRepository extends BaseRepository<AuditLogRow> {
  protected tableName = 'audit_logs';
  private logs: AuditLogRow[] = [];

  public logAction(logEntry: Record<string, any>): QueryResult {
    const validated = AuditLogInsertSchema.parse(logEntry);
    const row: AuditLogRow = {
      id: Date.now(),
      timestamp: validated.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
      username: validated.username || 'SYSTEM',
      role: validated.role || 'ADMIN',
      action: validated.action,
      category: validated.category || 'GENERAL',
      details: validated.details || '',
      ip_address: validated.ip_address || '127.0.0.1',
    };
    this.logs.unshift(row);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public findAll(limit = 100, offset = 0): AuditLogRow[] {
    return [...this.logs].slice(offset, offset + limit);
  }

  public findByCategory(category: string, limit = 50): AuditLogRow[] {
    return this.logs.filter((l) => l.category === category).slice(0, limit);
  }
}

export const auditRepository = new AuditRepository();
