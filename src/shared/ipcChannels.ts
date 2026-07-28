/**
 * Type-safe IPC Channel Enums for MZ Barcode Suite Enterprise v1.0
 */
export enum IPC_CHANNELS {
  // Database Foundation
  DATABASE_INIT = 'ipc:database:init',
  DATABASE_STATUS = 'ipc:database:status',

  // Dashboard IPC
  DASHBOARD_GET_OVERVIEW = 'ipc:dashboard:get_overview',
  DASHBOARD_GET_STATISTICS = 'ipc:dashboard:get_statistics',
  DASHBOARD_GET_RECENT_BARCODES = 'ipc:dashboard:get_recent_barcodes',

  // Settings Foundation
  SETTINGS_GET = 'ipc:settings:get',
  SETTINGS_SAVE = 'ipc:settings:save',
  SETTINGS_RESET = 'ipc:settings:reset',

  // Backup Foundation
  BACKUP_CREATE = 'ipc:backup:create',
  BACKUP_LIST = 'ipc:backup:list',
  BACKUP_RESTORE = 'ipc:backup:restore',

  // License Foundation
  LICENSE_CHECK = 'ipc:license:check',
  LICENSE_ACTIVATE = 'ipc:license:activate',
  LICENSE_GET_STATUS = 'ipc:license:get_status',

  // Printer Foundation
  PRINTER_LIST = 'ipc:printer:list',
  PRINTER_STATUS = 'ipc:printer:status',
  PRINTER_GET_DEFAULT = 'ipc:printer:get_default',

  // Barcode Foundation
  BARCODE_FORMATS = 'ipc:barcode:formats',
  BARCODE_VALIDATE = 'ipc:barcode:validate',
  BARCODE_GET_ALL = 'ipc:barcode:get_all',
  BARCODE_CREATE = 'ipc:barcode:create',
  BARCODE_GET_NEXT_SEQUENCE = 'ipc:barcode:get_next_sequence',

  // System & Logs
  SYSTEM_INFO = 'ipc:system:info',
  LOGS_WRITE = 'ipc:logs:write',
  AUDIT_LOGS_GET = 'ipc:audit_logs:get',

  // Label Template IPC
  TEMPLATE_LIST = 'ipc:template:list',
  TEMPLATE_GET = 'ipc:template:get',
  TEMPLATE_CREATE = 'ipc:template:create',
  TEMPLATE_UPDATE = 'ipc:template:update',
  TEMPLATE_DELETE = 'ipc:template:delete',
  TEMPLATE_DUPLICATE = 'ipc:template:duplicate',
  TEMPLATE_EXPORT = 'ipc:template:export',
  TEMPLATE_IMPORT = 'ipc:template:import',

  // Sprint 5 Barcode & Print Foundation
  BARCODE_GENERATE = 'barcode:generate',
  BARCODE_PREVIEW = 'barcode:preview',
  BARCODE_EXPORT = 'barcode:export',
  PRINT_PREVIEW = 'print:preview',
  PRINT_CREATE_JOB = 'print:createJob',
  PRINTER_GET_PROFILES = 'printer:getProfiles',

  // Auth & RBAC Foundation
  AUTH_LOGIN = 'ipc:auth:login',
  AUTH_LOGOUT = 'ipc:auth:logout',
  AUTH_VALIDATE_SESSION = 'ipc:auth:validate_session',
  AUTH_GET_CURRENT_USER = 'ipc:auth:get_current_user',
  AUTH_CHANGE_PASSWORD = 'ipc:auth:change_password',

  // User Management IPC
  USER_LIST = 'ipc:user:list',
  USER_CREATE = 'ipc:user:create',
  USER_UPDATE_STATUS = 'ipc:user:update_status',
  USER_CHANGE_ROLE = 'ipc:user:change_role',
  ROLE_LIST = 'ipc:role:list',
  PERMISSIONS_GET = 'ipc:permissions:get',

  // Sprint 7 Barcode Scanner IPC Foundation
  SCANNER_PROCESS = 'ipc:scanner:process',
  SCANNER_GET_HISTORY = 'ipc:scanner:get_history',
  SCANNER_CLEAR_HISTORY = 'ipc:scanner:clear_history',
  SCANNER_GET_SETTINGS = 'ipc:scanner:get_settings',
  SCANNER_SAVE_SETTINGS = 'ipc:scanner:save_settings',
  SCANNER_CREATE_PRODUCT = 'ipc:scanner:create_product',

  // Product Management Module IPC
  PRODUCT_GET_ALL = 'ipc:product:get_all',
  PRODUCT_CREATE = 'ipc:product:create',
  PRODUCT_UPDATE = 'ipc:product:update',
  PRODUCT_DELETE = 'ipc:product:delete',

  // Category Management Module IPC
  CATEGORY_GET_ALL = 'ipc:category:get_all',
  CATEGORY_CREATE = 'ipc:category:create',
  CATEGORY_UPDATE = 'ipc:category:update',
  CATEGORY_DELETE = 'ipc:category:delete',

  // Enterprise Master Data Framework IPC
  MASTER_GET_ALL = 'ipc:master:get_all',
  MASTER_GET_ACTIVE = 'ipc:master:get_active',
  MASTER_CREATE = 'ipc:master:create',
  MASTER_UPDATE = 'ipc:master:update',
  MASTER_ENABLE = 'ipc:master:enable',
  MASTER_DISABLE = 'ipc:master:disable',
  MASTER_DELETE = 'ipc:master:delete',
}
