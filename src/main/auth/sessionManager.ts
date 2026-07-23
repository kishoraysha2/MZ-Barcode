import crypto from 'crypto';
import { userRepository } from '../database/repositories/UserRepository';
import { QueryBuilder } from '../database/queryBuilder';
import { logger } from '../logger';

export interface ActiveSession {
  sessionId: number;
  userId: number;
  username: string;
  roleId: number;
  roleName: string;
  fullName: string;
  sessionToken: string;
  expiresAt: string;
  ipAddress: string;
}

export class SessionManager {
  private static DEFAULT_SESSION_HOURS = 12;
  private static REMEMBER_ME_DAYS = 30;

  /**
   * Generates a cryptographically secure 64-character session token
   */
  public static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a new user session in the SQLite database
   */
  public static createSession(userId: number, rememberMe = false, ipAddress = '127.0.0.1'): ActiveSession {
    const sessionToken = this.generateSessionToken();
    const durationHours = rememberMe ? this.REMEMBER_ME_DAYS * 24 : this.DEFAULT_SESSION_HOURS;
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Insert into user_sessions repository table
    const result = userRepository.createSession({
      userId,
      sessionToken,
      expiresAt,
      ipAddress,
    });

    const role = QueryBuilder.selectOne<{ name: string }>('roles', { id: user.role_id });

    logger.info(`[SessionManager] Created session for user "${user.username}" (Expires: ${expiresAt})`);

    return {
      sessionId: Number(result.lastInsertRowid),
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: role ? role.name : 'USER',
      fullName: user.full_name,
      sessionToken,
      expiresAt,
      ipAddress,
    };
  }

  /**
   * Validates an active session token against SQLite
   */
  public static validateSession(sessionToken: string): ActiveSession | null {
    if (!sessionToken) return null;

    const sessionRow = QueryBuilder.selectOne<{
      id: number;
      user_id: number;
      session_token: string;
      expires_at: string;
      ip_address: string;
      is_active: number;
    }>('user_sessions', { session_token: sessionToken, is_active: 1 });

    if (!sessionRow) {
      return null;
    }

    // Expiry check
    if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
      logger.info(`[SessionManager] Session token expired. Invalidating session ID ${sessionRow.id}`);
      this.invalidateSession(sessionToken);
      return null;
    }

    const user = userRepository.findById(sessionRow.user_id);
    if (!user || user.is_active !== 1) {
      this.invalidateSession(sessionToken);
      return null;
    }

    const role = QueryBuilder.selectOne<{ name: string }>('roles', { id: user.role_id });

    return {
      sessionId: sessionRow.id,
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: role ? role.name : 'USER',
      fullName: user.full_name,
      sessionToken: sessionRow.session_token,
      expiresAt: sessionRow.expires_at,
      ipAddress: sessionRow.ip_address,
    };
  }

  /**
   * Safely invalidates/logs out a session token
   */
  public static invalidateSession(sessionToken: string): void {
    QueryBuilder.update('user_sessions', { is_active: 0 }, { session_token: sessionToken });
    logger.info('[SessionManager] Session invalidated successfully.');
  }

  /**
   * Cleans up expired user sessions
   */
  public static cleanupExpiredSessions(): void {
    const nowISO = new Date().toISOString();
    QueryBuilder.update('user_sessions', { is_active: 0 }, { is_active: 1, expires_at: nowISO });
  }
}
