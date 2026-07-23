import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { SettingsDbInsertSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface SettingRow {
  id: number;
  key: string;
  value: string;
  category: string;
  updated_at: string;
  updated_by: string;
}

export class SettingsRepository extends BaseRepository<SettingRow> {
  protected tableName = 'settings';

  public findByKey(key: string): SettingRow | undefined {
    return QueryBuilder.selectOne<SettingRow>(this.tableName, { key });
  }

  public setKey(key: string, value: string, category = 'GENERAL', updatedBy = 'SYSTEM'): QueryResult {
    const record = { key, value, category, updated_by: updatedBy, updated_at: new Date().toISOString() };
    const validated = SettingsDbInsertSchema.parse(record);

    const existing = this.findByKey(key);
    if (existing) {
      return QueryBuilder.update(this.tableName, validated, { key });
    }
    return QueryBuilder.insert(this.tableName, validated);
  }
}

export const settingsRepository = new SettingsRepository();
