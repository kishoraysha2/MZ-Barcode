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
var electronBridge = {
  databaseInit: async () => invokeIPC("ipc:database:init" /* DATABASE_INIT */),
  getDatabaseStatus: async () => invokeIPC("ipc:database:status" /* DATABASE_STATUS */),
  getSettings: async () => invokeIPC("ipc:settings:get" /* SETTINGS_GET */),
  saveSettings: async (settings) => invokeIPC("ipc:settings:save" /* SETTINGS_SAVE */, settings),
  resetSettings: async () => invokeIPC("ipc:settings:reset" /* SETTINGS_RESET */),
  createBackup: async () => invokeIPC("ipc:backup:create" /* BACKUP_CREATE */),
  listBackups: async () => invokeIPC("ipc:backup:list" /* BACKUP_LIST */),
  restoreBackup: async (file) => invokeIPC("ipc:backup:restore" /* BACKUP_RESTORE */, file),
  checkLicense: async () => invokeIPC("ipc:license:check" /* LICENSE_CHECK */),
  activateLicense: async (key) => invokeIPC("ipc:license:activate" /* LICENSE_ACTIVATE */, key),
  getPrinters: async () => invokeIPC("ipc:printer:list" /* PRINTER_LIST */),
  getPrinterStatus: async (name) => invokeIPC("ipc:printer:status" /* PRINTER_STATUS */, name),
  getBarcodeFormats: async () => invokeIPC("ipc:barcode:formats" /* BARCODE_FORMATS */),
  validateBarcode: async (value, format) => invokeIPC("ipc:barcode:validate" /* BARCODE_VALIDATE */, { value, format }),
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
function simulateWebIPCResponse(channel, payload) {
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
    case "ipc:settings:get" /* SETTINGS_GET */:
      return {
        success: true,
        data: {
          app: { theme: "dark", autoUpdate: false, language: "en-US", edition: "customer" },
          database: { path: "%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db", walMode: true, autoBackupDaily: true },
          printing: { defaultPrinter: "Zebra ZD421 (203 dpi)", paperWidthMm: 100, paperHeightMm: 50, dpi: 203 },
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
    case "ipc:backup:create" /* BACKUP_CREATE */:
      return {
        success: true,
        data: { file: `mz_backup_${Date.now()}.db.bak` },
        timestamp
      };
    case "ipc:backup:list" /* BACKUP_LIST */:
      return {
        success: true,
        data: ["mz_backup_2026-07-22.db.bak", "mz_backup_2026-07-23.db.bak"],
        timestamp
      };
    case "ipc:license:check" /* LICENSE_CHECK */:
      return {
        success: true,
        data: { active: true, type: "ENTERPRISE_FOUNDATION_UNLOCKED" },
        timestamp
      };
    case "ipc:printer:list" /* PRINTER_LIST */:
      return {
        success: true,
        data: ["Zebra ZD421 (203 dpi)", "TSC TTP-244 Pro", "SATO CL4NX Plus"],
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
          { id: 2, username: "admin", fullName: "Enterprise Admin", roleId: 2, role: "ADMIN", isActive: true, createdAt: "2026-07-23 00:00:00", lastLogin: "2026-07-23 02:30:00" },
          { id: 3, username: "operator1", fullName: "Mark Operator", roleId: 3, role: "USER", isActive: true, createdAt: "2026-07-23 01:00:00", lastLogin: "2026-07-22 18:20:00" },
          { id: 4, username: "inspector", fullName: "Sarah Viewer", roleId: 4, role: "VIEWER", isActive: false, createdAt: "2026-07-23 01:30:00", lastLogin: "Never" }
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
