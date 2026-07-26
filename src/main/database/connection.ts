import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
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
  private db: Database.Database | null = null;
  private isConnected: boolean = false;

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
    if (this.isConnected && this.db) return;

    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(this.dbPath);

      if (SQLITE_CONFIG.WAL_MODE) {
        this.db.pragma('journal_mode = WAL');
      }
      if (SQLITE_CONFIG.FOREIGN_KEYS) {
        this.db.pragma('foreign_keys = ON');
      }
      if (SQLITE_CONFIG.BUSY_TIMEOUT) {
        this.db.pragma(`busy_timeout = ${SQLITE_CONFIG.BUSY_TIMEOUT}`);
      }

      logger.info(`[Database] Connected to SQLite DB at ${this.dbPath}`);
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
    this.db!.exec(sql);
  }

  public run(sql: string, params: any[] = []): QueryResult {
    this.ensureConnected();
    const stmt = this.db!.prepare(sql);
    const info = stmt.run(...params);
    return {
      changes: info.changes,
      lastInsertRowid: info.lastInsertRowid,
    };
  }

  public get<T = any>(sql: string, params: any[] = []): T | undefined {
    this.ensureConnected();
    const stmt = this.db!.prepare(sql);
    return stmt.get(...params) as T | undefined;
  }

  public all<T = any>(sql: string, params: any[] = []): T[] {
    this.ensureConnected();
    const stmt = this.db!.prepare(sql);
    return stmt.all(...params) as T[];
  }

  public transaction<T>(callback: () => T): T {
    this.ensureConnected();
    if (this.db!.inTransaction) {
      return callback();
    }
    const txn = this.db!.transaction(callback);
    return txn();
  }

  private ensureConnected() {
    if (!this.isConnected || !this.db) {
      this.connect();
    }
  }

  public getUserVersion(): number {
    this.ensureConnected();
    const res = this.db!.pragma('user_version', { simple: true });
    return typeof res === 'number' ? res : 0;
  }

  public setUserVersion(version: number): void {
    this.ensureConnected();
    this.db!.pragma(`user_version = ${version}`);
    logger.info(`[Database PRAGMA user_version] Updated to version ${version}`);
  }
}

export const dbConnection = SQLiteConnection.getInstance();

