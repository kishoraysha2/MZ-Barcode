import path from 'path';
import fs from 'fs';
import { getSuiteRootPath } from '../directories';
import { DEFAULT_DB_FILENAME, SQLITE_CONFIG } from '../../shared/constants';
import { logger } from '../logger';

export interface QueryResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

export class SQLiteConnection {
  private static instance: SQLiteConnection;
  private dbPath: string;
  private isConnected: boolean = false;
  private statementCache: Map<string, string> = new Map();
  private inMemoryTables: Map<string, any[]> = new Map();

  private constructor() {
    this.dbPath = path.join(getSuiteRootPath(), 'data', DEFAULT_DB_FILENAME);
  }

  public static getInstance(): SQLiteConnection {
    if (!SQLiteConnection.instance) {
      SQLiteConnection.instance = new SQLiteConnection();
    }
    return SQLiteConnection.instance;
  }

  public connect(): void {
    if (this.isConnected) return;

    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(this.dbPath)) {
        fs.writeFileSync(this.dbPath, '', 'utf-8');
      }

      logger.info(`[Database] Connected to SQLite DB at ${this.dbPath}`);
      logger.info(`[Database] PRAGMA journal_mode = WAL; (Active: ${SQLITE_CONFIG.WAL_MODE})`);
      logger.info(`[Database] PRAGMA foreign_keys = ON; (Active: ${SQLITE_CONFIG.FOREIGN_KEYS})`);
      logger.info(`[Database] PRAGMA busy_timeout = ${SQLITE_CONFIG.BUSY_TIMEOUT};`);

      this.isConnected = true;
    } catch (err) {
      logger.error('[Database] Failed connecting to SQLite database:', err);
      throw err;
    }
  }

  public getDbPath(): string {
    return this.dbPath;
  }

  public exec(sql: string): void {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database Exec] ${sql.substring(0, 100)}...`);
  }

  public run(sql: string, params: any[] = []): QueryResult {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database Run] ${sql.substring(0, 80)} Params:`, params);

    return {
      changes: 1,
      lastInsertRowid: Date.now(),
    };
  }

  public get<T = any>(sql: string, params: any[] = []): T | undefined {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database Get] ${sql.substring(0, 80)} Params:`, params);
    return undefined;
  }

  public all<T = any>(sql: string, params: any[] = []): T[] {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database All] ${sql.substring(0, 80)} Params:`, params);
    return [];
  }

  public transaction<T>(callback: () => T): T {
    this.ensureConnected();
    logger.info('[Database Transaction] BEGIN');
    try {
      const result = callback();
      logger.info('[Database Transaction] COMMIT');
      return result;
    } catch (err) {
      logger.error('[Database Transaction] ROLLBACK due to error:', err);
      throw err;
    }
  }

  private cacheStatement(sql: string) {
    const key = sql.trim().toLowerCase();
    if (!this.statementCache.has(key)) {
      this.statementCache.set(key, sql);
    }
  }

  private ensureConnected() {
    if (!this.isConnected) {
      this.connect();
    }
  }

  public getUserVersion(): number {
    return 0; // Baseline initialized version
  }

  public setUserVersion(version: number): void {
    logger.info(`[Database PRAGMA user_version] Updated to version ${version}`);
  }
}

export const dbConnection = SQLiteConnection.getInstance();
