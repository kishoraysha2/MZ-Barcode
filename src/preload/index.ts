import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipcChannels';
import { ElectronAPI, IPCResponse } from '../shared/types';

function invoke<T>(channel: string, payload?: unknown): Promise<IPCResponse<T>> {
  return ipcRenderer.invoke(channel, payload);
}

const electronAPI: ElectronAPI = {
  // Database IPC
  databaseInit: () => invoke(IPC_CHANNELS.DATABASE_INIT),
  getDatabaseStatus: () => invoke(IPC_CHANNELS.DATABASE_STATUS),

  // Dashboard IPC
  getDashboardOverview: () => invoke(IPC_CHANNELS.DASHBOARD_GET_OVERVIEW),
  getDashboardStatistics: () => invoke(IPC_CHANNELS.DASHBOARD_GET_STATISTICS),
  getRecentBarcodes: (limit) => invoke(IPC_CHANNELS.DASHBOARD_GET_RECENT_BARCODES, limit),

  // Settings IPC
  getSettings: () => invoke(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: (settings) => invoke(IPC_CHANNELS.SETTINGS_SAVE, settings),
  resetSettings: () => invoke(IPC_CHANNELS.SETTINGS_RESET),
  getAuditLogs: () => invoke(IPC_CHANNELS.AUDIT_LOGS_GET),

  // Backup IPC
  createBackup: () => invoke(IPC_CHANNELS.BACKUP_CREATE),
  listBackups: () => invoke(IPC_CHANNELS.BACKUP_LIST),
  restoreBackup: (file) => invoke(IPC_CHANNELS.BACKUP_RESTORE, file),

  // License IPC
  getLicenseStatus: () => invoke(IPC_CHANNELS.LICENSE_GET_STATUS),
  checkLicense: () => invoke(IPC_CHANNELS.LICENSE_CHECK),
  activateLicense: (key) => invoke(IPC_CHANNELS.LICENSE_ACTIVATE, key),

  // Printer IPC
  getDefaultPrinter: () => invoke(IPC_CHANNELS.PRINTER_GET_DEFAULT),
  getPrinters: () => invoke(IPC_CHANNELS.PRINTER_LIST),
  getPrinterStatus: (name) => invoke(IPC_CHANNELS.PRINTER_STATUS, name),
  getPrinterProfiles: () => invoke(IPC_CHANNELS.PRINTER_GET_PROFILES),

  // Barcode Engine & Printing IPC
  getBarcodeFormats: () => invoke(IPC_CHANNELS.BARCODE_FORMATS),
  validateBarcode: (value, format) => invoke(IPC_CHANNELS.BARCODE_VALIDATE, { value, format }),
  getAllBarcodes: () => invoke(IPC_CHANNELS.BARCODE_GET_ALL),
  generateBarcode: (options) => invoke(IPC_CHANNELS.BARCODE_GENERATE, options),
  previewBarcode: (options) => invoke(IPC_CHANNELS.BARCODE_PREVIEW, options),
  exportBarcode: (options) => invoke(IPC_CHANNELS.BARCODE_EXPORT, options),
  previewPrint: (options) => invoke(IPC_CHANNELS.PRINT_PREVIEW, options),
  createPrintJob: (options) => invoke(IPC_CHANNELS.PRINT_CREATE_JOB, options),
  createBarcode: (barcode) => invoke(IPC_CHANNELS.BARCODE_CREATE, barcode),
  getNextSequence: (prefix) => invoke(IPC_CHANNELS.BARCODE_GET_NEXT_SEQUENCE, prefix),

  // System & Logs
  getSystemInfo: () => invoke(IPC_CHANNELS.SYSTEM_INFO),
  logMessage: async (level, message) => {
    await invoke(IPC_CHANNELS.LOGS_WRITE, { level, message });
  },

  // Auth & RBAC IPC
  login: (credentials) => invoke(IPC_CHANNELS.AUTH_LOGIN, credentials),
  logout: (sessionToken) => invoke(IPC_CHANNELS.AUTH_LOGOUT, { sessionToken }),
  validateSession: (sessionToken) => invoke(IPC_CHANNELS.AUTH_VALIDATE_SESSION, { sessionToken }),
  changePassword: (params) => invoke(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, params),

  // User Management IPC
  getUsers: () => invoke(IPC_CHANNELS.USER_LIST),
  createUser: (user) => invoke(IPC_CHANNELS.USER_CREATE, user),
  updateUserStatus: (params) => invoke(IPC_CHANNELS.USER_UPDATE_STATUS, params),
  getRoles: () => invoke(IPC_CHANNELS.ROLE_LIST),
  getPermissions: (roleId) => invoke(IPC_CHANNELS.PERMISSIONS_GET, { roleId }),

  // Label Template IPC
  getLabelTemplates: () => invoke(IPC_CHANNELS.TEMPLATE_LIST),
  getLabelTemplate: (id) => invoke(IPC_CHANNELS.TEMPLATE_GET, id),
  createLabelTemplate: (dto) => invoke(IPC_CHANNELS.TEMPLATE_CREATE, dto),
  updateLabelTemplate: (dto) => invoke(IPC_CHANNELS.TEMPLATE_UPDATE, dto),
  deleteLabelTemplate: (id) => invoke(IPC_CHANNELS.TEMPLATE_DELETE, id),
  duplicateLabelTemplate: (dto) => invoke(IPC_CHANNELS.TEMPLATE_DUPLICATE, dto),
  exportLabelTemplate: (id) => invoke(IPC_CHANNELS.TEMPLATE_EXPORT, id),
  importLabelTemplate: (jsonContent) => invoke(IPC_CHANNELS.TEMPLATE_IMPORT, jsonContent),

  // Barcode Scanner IPC
  processScan: (options) => invoke(IPC_CHANNELS.SCANNER_PROCESS, options),
  getScanHistory: (limit) => invoke(IPC_CHANNELS.SCANNER_GET_HISTORY, limit),
  clearScanHistory: () => invoke(IPC_CHANNELS.SCANNER_CLEAR_HISTORY),
  getScannerSettings: () => invoke(IPC_CHANNELS.SCANNER_GET_SETTINGS),
  saveScannerSettings: (settings) => invoke(IPC_CHANNELS.SCANNER_SAVE_SETTINGS, settings),
  createScannerProduct: (product) => invoke(IPC_CHANNELS.SCANNER_CREATE_PRODUCT, product),

  // Product Management IPC
  getAllProducts: () => invoke(IPC_CHANNELS.PRODUCT_GET_ALL),
  createProduct: (product) => invoke(IPC_CHANNELS.PRODUCT_CREATE, product),
  updateProduct: (id, product) => invoke(IPC_CHANNELS.PRODUCT_UPDATE, { id, product }),
  deleteProduct: (id) => invoke(IPC_CHANNELS.PRODUCT_DELETE, id),

  // Category Management IPC
  getCategories: () => invoke(IPC_CHANNELS.CATEGORY_GET_ALL),
  createCategory: (category) => invoke(IPC_CHANNELS.CATEGORY_CREATE, category),
  updateCategory: (id, category) => invoke(IPC_CHANNELS.CATEGORY_UPDATE, { id, category }),
  deleteCategory: (id) => invoke(IPC_CHANNELS.CATEGORY_DELETE, id),

  // Enterprise Master Data Framework IPC
  masterGetAll: (moduleName: any) =>
    invoke(IPC_CHANNELS.MASTER_GET_ALL, typeof moduleName === 'object' && moduleName !== null ? moduleName : { moduleName }),
  masterGetActive: (moduleName: any) =>
    invoke(IPC_CHANNELS.MASTER_GET_ACTIVE, typeof moduleName === 'object' && moduleName !== null ? moduleName : { moduleName }),
  masterCreate: (moduleName: any, payload?: any) => {
    if (typeof moduleName === 'object' && moduleName !== null) {
      return invoke(IPC_CHANNELS.MASTER_CREATE, moduleName);
    }
    return invoke(IPC_CHANNELS.MASTER_CREATE, { moduleName, ...payload });
  },
  masterUpdate: (moduleName: any, id?: any, payload?: any) => {
    if (typeof moduleName === 'object' && moduleName !== null) {
      return invoke(IPC_CHANNELS.MASTER_UPDATE, moduleName);
    }
    return invoke(IPC_CHANNELS.MASTER_UPDATE, { moduleName, id, payload });
  },
  masterEnable: (moduleName: any, id?: any, context?: any) => {
    if (typeof moduleName === 'object' && moduleName !== null) {
      return invoke(IPC_CHANNELS.MASTER_ENABLE, moduleName);
    }
    return invoke(IPC_CHANNELS.MASTER_ENABLE, { moduleName, id, ...context });
  },
  masterDisable: (moduleName: any, id?: any, context?: any) => {
    if (typeof moduleName === 'object' && moduleName !== null) {
      return invoke(IPC_CHANNELS.MASTER_DISABLE, moduleName);
    }
    return invoke(IPC_CHANNELS.MASTER_DISABLE, { moduleName, id, ...context });
  },
  masterDelete: (moduleName: any, id?: any, context?: any) => {
    if (typeof moduleName === 'object' && moduleName !== null) {
      return invoke(IPC_CHANNELS.MASTER_DELETE, moduleName);
    }
    return invoke(IPC_CHANNELS.MASTER_DELETE, { moduleName, id, ...context });
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('[Preload] Failed to expose electronAPI via contextBridge:', error);
  }
} else {
  (window as unknown as Record<string, unknown>).electronAPI = electronAPI;
}

export { electronAPI };

