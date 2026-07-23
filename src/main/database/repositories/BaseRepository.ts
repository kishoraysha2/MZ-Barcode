import { QueryBuilder } from '../queryBuilder';
import { QueryResult } from '../connection';

export abstract class BaseRepository<T> {
  protected abstract tableName: string;

  public findById(id: number): T | undefined {
    return QueryBuilder.selectOne<T>(this.tableName, { id });
  }

  public findAll(limit = 100, offset = 0): T[] {
    return QueryBuilder.select<T>(this.tableName, ['*'], {}, { limit, offset });
  }

  public deleteById(id: number): QueryResult {
    return QueryBuilder.delete(this.tableName, { id });
  }
}
