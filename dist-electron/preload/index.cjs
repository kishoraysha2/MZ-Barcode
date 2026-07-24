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
  getPermissions: async (roleId) => invokeIPC("ipc:permissions:get" /* PERMISSIONS_GET */, { roleId })
};
async function invokeIPC(channel, payload) {
  if (typeof window !== "undefined" && window.ipcRenderer) {
    return window.ipcRenderer.invoke(channel, payload);
  }
  return simulateWebIPCResponse(channel, payload);
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
      const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect width="200" height="80" fill="#ffffff"/><path d="M10 10h5v60h-5zm10 0h10v60h-10zm15 0h5v60h-5zm10 0h15v60h-15zm20 0h5v60h-5zm10 0h10v60h-10zm15 0h5v60h-5z" fill="#000000"/><text x="100" y="75" font-family="monospace" font-size="10" text-anchor="middle">${val}</text></svg>`;
      return {
        success: true,
        data: {
          success: true,
          barcodeValue: val,
          format: opts.format || "CODE128",
          dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
          svgString: mockSvg
        },
        timestamp
      };
    }
    case "barcode:export" /* BARCODE_EXPORT */: {
      const opts = payload || {};
      const val = opts.value || "EXPORT-123";
      const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect width="200" height="80" fill="#ffffff"/><path d="M10 10h5v60h-5zm10 0h10v60h-10zm15 0h5v60h-5zm10 0h15v60h-15zm20 0h5v60h-5zm10 0h10v60h-10zm15 0h5v60h-5z" fill="#000000"/><text x="100" y="75" font-family="monospace" font-size="10" text-anchor="middle">${val}</text></svg>`;
      return {
        success: true,
        data: {
          success: true,
          filePath: `/downloads/${val}.svg`,
          dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`
        },
        timestamp
      };
    }
    case "print:preview" /* PRINT_PREVIEW */: {
      const opts = payload || {};
      const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect width="200" height="100" fill="#ffffff" stroke="#000"/><text x="10" y="30" font-size="12">PRINT PREVIEW</text></svg>`;
      return {
        success: true,
        data: {
          success: true,
          previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mockSvg)}`,
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
