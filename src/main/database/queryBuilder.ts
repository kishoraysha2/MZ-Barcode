import { dbConnection, QueryResult } from './connection';
import { logger } from '../logger';

export class QueryBuilder {
  private static compiledCache: Map<string, string> = new Map();

  public static select<T = any>(table: string, columns: string[] = ['*'], where: Record<string, any> = {}, options: { limit?: number; offset?: number; orderBy?: string } = {}): T[] {
    const keys = Object.keys(where);
    const whereClause = keys.length > 0 ? `WHERE ${keys.map((k) => `${k} = ?`).join(' AND ')}` : '';
    const orderClause = options.orderBy ? `ORDER BY ${options.orderBy}` : '';
    const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
    const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

    const sql = `SELECT ${columns.join(', ')} FROM ${table} ${whereClause} ${orderClause} ${limitClause} ${offsetClause};`.trim();
    const params = keys.map((k) => where[k]);

    console.log('[QB] SQL:', sql);
    console.log('[QB] Params:', params);

    this.cache(sql);
    return dbConnection.all<T>(sql, params);
  }

  public static selectOne<T = any>(table: string, where: Record<string, any>): T | undefined {
    const results = this.select<T>(table, ['*'], where, { limit: 1 });
    const row = results[0];
    console.log('[QB] Row:', row);
    return row;
  }

  public static insert(table: string, data: Record<string, any>): QueryResult {
    const keys = Object.keys(data);
    const values = keys.map((k) => data[k]);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders});`;
    this.cache(sql);
    return dbConnection.run(sql, values);
  }

  public static update(table: string, data: Record<string, any>, where: Record<string, any>): QueryResult {
    const dataKeys = Object.keys(data);
    const whereKeys = Object.keys(where);

    const setClause = dataKeys.map((k) => `${k} = ?`).join(', ');
    const whereClause = whereKeys.map((k) => `${k} = ?`).join(' AND ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause};`;
    const params = [...dataKeys.map((k) => data[k]), ...whereKeys.map((k) => where[k])];

    this.cache(sql);
    return dbConnection.run(sql, params);
  }

  public static delete(table: string, where: Record<string, any>): QueryResult {
    const keys = Object.keys(where);
    const whereClause = keys.map((k) => `${k} = ?`).join(' AND ');

    const sql = `DELETE FROM ${table} WHERE ${whereClause};`;
    const params = keys.map((k) => where[k]);

    this.cache(sql);
    return dbConnection.run(sql, params);
  }

  private static cache(sql: string) {
    if (!this.compiledCache.has(sql)) {
      this.compiledCache.set(sql, sql);
      logger.info(`[QueryBuilder Cache] Prepared statement cached: ${sql.substring(0, 60)}...`);
    }
  }
}
