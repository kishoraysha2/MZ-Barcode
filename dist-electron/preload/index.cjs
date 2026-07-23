"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/preload/index.ts
var index_exports = {};
__export(index_exports, {
  electronBridge: () => electronBridge
});
module.exports = __toCommonJS(index_exports);

// src/main/services/BarcodeEngine.ts
var import_bwip_js = __toESM(require("bwip-js"), 1);
var BarcodeEngine = class {
  /**
   * Map user-friendly font name to valid bwip-js font
   */
  static mapFontToBwipFont(fontStr) {
    if (!fontStr) return "Inconsolata";
    const f = fontStr.toLowerCase();
    if (f.includes("sans")) return "OCR-B";
    if (f.includes("serif")) return "OCR-A";
    if (f.includes("ocra")) return "OCR-A";
    if (f.includes("ocrb")) return "OCR-B";
    return "Inconsolata";
  }
  /**
   * Map user-friendly barcode type string to bwip-js bcid identifier
   */
  static mapTypeToBcid(typeStr) {
    if (!typeStr) return "code128";
    const t = typeStr.toUpperCase().replace(/[\s\-_]/g, "");
    switch (t) {
      case "CODE128":
        return "code128";
      case "CODE39":
        return "code39";
      case "EAN13":
        return "ean13";
      case "EAN8":
        return "ean8";
      case "UPCA":
      case "UPC":
        return "upca";
      case "UPCE":
        return "upce";
      case "QR":
      case "QRCODE":
        return "qrcode";
      case "DATAMATRIX":
      case "DATA":
        return "datamatrix";
      case "PDF417":
      case "PDF":
        return "pdf417";
      default:
        return "code128";
    }
  }
  /**
   * Calculate EAN-13 checksum digit for a 12-digit string
   */
  static calculateEan13Checksum(digits12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(digits12[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }
  /**
   * Calculate EAN-8 checksum digit for a 7-digit string
   */
  static calculateEan8Checksum(digits7) {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(digits7[i], 10);
      sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }
  /**
   * Calculate UPC-A checksum digit for an 11-digit string
   */
  static calculateUpcaChecksum(digits11) {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(digits11[i], 10);
      sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }
  /**
   * Validate barcode input, length, and checksum
   */
  static validate(type, value) {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      return { valid: false, error: "Barcode value cannot be empty" };
    }
    const cleanVal = value.trim();
    const bcid = this.mapTypeToBcid(type);
    switch (bcid) {
      case "code128": {
        if (!/^[\x00-\x7F]+$/.test(cleanVal)) {
          return { valid: false, error: "Code 128 requires standard ASCII characters" };
        }
        return { valid: true, formattedValue: cleanVal };
      }
      case "code39": {
        const uppercase = cleanVal.toUpperCase();
        if (!/^[A-Z0-9\-\.\ \$\/\+\%]+$/.test(uppercase)) {
          return { valid: false, error: "Code 39 permits uppercase letters, digits, - . $ / + %" };
        }
        return { valid: true, formattedValue: uppercase };
      }
      case "ean13": {
        const numeric = cleanVal.replace(/\D/g, "");
        if (numeric.length === 12) {
          const checksum = this.calculateEan13Checksum(numeric);
          return { valid: true, checksumValid: true, formattedValue: `${numeric}${checksum}` };
        } else if (numeric.length >= 13) {
          const base12 = numeric.slice(0, 12);
          const checksum = this.calculateEan13Checksum(base12);
          return { valid: true, checksumValid: true, formattedValue: `${base12}${checksum}` };
        }
        return { valid: false, error: "EAN-13 requires numeric digits (12 or 13 digits)" };
      }
      case "ean8": {
        const numeric = cleanVal.replace(/\D/g, "");
        if (numeric.length === 7) {
          const checksum = this.calculateEan8Checksum(numeric);
          return { valid: true, checksumValid: true, formattedValue: `${numeric}${checksum}` };
        } else if (numeric.length >= 8) {
          const base7 = numeric.slice(0, 7);
          const checksum = this.calculateEan8Checksum(base7);
          return { valid: true, checksumValid: true, formattedValue: `${base7}${checksum}` };
        }
        return { valid: false, error: "EAN-8 requires numeric digits (7 or 8 digits)" };
      }
      case "upca": {
        const numeric = cleanVal.replace(/\D/g, "");
        if (numeric.length === 11) {
          const checksum = this.calculateUpcaChecksum(numeric);
          return { valid: true, checksumValid: true, formattedValue: `${numeric}${checksum}` };
        } else if (numeric.length >= 12) {
          const base11 = numeric.slice(0, 11);
          const checksum = this.calculateUpcaChecksum(base11);
          return { valid: true, checksumValid: true, formattedValue: `${base11}${checksum}` };
        }
        return { valid: false, error: "UPC-A requires numeric digits (11 or 12 digits)" };
      }
      case "upce": {
        const numeric = cleanVal.replace(/\D/g, "");
        if (numeric.length >= 6 && numeric.length <= 8) {
          return { valid: true, formattedValue: numeric.slice(0, 8) };
        }
        return { valid: false, error: "UPC-E requires between 6 and 8 numeric digits" };
      }
      case "qrcode":
      case "datamatrix":
      case "pdf417": {
        if (cleanVal.length > 2e3) {
          return { valid: false, error: "2D Barcode input exceeds maximum payload limit of 2000 characters" };
        }
        return { valid: true, formattedValue: cleanVal };
      }
      default:
        return { valid: true, formattedValue: cleanVal };
    }
  }
  /**
   * Generate SVG string and PNG Data URL asynchronously
   */
  static async generate(options) {
    try {
      const validation = this.validate(options.type, options.value);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Invalid barcode value or format"
        };
      }
      const valueToEncode = validation.formattedValue || options.value.trim();
      const bcid = this.mapTypeToBcid(options.type);
      const is2D = bcid === "qrcode" || bcid === "datamatrix" || bcid === "pdf417";
      const bwipOptions = {
        bcid,
        text: valueToEncode,
        scale: options.scale || options.width || 3,
        height: options.height || (is2D ? 20 : 15),
        includetext: options.showText !== false && !is2D,
        textxalign: "center",
        textfont: this.mapFontToBwipFont(options.font),
        textsize: options.fontSize || 10,
        paddingwidth: options.margin || 5,
        paddingheight: options.margin || 5
      };
      let pngDataUrl = "";
      if (typeof import_bwip_js.default.toBuffer === "function") {
        const pngBuffer = await new Promise((resolve, reject) => {
          import_bwip_js.default.toBuffer(bwipOptions, (err, png) => {
            if (err) reject(err);
            else resolve(png);
          });
        });
        pngDataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
      } else if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        if (typeof import_bwip_js.default.toCanvas === "function") {
          import_bwip_js.default.toCanvas(canvas, bwipOptions);
        } else if (typeof import_bwip_js.default === "function") {
          (0, import_bwip_js.default)(canvas, bwipOptions);
        }
        pngDataUrl = canvas.toDataURL("image/png");
      }
      const svgString = pngDataUrl ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120" style="background:#fff"><image href="${pngDataUrl}" x="0" y="0" width="300" height="120"/></svg>` : "";
      return {
        success: true,
        svg: svgString,
        pngDataUrl,
        type: options.type,
        value: valueToEncode
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to render barcode vector graphics"
      };
    }
  }
  /**
   * Synchronous preview fallback or wrapper
   */
  static async preview(options) {
    return this.generate(options);
  }
  /**
   * Export barcode as SVG or PNG data payload
   */
  static async export(options) {
    const res = await this.generate(options);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    if (options.format === "svg") {
      return {
        success: true,
        svgContent: res.svg,
        dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(res.svg || "")}`
      };
    }
    return {
      success: true,
      dataUrl: res.pngDataUrl
    };
  }
};

// src/main/services/PrintService.ts
var PrintService = class {
  /**
   * Convert mm to printer dots based on DPI
   */
  static mmToDots(mm, dpi = 203) {
    return Math.round(mm / 25.4 * dpi);
  }
  /**
   * Generate Zebra ZPL II raw command code
   */
  static generateZpl(options) {
    const { labelConfig, barcodeValue, title } = options;
    const dpi = labelConfig.dpi || 203;
    const widthDots = this.mmToDots(labelConfig.width, dpi);
    const heightDots = this.mmToDots(labelConfig.height, dpi);
    const copies = labelConfig.copies || 1;
    const bcid = BarcodeEngine.mapTypeToBcid(options.barcodeType);
    let zplBarcodeCmd = `^FO50,40^BY2^BCN,90,Y,N,N^FD${barcodeValue}^FS`;
    if (bcid === "qrcode") {
      zplBarcodeCmd = `^FO50,40^BQN,2,5^FDQA,${barcodeValue}^FS`;
    } else if (bcid === "datamatrix") {
      zplBarcodeCmd = `^FO50,40^BXN,5,200^FD${barcodeValue}^FS`;
    } else if (bcid === "code39") {
      zplBarcodeCmd = `^FO50,40^B3N,N,90,Y,N^FD${barcodeValue}^FS`;
    }
    const titleCmd = title ? `^FO50,140^A0N,24,24^FD${title}^FS` : "";
    return [
      "^XA",
      `^PW${widthDots}`,
      `^LL${heightDots}`,
      "^LH0,0",
      zplBarcodeCmd,
      titleCmd,
      `^PQ${copies},0,1,Y`,
      "^XZ"
    ].join("\n");
  }
  /**
   * Generate TSPL (TSC Printer Language) raw command code
   */
  static generateTspl(options) {
    const { labelConfig, barcodeValue, title } = options;
    const copies = labelConfig.copies || 1;
    const bcid = BarcodeEngine.mapTypeToBcid(options.barcodeType);
    let tsplBarCmd = `BARCODE 50,40,"128",90,1,0,2,2,"${barcodeValue}"`;
    if (bcid === "qrcode") {
      tsplBarCmd = `QRCODE 50,40,L,5,A,0,"${barcodeValue}"`;
    } else if (bcid === "code39") {
      tsplBarCmd = `BARCODE 50,40,"39",90,1,0,2,2,"${barcodeValue}"`;
    }
    const titleCmd = title ? `TEXT 50,140,"3",0,1,1,"${title}"` : "";
    return [
      `SIZE ${labelConfig.width} mm, ${labelConfig.height} mm`,
      "GAP 3 mm, 0 mm",
      "DIRECTION 1",
      "CLS",
      tsplBarCmd,
      titleCmd,
      `PRINT ${copies},1`
    ].join("\n");
  }
  /**
   * Generate print preview including vector rendering and RAW driver command code
   */
  static async generatePreview(options) {
    try {
      const { labelConfig, barcodeValue, barcodeType, title, driverType } = options;
      const renderRes = await BarcodeEngine.generate({
        value: barcodeValue,
        type: barcodeType,
        width: 3,
        height: 15,
        margin: 4,
        showText: true
      });
      if (!renderRes.success) {
        return { success: false, error: renderRes.error || "Failed rendering barcode graphic for preview" };
      }
      const zplCode = this.generateZpl({ labelConfig, barcodeValue, barcodeType, title });
      const tsplCode = this.generateTspl({ labelConfig, barcodeValue, barcodeType, title });
      let formattedJobCommand = zplCode;
      if (driverType === "TSPL") {
        formattedJobCommand = tsplCode;
      } else if (driverType === "WINDOWS") {
        formattedJobCommand = `[Win32 RAW Spool Job] Printer: ${options.printerName} | Copies: ${labelConfig.copies} | Size: ${labelConfig.width}x${labelConfig.height}mm`;
      }
      return {
        success: true,
        zplCode,
        tsplCode,
        previewSvg: renderRes.svg,
        previewPngDataUrl: renderRes.pngDataUrl,
        formattedJobCommand
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Print preview creation failed"
      };
    }
  }
};

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
          { id: 1, name: "Zebra ZD421 Direct Thermal (203 DPI)", driver_type: "ZEBRA_ZPL", is_default: 1, dpi: 203, paper_type: "Continuous 50mm x 25mm", port: "USB001" },
          { id: 2, name: "TSPL Industrial Thermal Printer (300 DPI)", driver_type: "TSPL", is_default: 0, dpi: 300, paper_type: "Gap 100mm x 150mm", port: "USB002" },
          { id: 3, name: "Generic Windows Spool Printer Driver", driver_type: "WINDOWS", is_default: 0, dpi: 203, paper_type: "Standard Thermal Paper", port: "LPT1" }
        ],
        timestamp
      };
    case "barcode:generate" /* BARCODE_GENERATE */:
    case "barcode:preview" /* BARCODE_PREVIEW */: {
      const opts = payload;
      const genRes = await BarcodeEngine.generate(opts);
      if (!genRes.success) {
        return { success: false, error: { code: "GENERATE_FAILED", message: genRes.error || "Barcode generation failed" }, timestamp };
      }
      return { success: true, data: genRes, timestamp };
    }
    case "barcode:export" /* BARCODE_EXPORT */: {
      const opts = payload;
      const expRes = await BarcodeEngine.export(opts);
      if (!expRes.success) {
        return { success: false, error: { code: "EXPORT_FAILED", message: expRes.error || "Barcode export failed" }, timestamp };
      }
      return { success: true, data: expRes, timestamp };
    }
    case "print:preview" /* PRINT_PREVIEW */: {
      const opts = payload;
      const printRes = await PrintService.generatePreview(opts);
      if (!printRes.success) {
        return { success: false, error: { code: "PREVIEW_FAILED", message: printRes.error || "Print preview failed" }, timestamp };
      }
      return { success: true, data: printRes, timestamp };
    }
    case "print:createJob" /* PRINT_CREATE_JOB */: {
      const p = payload;
      return {
        success: true,
        data: {
          jobId: Math.floor(Math.random() * 9e3) + 1e3,
          status: "PENDING",
          printerName: p.printerName,
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
    case "ipc:printer:get_default" /* PRINTER_GET_DEFAULT */:
      return {
        success: true,
        data: null,
        timestamp
      };
    case "ipc:printer:list" /* PRINTER_LIST */:
      return {
        success: true,
        data: [],
        timestamp
      };
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
