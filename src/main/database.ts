import { dbConnection } from './database/connection';
import { migrationManager } from './database/migrationManager';
import { runSeeds } from './database/seeds/seedRunner';
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

      logger.info('[DatabaseEngine] Initializing RBAC Default Permissions...');
      RBACService.initializeDefaultPermissions();

      this.initialized = true;
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
