import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { SettingsDbInsertSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';
import { SystemSettings } from '../../../shared/types';

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
  private settingsStore: Map<string, string> = new Map();

  public findByKey(key: string): SettingRow | undefined {
    const val = this.settingsStore.get(key);
    if (val !== undefined) {
      return {
        id: 1,
        key,
        value: val,
        category: 'GENERAL',
        updated_at: new Date().toISOString(),
        updated_by: 'SYSTEM',
      };
    }
    return QueryBuilder.selectOne<SettingRow>(this.tableName, { key });
  }

  public setKey(key: string, value: string, category = 'GENERAL', updatedBy = 'SYSTEM'): QueryResult {
    this.settingsStore.set(key, value);
    const record = { key, value, category, updated_by: updatedBy, updated_at: new Date().toISOString() };
    const validated = SettingsDbInsertSchema.parse(record);

    const existing = this.findByKey(key);
    if (existing) {
      return QueryBuilder.update(this.tableName, validated, { key });
    }
    return QueryBuilder.insert(this.tableName, validated);
  }

  public getSettings(): SystemSettings {
    const defaultSettings: SystemSettings = {
      app: { theme: 'dark', autoUpdate: false, language: 'en-US', edition: 'customer' },
      database: { path: '%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db', walMode: true, autoBackupDaily: true },
      printing: { defaultPrinter: 'Not Configured', paperWidthMm: 50, paperHeightMm: 25, dpi: 203 },
      security: { sessionTimeoutMinutes: 30, auditLogging: true },
    };

    const stored = this.settingsStore.get('system_config');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  }

  public saveSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated: SystemSettings = {
      app: { ...current.app, ...(settings.app || {}) },
      database: { ...current.database, ...(settings.database || {}) },
      printing: { ...current.printing, ...(settings.printing || {}) },
      security: { ...current.security, ...(settings.security || {}) },
    };

    this.settingsStore.set('system_config', JSON.stringify(updated));
    this.setKey('system_config', JSON.stringify(updated), 'CONFIG', 'USER');
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
