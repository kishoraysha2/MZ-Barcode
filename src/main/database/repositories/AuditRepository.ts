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

  public logAction(logEntry: Record<string, any>): QueryResult {
    const validated = AuditLogInsertSchema.parse(logEntry);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public findByCategory(category: string, limit = 50): AuditLogRow[] {
    return QueryBuilder.select<AuditLogRow>(this.tableName, ['*'], { category }, { limit, orderBy: 'timestamp DESC' });
  }
}

export const auditRepository = new AuditRepository();
