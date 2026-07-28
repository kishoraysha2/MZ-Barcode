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
  electronAPI: () => electronAPI
});
module.exports = __toCommonJS(index_exports);
var import_electron = require("electron");
function invoke(channel, payload) {
  return import_electron.ipcRenderer.invoke(channel, payload);
}
var electronAPI = {
  // Database IPC
  databaseInit: () => invoke("ipc:database:init" /* DATABASE_INIT */),
  getDatabaseStatus: () => invoke("ipc:database:status" /* DATABASE_STATUS */),
  // Dashboard IPC
  getDashboardOverview: () => invoke("ipc:dashboard:get_overview" /* DASHBOARD_GET_OVERVIEW */),
  getDashboardStatistics: () => invoke("ipc:dashboard:get_statistics" /* DASHBOARD_GET_STATISTICS */),
  getRecentBarcodes: (limit) => invoke("ipc:dashboard:get_recent_barcodes" /* DASHBOARD_GET_RECENT_BARCODES */, limit),
  // Settings IPC
  getSettings: () => invoke("ipc:settings:get" /* SETTINGS_GET */),
  saveSettings: (settings) => invoke("ipc:settings:save" /* SETTINGS_SAVE */, settings),
  resetSettings: () => invoke("ipc:settings:reset" /* SETTINGS_RESET */),
  getAuditLogs: () => invoke("ipc:audit_logs:get" /* AUDIT_LOGS_GET */),
  // Backup IPC
  createBackup: () => invoke("ipc:backup:create" /* BACKUP_CREATE */),
  listBackups: () => invoke("ipc:backup:list" /* BACKUP_LIST */),
  restoreBackup: (file) => invoke("ipc:backup:restore" /* BACKUP_RESTORE */, file),
  // License IPC
  getLicenseStatus: () => invoke("ipc:license:get_status" /* LICENSE_GET_STATUS */),
  checkLicense: () => invoke("ipc:license:check" /* LICENSE_CHECK */),
  activateLicense: (key) => invoke("ipc:license:activate" /* LICENSE_ACTIVATE */, key),
  // Printer IPC
  getDefaultPrinter: () => invoke("ipc:printer:get_default" /* PRINTER_GET_DEFAULT */),
  getPrinters: () => invoke("ipc:printer:list" /* PRINTER_LIST */),
  getPrinterStatus: (name) => invoke("ipc:printer:status" /* PRINTER_STATUS */, name),
  getPrinterProfiles: () => invoke("printer:getProfiles" /* PRINTER_GET_PROFILES */),
  // Barcode Engine & Printing IPC
  getBarcodeFormats: () => invoke("ipc:barcode:formats" /* BARCODE_FORMATS */),
  validateBarcode: (value, format) => invoke("ipc:barcode:validate" /* BARCODE_VALIDATE */, { value, format }),
  getAllBarcodes: () => invoke("ipc:barcode:get_all" /* BARCODE_GET_ALL */),
  generateBarcode: (options) => invoke("barcode:generate" /* BARCODE_GENERATE */, options),
  previewBarcode: (options) => invoke("barcode:preview" /* BARCODE_PREVIEW */, options),
  exportBarcode: (options) => invoke("barcode:export" /* BARCODE_EXPORT */, options),
  previewPrint: (options) => invoke("print:preview" /* PRINT_PREVIEW */, options),
  createPrintJob: (options) => invoke("print:createJob" /* PRINT_CREATE_JOB */, options),
  createBarcode: (barcode) => invoke("ipc:barcode:create" /* BARCODE_CREATE */, barcode),
  getNextSequence: (prefix) => invoke("ipc:barcode:get_next_sequence" /* BARCODE_GET_NEXT_SEQUENCE */, prefix),
  // System & Logs
  getSystemInfo: () => invoke("ipc:system:info" /* SYSTEM_INFO */),
  logMessage: async (level, message) => {
    await invoke("ipc:logs:write" /* LOGS_WRITE */, { level, message });
  },
  // Auth & RBAC IPC
  login: (credentials) => invoke("ipc:auth:login" /* AUTH_LOGIN */, credentials),
  logout: (sessionToken) => invoke("ipc:auth:logout" /* AUTH_LOGOUT */, { sessionToken }),
  validateSession: (sessionToken) => invoke("ipc:auth:validate_session" /* AUTH_VALIDATE_SESSION */, { sessionToken }),
  changePassword: (params) => invoke("ipc:auth:change_password" /* AUTH_CHANGE_PASSWORD */, params),
  // User Management IPC
  getUsers: () => invoke("ipc:user:list" /* USER_LIST */),
  createUser: (user) => invoke("ipc:user:create" /* USER_CREATE */, user),
  updateUserStatus: (params) => invoke("ipc:user:update_status" /* USER_UPDATE_STATUS */, params),
  getRoles: () => invoke("ipc:role:list" /* ROLE_LIST */),
  getPermissions: (roleId) => invoke("ipc:permissions:get" /* PERMISSIONS_GET */, { roleId }),
  // Label Template IPC
  getLabelTemplates: () => invoke("ipc:template:list" /* TEMPLATE_LIST */),
  getLabelTemplate: (id) => invoke("ipc:template:get" /* TEMPLATE_GET */, id),
  createLabelTemplate: (dto) => invoke("ipc:template:create" /* TEMPLATE_CREATE */, dto),
  updateLabelTemplate: (dto) => invoke("ipc:template:update" /* TEMPLATE_UPDATE */, dto),
  deleteLabelTemplate: (id) => invoke("ipc:template:delete" /* TEMPLATE_DELETE */, id),
  duplicateLabelTemplate: (dto) => invoke("ipc:template:duplicate" /* TEMPLATE_DUPLICATE */, dto),
  exportLabelTemplate: (id) => invoke("ipc:template:export" /* TEMPLATE_EXPORT */, id),
  importLabelTemplate: (jsonContent) => invoke("ipc:template:import" /* TEMPLATE_IMPORT */, jsonContent),
  // Barcode Scanner IPC
  processScan: (options) => invoke("ipc:scanner:process" /* SCANNER_PROCESS */, options),
  getScanHistory: (limit) => invoke("ipc:scanner:get_history" /* SCANNER_GET_HISTORY */, limit),
  clearScanHistory: () => invoke("ipc:scanner:clear_history" /* SCANNER_CLEAR_HISTORY */),
  getScannerSettings: () => invoke("ipc:scanner:get_settings" /* SCANNER_GET_SETTINGS */),
  saveScannerSettings: (settings) => invoke("ipc:scanner:save_settings" /* SCANNER_SAVE_SETTINGS */, settings),
  createScannerProduct: (product) => invoke("ipc:scanner:create_product" /* SCANNER_CREATE_PRODUCT */, product),
  // Product Management IPC
  getAllProducts: () => invoke("ipc:product:get_all" /* PRODUCT_GET_ALL */),
  createProduct: (product) => invoke("ipc:product:create" /* PRODUCT_CREATE */, product),
  updateProduct: (id, product) => invoke("ipc:product:update" /* PRODUCT_UPDATE */, { id, product }),
  deleteProduct: (id) => invoke("ipc:product:delete" /* PRODUCT_DELETE */, id),
  // Category Management IPC
  getCategories: () => invoke("ipc:category:get_all" /* CATEGORY_GET_ALL */),
  createCategory: (category) => invoke("ipc:category:create" /* CATEGORY_CREATE */, category),
  updateCategory: (id, category) => invoke("ipc:category:update" /* CATEGORY_UPDATE */, { id, category }),
  deleteCategory: (id) => invoke("ipc:category:delete" /* CATEGORY_DELETE */, id),
  // Enterprise Master Data Framework IPC
  masterGetAll: (moduleName) => invoke("ipc:master:get_all" /* MASTER_GET_ALL */, typeof moduleName === "object" && moduleName !== null ? moduleName : { moduleName }),
  masterGetActive: (moduleName) => invoke("ipc:master:get_active" /* MASTER_GET_ACTIVE */, typeof moduleName === "object" && moduleName !== null ? moduleName : { moduleName }),
  masterCreate: (moduleName, payload) => {
    if (typeof moduleName === "object" && moduleName !== null) {
      return invoke("ipc:master:create" /* MASTER_CREATE */, moduleName);
    }
    return invoke("ipc:master:create" /* MASTER_CREATE */, { moduleName, ...payload });
  },
  masterUpdate: (moduleName, id, payload) => {
    if (typeof moduleName === "object" && moduleName !== null) {
      return invoke("ipc:master:update" /* MASTER_UPDATE */, moduleName);
    }
    return invoke("ipc:master:update" /* MASTER_UPDATE */, { moduleName, id, payload });
  },
  masterEnable: (moduleName, id, context) => {
    if (typeof moduleName === "object" && moduleName !== null) {
      return invoke("ipc:master:enable" /* MASTER_ENABLE */, moduleName);
    }
    return invoke("ipc:master:enable" /* MASTER_ENABLE */, { moduleName, id, ...context });
  },
  masterDisable: (moduleName, id, context) => {
    if (typeof moduleName === "object" && moduleName !== null) {
      return invoke("ipc:master:disable" /* MASTER_DISABLE */, moduleName);
    }
    return invoke("ipc:master:disable" /* MASTER_DISABLE */, { moduleName, id, ...context });
  },
  masterDelete: (moduleName, id, context) => {
    if (typeof moduleName === "object" && moduleName !== null) {
      return invoke("ipc:master:delete" /* MASTER_DELETE */, moduleName);
    }
    return invoke("ipc:master:delete" /* MASTER_DELETE */, { moduleName, id, ...context });
  }
};
if (process.contextIsolated) {
  try {
    import_electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error("[Preload] Failed to expose electronAPI via contextBridge:", error);
  }
} else {
  window.electronAPI = electronAPI;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  electronAPI
});
