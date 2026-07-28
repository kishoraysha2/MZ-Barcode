import { IPC_CHANNELS } from '../shared/ipcChannels';
import { ElectronAPI, IPCResponse } from '../shared/types';
import { MasterModuleName } from '../shared/masterTypes';

// In-memory array for web simulation fallback when in browser preview
const webBarcodes: any[] = [];
let barcodeAutoId = Date.now();

// Shared product store for web preview IPC simulation
let webLastScannedBarcode = '';
let webLastScanTimestamp = 0;

const webMockProducts: Record<string, any> = {};

const webMockCategories: any[] = [
  { id: 1, name: 'GENERAL', description: 'General uncategorized items', sortOrder: 1, isActive: true, createdAt: new Date().toISOString() },
  { id: 2, name: 'HARDWARE', description: 'Physical equipment and hardware devices', sortOrder: 2, isActive: true, createdAt: new Date().toISOString() },
  { id: 3, name: 'SUPPLIES', description: 'Consumables, packaging, and office supplies', sortOrder: 3, isActive: true, createdAt: new Date().toISOString() },
  { id: 4, name: 'ASSET', description: 'Fixed company assets and serialized tools', sortOrder: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 5, name: 'ELECTRONICS', description: 'Electronic parts and gadgets', sortOrder: 5, isActive: true, createdAt: new Date().toISOString() },
  { id: 6, name: 'ACCESSORIES', description: 'Peripherals and auxiliary accessories', sortOrder: 6, isActive: true, createdAt: new Date().toISOString() },
];

