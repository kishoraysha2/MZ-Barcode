import { dbConnection } from './connection';
import { ALL_MIGRATIONS, Migration } from './migrations';
import { logger } from '../logger';

export interface MigrationStatus {
  currentVersion: number;
  requiredVersion: number;
  pendingCount: number;
  completedMigrations: string[];
}

export class MigrationManager {
  private targetVersion: number;

  constructor() {
    this.targetVersion = ALL_MIGRATIONS.length > 0 ? ALL_MIGRATIONS[ALL_MIGRATIONS.length - 1].version : 0;
  }

  public getStatus(): MigrationStatus {
    const currentVersion = dbConnection.getUserVersion();
    const pending = ALL_MIGRATIONS.filter((m) => m.version > currentVersion);
    const completed = ALL_MIGRATIONS.filter((m) => m.version <= currentVersion).map((m) => m.name);

    return {
      currentVersion,
      requiredVersion: this.targetVersion,
      pendingCount: pending.length,
      completedMigrations: completed,
    };
  }

  public migrate(): void {
    const status = this.getStatus();
    logger.info(`[Migration Manager] Current DB Version: ${status.currentVersion}, Required Version: ${status.requiredVersion}`);

    if (status.pendingCount === 0) {
      logger.info('[Migration Manager] Database schema is up to date.');
      return;
    }

    const pending = ALL_MIGRATIONS.filter((m) => m.version > status.currentVersion).sort((a, b) => a.version - b.version);

    for (const migration of pending) {
      this.applyMigration(migration);
    }

    logger.info(`[Migration Manager] All migrations applied. New DB Version: ${dbConnection.getUserVersion()}`);
  }

  private applyMigration(migration: Migration): void {
    logger.info(`[Migration Manager] Applying migration v${migration.version}: ${migration.name}`);

    try {
      dbConnection.transaction(() => {
        dbConnection.exec(migration.up);
        dbConnection.setUserVersion(migration.version);
      });

      logger.info(`[Migration Manager] Migration ${migration.name} applied successfully.`);
    } catch (err) {
      logger.error(`[Migration Manager] Failed applying migration ${migration.name}. Rolling back...`, err);
      throw new Error(`Migration Failed: ${migration.name} - ${(err as Error).message}`);
    }
  }

  public rollbackLastMigration(): void {
    const currentVersion = dbConnection.getUserVersion();
    if (currentVersion === 0) {
      logger.info('[Migration Manager] No migrations to rollback.');
      return;
    }

    const migrationToRollback = ALL_MIGRATIONS.find((m) => m.version === currentVersion);
    if (!migrationToRollback) {
      logger.warn(`[Migration Manager] Migration for version ${currentVersion} not found in registry.`);
      return;
    }

    logger.info(`[Migration Manager] Rolling back migration v${migrationToRollback.version}: ${migrationToRollback.name}`);

    try {
      dbConnection.transaction(() => {
        dbConnection.exec(migrationToRollback.down);
        dbConnection.setUserVersion(currentVersion - 1);
      });

      logger.info(`[Migration Manager] Rollback of ${migrationToRollback.name} complete. Current Version: ${currentVersion - 1}`);
    } catch (err) {
      logger.error(`[Migration Manager] Rollback failed for ${migrationToRollback.name}:`, err);
      throw err;
    }
  }
}

export const migrationManager = new MigrationManager();
