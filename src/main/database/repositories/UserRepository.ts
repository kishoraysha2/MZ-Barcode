import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { UserInsertSchema, UserUpdateSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role_id: number;
  email?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

export class UserRepository extends BaseRepository<UserRow> {
  protected tableName = 'users';

  public findByUsername(username: string): UserRow | undefined {
    return QueryBuilder.selectOne<UserRow>(this.tableName, { username });
  }

  public create(user: Record<string, any>): QueryResult {
    const validated = UserInsertSchema.parse(user);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public update(id: number, user: Record<string, any>): QueryResult {
    const validated = UserUpdateSchema.parse({ ...user, id });
    return QueryBuilder.update(this.tableName, validated, { id });
  }

  public createSession(sessionData: { userId: number; sessionToken: string; expiresAt: string; ipAddress?: string }): QueryResult {
    return QueryBuilder.insert('user_sessions', {
      user_id: sessionData.userId,
      session_token: sessionData.sessionToken,
      expires_at: sessionData.expiresAt,
      ip_address: sessionData.ipAddress || '127.0.0.1',
      is_active: 1,
    });
  }
}

export const userRepository = new UserRepository();
