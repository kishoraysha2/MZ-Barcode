"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/preload/index.ts
var index_exports = {};
__export(index_exports, {
  electronBridge: () => electronBridge
});
module.exports = __toCommonJS(index_exports);

// src/preload/bridge.ts
var webBarcodes = [];
var barcodeAutoId = Date.now();
var webTemplates = [
  {
    id: "sys_tpl_40x20",
    name: "Standard Retail Tag (40x20mm)",
    description: "Compact retail price tag with barcode and price binding",
    category: "RETAIL",
    widthMm: 40,
    heightMm: 20,
    marginTopMm: 1,
    marginBottomMm: 1,
    marginLeftMm: 1,
    marginRightMm: 1,
    paddingMm: 1,
    gapMm: 0,
    orientation: "PORTRAIT",
    dpi: 203,
    isSystem: true,
    isDefault: false,
    isActive: true,
    elements: [
      {
        id: "el_1",
        templateId: "sys_tpl_40x20",
        type: "TEXT",
        name: "Company Name",
        xMm: 2,
        yMm: 1.5,
        widthMm: 36,
        heightMm: 3.5,
        zIndex: 0,
        rotation: 0,
        alignment: "CENTER",
        isLocked: true,
        isHidden: false,
        isPrintable: true,
        properties: { fontFamily: "Arial", fontSize: 8, fontWeight: "bold", staticValue: "MZ RETAIL STORE" }
      },
      {
        id: "el_2",
        templateId: "sys_tpl_40x20",
        type: "BARCODE",
        name: "Product Barcode",
        xMm: 2,
        yMm: 5.5,
        widthMm: 36,
        heightMm: 9,
        zIndex: 1,
        rotation: 0,
        alignment: "CENTER",
        isLocked: true,
        isHidden: false,
        isPrintable: true,
        properties: { barcodeFormat: "CODE128", quietZone: 1, dataBinding: "SKU", staticValue: "100012345", showText: true }
      },
      {
        id: "el_3",
        templateId: "sys_tpl_40x20",
        type: "TEXT",
        name: "Price Tag",
        xMm: 2,
        yMm: 15,
        widthMm: 36,
        heightMm: 4,
        zIndex: 2,
        rotation: 0,
        alignment: "CENTER",
        isLocked: true,
        isHidden: false,
        isPrintable: true,
        properties: { fontFamily: "Arial", fontSize: 10, fontWeight: "bold", dataBinding: "Price", staticValue: "$19.99" }
      }
    ]
  },
  {
    id: "sys_tpl_50x25",
    name: "Standard Product Label (50x25mm)",
    description: "Standard product and inventory label with barcode and product title",
    category: "RETAIL",
    widthMm: 50,
    heightMm: 25,
    marginTopMm: 1,
    marginBottomMm: 1,
    marginLeftMm: 1,
    marginRightMm: 1,
    paddingMm: 1,
    gapMm: 0,
    orientation: "PORTRAIT",
    dpi: 203,
    isSystem: true,
    isDefault: true,
    isActive: true,
    elements: []
  }
];
var electronBridge = {
  databaseInit: async () => invokeIPC("ipc:database:init" /* DATABASE_INIT */),
  getDatabaseStatus: async () => invokeIPC("ipc:database:status" /* DATABASE_STATUS */),
  // Dashboard IPC
  getDashboardOverview: async () => invokeIPC("ipc:dashboard:get_overview" /* DASHBOARD_GET_OVERVIEW */),
  getDashboardStatistics: async () => invokeIPC("ipc:dashboard:get_statistics" /* DASHBOARD_GET_STATISTICS */),
  getRecentBarcodes: async (limit) => invokeIPC("ipc:dashboard:get_recent_barcodes" /* DASHBOARD_GET_RECENT_BARCODES */, limit),
  // Settings IPC
  getSettings: async () => invokeIPC("ipc:settings:get" /* SETTINGS_GET */),
  saveSettings: async (settings) => invokeIPC("ipc:settings:save" /* SETTINGS_SAVE */, settings),
  resetSettings: async () => invokeIPC("ipc:settings:reset" /* SETTINGS_RESET */),
  getAuditLogs: async () => invokeIPC("ipc:audit_logs:get" /* AUDIT_LOGS_GET */),
  // Backup IPC
  createBackup: async () => invokeIPC("ipc:backup:create" /* BACKUP_CREATE */),
  listBackups: async () => invokeIPC("ipc:backup:list" /* BACKUP_LIST */),
  restoreBackup: async (file) => invokeIPC("ipc:backup:restore" /* BACKUP_RESTORE */, file),
  // License IPC
  getLicenseStatus: async () => invokeIPC("ipc:license:get_status" /* LICENSE_GET_STATUS */),
  checkLicense: async () => invokeIPC("ipc:license:check" /* LICENSE_CHECK */),
  activateLicense: async (key) => invokeIPC("ipc:license:activate" /* LICENSE_ACTIVATE */, key),
  // Printer IPC
  getDefaultPrinter: async () => invokeIPC("ipc:printer:get_default" /* PRINTER_GET_DEFAULT */),
  getPrinters: async () => invokeIPC("ipc:printer:list" /* PRINTER_LIST */),
  getPrinterStatus: async (name) => invokeIPC("ipc:printer:status" /* PRINTER_STATUS */, name),
  getPrinterProfiles: async () => invokeIPC("printer:getProfiles" /* PRINTER_GET_PROFILES */),
  // Barcode & Print Foundation IPC (Sprint 5)
  getBarcodeFormats: async () => invokeIPC("ipc:barcode:formats" /* BARCODE_FORMATS */),
  validateBarcode: async (value, format) => invokeIPC("ipc:barcode:validate" /* BARCODE_VALIDATE */, { value, format }),
  getAllBarcodes: async () => invokeIPC("ipc:barcode:get_all" /* BARCODE_GET_ALL */),
  generateBarcode: async (options) => invokeIPC("barcode:generate" /* BARCODE_GENERATE */, options),
  previewBarcode: async (options) => invokeIPC("barcode:preview" /* BARCODE_PREVIEW */, options),
  exportBarcode: async (options) => invokeIPC("barcode:export" /* BARCODE_EXPORT */, options),
  previewPrint: async (options) => invokeIPC("print:preview" /* PRINT_PREVIEW */, options),
  createPrintJob: async (options) => invokeIPC("print:createJob" /* PRINT_CREATE_JOB */, options),
  createBarcode: async (barcode) => invokeIPC("ipc:barcode:create" /* BARCODE_CREATE */, barcode),
  getNextSequence: async (prefix) => invokeIPC("ipc:barcode:get_next_sequence" /* BARCODE_GET_NEXT_SEQUENCE */, prefix),
  // System & Logs
  getSystemInfo: async () => invokeIPC("ipc:system:info" /* SYSTEM_INFO */),
  logMessage: async (level, message) => {
    await invokeIPC("ipc:logs:write" /* LOGS_WRITE */, { level, message });
  },
  // Auth & RBAC IPC
  login: async (credentials) => invokeIPC("ipc:auth:login" /* AUTH_LOGIN */, credentials),
  logout: async (sessionToken) => invokeIPC("ipc:auth:logout" /* AUTH_LOGOUT */, { sessionToken }),
  validateSession: async (sessionToken) => invokeIPC("ipc:auth:validate_session" /* AUTH_VALIDATE_SESSION */, { sessionToken }),
  changePassword: async (params) => invokeIPC("ipc:auth:change_password" /* AUTH_CHANGE_PASSWORD */, params),
  // User Management IPC
  getUsers: async () => invokeIPC("ipc:user:list" /* USER_LIST */),
  createUser: async (user) => invokeIPC("ipc:user:create" /* USER_CREATE */, user),
  updateUserStatus: async (params) => invokeIPC("ipc:user:update_status" /* USER_UPDATE_STATUS */, params),
  getRoles: async () => invokeIPC("ipc:role:list" /* ROLE_LIST */),
  getPermissions: async (roleId) => invokeIPC("ipc:permissions:get" /* PERMISSIONS_GET */, { roleId }),
  // Label Template IPC (Sprint 6.2.1)
  getLabelTemplates: async () => invokeIPC("ipc:template:list" /* TEMPLATE_LIST */),
  getLabelTemplate: async (id) => invokeIPC("ipc:template:get" /* TEMPLATE_GET */, id),
  createLabelTemplate: async (dto) => invokeIPC("ipc:template:create" /* TEMPLATE_CREATE */, dto),
  updateLabelTemplate: async (dto) => {
    console.log("[TRACE 2.1] bridge.updateLabelTemplate() invoked with dto:", dto);
    return invokeIPC("ipc:template:update" /* TEMPLATE_UPDATE */, dto);
  },
  deleteLabelTemplate: async (id) => invokeIPC("ipc:template:delete" /* TEMPLATE_DELETE */, id),
  duplicateLabelTemplate: async (dto) => invokeIPC("ipc:template:duplicate" /* TEMPLATE_DUPLICATE */, dto),
  exportLabelTemplate: async (id) => invokeIPC("ipc:template:export" /* TEMPLATE_EXPORT */, id),
  importLabelTemplate: async (jsonContent) => invokeIPC("ipc:template:import" /* TEMPLATE_IMPORT */, jsonContent)
};
async function invokeIPC(channel, payload) {
  console.log(`[TRACE 2.2] invokeIPC channel: ${channel}`);
  if (typeof window !== "undefined" && window.ipcRenderer) {
    console.log(`[TRACE 2.3] Dispatching via Electron window.ipcRenderer.invoke(${channel})`);
    const res2 = await window.ipcRenderer.invoke(channel, payload);
    console.log(`[TRACE 2.3.1] Electron window.ipcRenderer.invoke response for ${channel}:`, res2);
    return res2;
  }
  console.log(`[TRACE 2.4] Falling back to simulateWebIPCResponse for ${channel}`);
  const res = await simulateWebIPCResponse(channel, payload);
  console.log(`[TRACE 2.4.1] simulateWebIPCResponse response for ${channel}:`, res);
  return res;
}
function generateMockBarcodeSvg(val, format = "CODE128", width = 200, height = 80) {
  const is2D = ["QR_CODE", "QR", "DATAMATRIX", "AZTEC", "PDF417"].includes(format.toUpperCase());
  if (is2D) {
    const size = Math.min(width, height);
    const boxSize = size * 0.85;
    const startX2 = (width - boxSize) / 2;
    const startY = (height - boxSize) / 2;
    const modules = 21;
    const mw2 = boxSize / modules;
    let pathD2 = "";
    const drawFinder = (mx, my) => {
      pathD2 += `M${(startX2 + mx * mw2).toFixed(2)} ${(startY + my * mw2).toFixed(2)}h${(7 * mw2).toFixed(2)}v${(7 * mw2).toFixed(2)}h-${(7 * mw2).toFixed(2)}z `;
      pathD2 += `M${(startX2 + (mx + 1) * mw2).toFixed(2)} ${(startY + (my + 1) * mw2).toFixed(2)}h${(5 * mw2).toFixed(2)}v${(5 * mw2).toFixed(2)}h-${(5 * mw2).toFixed(2)}z `;
      pathD2 += `M${(startX2 + (mx + 2) * mw2).toFixed(2)} ${(startY + (my + 2) * mw2).toFixed(2)}h${(3 * mw2).toFixed(2)}v${(3 * mw2).toFixed(2)}h-${(3 * mw2).toFixed(2)}z `;
    };
    drawFinder(0, 0);
    drawFinder(14, 0);
    drawFinder(0, 14);
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (r < 7 && c < 7 || r < 7 && c >= 14 || r >= 14 && c < 7) continue;
        const hash = (r * 31 + c * 17 + (val.charCodeAt((r + c) % val.length) || 0)) % 3;
        if (hash === 0) {
          pathD2 += `M${(startX2 + c * mw2).toFixed(2)} ${(startY + r * mw2).toFixed(2)}h${mw2.toFixed(2)}v${mw2.toFixed(2)}h-${mw2.toFixed(2)}z `;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="background-color:#ffffff;"><rect width="${width}" height="${height}" fill="#ffffff"/><path d="${pathD2}" fill="#000000" fill-rule="evenodd"/><text x="${width / 2}" y="${startY + boxSize + 12}" font-family="monospace" font-size="10" text-anchor="middle" fill="#000000" font-weight="bold">${val}</text></svg>`;
  }
  const targetBarWidth = width * 0.85;
  const startX = (width - targetBarWidth) / 2;
  const barTop = 8;
  const barHeight = height - 24;
  const pattern = [];
  pattern.push([2, true], [1, false], [1, true], [2, false]);
  const cleanVal = val || "PREVIEW-123";
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    const b1 = code % 3 + 1;
    const s1 = (code >> 1) % 3 + 1;
    const b2 = (code >> 2) % 3 + 1;
    const s2 = (code >> 3) % 2 + 1;
    const b3 = (code >> 4) % 3 + 1;
    const s3 = (code >> 5) % 2 + 1;
    pattern.push([b1, true], [s1, false], [b2, true], [s2, false], [b3, true], [s3, false]);
  }
  pattern.push([2, true], [1, false], [3, true]);
  const totalModules = pattern.reduce((sum, p) => sum + p[0], 0);
  const mw = targetBarWidth / totalModules;
  let pathD = "";
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
async function simulateWebIPCResponse(channel, payload) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  switch (channel) {
    case "ipc:database:init" /* DATABASE_INIT */:
      return {
        success: true,
        data: { path: "%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db", status: "SQLite WAL Mode Engine Online" },
        timestamp
      };
    case "ipc:database:status" /* DATABASE_STATUS */:
      return {
        success: true,
        data: { initialized: true, wal: true },
        timestamp
      };
    case "printer:getProfiles" /* PRINTER_GET_PROFILES */:
      return {
        success: true,
        data: [
          { id: 1, name: "Canon G3010 series", driver_type: "WINDOWS", is_default: 1, dpi: 203, paper_type: "Continuous 50mm x 25mm", port: "USB001" },
          { id: 2, name: "Microsoft Print to PDF", driver_type: "WINDOWS", is_default: 0, dpi: 300, paper_type: "A4", port: "PORTPROMPT:" }
        ],
        timestamp
      };
    case "barcode:generate" /* BARCODE_GENERATE */:
    case "barcode:preview" /* BARCODE_PREVIEW */: {
      const opts = payload || {};
      const val = opts.value || "PREVIEW-123";
      const fmt = opts.format || "CODE128";
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
          pngDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`
        },
        timestamp
      };
    }
    case "barcode:export" /* BARCODE_EXPORT */: {
      const opts = payload || {};
      const val = opts.value || "EXPORT-123";
      const fmt = opts.format || "CODE128";
      const mockSvg = generateMockBarcodeSvg(val, fmt, 200, 80);
      return {
        success: true,
        data: {
          success: true,
          filePath: `/downloads/${val}.svg`,
          dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
          svgContent: mockSvg
        },
        timestamp
      };
    }
    case "print:preview" /* PRINT_PREVIEW */: {
      const opts = payload || {};
      const val = opts.barcodeValue || "PRINT-PREVIEW-123";
      const fmt = opts.barcodeType || opts.format || "CODE128";
      const mockSvg = generateMockBarcodeSvg(val, fmt, 200, 100);
      return {
        success: true,
        data: {
          success: true,
          previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
          previewSvg: mockSvg,
          svg: mockSvg,
          printerName: opts.printerName || "Default Printer"
        },
        timestamp
      };
    }
    case "print:createJob" /* PRINT_CREATE_JOB */: {
      const p = payload || {};
      return {
        success: true,
        data: {
          jobId: Math.floor(Math.random() * 9e3) + 1e3,
          status: "PENDING",
          printerName: p.printerName || "Default Printer",
          copies: p.copies || 1
        },
        timestamp
      };
    }
    case "ipc:dashboard:get_overview" /* DASHBOARD_GET_OVERVIEW */:
      return {
        success: true,
        data: {
          totalBarcodes: webBarcodes.length,
          totalPrints: webBarcodes.reduce((acc, b) => acc + (b.print_count || 1), 0),
          nextSequence: `MZ-${String(webBarcodes.length + 1).padStart(8, "0")}`,
          activePrinter: "Not Configured",
          licenseStatus: "Not Configured",
          licenseDaysRemaining: 0,
          hwid: "Not Configured",
          databaseHealth: "SQLite WAL Mode Engine Online",
          databaseSizeKb: 34
        },
        timestamp
      };
    case "ipc:dashboard:get_statistics" /* DASHBOARD_GET_STATISTICS */:
      return {
        success: true,
        data: {
          totalBarcodes: webBarcodes.length,
          totalPrints: webBarcodes.reduce((acc, b) => acc + (b.print_count || 1), 0),
          activeUsersCount: 2,
          totalTemplatesCount: 0,
          databaseSizeKb: 34
        },
        timestamp
      };
    case "ipc:dashboard:get_recent_barcodes" /* DASHBOARD_GET_RECENT_BARCODES */:
    case "ipc:barcode:get_all" /* BARCODE_GET_ALL */:
      return {
        success: true,
        data: [...webBarcodes],
        timestamp
      };
    case "ipc:barcode:create" /* BARCODE_CREATE */: {
      const p = payload;
      barcodeAutoId += 1;
      const created = {
        id: p.id || barcodeAutoId,
        barcode_value: p.barcode_value,
        prefix: p.prefix || "MZ-",
        sequence_number: p.sequence_number || webBarcodes.length + 1,
        barcode_type: p.barcode_type || "CODE128",
        title: p.title || "General Item",
        category: p.category || "General",
        status: "active",
        print_count: p.print_count || 1,
        created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
        created_by: p.created_by || "Customer Admin"
      };
      webBarcodes.unshift(created);
      return {
        success: true,
        data: created,
        timestamp
      };
    }
    case "ipc:barcode:get_next_sequence" /* BARCODE_GET_NEXT_SEQUENCE */: {
      const pref = payload || "MZ-";
      const seq = webBarcodes.length + 1;
      return {
        success: true,
        data: {
          prefix: pref,
          nextSequence: seq,
          nextBarcodeNumber: `${pref}${String(seq).padStart(8, "0")}`
        },
        timestamp
      };
    }
    case "ipc:settings:get" /* SETTINGS_GET */:
      return {
        success: true,
        data: {
          app: { theme: "dark", autoUpdate: false, language: "en-US", edition: "customer" },
          database: { path: "%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db", walMode: true, autoBackupDaily: true },
          printing: { defaultPrinter: "Not Configured", paperWidthMm: 50, paperHeightMm: 25, dpi: 203 },
          security: { sessionTimeoutMinutes: 30, auditLogging: true }
        },
        timestamp
      };
    case "ipc:settings:save" /* SETTINGS_SAVE */:
      return {
        success: true,
        data: payload,
        timestamp
      };
    case "ipc:audit_logs:get" /* AUDIT_LOGS_GET */:
      return {
        success: true,
        data: [],
        timestamp
      };
    case "ipc:backup:create" /* BACKUP_CREATE */:
      return {
        success: true,
        data: { file: `mz_backup_${Date.now()}.db.bak` },
        timestamp
      };
    case "ipc:backup:list" /* BACKUP_LIST */:
      return {
        success: true,
        data: [],
        timestamp
      };
    case "ipc:printer:get_default" /* PRINTER_GET_DEFAULT */: {
      return {
        success: true,
        data: { id: 1, name: "Canon G3010 series", driver_type: "WINDOWS", is_default: 1, dpi: 203, status: "ready", port: "USB001" },
        timestamp
      };
    }
    case "ipc:printer:list" /* PRINTER_LIST */: {
      return {
        success: true,
        data: [
          { id: 1, name: "Canon G3010 series", driver_type: "WINDOWS", is_default: 1, dpi: 203, status: "ready", port: "USB001" },
          { id: 2, name: "Microsoft Print to PDF", driver_type: "WINDOWS", is_default: 0, dpi: 300, status: "ready", port: "PORTPROMPT:" }
        ],
        timestamp
      };
    }
    case "ipc:license:get_status" /* LICENSE_GET_STATUS */:
      return {
        success: true,
        data: {
          isActivated: false,
          customerName: "Not Configured",
          hwid: "Not Configured",
          activationKey: "",
          issuedAt: "",
          expiresAt: "",
          daysRemaining: 0,
          durationDays: 0,
          maxUsers: 0,
          status: "Not Configured",
          lastClockCheck: "Not Configured"
        },
        timestamp
      };
    case "ipc:license:check" /* LICENSE_CHECK */:
      return {
        success: true,
        data: { active: false, type: "NOT_CONFIGURED" },
        timestamp
      };
    case "ipc:barcode:formats" /* BARCODE_FORMATS */:
      return {
        success: true,
        data: ["CODE128", "EAN13", "EAN8", "UPCA", "QR", "DATAMATRIX", "PDF417"],
        timestamp
      };
    case "ipc:auth:login" /* AUTH_LOGIN */: {
      const creds = payload;
      if (creds.username === "admin" || creds.username === "owner") {
        return {
          success: true,
          data: {
            sessionId: 101,
            userId: creds.username === "owner" ? 1 : 2,
            username: creds.username,
            roleId: creds.username === "owner" ? 1 : 2,
            roleName: creds.username === "owner" ? "OWNER" : "ADMIN",
            fullName: creds.username === "owner" ? "System Owner" : "Enterprise Admin",
            sessionToken: `token_web_mock_${Date.now()}`,
            expiresAt: new Date(Date.now() + 12 * 3600 * 1e3).toISOString()
          },
          timestamp
        };
      }
      return {
        success: false,
        error: { code: "AUTH_FAILED", message: "Invalid username or password" },
        timestamp
      };
    }
    case "ipc:auth:validate_session" /* AUTH_VALIDATE_SESSION */:
      return {
        success: true,
        data: {
          sessionId: 101,
          userId: 2,
          username: "admin",
          roleId: 2,
          roleName: "ADMIN",
          fullName: "Enterprise Admin",
          sessionToken: "token_web_active",
          expiresAt: new Date(Date.now() + 12 * 3600 * 1e3).toISOString()
        },
        timestamp
      };
    case "ipc:user:list" /* USER_LIST */:
      return {
        success: true,
        data: [
          { id: 1, username: "owner", fullName: "System Owner", roleId: 1, role: "OWNER", isActive: true, createdAt: "2026-07-23 00:00:00", lastLogin: "2026-07-23 02:15:00" },
          { id: 2, username: "admin", fullName: "Enterprise Admin", roleId: 2, role: "ADMIN", isActive: true, createdAt: "2026-07-23 00:00:00", lastLogin: "2026-07-23 02:30:00" }
        ],
        timestamp
      };
    case "ipc:role:list" /* ROLE_LIST */:
      return {
        success: true,
        data: [
          { id: 1, name: "OWNER", description: "System Owner & Software Issuer", isActive: true },
          { id: 2, name: "ADMIN", description: "Enterprise Administrator", isActive: true },
          { id: 3, name: "USER", description: "Standard Operator User", isActive: true },
          { id: 4, name: "VIEWER", description: "Read-only Inspector", isActive: true }
        ],
        timestamp
      };
    // Label Template IPC Handlers for Web Simulation Fallback
    case "ipc:template:list" /* TEMPLATE_LIST */: {
      const sanitized = webTemplates.map((t) => ({
        ...t,
        elements: (t.elements || []).map((el) => ({
          ...el,
          isLocked: t.isSystem ? true : false
        }))
      }));
      return { success: true, data: sanitized, timestamp };
    }
    case "ipc:template:get" /* TEMPLATE_GET */: {
      const found = webTemplates.find((t) => t.id === payload);
      if (!found) {
        return { success: false, error: { code: "NOT_FOUND", message: "Template not found" }, timestamp };
      }
      const sanitized = {
        ...found,
        elements: (found.elements || []).map((el) => ({
          ...el,
          isLocked: found.isSystem ? true : false
        }))
      };
      return { success: true, data: sanitized, timestamp };
    }
    case "ipc:template:create" /* TEMPLATE_CREATE */: {
      const body = payload || {};
      const tplData = body.template || {};
      const newTpl = {
        id: "web_tpl_" + Date.now(),
        name: tplData.name || "New Template",
        description: tplData.description || "",
        category: tplData.category || "CUSTOM",
        widthMm: tplData.widthMm || 50,
        heightMm: tplData.heightMm || 25,
        marginTopMm: tplData.marginTopMm || 0,
        marginBottomMm: tplData.marginBottomMm || 0,
        marginLeftMm: tplData.marginLeftMm || 0,
        marginRightMm: tplData.marginRightMm || 0,
        paddingMm: tplData.paddingMm || 0,
        gapMm: tplData.gapMm || 0,
        orientation: tplData.orientation || "PORTRAIT",
        dpi: tplData.dpi || 203,
        isSystem: false,
        isDefault: Boolean(tplData.isDefault),
        isActive: true,
        elements: (body.elements || []).map((el) => ({ ...el, isLocked: false })),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      webTemplates.push(newTpl);
      return { success: true, data: newTpl, timestamp };
    }
    case "ipc:template:update" /* TEMPLATE_UPDATE */: {
      const body = payload || {};
      const idx = webTemplates.findIndex((t) => t.id === body.id);
      if (idx === -1) {
        return { success: false, error: { code: "NOT_FOUND", message: "Template not found" }, timestamp };
      }
      if (webTemplates[idx].isSystem) {
        return { success: false, error: { code: "READ_ONLY", message: "System templates cannot be edited" }, timestamp };
      }
      const updatedElements = body.elements ? body.elements.map((el) => ({ ...el, isLocked: false })) : webTemplates[idx].elements;
      const updated = {
        ...webTemplates[idx],
        ...body.template,
        elements: updatedElements,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      webTemplates[idx] = updated;
      return { success: true, data: updated, timestamp };
    }
    case "ipc:template:delete" /* TEMPLATE_DELETE */: {
      const idx = webTemplates.findIndex((t) => t.id === payload);
      if (idx !== -1 && !webTemplates[idx].isSystem) {
        webTemplates.splice(idx, 1);
        return { success: true, data: true, timestamp };
      }
      return { success: false, error: { code: "DELETE_FAILED", message: "Cannot delete template" }, timestamp };
    }
    case "ipc:template:duplicate" /* TEMPLATE_DUPLICATE */: {
      const p = payload || {};
      const src = webTemplates.find((t) => t.id === p.id);
      if (!src) {
        return { success: false, error: { code: "NOT_FOUND", message: "Source template not found" }, timestamp };
      }
      const dupId = "web_tpl_" + Date.now();
      const dup = {
        ...src,
        id: dupId,
        name: p.newName || `${src.name} (Copy)`,
        isSystem: false,
        isDefault: false,
        elements: (src.elements || []).map((el, idx) => ({
          ...el,
          id: "el_" + Math.random().toString(36).substring(2, 9) + "_" + idx,
          templateId: dupId,
          isLocked: false
        })),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      webTemplates.push(dup);
      return { success: true, data: dup, timestamp };
    }
    case "ipc:template:export" /* TEMPLATE_EXPORT */: {
      const src = webTemplates.find((t) => t.id === payload);
      if (!src) {
        return { success: false, error: { code: "NOT_FOUND", message: "Template not found" }, timestamp };
      }
      const jsonStr = JSON.stringify({ version: "1.0.0", exportedAt: (/* @__PURE__ */ new Date()).toISOString(), template: src, elements: src.elements || [] }, null, 2);
      return { success: true, data: jsonStr, timestamp };
    }
    case "ipc:template:import" /* TEMPLATE_IMPORT */: {
      try {
        const pkg = JSON.parse(payload);
        const dupId = "web_tpl_" + Date.now();
        const imported = {
          ...pkg.template,
          id: dupId,
          name: `${pkg.template?.name || "Imported"} (Imported)`,
          isSystem: false,
          isDefault: false,
          elements: (pkg.elements || []).map((el, idx) => ({
            ...el,
            id: "el_" + Math.random().toString(36).substring(2, 9) + "_" + idx,
            templateId: dupId,
            isLocked: false
          })),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        webTemplates.push(imported);
        return { success: true, data: imported, timestamp };
      } catch (err) {
        return { success: false, error: { code: "IMPORT_FAILED", message: err.message }, timestamp };
      }
    }
    default:
      return {
        success: true,
        data: {},
        timestamp
      };
  }
}

// src/preload/index.ts
try {
  const { contextBridge, ipcRenderer } = require("electron");
  if (contextBridge) {
    contextBridge.exposeInMainWorld("ipcRenderer", {
      invoke: (channel, payload) => ipcRenderer.invoke(channel, payload)
    });
    contextBridge.exposeInMainWorld("electronAPI", electronBridge);
  }
} catch {
  if (typeof window !== "undefined") {
    window.electronAPI = electronBridge;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  electronBridge
});
