/**
 * Shared Type Definitions for Main, Preload, Renderer
 */

export * from './types/template';
export * from './scannerTypes';
export * from './categoryTypes';
export * from './masterTypes';
import { LabelTemplate, LabelTemplateDTO, LabelElementDTO } from './types/template';
import { ProductInfo, ScanRecord, ScanResult, ScannerSettings, ScanProcessOptions } from './scannerTypes';
import { CategoryInfo, CreateCategoryPayload } from './categoryTypes';
import { MasterEntity, MasterModuleName, CreateMasterPayload, UpdateMasterPayload } from './masterTypes';

export type AppEdition = 'customer' | 'owner';
export type UserRole = 'OWNER' | 'ADMIN' | 'USER' | 'OPERATOR' | 'VIEWER';

export interface SystemDirectories {
  dataDir: string;
  backupDir: string;
  logsDir: string;
  licenseDir: string;
  configDir: string;
  cacheDir: string;
  tempDir: string;
}

export interface SystemSettings {
  app: {
    theme: 'dark' | 'light' | 'system';
    autoUpdate: boolean;
    language: string;
    edition: AppEdition;
  };
  database: {
    path: string;
    walMode: boolean;
    autoBackupDaily: boolean;
  };
  printing: {
    defaultPrinter: string;
    printMode: 'DIALOG' | 'SILENT';
    silentPrinting: boolean;
    rememberLastPrinter: boolean;
    paperWidthMm: number;
    paperHeightMm: number;
    dpi: number;
    copies: number;
    orientation: 'PORTRAIT' | 'LANDSCAPE';
    paperSize: string;
    margins: { top: number; right: number; bottom: number; left: number };
    printBackground: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    auditLogging: boolean;
  };
}

export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AuthSessionData {
  sessionId: number;
  userId: number;
  username: string;
  roleId: number;
  roleName: UserRole;
  fullName: string;
  sessionToken: string;
  expiresAt: string;
}

export interface UserAccountInfo {
  id: number;
  username: string;
  fullName: string;
  roleId: number;
  role: UserRole;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface DashboardOverview {
  totalBarcodes: number;
  totalPrints: number;
  nextSequence: string;
  activePrinter: string;
  licenseStatus: string;
  licenseDaysRemaining: number;
  hwid: string;
  databaseHealth: string;
  databaseSizeKb: number;
}

export interface DashboardStatistics {
  totalBarcodes: number;
  totalPrints: number;
  activeUsersCount: number;
  totalTemplatesCount: number;
  databaseSizeKb: number;
}

export interface BarcodeRecordItem {
  id: number;
  barcode_value: string;
  prefix: string;
  sequence_number: number;
  barcode_type: string;
  title: string;
  category: string;
  status: string;
  print_count: number;
  created_at: string;
  created_by: string;
}

export interface LicenseStatusInfo {
  isActivated: boolean;
  customerName: string;
  hwid: string;
  activationKey: string;
  issuedAt: string;
  expiresAt: string;
  daysRemaining: number;
  durationDays: number;
  maxUsers: number;
  status: string;
  lastClockCheck: string;
}

export interface BarcodeGenerateOptions {
  value: string;
  type: string;
  width?: number;
  height?: number;
  margin?: number;
  font?: string;
  fontSize?: number;
  showText?: boolean;
}

export interface BarcodeGenerateResult {
  success: boolean;
  svg?: string;
  svgString?: string;
  previewSvg?: string;
  pngDataUrl?: string;
  dataUrl?: string;
  type?: string;
  value?: string;
  error?: string;
}

export interface LabelConfig {
  width: number;
  height: number;
  dpi: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  copies: number;
  margins: { top: number; right: number; bottom: number; left: number };
  rotation: 0 | 90 | 180 | 270;
  paperType: string;
}

export interface PrintPreviewOptions {
  printerName: string;
  driverType: string;
  labelConfig: LabelConfig;
  barcodeValue: string;
  barcodeType: string;
  title?: string;
}

export interface PrintPreviewResult {
  success: boolean;
  zplCode?: string;
  tsplCode?: string;
  previewSvg?: string;
  previewPngDataUrl?: string;
  formattedJobCommand?: string;
  error?: string;
}

export interface PrintJobOptions {
  printerName: string;
  driverType?: string;
  templateId?: number;
  barcodeId?: number;
  barcodeValue: string;
  barcodeType: string;
  title?: string;
  copies?: number;
  silent?: boolean;
  printMode?: 'DIALOG' | 'SILENT';
  printBackground?: boolean;
  svgContent?: string;
  pngDataUrl?: string;
  labelConfig?: Partial<LabelConfig>;
}

export interface PrinterProfileItem {
  id: number;
  name: string;
  driver_type: string;
  is_default: number;
  dpi: number;
  paper_type: string;
  port: string;
  config_json?: string;
}

export interface PrinterInfoItem {
  id: string | number;
  name: string;
  isDefault?: boolean;
  is_default?: number;
  driver_type?: string;
  status: string;
  paperType?: string;
  dpi?: number;
  port?: string;
}

export interface ElectronAPI {
  // Database IPC
  databaseInit: () => Promise<IPCResponse<{ path: string; status: string }>>;
  getDatabaseStatus: () => Promise<IPCResponse<{ initialized: boolean; wal: boolean }>>;

