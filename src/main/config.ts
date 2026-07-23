import path from 'path';
import fs from 'fs';
import { getSuiteRootPath } from './directories';
import { DEFAULT_SETTINGS } from '../shared/config';
import { SystemSettings } from '../shared/types';
import { SystemSettingsSchema } from '../shared/validation';
import { logger } from './logger';

export class SettingsManager {
  private configPath: string;
  private currentSettings: SystemSettings = DEFAULT_SETTINGS;
  private initialized: boolean = false;

  constructor() {
    this.configPath = path.join(getSuiteRootPath(), 'config', 'settings.json');
  }

  public initialize(): SystemSettings {
    if (this.initialized) return this.currentSettings;
    this.currentSettings = this.loadOrInitialize();
    this.initialized = true;
    return this.currentSettings;
  }

  private loadOrInitialize(): SystemSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const validated = SystemSettingsSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
        logger.warn('Corrupted settings.json detected. Re-initializing default values.');
      }
    } catch (e) {
      logger.error('Failed reading settings.json:', e);
    }

    this.currentSettings = DEFAULT_SETTINGS;
    this.save(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  public getSettings(): SystemSettings {
    if (!this.initialized) {
      this.initialize();
    }
    return { ...this.currentSettings };
  }

  public save(newSettings: Partial<SystemSettings>): SystemSettings {
    const base = this.currentSettings || DEFAULT_SETTINGS;
    const merged = {
      ...base,
      ...newSettings,
      app: { ...(base.app || {}), ...(newSettings.app || {}) },
      database: { ...(base.database || {}), ...(newSettings.database || {}) },
      printing: { ...(base.printing || {}), ...(newSettings.printing || {}) },
      security: { ...(base.security || {}), ...(newSettings.security || {}) },
    };

    const validated = SystemSettingsSchema.safeParse(merged);
    if (!validated.success) {
      logger.error('Invalid settings structure attempted:', validated.error.format());
      return base;
    }

    this.currentSettings = validated.data;
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.currentSettings, null, 2), 'utf-8');
      logger.info('settings.json saved successfully.');
    } catch (e) {
      logger.error('Failed to write settings.json:', e);
    }

    return this.currentSettings;
  }

  public reset(): SystemSettings {
    return this.save(DEFAULT_SETTINGS);
  }
}

export const settingsManager = new SettingsManager();
