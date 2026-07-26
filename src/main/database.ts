import fs from 'fs';
import { dbConnection } from './database/connection';
import { migrationManager } from './database/migrationManager';
import { runSeeds } from './database/seeds/seedRunner';
import { templateService } from './services/TemplateService';
import { RBACService } from './auth/rbacService';
import { logger } from './logger';

export class DatabaseEngine {
  private initialized: boolean = false;

  public initialize(): { path: string; initialized: boolean; wal: boolean; version: number } {
    try {
      logger.info('[DatabaseEngine] Starting SQLite Engine Connection...');
      dbConnection.connect();

      logger.info('[DatabaseEngine] Executing Schema Migration Manager...');
      migrationManager.migrate();

      logger.info('[DatabaseEngine] Executing Seed Runner...');
      runSeeds('development');

      logger.info('[DatabaseEngine] Initializing System Templates...');
      templateService.initSystemTemplates();

      logger.info('[DatabaseEngine] Initializing RBAC Default Permissions...');
      RBACService.initializeDefaultPermissions();

      this.initialized = true;

      this.logStartupVerification();

      const status = migrationManager.getStatus();

      return {
        path: dbConnection.getDbPath(),
        initialized: true,
        wal: true,
        version: status.currentVersion,
      };
    } catch (error) {
      logger.error('[DatabaseEngine] Initialization failure:', error);
      throw error;
    }
  }

  public logStartupVerification(): void {
    const dbPath = dbConnection.getDbPath();
    const dbExists = fs.existsSync(dbPath) ? 'YES' : 'NO';

    const tplTable = dbConnection.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='label_templates'"
    );
    const elemTable = dbConnection.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='label_elements'"
    );
    const tableCountRow = dbConnection.get<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table'"
    );

    const migrationStatus = migrationManager.getStatus();
    const migrationsExecuted = migrationStatus.currentVersion > 0 ? 'YES' : 'NO';

    const verifyLog = [
      '================ STARTUP DATABASE VERIFICATION ================',
      `Database File: ${dbPath}`,
      `Database exists: ${dbExists}`,
      `label_templates table exists: ${tplTable ? 'YES' : 'NO'}`,
      `label_elements table exists: ${elemTable ? 'YES' : 'NO'}`,
      `Number of tables found in sqlite_master: ${tableCountRow ? tableCountRow.cnt : 0}`,
      `Migration executed: ${migrationsExecuted}`,
      '================================================================',
    ].join('\n');

    console.log(verifyLog);
    logger.info(verifyLog);
  }

  public getStatus() {
    const migrationStatus = migrationManager.getStatus();
    return {
      initialized: this.initialized,
      path: dbConnection.getDbPath(),
      wal: true,
      foreignKeys: true,
      busyTimeout: 5000,
      currentVersion: migrationStatus.currentVersion,
      requiredVersion: migrationStatus.requiredVersion,
      pendingCount: migrationStatus.pendingCount,
    };
  }
}

export const databaseEngine = new DatabaseEngine();