  // Dashboard IPC
  getDashboardOverview: () => Promise<IPCResponse<DashboardOverview>>;
  getDashboardStatistics: () => Promise<IPCResponse<DashboardStatistics>>;
  getRecentBarcodes: (limit?: number) => Promise<IPCResponse<BarcodeRecordItem[]>>;

  // Settings IPC
  getSettings: () => Promise<IPCResponse<SystemSettings>>;
  saveSettings: (settings: Partial<SystemSettings>) => Promise<IPCResponse<SystemSettings>>;
  resetSettings: () => Promise<IPCResponse<SystemSettings>>;
  getAuditLogs: () => Promise<IPCResponse<any[]>>;

  // Backup IPC
  createBackup: () => Promise<IPCResponse<{ file: string }>>;
  listBackups: () => Promise<IPCResponse<string[]>>;
  restoreBackup: (file: string) => Promise<IPCResponse<{ restored: boolean }>>;

  // License IPC
  getLicenseStatus: () => Promise<IPCResponse<LicenseStatusInfo>>;
  checkLicense: () => Promise<IPCResponse<{ active: boolean; type: string }>>;
  activateLicense: (key: string) => Promise<IPCResponse<{ success: boolean; message?: string }>>;

  // Printer IPC
  getDefaultPrinter: () => Promise<IPCResponse<PrinterInfoItem | null>>;
  getPrinters: () => Promise<IPCResponse<PrinterInfoItem[]>>;
  getPrinterStatus: (name: string) => Promise<IPCResponse<{ online: boolean; status: string }>>;
  getPrinterProfiles: () => Promise<IPCResponse<PrinterProfileItem[]>>;

  // Barcode Engine & Printing IPC (Sprint 5)
  getBarcodeFormats: () => Promise<IPCResponse<string[]>>;
  validateBarcode: (value: string, format: string) => Promise<IPCResponse<{ valid: boolean; error?: string }>>;
  getAllBarcodes: () => Promise<IPCResponse<BarcodeRecordItem[]>>;
  generateBarcode: (options: BarcodeGenerateOptions) => Promise<IPCResponse<BarcodeGenerateResult>>;
  previewBarcode: (options: BarcodeGenerateOptions) => Promise<IPCResponse<BarcodeGenerateResult>>;
  exportBarcode: (options: BarcodeGenerateOptions & { format?: 'svg' | 'png' }) => Promise<IPCResponse<{ success: boolean; dataUrl?: string; svgContent?: string; error?: string }>>;
  previewPrint: (options: PrintPreviewOptions) => Promise<IPCResponse<PrintPreviewResult>>;
  createPrintJob: (options: PrintJobOptions) => Promise<IPCResponse<{ jobId: number; status: string; printerName: string; copies: number; error?: string }>>;
  createBarcode: (barcode: {
    id?: number;
    barcode_value: string;
    prefix?: string;
    sequence_number?: number;
    barcode_type: string;
    title: string;
    category?: string;
    created_by?: string;
    print_count?: number;
  }) => Promise<IPCResponse<BarcodeRecordItem>>;
  getNextSequence: (prefix?: string) => Promise<IPCResponse<{ prefix: string; nextSequence: number; nextBarcodeNumber: string }>>;


  // System & Logs
  getSystemInfo: () => Promise<IPCResponse<{ platform: string; version: string; dirs: SystemDirectories }>>;
  logMessage: (level: 'info' | 'warn' | 'error', message: string) => Promise<void>;

