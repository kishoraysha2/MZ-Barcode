import { userRepository, UserRow } from '../database/repositories/UserRepository';
import { PasswordService } from './passwordService';
import { SessionManager, ActiveSession } from './sessionManager';
import { AuditFramework } from '../database/auditFramework';
import { QueryBuilder } from '../database/queryBuilder';
import { logger } from '../logger';

export class AuthService {
  /**
   * Local user authentication login flow
   */
  public static async login(
    username: string,
    password: string,
    rememberMe = false,
    ipAddress = '127.0.0.1'
  ): Promise<{ success: boolean; session?: ActiveSession; message?: string }> {
    logger.info(`[AuthService] Login attempt for user: "${username}"`);

    const user = userRepository.findByUsername(username);
    if (!user) {
      AuditFramework.log({
        username,
        role: 'GUEST',
        action: 'LOGIN_FAILED',
        category: 'AUTHENTICATION',
        details: 'Invalid username',
        ipAddress,
      });
      return { success: false, message: 'Invalid username or password.' };
    }

    if (user.is_active !== 1) {
      AuditFramework.log({
        username,
        role: 'DISABLED',
        action: 'LOGIN_FAILED',
        category: 'AUTHENTICATION',
        details: 'Account disabled',
        ipAddress,
      });
      return { success: false, message: 'This user account is currently disabled.' };
    }

    const isValidPassword = await PasswordService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      AuditFramework.log({
        username,
        role: 'USER',
        action: 'LOGIN_FAILED',
        category: 'AUTHENTICATION',
        details: 'Incorrect password',
        ipAddress,
      });
      return { success: false, message: 'Invalid username or password.' };
    }

    // Create session
    const session = SessionManager.createSession(user.id, rememberMe, ipAddress);

    // Audit Success Log
    AuditFramework.log({
      username: user.username,
      role: session.roleName,
      action: 'LOGIN_SUCCESS',
      category: 'AUTHENTICATION',
      details: `Session created token=${session.sessionToken.substring(0, 8)}...`,
      ipAddress,
    });

    return {
      success: true,
      session,
    };
  }

  /**
   * Local user logout
   */
  public static logout(sessionToken: string): void {
    const session = SessionManager.validateSession(sessionToken);
    if (session) {
      AuditFramework.log({
        username: session.username,
        role: session.roleName,
        action: 'LOGOUT',
        category: 'AUTHENTICATION',
        details: 'User logged out successfully',
        ipAddress: session.ipAddress,
      });
    }
    SessionManager.invalidateSession(sessionToken);
  }

  /**
   * Validates active session token
   */
  public static validateSession(sessionToken: string): ActiveSession | null {
    return SessionManager.validateSession(sessionToken);
  }

  /**
   * Change Password Framework
   */
  public static async changePassword(
    userId: number,
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message?: string }> {
    const user = userRepository.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const isMatch = await PasswordService.verifyPassword(currentPass, user.password_hash);
    if (!isMatch) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    const policy = PasswordService.validatePasswordPolicy(newPass);
    if (!policy.valid) {
      return { success: false, message: policy.errors.join(' ') };
    }

    const newHash = await PasswordService.hashPassword(newPass);
    userRepository.update(userId, {
      password_hash: newHash,
      updated_at: new Date().toISOString(),
    });

    AuditFramework.log({
      username: user.username,
      action: 'PASSWORD_CHANGE',
      category: 'AUTHENTICATION',
      details: 'Password changed successfully',
    });

    return { success: true };
  }

  /**
   * User Management: Create User
   */
  public static async createUser(userData: {
    username: string;
    fullName: string;
    password: string;
    roleId: number;
    email?: string;
    createdBy?: string;
  }): Promise<{ success: boolean; user?: UserRow; message?: string }> {
    const existing = userRepository.findByUsername(userData.username);
    if (existing) {
      return { success: false, message: `Username "${userData.username}" already exists.` };
    }

    const policy = PasswordService.validatePasswordPolicy(userData.password);
    if (!policy.valid) {
      return { success: false, message: policy.errors.join(' ') };
    }

    const passwordHash = await PasswordService.hashPassword(userData.password);

    userRepository.create({
      username: userData.username,
      password_hash: passwordHash,
      full_name: userData.fullName,
      role_id: userData.roleId,
      email: userData.email || null,
      created_by: userData.createdBy || 'ADMIN',
    });

    const newUser = userRepository.findByUsername(userData.username);

    AuditFramework.log({
      username: userData.createdBy || 'ADMIN',
      action: 'USER_CREATION',
      category: 'AUTHENTICATION',
      details: `Created user account "${userData.username}"`,
    });

    return { success: true, user: newUser };
  }

  /**
   * User Management: Update Status (Enable/Disable)
   */
  public static updateUserStatus(userId: number, isActive: boolean, updatedBy = 'ADMIN'): { success: boolean; message?: string } {
    const user = userRepository.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    userRepository.update(userId, {
      is_active: isActive ? 1 : 0,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    });

    AuditFramework.log({
      username: updatedBy,
      action: isActive ? 'USER_ACTIVATE' : 'USER_DISABLE',
      category: 'AUTHENTICATION',
      details: `Updated account status for "${user.username}" to ${isActive ? 'ACTIVE' : 'DISABLED'}`,
    });

    return { success: true };
  }

  /**
   * List all user accounts with role details
   */
  public static listUsers() {
    const users = userRepository.findAll();
    return users.map((u) => {
      const role = QueryBuilder.selectOne<{ name: string }>('roles', { id: u.role_id });
      return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        roleId: u.role_id,
        role: role ? role.name : 'USER',
        email: u.email,
        isActive: u.is_active === 1,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      };
    });
  }
}
