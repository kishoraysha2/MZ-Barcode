import { dbConnection, SQLiteConnection } from './connection';
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

    if (status.pendingCount > 0) {
      const pending = ALL_MIGRATIONS.filter((m) => m.version > status.currentVersion).sort((a, b) => a.version - b.version);

      for (const migration of pending) {
        this.applyMigration(migration);
      }

      logger.info(`[Migration Manager] All migrations applied. New DB Version: ${dbConnection.getUserVersion()}`);
    } else {
      logger.info('[Migration Manager] Database schema version is up to date.');
    }

    // Always run schema integrity check to guarantee required columns on existing tables exist
    this.ensureSchemaIntegrity();
  }

  private ensureSchemaIntegrity(): void {
    try {
      const tableExists = dbConnection.get<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='print_jobs'"
      );
      if (tableExists) {
        const columns = dbConnection.all<{ name: string }>("PRAGMA table_info('print_jobs')").map((col) => col.name);

        if (!columns.includes('zpl_output')) {
          logger.info('[Migration Manager] Repairing schema: Adding missing zpl_output column to print_jobs');
          dbConnection.exec('ALTER TABLE print_jobs ADD COLUMN zpl_output TEXT;');
        }
        if (!columns.includes('tspl_output')) {
          logger.info('[Migration Manager] Repairing schema: Adding missing tspl_output column to print_jobs');
          dbConnection.exec('ALTER TABLE print_jobs ADD COLUMN tspl_output TEXT;');
        }
        if (!columns.includes('job_metadata_json')) {
          logger.info('[Migration Manager] Repairing schema: Adding missing job_metadata_json column to print_jobs');
          dbConnection.exec("ALTER TABLE print_jobs ADD COLUMN job_metadata_json TEXT DEFAULT '{}';");
        }
      }

      const productsExists = dbConnection.get<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
      );
      if (productsExists) {
        const prodCols = dbConnection.all<{ name: string }>("PRAGMA table_info('products')").map((col) => col.name);

        if (!prodCols.includes('purchase_price')) {
          logger.info('[Migration Manager] Repairing schema: Adding missing purchase_price column to products');
          dbConnection.exec('ALTER TABLE products ADD COLUMN purchase_price REAL DEFAULT 0.00;');
        }
        if (!prodCols.includes('status')) {
          logger.info('[Migration Manager] Repairing schema: Adding missing status column to products');
          dbConnection.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'ACTIVE';");
        }
      }
    } catch (err) {
      logger.error('[Migration Manager] Schema integrity check error:', err);
    }
  }

  private applyMigration(migration: Migration): void {
    logger.info(`[Migration Manager] Applying migration v${migration.version}: ${migration.name}`);

    try {
      dbConnection.transaction(() => {
        if (typeof migration.up === 'function') {
          migration.up(dbConnection);
        } else if (typeof migration.up === 'string' && migration.up.trim()) {
          dbConnection.exec(migration.up);
        }
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
        if (typeof migrationToRollback.down === 'function') {
          migrationToRollback.down(dbConnection);
        } else if (typeof migrationToRollback.down === 'string' && migrationToRollback.down.trim()) {
          dbConnection.exec(migrationToRollback.down);
        }
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