  // Auth & RBAC IPC
  login: (credentials: { username: string; password: string; rememberMe?: boolean }) => Promise<IPCResponse<AuthSessionData>>;
  logout: (sessionToken: string) => Promise<IPCResponse<{ loggedOut: boolean }>>;
  validateSession: (sessionToken: string) => Promise<IPCResponse<AuthSessionData>>;
  changePassword: (params: { userId: number; currentPass: string; newPass: string }) => Promise<IPCResponse<{ updated: boolean }>>;

  // User Management IPC
  getUsers: () => Promise<IPCResponse<UserAccountInfo[]>>;
  createUser: (user: { username: string; fullName: string; password: string; roleId: number; email?: string }) => Promise<IPCResponse<UserAccountInfo>>;
  updateUserStatus: (params: { userId: number; isActive: boolean }) => Promise<IPCResponse<{ updated: boolean }>>;
  getRoles: () => Promise<IPCResponse<{ id: number; name: string; description: string; isActive: boolean }[]>>;
  getPermissions: (roleId: number) => Promise<IPCResponse<string[]>>;

  // Label Template IPC (Sprint 6.2.1)
  getLabelTemplates: () => Promise<IPCResponse<LabelTemplate[]>>;
  getLabelTemplate: (id: string) => Promise<IPCResponse<LabelTemplate>>;
  createLabelTemplate: (dto: { template: LabelTemplateDTO; elements?: LabelElementDTO[] }) => Promise<IPCResponse<LabelTemplate>>;
  updateLabelTemplate: (dto: { id: string; template: Partial<LabelTemplateDTO>; elements?: LabelElementDTO[] }) => Promise<IPCResponse<LabelTemplate>>;
  deleteLabelTemplate: (id: string) => Promise<IPCResponse<boolean>>;
  duplicateLabelTemplate: (dto: { id: string; newName?: string }) => Promise<IPCResponse<LabelTemplate>>;
  exportLabelTemplate: (id: string) => Promise<IPCResponse<string>>;
  importLabelTemplate: (jsonContent: string) => Promise<IPCResponse<LabelTemplate>>;

  // Barcode Scanner IPC (Sprint 7.0.0)
  processScan: (options: ScanProcessOptions) => Promise<IPCResponse<ScanResult>>;
  getScanHistory: (limit?: number) => Promise<IPCResponse<ScanRecord[]>>;
  clearScanHistory: () => Promise<IPCResponse<boolean>>;
  getScannerSettings: () => Promise<IPCResponse<ScannerSettings>>;
  saveScannerSettings: (settings: Partial<ScannerSettings>) => Promise<IPCResponse<ScannerSettings>>;
  createScannerProduct: (product: Partial<ProductInfo>) => Promise<IPCResponse<ProductInfo>>;

  // Product Management IPC
  getAllProducts: () => Promise<IPCResponse<ProductInfo[]>>;
  createProduct: (product: Partial<ProductInfo>) => Promise<IPCResponse<ProductInfo>>;
  updateProduct: (id: number, product: Partial<ProductInfo>) => Promise<IPCResponse<ProductInfo>>;
  deleteProduct: (id: number) => Promise<IPCResponse<boolean>>;

  // Category Management IPC
  getCategories: () => Promise<IPCResponse<CategoryInfo[]>>;
  createCategory: (category: CreateCategoryPayload) => Promise<IPCResponse<CategoryInfo>>;
  updateCategory: (id: number, category: Partial<CategoryInfo>) => Promise<IPCResponse<CategoryInfo>>;
  deleteCategory: (id: number) => Promise<IPCResponse<boolean>>;

  // Enterprise Master Data Framework IPC
  masterGetAll: (moduleName: MasterModuleName) => Promise<IPCResponse<MasterEntity[]>>;
  masterGetActive: (moduleName: MasterModuleName) => Promise<IPCResponse<MasterEntity[]>>;
  masterCreate: (moduleName: MasterModuleName, payload: CreateMasterPayload) => Promise<IPCResponse<MasterEntity>>;
  masterUpdate: (moduleName: MasterModuleName, id: string, payload: UpdateMasterPayload) => Promise<IPCResponse<MasterEntity>>;
  masterEnable: (moduleName: MasterModuleName, id: string, context?: { userRole?: string; username?: string }) => Promise<IPCResponse<MasterEntity>>;
  masterDisable: (moduleName: MasterModuleName, id: string, context?: { userRole?: string; username?: string }) => Promise<IPCResponse<MasterEntity>>;
  masterDelete: (moduleName: MasterModuleName, id: string, context?: { userRole?: string; username?: string }) => Promise<IPCResponse<boolean>>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
