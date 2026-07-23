import { IPC_CHANNELS } from '../shared/ipcChannels';
import { ElectronAPI, IPCResponse } from '../shared/types';
import { BarcodeEngine, BarcodeGenerateOptions } from '../main/services/BarcodeEngine';
import { PrintService, PrintPreviewOptions, PrintJobOptions } from '../main/services/PrintService';

// In-memory array for web simulation fallback when in browser preview
const webBarcodes: any[] = [];
let barcodeAutoId = Date.now();


/**
 * Enterprise Secure Bridge API Implementation
 * Exposes type-safe window.electronAPI with zero Node.js raw handles
 */
export const electronBridge: ElectronAPI = {
  databaseInit: async () => invokeIPC(IPC_CHANNELS.DATABASE_INIT),
  getDatabaseStatus: async () => invokeIPC(IPC_CHANNELS.DATABASE_STATUS),

  // Dashboard IPC
  getDashboardOverview: async () => invokeIPC(IPC_CHANNELS.DASHBOARD_GET_OVERVIEW),
  getDashboardStatistics: async () => invokeIPC(IPC_CHANNELS.DASHBOARD_GET_STATISTICS),
  getRecentBarcodes: async (limit) => invokeIPC(IPC_CHANNELS.DASHBOARD_GET_RECENT_BARCODES, limit),

  // Settings IPC
  getSettings: async () => invokeIPC(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: async (settings) => invokeIPC(IPC_CHANNELS.SETTINGS_SAVE, settings),
  resetSettings: async () => invokeIPC(IPC_CHANNELS.SETTINGS_RESET),
  getAuditLogs: async () => invokeIPC(IPC_CHANNELS.AUDIT_LOGS_GET),

  // Backup IPC
  createBackup: async () => invokeIPC(IPC_CHANNELS.BACKUP_CREATE),
  listBackups: async () => invokeIPC(IPC_CHANNELS.BACKUP_LIST),
  restoreBackup: async (file) => invokeIPC(IPC_CHANNELS.BACKUP_RESTORE, file),

  // License IPC
  getLicenseStatus: async () => invokeIPC(IPC_CHANNELS.LICENSE_GET_STATUS),
  checkLicense: async () => invokeIPC(IPC_CHANNELS.LICENSE_CHECK),
  activateLicense: async (key) => invokeIPC(IPC_CHANNELS.LICENSE_ACTIVATE, key),

  // Printer IPC
  getDefaultPrinter: async () => invokeIPC(IPC_CHANNELS.PRINTER_GET_DEFAULT),
  getPrinters: async () => invokeIPC(IPC_CHANNELS.PRINTER_LIST),
  getPrinterStatus: async (name) => invokeIPC(IPC_CHANNELS.PRINTER_STATUS, name),
  getPrinterProfiles: async () => invokeIPC(IPC_CHANNELS.PRINTER_GET_PROFILES),

  // Barcode & Print Foundation IPC (Sprint 5)
  getBarcodeFormats: async () => invokeIPC(IPC_CHANNELS.BARCODE_FORMATS),
  validateBarcode: async (value, format) => invokeIPC(IPC_CHANNELS.BARCODE_VALIDATE, { value, format }),
  getAllBarcodes: async () => invokeIPC(IPC_CHANNELS.BARCODE_GET_ALL),
  generateBarcode: async (options) => invokeIPC(IPC_CHANNELS.BARCODE_GENERATE, options),
  previewBarcode: async (options) => invokeIPC(IPC_CHANNELS.BARCODE_PREVIEW, options),
  exportBarcode: async (options) => invokeIPC(IPC_CHANNELS.BARCODE_EXPORT, options),
  previewPrint: async (options) => invokeIPC(IPC_CHANNELS.PRINT_PREVIEW, options),
  createPrintJob: async (options) => invokeIPC(IPC_CHANNELS.PRINT_CREATE_JOB, options),
  createBarcode: async (barcode) => invokeIPC(IPC_CHANNELS.BARCODE_CREATE, barcode),
  getNextSequence: async (prefix) => invokeIPC(IPC_CHANNELS.BARCODE_GET_NEXT_SEQUENCE, prefix),


  // System & Logs
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

async function simulateWebIPCResponse<T>(channel: string, payload?: unknown): Promise<IPCResponse<T>> {
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
    case IPC_CHANNELS.PRINTER_GET_PROFILES:
      return {
        success: true,
        data: [
          { id: 1, name: 'Zebra ZD421 Direct Thermal (203 DPI)', driver_type: 'ZEBRA_ZPL', is_default: 1, dpi: 203, paper_type: 'Continuous 50mm x 25mm', port: 'USB001' },
          { id: 2, name: 'TSPL Industrial Thermal Printer (300 DPI)', driver_type: 'TSPL', is_default: 0, dpi: 300, paper_type: 'Gap 100mm x 150mm', port: 'USB002' },
          { id: 3, name: 'Generic Windows Spool Printer Driver', driver_type: 'WINDOWS', is_default: 0, dpi: 203, paper_type: 'Standard Thermal Paper', port: 'LPT1' },
        ] as T,
        timestamp,
      };
    case IPC_CHANNELS.BARCODE_GENERATE:
    case IPC_CHANNELS.BARCODE_PREVIEW: {
      const opts = payload as BarcodeGenerateOptions;
      const genRes = await BarcodeEngine.generate(opts);
      if (!genRes.success) {
        return { success: false, error: { code: 'GENERATE_FAILED', message: genRes.error || 'Barcode generation failed' }, timestamp };
      }
      return { success: true, data: genRes as T, timestamp };
    }
    case IPC_CHANNELS.BARCODE_EXPORT: {
      const opts = payload as BarcodeGenerateOptions & { format?: 'svg' | 'png' };
      const expRes = await BarcodeEngine.export(opts);
      if (!expRes.success) {
        return { success: false, error: { code: 'EXPORT_FAILED', message: expRes.error || 'Barcode export failed' }, timestamp };
      }
      return { success: true, data: expRes as T, timestamp };
    }
    case IPC_CHANNELS.PRINT_PREVIEW: {
      const opts = payload as PrintPreviewOptions;
      const printRes = await PrintService.generatePreview(opts);
      if (!printRes.success) {
        return { success: false, error: { code: 'PREVIEW_FAILED', message: printRes.error || 'Print preview failed' }, timestamp };
      }
      return { success: true, data: printRes as T, timestamp };
    }
    case IPC_CHANNELS.PRINT_CREATE_JOB: {
      const p = payload as PrintJobOptions;
      return {
        success: true,
        data: {
          jobId: Math.floor(Math.random() * 9000) + 1000,
          status: 'PENDING',
          printerName: p.printerName,
          copies: p.copies || 1,
        } as T,
        timestamp,
      };
    }

    case IPC_CHANNELS.DASHBOARD_GET_OVERVIEW:
      return {
        success: true,
        data: {
          totalBarcodes: webBarcodes.length,
          totalPrints: webBarcodes.reduce((acc, b) => acc + (b.print_count || 1), 0),
          nextSequence: `MZ-${String(webBarcodes.length + 1).padStart(8, '0')}`,
          activePrinter: 'Not Configured',
          licenseStatus: 'Not Configured',
          licenseDaysRemaining: 0,
          hwid: 'Not Configured',
          databaseHealth: 'SQLite WAL Mode Engine Online',
          databaseSizeKb: 34,
        } as T,
        timestamp,
      };
    case IPC_CHANNELS.DASHBOARD_GET_STATISTICS:
      return {
        success: true,
        data: {
          totalBarcodes: webBarcodes.length,
          totalPrints: webBarcodes.reduce((acc, b) => acc + (b.print_count || 1), 0),
          activeUsersCount: 2,
          totalTemplatesCount: 0,
          databaseSizeKb: 34,
        } as T,
        timestamp,
      };
    case IPC_CHANNELS.DASHBOARD_GET_RECENT_BARCODES:
    case IPC_CHANNELS.BARCODE_GET_ALL:
      return {
        success: true,
        data: [...webBarcodes] as T,
        timestamp,
      };
    case IPC_CHANNELS.BARCODE_CREATE: {
      const p = payload as any;
      barcodeAutoId += 1;
      const created = {
        id: p.id || barcodeAutoId,
        barcode_value: p.barcode_value,
        prefix: p.prefix || 'MZ-',
        sequence_number: p.sequence_number || webBarcodes.length + 1,
        barcode_type: p.barcode_type || 'CODE128',
        title: p.title || 'General Item',
        category: p.category || 'General',
        status: 'active',
        print_count: p.print_count || 1,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        created_by: p.created_by || 'Customer Admin',
      };
      webBarcodes.unshift(created);
      return {
        success: true,
        data: created as T,
        timestamp,
      };
    }
    case IPC_CHANNELS.BARCODE_GET_NEXT_SEQUENCE: {
      const pref = (payload as string) || 'MZ-';
      const seq = webBarcodes.length + 1;
      return {
        success: true,
        data: {
          prefix: pref,
          nextSequence: seq,
          nextBarcodeNumber: `${pref}${String(seq).padStart(8, '0')}`,
        } as T,
        timestamp,
      };
    }
    case IPC_CHANNELS.SETTINGS_GET:
      return {
        success: true,
        data: {
          app: { theme: 'dark', autoUpdate: false, language: 'en-US', edition: 'customer' },
          database: { path: '%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db', walMode: true, autoBackupDaily: true },
          printing: { defaultPrinter: 'Not Configured', paperWidthMm: 50, paperHeightMm: 25, dpi: 203 },
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
    case IPC_CHANNELS.AUDIT_LOGS_GET:
      return {
        success: true,
        data: [] as T,
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
        data: [] as T,
        timestamp,
      };
    case IPC_CHANNELS.PRINTER_GET_DEFAULT:
      return {
        success: true,
        data: null as T,
        timestamp,
      };
    case IPC_CHANNELS.PRINTER_LIST:
      return {
        success: true,
        data: [] as T,
        timestamp,
      };
    case IPC_CHANNELS.LICENSE_GET_STATUS:
      return {
        success: true,
        data: {
          isActivated: false,
          customerName: 'Not Configured',
          hwid: 'Not Configured',
          activationKey: '',
          issuedAt: '',
          expiresAt: '',
          daysRemaining: 0,
          durationDays: 0,
          maxUsers: 0,
          status: 'Not Configured',
          lastClockCheck: 'Not Configured',
        } as T,
        timestamp,
      };
    case IPC_CHANNELS.LICENSE_CHECK:
      return {
        success: true,
        data: { active: false, type: 'NOT_CONFIGURED' } as T,
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
