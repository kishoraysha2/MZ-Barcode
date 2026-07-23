import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { BackupHistoryInsertSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface BackupHistoryRow {
  id: number;
  filename: string;
  filepath: string;
  size_bytes: number;
  status: string;
  created_at: string;
  created_by: string;
}

export class BackupRepository extends BaseRepository<BackupHistoryRow> {
  protected tableName = 'backup_history';

  public recordBackup(entry: Record<string, any>): QueryResult {
    const validated = BackupHistoryInsertSchema.parse(entry);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public getRecentBackups(limit = 20): BackupHistoryRow[] {
    return QueryBuilder.select<BackupHistoryRow>(this.tableName, ['*'], {}, { limit, orderBy: 'created_at DESC' });
  }
}

export const backupRepository = new BackupRepository();