const webMockMasterData: Record<string, any[]> = {
  categories: [
    { id: 'cat-uuid-001', name: 'General', code: 'CAT-GEN', description: 'General uncategorized items', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'cat-uuid-002', name: 'Hardware', code: 'CAT-HWD', description: 'Physical equipment and hardware tools', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'cat-uuid-003', name: 'Supplies', code: 'CAT-SUP', description: 'Consumables, packaging, and office supplies', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'cat-uuid-004', name: 'Electronics', code: 'CAT-ELE', description: 'Electronic parts and components', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'cat-uuid-005', name: 'Accessories', code: 'CAT-ACC', description: 'Auxiliary parts and peripheral accessories', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
  ],
  units: [
    { id: 'uom-uuid-001', name: 'Pieces', code: 'PCS', description: 'Individual count units', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'uom-uuid-002', name: 'Boxes', code: 'BOX', description: 'Box container packs', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'uom-uuid-003', name: 'Kilograms', code: 'KG', description: 'Weight measurement in kilograms', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'uom-uuid-004', name: 'Meters', code: 'MTR', description: 'Length measurement in meters', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'uom-uuid-005', name: 'Sets', code: 'SET', description: 'Assembled set packs', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
  ],
  brands: [
    { id: 'brd-uuid-001', name: 'MZ Enterprise', code: 'MZ-ENT', description: 'Primary house brand products', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'brd-uuid-002', name: 'LogiTech Pro', code: 'LOGI', description: 'Hardware and scanner equipment', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'brd-uuid-003', name: 'Zebra Tech', code: 'ZEBRA', description: 'Thermal printers and barcode tech', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'brd-uuid-004', name: 'Honeywell', code: 'HNW', description: 'Industrial scanner devices', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
  ],
  warehouses: [
    { id: 'whs-uuid-001', name: 'Main Central Warehouse', code: 'WHS-MAIN', description: 'Primary distribution facility and hub', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'whs-uuid-002', name: 'North Storage Annex', code: 'WHS-NTH', description: 'Secondary overflow regional storage', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'whs-uuid-003', name: 'Retail Front Depot', code: 'WHS-RTL', description: 'Storefront quick pick inventory depot', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
  ],
  suppliers: [
    { id: 'sup-uuid-001', name: 'Apex Logistics & Supply', code: 'SUP-APEX', description: 'Primary raw materials supplier', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'sup-uuid-002', name: 'Global Barcode Systems', code: 'SUP-GBS', description: 'Hardware and printer media partner', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
    { id: 'sup-uuid-003', name: 'Omni Components Ltd', code: 'SUP-OMNI', description: 'Electronics and component distributor', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
  ],
};

const webTemplates: any[] = [
  {
    id: 'sys_tpl_40x20',
    name: 'Standard Retail Tag (40x20mm)',
    description: 'Compact retail price tag with barcode and price binding',
    category: 'RETAIL',
    widthMm: 40,
    heightMm: 20,
    marginTopMm: 1,
    marginBottomMm: 1,
    marginLeftMm: 1,
    marginRightMm: 1,
    paddingMm: 1,
    gapMm: 0,
    orientation: 'PORTRAIT',
    dpi: 203,
    isSystem: true,
    isDefault: false,
    isActive: true,
    elements: [
      {
        id: 'el_1',
        templateId: 'sys_tpl_40x20',
        type: 'TEXT',
        name: 'Company Name',
        xMm: 2,
        yMm: 1.5,
        widthMm: 36,
        heightMm: 3.5,
        zIndex: 0,
        rotation: 0,
        alignment: 'CENTER',
        isLocked: true,
        isHidden: false,
        isPrintable: true,
        properties: { fontFamily: 'Arial', fontSize: 8, fontWeight: 'bold', staticValue: 'MZ RETAIL STORE' },
      },
      {
        id: 'el_2',
        templateId: 'sys_tpl_40x20',
        type: 'BARCODE',
        name: 'Product Barcode',
        xMm: 2,
        yMm: 5.5,
        widthMm: 36,
        heightMm: 9,
        zIndex: 1,
        rotation: 0,
        alignment: 'CENTER',
        isLocked: true,
        isHidden: false,
        isPrintable: true,
        properties: { barcodeFormat: 'CODE128', quietZone: 1, dataBinding: 'SKU', staticValue: '100012345', showText: true },
      },
      {
        id: 'el_3',
        templateId: 'sys_tpl_40x20',
        type: 'TEXT',
        name: 'Price Tag',
        xMm: 2,
        yMm: 15,
        widthMm: 36,
        heightMm: 4,
        zIndex: 2,
        rotation: 0,
        alignment: 'CENTER',
        isLocked: true,
        isHidden: false,
        isPrintable: true,
        properties: { fontFamily: 'Arial', fontSize: 10, fontWeight: 'bold', dataBinding: 'Price', staticValue: '$19.99' },
      },
    ],
  },
  {
    id: 'sys_tpl_50x25',
    name: 'Standard Product Label (50x25mm)',
    description: 'Standard product and inventory label with barcode and product title',
    category: 'RETAIL',
    widthMm: 50,
    heightMm: 25,
    marginTopMm: 1,
    marginBottomMm: 1,
    marginLeftMm: 1,
    marginRightMm: 1,
    paddingMm: 1,
    gapMm: 0,
    orientation: 'PORTRAIT',
    dpi: 203,
    isSystem: true,
    isDefault: true,
    isActive: true,
    elements: [],
  },
];


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

  // Label Template IPC (Sprint 6.2.1)
  getLabelTemplates: async () => invokeIPC(IPC_CHANNELS.TEMPLATE_LIST),
  getLabelTemplate: async (id) => invokeIPC(IPC_CHANNELS.TEMPLATE_GET, id),
  createLabelTemplate: async (dto) => invokeIPC(IPC_CHANNELS.TEMPLATE_CREATE, dto),
  updateLabelTemplate: async (dto) => {
    console.log('[TRACE 2.1] bridge.updateLabelTemplate() invoked with dto:', dto);
    return invokeIPC(IPC_CHANNELS.TEMPLATE_UPDATE, dto);
  },
  deleteLabelTemplate: async (id) => invokeIPC(IPC_CHANNELS.TEMPLATE_DELETE, id),
  duplicateLabelTemplate: async (dto) => invokeIPC(IPC_CHANNELS.TEMPLATE_DUPLICATE, dto),
  exportLabelTemplate: async (id) => invokeIPC(IPC_CHANNELS.TEMPLATE_EXPORT, id),
  importLabelTemplate: async (jsonContent) => invokeIPC(IPC_CHANNELS.TEMPLATE_IMPORT, jsonContent),

  // Barcode Scanner IPC (Sprint 7.0.0)
  processScan: async (options) => invokeIPC(IPC_CHANNELS.SCANNER_PROCESS, options),
  getScanHistory: async (limit) => invokeIPC(IPC_CHANNELS.SCANNER_GET_HISTORY, limit),
  clearScanHistory: async () => invokeIPC(IPC_CHANNELS.SCANNER_CLEAR_HISTORY),
  getScannerSettings: async () => invokeIPC(IPC_CHANNELS.SCANNER_GET_SETTINGS),
  saveScannerSettings: async (settings) => invokeIPC(IPC_CHANNELS.SCANNER_SAVE_SETTINGS, settings),
  createScannerProduct: async (product) => invokeIPC(IPC_CHANNELS.SCANNER_CREATE_PRODUCT, product),

  // Product Management Module IPC
  getAllProducts: async () => invokeIPC(IPC_CHANNELS.PRODUCT_GET_ALL),
  createProduct: async (product) => invokeIPC(IPC_CHANNELS.PRODUCT_CREATE, product),
  updateProduct: async (id, product) => invokeIPC(IPC_CHANNELS.PRODUCT_UPDATE, { id, product }),
  deleteProduct: async (id) => invokeIPC(IPC_CHANNELS.PRODUCT_DELETE, id),

  // Category Management Module IPC
  getCategories: async () => invokeIPC(IPC_CHANNELS.CATEGORY_GET_ALL),
  createCategory: async (category) => invokeIPC(IPC_CHANNELS.CATEGORY_CREATE, category),
  updateCategory: async (id, category) => invokeIPC(IPC_CHANNELS.CATEGORY_UPDATE, { id, category }),
  deleteCategory: async (id) => invokeIPC(IPC_CHANNELS.CATEGORY_DELETE, id),

  // Enterprise Master Data Framework IPC
  masterGetAll: async (moduleName) => invokeIPC(IPC_CHANNELS.MASTER_GET_ALL, { moduleName }),
  masterGetActive: async (moduleName) => invokeIPC(IPC_CHANNELS.MASTER_GET_ACTIVE, { moduleName }),
  masterCreate: async (moduleName, payload) => invokeIPC(IPC_CHANNELS.MASTER_CREATE, { moduleName, ...payload }),
  masterUpdate: async (moduleName, id, payload) => invokeIPC(IPC_CHANNELS.MASTER_UPDATE, { moduleName, id, payload }),
  masterEnable: async (moduleName, id, context) => invokeIPC(IPC_CHANNELS.MASTER_ENABLE, { moduleName, id, ...context }),
  masterDisable: async (moduleName, id, context) => invokeIPC(IPC_CHANNELS.MASTER_DISABLE, { moduleName, id, ...context }),
  masterDelete: async (moduleName, id, context) => invokeIPC(IPC_CHANNELS.MASTER_DELETE, { moduleName, id, ...context }),
};

function extractModuleName(payload: unknown): MasterModuleName {
  if (typeof payload === 'string') return payload as MasterModuleName;
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, any>;
    if (typeof p.moduleName === 'string') return p.moduleName as MasterModuleName;
    if (p.moduleName && typeof p.moduleName === 'object' && typeof p.moduleName.moduleName === 'string') {
      return p.moduleName.moduleName as MasterModuleName;
    }
  }
  return 'categories';
}

/**
 * Universal IPC invoker with web preview runtime fallback
 */
async function invokeIPC<T>(channel: string, payload?: unknown): Promise<IPCResponse<T>> {
  console.log(`[TRACE 2.2] invokeIPC channel: ${channel}`);
  
  const api = typeof window !== 'undefined' ? (window as any).electronAPI : undefined;

  if (api && api !== electronBridge) {
    const channelToMethodMap: Record<string, keyof ElectronAPI> = {
      [IPC_CHANNELS.DATABASE_INIT]: 'databaseInit',
      [IPC_CHANNELS.DATABASE_STATUS]: 'getDatabaseStatus',
      [IPC_CHANNELS.DASHBOARD_GET_OVERVIEW]: 'getDashboardOverview',
      [IPC_CHANNELS.DASHBOARD_GET_STATISTICS]: 'getDashboardStatistics',
      [IPC_CHANNELS.DASHBOARD_GET_RECENT_BARCODES]: 'getRecentBarcodes',
      [IPC_CHANNELS.SETTINGS_GET]: 'getSettings',
      [IPC_CHANNELS.SETTINGS_SAVE]: 'saveSettings',
      [IPC_CHANNELS.SETTINGS_RESET]: 'resetSettings',
      [IPC_CHANNELS.AUDIT_LOGS_GET]: 'getAuditLogs',
      [IPC_CHANNELS.BACKUP_CREATE]: 'createBackup',
      [IPC_CHANNELS.BACKUP_LIST]: 'listBackups',
      [IPC_CHANNELS.BACKUP_RESTORE]: 'restoreBackup',
      [IPC_CHANNELS.LICENSE_GET_STATUS]: 'getLicenseStatus',
      [IPC_CHANNELS.LICENSE_CHECK]: 'checkLicense',
      [IPC_CHANNELS.LICENSE_ACTIVATE]: 'activateLicense',
      [IPC_CHANNELS.PRINTER_GET_DEFAULT]: 'getDefaultPrinter',
      [IPC_CHANNELS.PRINTER_LIST]: 'getPrinters',
      [IPC_CHANNELS.PRINTER_STATUS]: 'getPrinterStatus',
      [IPC_CHANNELS.PRINTER_GET_PROFILES]: 'getPrinterProfiles',
      [IPC_CHANNELS.BARCODE_FORMATS]: 'getBarcodeFormats',
      [IPC_CHANNELS.BARCODE_VALIDATE]: 'validateBarcode',
      [IPC_CHANNELS.BARCODE_GET_ALL]: 'getAllBarcodes',
      [IPC_CHANNELS.BARCODE_GENERATE]: 'generateBarcode',
      [IPC_CHANNELS.BARCODE_PREVIEW]: 'previewBarcode',
      [IPC_CHANNELS.BARCODE_EXPORT]: 'exportBarcode',
      [IPC_CHANNELS.PRINT_PREVIEW]: 'previewPrint',
      [IPC_CHANNELS.PRINT_CREATE_JOB]: 'createPrintJob',
      [IPC_CHANNELS.BARCODE_CREATE]: 'createBarcode',
      [IPC_CHANNELS.BARCODE_GET_NEXT_SEQUENCE]: 'getNextSequence',
      [IPC_CHANNELS.SYSTEM_INFO]: 'getSystemInfo',
      [IPC_CHANNELS.LOGS_WRITE]: 'logMessage',
      [IPC_CHANNELS.AUTH_LOGIN]: 'login',
      [IPC_CHANNELS.AUTH_LOGOUT]: 'logout',
      [IPC_CHANNELS.AUTH_VALIDATE_SESSION]: 'validateSession',
      [IPC_CHANNELS.AUTH_CHANGE_PASSWORD]: 'changePassword',
      [IPC_CHANNELS.USER_LIST]: 'getUsers',
      [IPC_CHANNELS.USER_CREATE]: 'createUser',
      [IPC_CHANNELS.USER_UPDATE_STATUS]: 'updateUserStatus',
      [IPC_CHANNELS.ROLE_LIST]: 'getRoles',
      [IPC_CHANNELS.PERMISSIONS_GET]: 'getPermissions',
      [IPC_CHANNELS.TEMPLATE_LIST]: 'getLabelTemplates',
      [IPC_CHANNELS.TEMPLATE_GET]: 'getLabelTemplate',
      [IPC_CHANNELS.TEMPLATE_CREATE]: 'createLabelTemplate',
      [IPC_CHANNELS.TEMPLATE_UPDATE]: 'updateLabelTemplate',
      [IPC_CHANNELS.TEMPLATE_DELETE]: 'deleteLabelTemplate',
      [IPC_CHANNELS.TEMPLATE_DUPLICATE]: 'duplicateLabelTemplate',
      [IPC_CHANNELS.TEMPLATE_EXPORT]: 'exportLabelTemplate',
      [IPC_CHANNELS.TEMPLATE_IMPORT]: 'importLabelTemplate',
      [IPC_CHANNELS.SCANNER_PROCESS]: 'processScan',
      [IPC_CHANNELS.SCANNER_GET_HISTORY]: 'getScanHistory',
      [IPC_CHANNELS.SCANNER_CLEAR_HISTORY]: 'clearScanHistory',
      [IPC_CHANNELS.SCANNER_GET_SETTINGS]: 'getScannerSettings',
      [IPC_CHANNELS.SCANNER_SAVE_SETTINGS]: 'saveScannerSettings',
      [IPC_CHANNELS.SCANNER_CREATE_PRODUCT]: 'createScannerProduct',
      [IPC_CHANNELS.PRODUCT_GET_ALL]: 'getAllProducts',
      [IPC_CHANNELS.PRODUCT_CREATE]: 'createProduct',
      [IPC_CHANNELS.PRODUCT_UPDATE]: 'updateProduct',
      [IPC_CHANNELS.PRODUCT_DELETE]: 'deleteProduct',
      [IPC_CHANNELS.CATEGORY_GET_ALL]: 'getCategories',
      [IPC_CHANNELS.CATEGORY_CREATE]: 'createCategory',
      [IPC_CHANNELS.CATEGORY_UPDATE]: 'updateCategory',
      [IPC_CHANNELS.CATEGORY_DELETE]: 'deleteCategory',
      [IPC_CHANNELS.MASTER_GET_ALL]: 'masterGetAll',
      [IPC_CHANNELS.MASTER_GET_ACTIVE]: 'masterGetActive',
      [IPC_CHANNELS.MASTER_CREATE]: 'masterCreate',
      [IPC_CHANNELS.MASTER_UPDATE]: 'masterUpdate',
      [IPC_CHANNELS.MASTER_ENABLE]: 'masterEnable',
      [IPC_CHANNELS.MASTER_DISABLE]: 'masterDisable',
      [IPC_CHANNELS.MASTER_DELETE]: 'masterDelete',
    };

    const method = channelToMethodMap[channel];
    if (method && typeof api[method] === 'function') {
      console.log(`[TRACE 2.3] Delegating to window.electronAPI.${String(method)}(...)`);
      const res = await (api[method] as Function)(payload);
      console.log(`[TRACE 2.3.1] Response from window.electronAPI.${String(method)}:`, res);
      return res;
    }
  }

  console.log(`[TRACE 2.4] Falling back to simulateWebIPCResponse for browser mode (${channel})`);
  const res = await simulateWebIPCResponse<T>(channel, payload);
  console.log(`[TRACE 2.4.1] simulateWebIPCResponse response for ${channel}:`, res);
  return res;
}

function generateMockBarcodeSvg(val: string, format = 'CODE128', width = 200, height = 80): string {
  const is2D = ['QR_CODE', 'QR', 'DATAMATRIX', 'AZTEC', 'PDF417'].includes(format.toUpperCase());

  if (is2D) {
    const size = Math.min(width, height);
    const boxSize = size * 0.85;
    const startX = (width - boxSize) / 2;
    const startY = (height - boxSize) / 2;
    const modules = 21;
    const mw = boxSize / modules;

    let pathD = '';
    const drawFinder = (mx: number, my: number) => {
      pathD += `M${(startX + mx * mw).toFixed(2)} ${(startY + my * mw).toFixed(2)}h${(7 * mw).toFixed(2)}v${(7 * mw).toFixed(2)}h-${(7 * mw).toFixed(2)}z `;
      pathD += `M${(startX + (mx + 1) * mw).toFixed(2)} ${(startY + (my + 1) * mw).toFixed(2)}h${(5 * mw).toFixed(2)}v${(5 * mw).toFixed(2)}h-${(5 * mw).toFixed(2)}z `;
      pathD += `M${(startX + (mx + 2) * mw).toFixed(2)} ${(startY + (my + 2) * mw).toFixed(2)}h${(3 * mw).toFixed(2)}v${(3 * mw).toFixed(2)}h-${(3 * mw).toFixed(2)}z `;
    };

    drawFinder(0, 0);
    drawFinder(14, 0);
    drawFinder(0, 14);

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) continue;
        const hash = (r * 31 + c * 17 + (val.charCodeAt((r + c) % val.length) || 0)) % 3;
        if (hash === 0) {
          pathD += `M${(startX + c * mw).toFixed(2)} ${(startY + r * mw).toFixed(2)}h${mw.toFixed(2)}v${mw.toFixed(2)}h-${mw.toFixed(2)}z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="background-color:#ffffff;"><rect width="${width}" height="${height}" fill="#ffffff"/><path d="${pathD}" fill="#000000" fill-rule="evenodd"/><text x="${width / 2}" y="${startY + boxSize + 12}" font-family="monospace" font-size="10" text-anchor="middle" fill="#000000" font-weight="bold">${val}</text></svg>`;
  }

  // 1D Barcode (CODE128, CODE39, EAN, UPC, etc.)
  const targetBarWidth = width * 0.85; // 85% of total SVG width
  const startX = (width - targetBarWidth) / 2;
  const barTop = 8;
  const barHeight = height - 24;

  const pattern: Array<[number, boolean]> = [];
  pattern.push([2, true], [1, false], [1, true], [2, false]);

  const cleanVal = val || 'PREVIEW-123';
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    const b1 = (code % 3) + 1;
    const s1 = ((code >> 1) % 3) + 1;
    const b2 = ((code >> 2) % 3) + 1;
    const s2 = ((code >> 3) % 2) + 1;
    const b3 = ((code >> 4) % 3) + 1;
    const s3 = ((code >> 5) % 2) + 1;
    pattern.push([b1, true], [s1, false], [b2, true], [s2, false], [b3, true], [s3, false]);
  }
  pattern.push([2, true], [1, false], [3, true]);

  const totalModules = pattern.reduce((sum, p) => sum + p[0], 0);
  const mw = targetBarWidth / totalModules;

  let pathD = '';
  let currX = startX;

  for (const [modCount, isBar] of pattern) {
    const w = modCount * mw;
    if (isBar) {
      pathD += `M${currX.toFixed(2)} ${barTop}h${w.toFixed(2)}v${barHeight}h-${w.toFixed(2)}z `;
    }
    currX += w;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="background-color:#ffffff;"><rect width="${width}" height="${height}" fill="#ffffff"/><path d="${pathD}" fill="#000000"/><text x="${width / 2}" y="${height - 6}" font-family="monospace" font-size="10" text-anchor="middle" fill="#000000" font-weight="bold">${cleanVal}</text></svg>`;
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
          { id: 1, name: 'Canon G3010 series', driver_type: 'WINDOWS', is_default: 1, dpi: 203, paper_type: 'Continuous 50mm x 25mm', port: 'USB001' },
          { id: 2, name: 'Microsoft Print to PDF', driver_type: 'WINDOWS', is_default: 0, dpi: 300, paper_type: 'A4', port: 'PORTPROMPT:' },
        ] as T,
        timestamp,
      };
    case IPC_CHANNELS.BARCODE_GENERATE:
    case IPC_CHANNELS.BARCODE_PREVIEW: {
      const opts = (payload as any) || {};
      const val = opts.value || 'PREVIEW-123';
      const fmt = opts.format || 'CODE128';
      const mockSvg = generateMockBarcodeSvg(val, fmt, 200, 80);
      return {
        success: true,
        data: {
          success: true,
          barcodeValue: val,
          format: fmt,
          dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
          svg: mockSvg,
          svgString: mockSvg,
          previewSvg: mockSvg,
          pngDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
        } as T,
        timestamp,
      };
    }
    case IPC_CHANNELS.BARCODE_EXPORT: {
      const opts = (payload as any) || {};
      const val = opts.value || 'EXPORT-123';
      const fmt = opts.format || 'CODE128';
      const mockSvg = generateMockBarcodeSvg(val, fmt, 200, 80);
      return {
        success: true,
        data: {
          success: true,
          filePath: `/downloads/${val}.svg`,
          dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
          svgContent: mockSvg,
        } as T,
        timestamp,
      };
    }
    case IPC_CHANNELS.PRINT_PREVIEW: {
      const opts = (payload as any) || {};
      const val = opts.barcodeValue || 'PRINT-PREVIEW-123';
      const fmt = opts.barcodeType || opts.format || 'CODE128';
      const mockSvg = generateMockBarcodeSvg(val, fmt, 200, 100);
      return {
        success: true,
        data: {
          success: true,
          previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
          previewSvg: mockSvg,
          svg: mockSvg,
          printerName: opts.printerName || 'Default Printer',
        } as T,
        timestamp,
      };
    }
    case IPC_CHANNELS.PRINT_CREATE_JOB: {
      const p = (payload as any) || {};
      return {
        success: true,
        data: {
          jobId: Math.floor(Math.random() * 9000) + 1000,
          status: 'PENDING',
          printerName: p.printerName || 'Default Printer',
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
    case IPC_CHANNELS.PRINTER_GET_DEFAULT: {
      return {
        success: true,
        data: { id: 1, name: 'Canon G3010 series', driver_type: 'WINDOWS', is_default: 1, dpi: 203, status: 'ready', port: 'USB001' } as T,
        timestamp,
      };
    }
    case IPC_CHANNELS.PRINTER_LIST: {
      return {
        success: true,
        data: [
          { id: 1, name: 'Canon G3010 series', driver_type: 'WINDOWS', is_default: 1, dpi: 203, status: 'ready', port: 'USB001' },
          { id: 2, name: 'Microsoft Print to PDF', driver_type: 'WINDOWS', is_default: 0, dpi: 300, status: 'ready', port: 'PORTPROMPT:' },
        ] as T,
        timestamp,
      };
    }
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

    // Label Template IPC Handlers for Web Simulation Fallback
    case IPC_CHANNELS.TEMPLATE_LIST: {
      const sanitized = webTemplates.map((t) => ({
        ...t,
        elements: (t.elements || []).map((el: any) => ({
          ...el,
          isLocked: t.isSystem ? true : false,
        })),
      }));
      return { success: true, data: sanitized as unknown as T, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_GET: {
      const found = webTemplates.find((t) => t.id === payload);
      if (!found) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' }, timestamp };
      }
      const sanitized = {
        ...found,
        elements: (found.elements || []).map((el: any) => ({
          ...el,
          isLocked: found.isSystem ? true : false,
        })),
      };
      return { success: true, data: sanitized as unknown as T, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_CREATE: {
      const body = (payload || {}) as any;
      const tplData = body.template || {};
      const newTpl = {
        id: 'web_tpl_' + Date.now(),
        name: tplData.name || 'New Template',
        description: tplData.description || '',
        category: tplData.category || 'CUSTOM',
        widthMm: tplData.widthMm || 50,
        heightMm: tplData.heightMm || 25,
        marginTopMm: tplData.marginTopMm || 0,
        marginBottomMm: tplData.marginBottomMm || 0,
        marginLeftMm: tplData.marginLeftMm || 0,
        marginRightMm: tplData.marginRightMm || 0,
        paddingMm: tplData.paddingMm || 0,
        gapMm: tplData.gapMm || 0,
        orientation: tplData.orientation || 'PORTRAIT',
        dpi: tplData.dpi || 203,
        isSystem: false,
        isDefault: Boolean(tplData.isDefault),
        isActive: true,
        elements: (body.elements || []).map((el: any) => ({ ...el, isLocked: false })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      webTemplates.push(newTpl);
      return { success: true, data: newTpl as unknown as T, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_UPDATE: {
      const body = (payload || {}) as any;
      const idx = webTemplates.findIndex((t) => t.id === body.id);
      if (idx === -1) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' }, timestamp };
      }
      if (webTemplates[idx].isSystem) {
        return { success: false, error: { code: 'READ_ONLY', message: 'System templates cannot be edited' }, timestamp };
      }
      const updatedElements = body.elements
        ? body.elements.map((el: any) => ({ ...el, isLocked: false }))
        : webTemplates[idx].elements;
      const updated = {
        ...webTemplates[idx],
        ...body.template,
        elements: updatedElements,
        updatedAt: new Date().toISOString(),
      };
      webTemplates[idx] = updated;
      return { success: true, data: updated as unknown as T, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_DELETE: {
      const idx = webTemplates.findIndex((t) => t.id === payload);
      if (idx !== -1 && !webTemplates[idx].isSystem) {
        webTemplates.splice(idx, 1);
        return { success: true, data: true as unknown as T, timestamp };
      }
      return { success: false, error: { code: 'DELETE_FAILED', message: 'Cannot delete template' }, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_DUPLICATE: {
      const p = (payload || {}) as { id: string; newName?: string };
      const src = webTemplates.find((t) => t.id === p.id);
      if (!src) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Source template not found' }, timestamp };
      }
      const dupId = 'web_tpl_' + Date.now();
      const dup = {
        ...src,
        id: dupId,
        name: p.newName || `${src.name} (Copy)`,
        isSystem: false,
        isDefault: false,
        elements: (src.elements || []).map((el: any, idx: number) => ({
          ...el,
          id: 'el_' + Math.random().toString(36).substring(2, 9) + '_' + idx,
          templateId: dupId,
          isLocked: false,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      webTemplates.push(dup);
      return { success: true, data: dup as unknown as T, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_EXPORT: {
      const src = webTemplates.find((t) => t.id === payload);
      if (!src) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' }, timestamp };
      }
      const jsonStr = JSON.stringify({ version: '1.0.0', exportedAt: new Date().toISOString(), template: src, elements: src.elements || [] }, null, 2);
      return { success: true, data: jsonStr as unknown as T, timestamp };
    }

    case IPC_CHANNELS.TEMPLATE_IMPORT: {
      try {
        const pkg = JSON.parse(payload as string);
        const dupId = 'web_tpl_' + Date.now();
        const imported = {
          ...pkg.template,
          id: dupId,
          name: `${pkg.template?.name || 'Imported'} (Imported)`,
          isSystem: false,
          isDefault: false,
          elements: (pkg.elements || []).map((el: any, idx: number) => ({
            ...el,
            id: 'el_' + Math.random().toString(36).substring(2, 9) + '_' + idx,
            templateId: dupId,
            isLocked: false,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        webTemplates.push(imported);
        return { success: true, data: imported as unknown as T, timestamp };
      } catch (err) {
        return { success: false, error: { code: 'IMPORT_FAILED', message: (err as Error).message }, timestamp };
      }
    }

    // Barcode Scanner IPC Web Simulation Handlers
    case IPC_CHANNELS.SCANNER_PROCESS: {
      console.log('[bridge] IPC_CHANNELS.SCANNER_PROCESS invoked with payload:', payload);
      const opts = (payload as any) || {};
      const cleanVal = (opts.barcode || '').trim();
      const now = Date.now();
      const duplicateScanDelay = 1000;

      if (
        duplicateScanDelay > 0 &&
        cleanVal === webLastScannedBarcode &&
        now - webLastScanTimestamp < duplicateScanDelay
      ) {
        console.warn(`[bridge] Suppressed duplicate scan for '${cleanVal}' within ${duplicateScanDelay}ms`);
        return {
          success: false,
          data: {
            success: false,
            barcode: opts.barcode,
            cleanBarcode: cleanVal,
            product: null,
            status: 'INVALID',
            message: `Duplicate scan suppressed (${duplicateScanDelay}ms delay active)`,
            timestamp,
          } as T,
          timestamp,
        };
      }

      webLastScannedBarcode = cleanVal;
      webLastScanTimestamp = now;

      const foundProduct = webMockProducts[cleanVal] || webMockProducts[cleanVal.toUpperCase()] || null;
      console.log(`[bridge] SCANNER_PROCESS barcode lookup '${cleanVal}':`, foundProduct ? 'FOUND' : 'NOT_FOUND');
      const status = foundProduct ? 'SUCCESS' : 'NOT_FOUND';
      const record = {
        id: Date.now(),
        barcode: cleanVal,
        productId: foundProduct?.id || null,
        productName: foundProduct?.name || 'Unknown Product',
        sku: foundProduct?.sku || '',
        category: foundProduct?.category || 'General',
        price: foundProduct?.price || 0,
        stock: foundProduct?.stock || 0,
        location: foundProduct?.location || 'N/A',
        scanTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: opts.userId || 'Customer Admin',
        deviceName: opts.deviceName || 'USB HID Scanner',
        status,
      };
      return {
        success: status === 'SUCCESS',
        data: {
          success: status === 'SUCCESS',
          barcode: opts.barcode,
          cleanBarcode: cleanVal,
          product: foundProduct,
          status,
          message: foundProduct ? `Product Found: ${foundProduct.name}` : 'Product Not Found',
          scanRecord: record,
          timestamp,
        } as T,
        timestamp,
      };
    }

    case IPC_CHANNELS.SCANNER_GET_HISTORY:
      return { success: true, data: [] as T, timestamp };

    case IPC_CHANNELS.SCANNER_CLEAR_HISTORY:
      return { success: true, data: true as T, timestamp };

    case IPC_CHANNELS.SCANNER_GET_SETTINGS:
      return {
        success: true,
        data: {
          prefix: '',
          suffix: 'Enter',
          autoClear: true,
          autoFocus: true,
          successSound: true,
          errorSound: true,
          continuousScanMode: false,
          duplicateScanDelay: 1000,
        } as T,
        timestamp,
      };

    case IPC_CHANNELS.SCANNER_SAVE_SETTINGS:
      return { success: true, data: payload as T, timestamp };

    case IPC_CHANNELS.PRODUCT_GET_ALL: {
      const list = Object.values(webMockProducts).filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
      return { success: true, data: list as unknown as T, timestamp };
    }

    case IPC_CHANNELS.SCANNER_CREATE_PRODUCT:
    case IPC_CHANNELS.PRODUCT_CREATE: {
      const p = (payload as any) || {};
      const id = Date.now();
      const created = {
        id,
        name: p.name || 'New Product',
        barcode: p.barcode || 'MZ-' + id,
        sku: p.sku || 'SKU-' + id,
        internalCode: p.internalCode || 'INT-' + id,
        category: p.category || 'General',
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
        purchasePrice: typeof p.purchasePrice === 'number' ? p.purchasePrice : parseFloat(p.purchasePrice) || 0,
        stock: typeof p.stock === 'number' ? p.stock : parseInt(p.stock, 10) || 0,
        status: p.status || 'ACTIVE',
        location: p.location || 'Warehouse A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      webMockProducts[created.barcode] = created;
      webMockProducts[created.barcode.toUpperCase()] = created;
      return { success: true, data: created as unknown as T, timestamp };
    }

    case IPC_CHANNELS.PRODUCT_UPDATE: {
      const { id, product } = (payload as { id: number; product: any }) || {};
      const existing = Object.values(webMockProducts).find((p) => p.id === id);
      const updated = {
        ...(existing || {}),
        ...product,
        id: id || existing?.id || Date.now(),
        updatedAt: new Date().toISOString(),
      };
      if (updated.barcode) {
        webMockProducts[updated.barcode] = updated;
        webMockProducts[updated.barcode.toUpperCase()] = updated;
      }
      return { success: true, data: updated as unknown as T, timestamp };
    }

    case IPC_CHANNELS.PRODUCT_DELETE: {
      const deleteId = typeof payload === 'number' ? payload : (payload as any)?.id;
      for (const key of Object.keys(webMockProducts)) {
        if (webMockProducts[key].id === deleteId) {
          delete webMockProducts[key];
        }
      }
      return { success: true, data: true as unknown as T, timestamp };
    }

    case IPC_CHANNELS.CATEGORY_GET_ALL: {
      const sorted = [...webMockCategories].sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));
      return { success: true, data: sorted as unknown as T, timestamp };
    }

    case IPC_CHANNELS.CATEGORY_CREATE: {
      const p = (payload as any) || {};
      const userRole = p.userRole || p.role;
      if (userRole === 'USER' || userRole === 'OPERATOR' || userRole === 'VIEWER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Users have read-only access to categories.' }, timestamp };
      }
      const trimmedName = (p.name || '').trim();
      if (!trimmedName) {
        return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Category name is required.' }, timestamp };
      }
      const existing = webMockCategories.find((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
      if (existing) {
        return { success: false, error: { code: 'DUPLICATE_CATEGORY', message: `Category "${trimmedName}" already exists.` }, timestamp };
      }
      const created = {
        id: Date.now(),
        name: trimmedName,
        description: p.description?.trim() || '',
        sortOrder: p.sortOrder !== undefined ? p.sortOrder : 0,
        isActive: p.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: p.createdBy || p.username || 'SYSTEM',
        updatedBy: p.createdBy || p.username || 'SYSTEM',
      };
      webMockCategories.push(created);
      return { success: true, data: created as unknown as T, timestamp };
    }

    case IPC_CHANNELS.CATEGORY_UPDATE: {
      const p = (payload as any) || {};
      const { id, category, userRole, role } = p;
      const effectiveRole = userRole || role;
      if (effectiveRole === 'USER' || effectiveRole === 'OPERATOR' || effectiveRole === 'VIEWER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Users cannot update categories.' }, timestamp };
      }
      const existing = webMockCategories.find((c) => c.id === id);
      if (!existing) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Category not found' }, timestamp };
      }
      const updateData = category || p;
      if (updateData.name) {
        const trimmedName = updateData.name.trim();
        const dup = webMockCategories.find((c) => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase());
        if (dup) {
          return { success: false, error: { code: 'DUPLICATE_CATEGORY', message: `Category "${trimmedName}" already exists.` }, timestamp };
        }
        existing.name = trimmedName;
      }
      if (updateData.description !== undefined) existing.description = updateData.description;
      if (updateData.sortOrder !== undefined) existing.sortOrder = updateData.sortOrder;
      if (updateData.isActive !== undefined) existing.isActive = updateData.isActive;
      existing.updatedAt = new Date().toISOString();
      return { success: true, data: existing as unknown as T, timestamp };
    }

    case IPC_CHANNELS.CATEGORY_DELETE: {
      const p = (payload as any) || {};
      const id = typeof payload === 'number' ? payload : p.id;
      const effectiveRole = p.userRole || p.role;
      if (effectiveRole && effectiveRole !== 'OWNER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Only Owner can delete categories.' }, timestamp };
      }
      const idx = webMockCategories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        webMockCategories.splice(idx, 1);
        return { success: true, data: true as unknown as T, timestamp };
      }
      return { success: false, error: { code: 'NOT_FOUND', message: 'Category not found' }, timestamp };
    }

    // ENTERPRISE MASTER DATA MOCK IPC HANDLERS
    case IPC_CHANNELS.MASTER_GET_ALL: {
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || [];
      const sorted = [...list].sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));
      return { success: true, data: sorted as unknown as T, timestamp };
    }

    case IPC_CHANNELS.MASTER_GET_ACTIVE: {
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || [];
      const activeOnly = list.filter((item) => item.isActive);
      const sorted = [...activeOnly].sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));
      return { success: true, data: sorted as unknown as T, timestamp };
    }

    case IPC_CHANNELS.MASTER_CREATE: {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || (webMockMasterData[moduleName] = []);
      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions to create master data.' }, timestamp };
      }

      const trimmedName = (p.name || p.payload?.name || '').trim();
      const trimmedCode = (p.code || p.payload?.code || '').trim().toUpperCase();

      if (!trimmedName || !trimmedCode) {
        return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name and Code are required.' }, timestamp };
      }

      if (list.some((i) => i.name.toLowerCase() === trimmedName.toLowerCase())) {
        return { success: false, error: { code: 'DUPLICATE_NAME', message: `Name "${trimmedName}" already exists.` }, timestamp };
      }
      if (list.some((i) => i.code.toLowerCase() === trimmedCode.toLowerCase())) {
        return { success: false, error: { code: 'DUPLICATE_CODE', message: `Code "${trimmedCode}" already exists.` }, timestamp };
      }

      const newItem = {
        id: `${moduleName}-${Date.now()}`,
        name: trimmedName,
        code: trimmedCode,
        description: (p.description || p.payload?.description || '').trim(),
        sortOrder: p.sortOrder !== undefined ? Number(p.sortOrder) : (p.payload?.sortOrder !== undefined ? Number(p.payload.sortOrder) : 0),
        isActive: p.isActive !== undefined ? Boolean(p.isActive) : (p.payload?.isActive !== undefined ? Boolean(p.payload.isActive) : true),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: p.username || p.payload?.username || 'SYSTEM',
        updatedBy: p.username || p.payload?.username || 'SYSTEM',
      };

      list.push(newItem);
      return { success: true, data: newItem as unknown as T, timestamp };
    }

    case IPC_CHANNELS.MASTER_UPDATE: {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || [];
      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions to update master data.' }, timestamp };
      }

      const item = list.find((i) => i.id === p.id);
      if (!item) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Record not found' }, timestamp };
      }

      const updateData = p.payload || p;
      if (updateData.name) {
        const trimmedName = updateData.name.trim();
        if (list.some((i) => i.id !== p.id && i.name.toLowerCase() === trimmedName.toLowerCase())) {
          return { success: false, error: { code: 'DUPLICATE_NAME', message: `Name "${trimmedName}" already exists.` }, timestamp };
        }
        item.name = trimmedName;
      }

      if (updateData.code) {
        const trimmedCode = updateData.code.trim().toUpperCase();
        if (list.some((i) => i.id !== p.id && i.code.toLowerCase() === trimmedCode.toLowerCase())) {
          return { success: false, error: { code: 'DUPLICATE_CODE', message: `Code "${trimmedCode}" already exists.` }, timestamp };
        }
        item.code = trimmedCode;
      }

      if (updateData.description !== undefined) item.description = updateData.description.trim();
      if (updateData.sortOrder !== undefined) item.sortOrder = Number(updateData.sortOrder);
      if (updateData.isActive !== undefined) item.isActive = Boolean(updateData.isActive);
      item.updatedAt = new Date().toISOString();

      return { success: true, data: item as unknown as T, timestamp };
    }

    case IPC_CHANNELS.MASTER_ENABLE: {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || [];
      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions.' }, timestamp };
      }

      const item = list.find((i) => i.id === p.id);
      if (!item) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Record not found' }, timestamp };
      }

      item.isActive = true;
      item.updatedAt = new Date().toISOString();
      return { success: true, data: item as unknown as T, timestamp };
    }

    case IPC_CHANNELS.MASTER_DISABLE: {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || [];
      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions.' }, timestamp };
      }

      const item = list.find((i) => i.id === p.id);
      if (!item) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Record not found' }, timestamp };
      }

      item.isActive = false;
      item.updatedAt = new Date().toISOString();
      return { success: true, data: item as unknown as T, timestamp };
    }

    case IPC_CHANNELS.MASTER_DELETE: {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const list = webMockMasterData[moduleName] || [];
      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();

      if (role !== 'OWNER' && role !== 'ADMIN') {
        return { success: false, error: { code: 'PERMISSION_DENIED', message: 'Insufficient permissions to delete master data records.' }, timestamp };
      }

      const idx = list.findIndex((i) => i.id === p.id);
      if (idx !== -1) {
        list.splice(idx, 1);
        return { success: true, data: true as unknown as T, timestamp };
      }
      return { success: false, error: { code: 'NOT_FOUND', message: 'Record not found' }, timestamp };
    }

    default:
      return {
        success: true,
        data: {} as T,
        timestamp,
      };
  }
}
