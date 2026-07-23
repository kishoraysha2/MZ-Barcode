import { IPC_CHANNELS } from '../shared/ipcChannels';
import { ElectronAPI, IPCResponse } from '../shared/types';

/**
 * Enterprise Secure Bridge API Implementation
 * Exposes type-safe window.electronAPI with zero Node.js raw handles
 */
export const electronBridge: ElectronAPI = {
  databaseInit: async () => invokeIPC(IPC_CHANNELS.DATABASE_INIT),
  getDatabaseStatus: async () => invokeIPC(IPC_CHANNELS.DATABASE_STATUS),

  getSettings: async () => invokeIPC(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: async (settings) => invokeIPC(IPC_CHANNELS.SETTINGS_SAVE, settings),
  resetSettings: async () => invokeIPC(IPC_CHANNELS.SETTINGS_RESET),

  createBackup: async () => invokeIPC(IPC_CHANNELS.BACKUP_CREATE),
  listBackups: async () => invokeIPC(IPC_CHANNELS.BACKUP_LIST),
  restoreBackup: async (file) => invokeIPC(IPC_CHANNELS.BACKUP_RESTORE, file),

  checkLicense: async () => invokeIPC(IPC_CHANNELS.LICENSE_CHECK),
  activateLicense: async (key) => invokeIPC(IPC_CHANNELS.LICENSE_ACTIVATE, key),

  getPrinters: async () => invokeIPC(IPC_CHANNELS.PRINTER_LIST),
  getPrinterStatus: async (name) => invokeIPC(IPC_CHANNELS.PRINTER_STATUS, name),

  getBarcodeFormats: async () => invokeIPC(IPC_CHANNELS.BARCODE_FORMATS),
  validateBarcode: async (value, format) => invokeIPC(IPC_CHANNELS.BARCODE_VALIDATE, { value, format }),

  getSystemInfo: async () => invokeIPC(IPC_CHANNELS.SYSTEM_INFO),
  logMessage: async (level, message) => {
    await invokeIPC(IPC_CHANNELS.LOGS_WRITE, { level, message });
  },

  // Auth & RBAC IPC
  login: async (credentials) => invokeIPC(IPC_CHANNELS.AUTH_LOGIN, credentials),
  logout: async (sessionToken) => invokeIPC(IPC_CHANNELS.AUTH_LOGOUT, { sessionToken }),
  validateSession: async (sessionToken) => invokeIPC(IPC_CHANNELS.AUTH_VALIDATE_SESSION, { sessionToken }),
  changePassword: async (params) => invokeIPC(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, params),

  // User Management IPC
  getUsers: async () => invokeIPC(IPC_CHANNELS.USER_LIST),
  createUser: async (user) => invokeIPC(IPC_CHANNELS.USER_CREATE, user),
  updateUserStatus: async (params) => invokeIPC(IPC_CHANNELS.USER_UPDATE_STATUS, params),
  getRoles: async () => invokeIPC(IPC_CHANNELS.ROLE_LIST),
  getPermissions: async (roleId) => invokeIPC(IPC_CHANNELS.PERMISSIONS_GET, { roleId }),
};

/**
 * Universal IPC invoker with web preview runtime fallback
 */
async function invokeIPC<T>(channel: string, payload?: unknown): Promise<IPCResponse<T>> {
  if (typeof window !== 'undefined' && (window as unknown as { ipcRenderer?: { invoke: (c: string, p?: unknown) => Promise<IPCResponse<T>> } }).ipcRenderer) {
    return (window as unknown as { ipcRenderer: { invoke: (c: string, p?: unknown) => Promise<IPCResponse<T>> } }).ipcRenderer.invoke(channel, payload);
  }

  // Web Browser / Cloud Run Environment Fallback Mock for IPC Foundation
  return simulateWebIPCResponse<T>(channel, payload);
}

function simulateWebIPCResponse<T>(channel: string, payload?: unknown): IPCResponse<T> {
  const timestamp = new Date().toISOString();

  switch (channel) {
    case IPC_CHANNELS.DATABASE_INIT:
      return {
        success: true,
        data: { path: '%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db', status: 'SQLite WAL Mode Engine Online' } as T,
        timestamp,
      };
    case IPC_CHANNELS.DATABASE_STATUS:
      return {
        success: true,
        data: { initialized: true, wal: true } as T,
        timestamp,
      };
    case IPC_CHANNELS.SETTINGS_GET:
      return {
        success: true,
        data: {
          app: { theme: 'dark', autoUpdate: false, language: 'en-US', edition: 'customer' },
          database: { path: '%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db', walMode: true, autoBackupDaily: true },
          printing: { defaultPrinter: 'Zebra ZD421 (203 dpi)', paperWidthMm: 100, paperHeightMm: 50, dpi: 203 },
          security: { sessionTimeoutMinutes: 30, auditLogging: true },
        } as unknown as T,
        timestamp,
      };
    case IPC_CHANNELS.SETTINGS_SAVE:
      return {
        success: true,
        data: payload as T,
        timestamp,
      };
    case IPC_CHANNELS.BACKUP_CREATE:
      return {
        success: true,
        data: { file: `mz_backup_${Date.now()}.db.bak` } as T,
        timestamp,
      };
    case IPC_CHANNELS.BACKUP_LIST:
      return {
        success: true,
        data: ['mz_backup_2026-07-22.db.bak', 'mz_backup_2026-07-23.db.bak'] as T,
        timestamp,
      };
    case IPC_CHANNELS.LICENSE_CHECK:
      return {
        success: true,
        data: { active: true, type: 'ENTERPRISE_FOUNDATION_UNLOCKED' } as T,
        timestamp,
      };
    case IPC_CHANNELS.PRINTER_LIST:
      return {
        success: true,
        data: ['Zebra ZD421 (203 dpi)', 'TSC TTP-244 Pro', 'SATO CL4NX Plus'] as T,
        timestamp,
      };
    case IPC_CHANNELS.BARCODE_FORMATS:
      return {
        success: true,
        data: ['CODE128', 'EAN13', 'EAN8', 'UPCA', 'QR', 'DATAMATRIX', 'PDF417'] as T,
        timestamp,
      };
    case IPC_CHANNELS.AUTH_LOGIN: {
      const creds = payload as { username: string; password?: string };
      if (creds.username === 'admin' || creds.username === 'owner') {
        return {
          success: true,
          data: {
            sessionId: 101,
            userId: creds.username === 'owner' ? 1 : 2,
            username: creds.username,
            roleId: creds.username === 'owner' ? 1 : 2,
            roleName: creds.username === 'owner' ? 'OWNER' : 'ADMIN',
            fullName: creds.username === 'owner' ? 'System Owner' : 'Enterprise Admin',
            sessionToken: `token_web_mock_${Date.now()}`,
            expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
          } as T,
          timestamp,
        };
      }
      return {
        success: false,
        error: { code: 'AUTH_FAILED', message: 'Invalid username or password' },
        timestamp,
      };
    }
    case IPC_CHANNELS.AUTH_VALIDATE_SESSION:
      return {
        success: true,
        data: {
          sessionId: 101,
          userId: 2,
          username: 'admin',
          roleId: 2,
          roleName: 'ADMIN',
          fullName: 'Enterprise Admin',
          sessionToken: 'token_web_active',
          expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        } as T,
        timestamp,
      };
    case IPC_CHANNELS.USER_LIST:
      return {
        success: true,
        data: [
          { id: 1, username: 'owner', fullName: 'System Owner', roleId: 1, role: 'OWNER', isActive: true, createdAt: '2026-07-23 00:00:00', lastLogin: '2026-07-23 02:15:00' },
          { id: 2, username: 'admin', fullName: 'Enterprise Admin', roleId: 2, role: 'ADMIN', isActive: true, createdAt: '2026-07-23 00:00:00', lastLogin: '2026-07-23 02:30:00' },
          { id: 3, username: 'operator1', fullName: 'Mark Operator', roleId: 3, role: 'USER', isActive: true, createdAt: '2026-07-23 01:00:00', lastLogin: '2026-07-22 18:20:00' },
          { id: 4, username: 'inspector', fullName: 'Sarah Viewer', roleId: 4, role: 'VIEWER', isActive: false, createdAt: '2026-07-23 01:30:00', lastLogin: 'Never' },
        ] as T,
        timestamp,
      };
    case IPC_CHANNELS.ROLE_LIST:
      return {
        success: true,
        data: [
          { id: 1, name: 'OWNER', description: 'System Owner & Software Issuer', isActive: true },
          { id: 2, name: 'ADMIN', description: 'Enterprise Administrator', isActive: true },
          { id: 3, name: 'USER', description: 'Standard Operator User', isActive: true },
          { id: 4, name: 'VIEWER', description: 'Read-only Inspector', isActive: true },
        ] as T,
        timestamp,
      };
    default:
      return {
        success: true,
        data: {} as T,
        timestamp,
      };
  }
}
