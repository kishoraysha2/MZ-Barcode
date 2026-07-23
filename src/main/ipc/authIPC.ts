import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { AuthService } from '../auth/authService';
import { RBACService } from '../auth/rbacService';
import { logger } from '../logger';

export function registerAuthIPC(
  registerHandler: (channel: string, handler: (event: unknown, ...args: any[]) => Promise<unknown>) => void
) {
  logger.info('Registering Auth & RBAC IPC Channels...');

  // Local Login
  registerHandler(IPC_CHANNELS.AUTH_LOGIN, async (_, payload: { username: string; password: string; rememberMe?: boolean }) => {
    try {
      const res = await AuthService.login(payload.username, payload.password, payload.rememberMe);
      if (!res.success) {
        return { success: false, error: { code: 'AUTH_FAILED', message: res.message || 'Login failed' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: res.session, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error AUTH_LOGIN:', err);
      return { success: false, error: { code: 'AUTH_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // Local Logout
  registerHandler(IPC_CHANNELS.AUTH_LOGOUT, async (_, payload: { sessionToken: string }) => {
    try {
      AuthService.logout(payload.sessionToken);
      return { success: true, data: { loggedOut: true }, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'LOGOUT_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // Validate Session Token
  registerHandler(IPC_CHANNELS.AUTH_VALIDATE_SESSION, async (_, payload: { sessionToken: string }) => {
    try {
      const session = AuthService.validateSession(payload.sessionToken);
      if (!session) {
        return { success: false, error: { code: 'SESSION_INVALID', message: 'Session expired or invalid' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: session, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'SESSION_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // Change Password
  registerHandler(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, async (_, payload: { userId: number; currentPass: string; newPass: string }) => {
    try {
      const res = await AuthService.changePassword(payload.userId, payload.currentPass, payload.newPass);
      if (!res.success) {
        return { success: false, error: { code: 'PASSWORD_CHANGE_FAILED', message: res.message || 'Password change failed' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: { updated: true }, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'PASSWORD_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // User Management: List Users
  registerHandler(IPC_CHANNELS.USER_LIST, async () => {
    try {
      const users = AuthService.listUsers();
      return { success: true, data: users, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'USER_LIST_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // User Management: Create User
  registerHandler(IPC_CHANNELS.USER_CREATE, async (_, payload: { username: string; fullName: string; password: string; roleId: number; email?: string }) => {
    try {
      const res = await AuthService.createUser(payload);
      if (!res.success) {
        return { success: false, error: { code: 'USER_CREATE_FAILED', message: res.message || 'Failed creating user' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: res.user, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'USER_CREATE_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // User Management: Update User Active Status
  registerHandler(IPC_CHANNELS.USER_UPDATE_STATUS, async (_, payload: { userId: number; isActive: boolean }) => {
    try {
      const res = AuthService.updateUserStatus(payload.userId, payload.isActive);
      if (!res.success) {
        return { success: false, error: { code: 'STATUS_UPDATE_FAILED', message: res.message || 'Failed updating status' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: { updated: true }, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'USER_STATUS_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // RBAC: Roles List
  registerHandler(IPC_CHANNELS.ROLE_LIST, async () => {
    try {
      const roles = RBACService.getRoles();
      return { success: true, data: roles, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'ROLE_LIST_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  // RBAC: Get Permissions for Role
  registerHandler(IPC_CHANNELS.PERMISSIONS_GET, async (_, payload: { roleId: number }) => {
    try {
      const permissions = RBACService.getPermissionsForRole(payload.roleId);
      return { success: true, data: permissions, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: { code: 'PERMISSIONS_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });
}
