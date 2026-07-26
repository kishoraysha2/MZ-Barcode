import { IPC_CHANNELS } from '../shared/ipcChannels';
import { ElectronAPI, IPCResponse } from '../shared/types';

// In-memory array for web simulation fallback when in browser preview
const webBarcodes: any[] = [];
let barcodeAutoId = Date.now();

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
};

/**
 * Universal IPC invoker with web preview runtime fallback
 */
async function invokeIPC<T>(channel: string, payload?: unknown): Promise<IPCResponse<T>> {
  console.log(`[TRACE 2.2] invokeIPC channel: ${channel}`);
  if (typeof window !== 'undefined' && (window as unknown as { ipcRenderer?: { invoke: (c: string, p?: unknown) => Promise<IPCResponse<T>> } }).ipcRenderer) {
    console.log(`[TRACE 2.3] Dispatching via Electron window.ipcRenderer.invoke(${channel})`);
    const res = await (window as unknown as { ipcRenderer: { invoke: (c: string, p?: unknown) => Promise<IPCResponse<T>> } }).ipcRenderer.invoke(channel, payload);
    console.log(`[TRACE 2.3.1] Electron window.ipcRenderer.invoke response for ${channel}:`, res);
    return res;
  }

  console.log(`[TRACE 2.4] Falling back to simulateWebIPCResponse for ${channel}`);
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
    default:
      return {
        success: true,
        data: {} as T,
        timestamp,
      };
  }
}
