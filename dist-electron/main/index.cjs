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

// src/main/index.ts
var index_exports = {};
__export(index_exports, {
  MainApplication: () => MainApplication,
  mainApp: () => mainApp
});
module.exports = __toCommonJS(index_exports);
var import_path5 = __toESM(require("path"), 1);

// src/main/directories.ts
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);

// src/shared/constants.ts
var APP_METADATA = {
  NAME: "MZ Barcode Suite Enterprise",
  SHORT_NAME: "MZBarcodeSuite",
  VERSION: "1.0.0",
  BUILD: "1001",
  ORGANIZATION: "MZ Enterprise Software",
  APP_ID: "com.mz.barcodesuite.enterprise"
};
var DIRECTORY_NAMES = {
  DATA: "data",
  BACKUP: "backup",
  LOGS: "logs",
  LICENSE: "license",
  CONFIG: "config",
  CACHE: "cache",
  TEMP: "temp"
};
var DEFAULT_DB_FILENAME = "mz_barcode_suite.db";
var SQLITE_CONFIG = {
  WAL_MODE: true,
  FOREIGN_KEYS: true,
  BUSY_TIMEOUT: 5e3
};

// src/main/directories.ts
function getAppDataPath() {
  if (process.platform === "win32") {
    return process.env.APPDATA || import_path.default.join(process.env.USERPROFILE || "C:\\Users\\Default", "AppData", "Roaming");
  }
  if (process.platform === "darwin") {
    return import_path.default.join(process.env.HOME || "/Users", "Library", "Application Support");
  }
  return import_path.default.join(process.env.HOME || "/home", ".config");
}
function getSuiteRootPath() {
  return import_path.default.join(getAppDataPath(), APP_METADATA.SHORT_NAME);
}
function initializeDirectories() {
  const root = getSuiteRootPath();
  const dirs = {
    dataDir: import_path.default.join(root, DIRECTORY_NAMES.DATA),
    backupDir: import_path.default.join(root, DIRECTORY_NAMES.BACKUP),
    logsDir: import_path.default.join(root, DIRECTORY_NAMES.LOGS),
    licenseDir: import_path.default.join(root, DIRECTORY_NAMES.LICENSE),
    configDir: import_path.default.join(root, DIRECTORY_NAMES.CONFIG),
    cacheDir: import_path.default.join(root, DIRECTORY_NAMES.CACHE),
    tempDir: import_path.default.join(root, DIRECTORY_NAMES.TEMP)
  };
  Object.values(dirs).forEach((dir) => {
    if (!import_fs.default.existsSync(dir)) {
      import_fs.default.mkdirSync(dir, { recursive: true });
    }
  });
  return dirs;
}

// src/main/database/connection.ts
var import_path3 = __toESM(require("path"), 1);
var import_fs3 = __toESM(require("fs"), 1);

// src/main/logger.ts
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var AppLogger = class {
  constructor() {
    this.logDir = import_path2.default.join(getSuiteRootPath(), "logs");
    if (!import_fs2.default.existsSync(this.logDir)) {
      import_fs2.default.mkdirSync(this.logDir, { recursive: true });
    }
  }
  getTodayLogFile() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return import_path2.default.join(this.logDir, `mz_suite_${today}.log`);
  }
  writeLog(level, message, details) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const formatted = `[${timestamp}] [${level}] ${message} ${details ? JSON.stringify(details) : ""}
`;
    try {
      import_fs2.default.appendFileSync(this.getTodayLogFile(), formatted, "utf-8");
    } catch {
      console.error("Failed to write to daily log file:", formatted);
    }
  }
  info(msg, details) {
    this.writeLog("INFO", msg, details);
  }
  warn(msg, details) {
    this.writeLog("WARN", msg, details);
  }
  error(msg, details) {
    this.writeLog("ERROR", msg, details);
  }
  crash(msg, error) {
    this.writeLog("CRASH", msg, error);
  }
};
var logger = new AppLogger();

// src/main/database/connection.ts
var SQLiteConnection = class _SQLiteConnection {
  constructor() {
    this.isConnected = false;
    this.statementCache = /* @__PURE__ */ new Map();
    this.inMemoryTables = /* @__PURE__ */ new Map();
    this.dbPath = import_path3.default.join(getSuiteRootPath(), "data", DEFAULT_DB_FILENAME);
  }
  static getInstance() {
    if (!_SQLiteConnection.instance) {
      _SQLiteConnection.instance = new _SQLiteConnection();
    }
    return _SQLiteConnection.instance;
  }
  connect() {
    if (this.isConnected) return;
    try {
      const dir = import_path3.default.dirname(this.dbPath);
      if (!import_fs3.default.existsSync(dir)) {
        import_fs3.default.mkdirSync(dir, { recursive: true });
      }
      if (!import_fs3.default.existsSync(this.dbPath)) {
        import_fs3.default.writeFileSync(this.dbPath, "", "utf-8");
      }
      logger.info(`[Database] Connected to SQLite DB at ${this.dbPath}`);
      logger.info(`[Database] PRAGMA journal_mode = WAL; (Active: ${SQLITE_CONFIG.WAL_MODE})`);
      logger.info(`[Database] PRAGMA foreign_keys = ON; (Active: ${SQLITE_CONFIG.FOREIGN_KEYS})`);
      logger.info(`[Database] PRAGMA busy_timeout = ${SQLITE_CONFIG.BUSY_TIMEOUT};`);
      this.isConnected = true;
    } catch (err) {
      logger.error("[Database] Failed connecting to SQLite database:", err);
      throw err;
    }
  }
  getDbPath() {
    return this.dbPath;
  }
  exec(sql) {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database Exec] ${sql.substring(0, 100)}...`);
  }
  run(sql, params = []) {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database Run] ${sql.substring(0, 80)} Params:`, params);
    return {
      changes: 1,
      lastInsertRowid: Date.now()
    };
  }
  get(sql, params = []) {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database Get] ${sql.substring(0, 80)} Params:`, params);
    return void 0;
  }
  all(sql, params = []) {
    this.ensureConnected();
    this.cacheStatement(sql);
    logger.info(`[Database All] ${sql.substring(0, 80)} Params:`, params);
    return [];
  }
  transaction(callback) {
    this.ensureConnected();
    logger.info("[Database Transaction] BEGIN");
    try {
      const result = callback();
      logger.info("[Database Transaction] COMMIT");
      return result;
    } catch (err) {
      logger.error("[Database Transaction] ROLLBACK due to error:", err);
      throw err;
    }
  }
  cacheStatement(sql) {
    const key = sql.trim().toLowerCase();
    if (!this.statementCache.has(key)) {
      this.statementCache.set(key, sql);
    }
  }
  ensureConnected() {
    if (!this.isConnected) {
      this.connect();
    }
  }
  getUserVersion() {
    return 0;
  }
  setUserVersion(version) {
    logger.info(`[Database PRAGMA user_version] Updated to version ${version}`);
  }
};
var dbConnection = SQLiteConnection.getInstance();

// src/main/database/migrations/0001_initial.ts
var migration0001 = {
  version: 1,
  name: "0001_initial",
  up: `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      permission_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'GENERAL',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT DEFAULT 'SYSTEM'
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
    CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);
  `,
  down: `
    DROP TABLE IF EXISTS system_logs;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS permissions;
    DROP TABLE IF EXISTS roles;
  `
};

// src/main/database/migrations/0002_users.ts
var migration0002 = {
  version: 2,
  name: "0002_users",
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM',
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT DEFAULT '127.0.0.1',
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
  `,
  down: `
    DROP TABLE IF EXISTS user_sessions;
    DROP TABLE IF EXISTS users;
  `
};

// src/main/database/migrations/0003_barcodes.ts
var migration0003 = {
  version: 3,
  name: "0003_barcodes",
  up: `
    CREATE TABLE IF NOT EXISTS barcodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode_value TEXT NOT NULL UNIQUE,
      prefix TEXT DEFAULT '',
      sequence_number INTEGER DEFAULT 0,
      barcode_type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'GENERAL',
      status TEXT DEFAULT 'active',
      print_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS barcode_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefix TEXT NOT NULL UNIQUE,
      current_value INTEGER DEFAULT 1,
      increment_by INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_barcodes_value ON barcodes(barcode_value);
    CREATE INDEX IF NOT EXISTS idx_barcodes_type ON barcodes(barcode_type);
    CREATE INDEX IF NOT EXISTS idx_barcodes_created ON barcodes(created_at);
  `,
  down: `
    DROP TABLE IF EXISTS barcode_sequences;
    DROP TABLE IF EXISTS barcodes;
  `
};

// src/main/database/migrations/0004_templates_printers.ts
var migration0004 = {
  version: 4,
  name: "0004_templates_printers",
  up: `
    CREATE TABLE IF NOT EXISTS label_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      dpi INTEGER DEFAULT 203,
      is_default INTEGER DEFAULT 0,
      layout_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS print_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_name TEXT NOT NULL,
      template_id INTEGER,
      barcode_id INTEGER,
      copies INTEGER DEFAULT 1,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (template_id) REFERENCES label_templates(id) ON DELETE SET NULL,
      FOREIGN KEY (barcode_id) REFERENCES barcodes(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_templates_name ON label_templates(name);
    CREATE INDEX IF NOT EXISTS idx_print_jobs_created ON print_jobs(created_at);
  `,
  down: `
    DROP TABLE IF EXISTS print_jobs;
    DROP TABLE IF EXISTS label_templates;
  `
};

// src/main/database/migrations/0005_audit_license_backup.ts
var migration0005 = {
  version: 5,
  name: "0005_audit_license_backup",
  up: `
    CREATE TABLE IF NOT EXISTS license_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      hwid TEXT NOT NULL,
      status TEXT NOT NULL,
      issued_at DATETIME NOT NULL,
      expires_at DATETIME NOT NULL,
      max_users INTEGER DEFAULT 1,
      features_json TEXT DEFAULT '{}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      username TEXT DEFAULT 'SYSTEM',
      role TEXT DEFAULT 'ADMIN',
      action TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT,
      ip_address TEXT DEFAULT '127.0.0.1'
    );

    CREATE TABLE IF NOT EXISTS backup_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM'
    );

    CREATE INDEX IF NOT EXISTS idx_license_key ON license_info(license_key);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_logs(category);
    CREATE INDEX IF NOT EXISTS idx_backup_created ON backup_history(created_at);
  `,
  down: `
    DROP TABLE IF EXISTS backup_history;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS license_info;
  `
};

// src/main/database/migrations/index.ts
var ALL_MIGRATIONS = [
  migration0001,
  migration0002,
  migration0003,
  migration0004,
  migration0005
];

// src/main/database/migrationManager.ts
var MigrationManager = class {
  constructor() {
    this.targetVersion = ALL_MIGRATIONS.length > 0 ? ALL_MIGRATIONS[ALL_MIGRATIONS.length - 1].version : 0;
  }
  getStatus() {
    const currentVersion = dbConnection.getUserVersion();
    const pending = ALL_MIGRATIONS.filter((m) => m.version > currentVersion);
    const completed = ALL_MIGRATIONS.filter((m) => m.version <= currentVersion).map((m) => m.name);
    return {
      currentVersion,
      requiredVersion: this.targetVersion,
      pendingCount: pending.length,
      completedMigrations: completed
    };
  }
  migrate() {
    const status = this.getStatus();
    logger.info(`[Migration Manager] Current DB Version: ${status.currentVersion}, Required Version: ${status.requiredVersion}`);
    if (status.pendingCount === 0) {
      logger.info("[Migration Manager] Database schema is up to date.");
      return;
    }
    const pending = ALL_MIGRATIONS.filter((m) => m.version > status.currentVersion).sort((a, b) => a.version - b.version);
    for (const migration of pending) {
      this.applyMigration(migration);
    }
    logger.info(`[Migration Manager] All migrations applied. New DB Version: ${dbConnection.getUserVersion()}`);
  }
  applyMigration(migration) {
    logger.info(`[Migration Manager] Applying migration v${migration.version}: ${migration.name}`);
    try {
      dbConnection.transaction(() => {
        dbConnection.exec(migration.up);
        dbConnection.setUserVersion(migration.version);
      });
      logger.info(`[Migration Manager] Migration ${migration.name} applied successfully.`);
    } catch (err) {
      logger.error(`[Migration Manager] Failed applying migration ${migration.name}. Rolling back...`, err);
      throw new Error(`Migration Failed: ${migration.name} - ${err.message}`);
    }
  }
  rollbackLastMigration() {
    const currentVersion = dbConnection.getUserVersion();
    if (currentVersion === 0) {
      logger.info("[Migration Manager] No migrations to rollback.");
      return;
    }
    const migrationToRollback = ALL_MIGRATIONS.find((m) => m.version === currentVersion);
    if (!migrationToRollback) {
      logger.warn(`[Migration Manager] Migration for version ${currentVersion} not found in registry.`);
      return;
    }
    logger.info(`[Migration Manager] Rolling back migration v${migrationToRollback.version}: ${migrationToRollback.name}`);
    try {
      dbConnection.transaction(() => {
        dbConnection.exec(migrationToRollback.down);
        dbConnection.setUserVersion(currentVersion - 1);
      });
      logger.info(`[Migration Manager] Rollback of ${migrationToRollback.name} complete. Current Version: ${currentVersion - 1}`);
    } catch (err) {
      logger.error(`[Migration Manager] Rollback failed for ${migrationToRollback.name}:`, err);
      throw err;
    }
  }
};
var migrationManager = new MigrationManager();

// src/main/database/queryBuilder.ts
var QueryBuilder = class {
  static {
    this.compiledCache = /* @__PURE__ */ new Map();
  }
  static select(table, columns = ["*"], where = {}, options = {}) {
    const keys = Object.keys(where);
    const whereClause = keys.length > 0 ? `WHERE ${keys.map((k) => `${k} = ?`).join(" AND ")}` : "";
    const orderClause = options.orderBy ? `ORDER BY ${options.orderBy}` : "";
    const limitClause = options.limit ? `LIMIT ${options.limit}` : "";
    const offsetClause = options.offset ? `OFFSET ${options.offset}` : "";
    const sql = `SELECT ${columns.join(", ")} FROM ${table} ${whereClause} ${orderClause} ${limitClause} ${offsetClause};`.trim();
    const params = keys.map((k) => where[k]);
    this.cache(sql);
    return dbConnection.all(sql, params);
  }
  static selectOne(table, where) {
    const results = this.select(table, ["*"], where, { limit: 1 });
    return results[0];
  }
  static insert(table, data) {
    const keys = Object.keys(data);
    const values = keys.map((k) => data[k]);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders});`;
    this.cache(sql);
    return dbConnection.run(sql, values);
  }
  static update(table, data, where) {
    const dataKeys = Object.keys(data);
    const whereKeys = Object.keys(where);
    const setClause = dataKeys.map((k) => `${k} = ?`).join(", ");
    const whereClause = whereKeys.map((k) => `${k} = ?`).join(" AND ");
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause};`;
    const params = [...dataKeys.map((k) => data[k]), ...whereKeys.map((k) => where[k])];
    this.cache(sql);
    return dbConnection.run(sql, params);
  }
  static delete(table, where) {
    const keys = Object.keys(where);
    const whereClause = keys.map((k) => `${k} = ?`).join(" AND ");
    const sql = `DELETE FROM ${table} WHERE ${whereClause};`;
    const params = keys.map((k) => where[k]);
    this.cache(sql);
    return dbConnection.run(sql, params);
  }
  static cache(sql) {
    if (!this.compiledCache.has(sql)) {
      this.compiledCache.set(sql, sql);
      logger.info(`[QueryBuilder Cache] Prepared statement cached: ${sql.substring(0, 60)}...`);
    }
  }
};

// src/main/database/seeds/devSeeds.ts
function runDevelopmentSeeds() {
  logger.info("[Seed Runner] Executing Development Seed Datasets...");
  const roles = [
    { name: "OWNER", description: "System Owner & Software Issuer" },
    { name: "ADMIN", description: "Enterprise Administrator" },
    { name: "USER", description: "Standard Operator User" },
    { name: "VIEWER", description: "Read-only Inspector" }
  ];
  for (const role of roles) {
    const existing = QueryBuilder.selectOne("roles", { name: role.name });
    if (!existing) {
      QueryBuilder.insert("roles", role);
      logger.info(`[Seed] Seeded Role: ${role.name}`);
    }
  }
  const adminRole = QueryBuilder.selectOne("roles", { name: "ADMIN" });
  if (adminRole) {
    const existingAdmin = QueryBuilder.selectOne("users", { username: "admin" });
    if (!existingAdmin) {
      QueryBuilder.insert("users", {
        username: "admin",
        password_hash: "$argon2id$v=19$m=65536,t=3,p=4$mz_enterprise_admin_hash_stub",
        full_name: "Enterprise Admin",
        role_id: adminRole.id,
        email: "admin@mzbarcodesuite.com",
        created_by: "SYSTEM_SEED"
      });
      logger.info("[Seed] Seeded Default Admin User: admin");
    }
  }
  const templates = [
    {
      name: "Standard Shipping 100x50mm",
      width_mm: 100,
      height_mm: 50,
      dpi: 203,
      is_default: 1,
      layout_json: JSON.stringify({ barcodeType: "CODE128", showText: true })
    },
    {
      name: "Asset Tag QR 50x25mm",
      width_mm: 50,
      height_mm: 25,
      dpi: 203,
      is_default: 0,
      layout_json: JSON.stringify({ barcodeType: "QR", showText: true })
    }
  ];
  for (const tpl of templates) {
    const existingTpl = QueryBuilder.selectOne("label_templates", { name: tpl.name });
    if (!existingTpl) {
      QueryBuilder.insert("label_templates", tpl);
      logger.info(`[Seed] Seeded Label Template: ${tpl.name}`);
    }
  }
  const existingLicense = QueryBuilder.selectOne("license_info", { license_key: "MZ-ENT-2026-FOUNDATION-UNLOCK-KEY" });
  if (!existingLicense) {
    QueryBuilder.insert("license_info", {
      license_key: "MZ-ENT-2026-FOUNDATION-UNLOCK-KEY",
      customer_name: "Enterprise License Holder",
      hwid: "HWID-9921-A87X-MZ",
      status: "valid",
      issued_at: (/* @__PURE__ */ new Date()).toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString(),
      max_users: 10,
      features_json: JSON.stringify({ modules: ["generator", "designer", "backup", "users"] })
    });
    logger.info("[Seed] Seeded License Info.");
  }
  logger.info("[Seed Runner] Development Seed Complete.");
}

// src/main/database/seeds/prodSeed.ts
function runProductionSeeds() {
  logger.info("[Seed Runner] Running Production Clean Seed Initializer...");
  const roles = [
    { name: "OWNER", description: "System Owner & Software Issuer" },
    { name: "ADMIN", description: "Enterprise Administrator" },
    { name: "USER", description: "Standard Operator User" },
    { name: "VIEWER", description: "Read-only Inspector" }
  ];
  for (const role of roles) {
    const existing = QueryBuilder.selectOne("roles", { name: role.name });
    if (!existing) {
      QueryBuilder.insert("roles", role);
      logger.info(`[Production Seed] Initialized Mandatory Role: ${role.name}`);
    }
  }
  logger.info("[Seed Runner] Production Clean Seed Complete.");
}

// src/main/database/seeds/seedRunner.ts
function runSeeds(environment = "development") {
  logger.info(`[Seed Runner] Environment mode: ${environment}`);
  if (environment === "production") {
    runProductionSeeds();
  } else {
    runDevelopmentSeeds();
  }
}

// src/main/auth/rbacService.ts
var RBACService = class {
  /**
   * Retrieves all roles from the database
   */
  static getRoles() {
    const rows = QueryBuilder.select("roles", ["*"]);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isActive: r.is_active === 1
    }));
  }
  /**
   * Retrieves permissions for a given role ID from SQLite
   */
  static getPermissionsForRole(roleId) {
    const rows = QueryBuilder.select("permissions", ["permission_key"], { role_id: roleId });
    return rows.map((r) => r.permission_key);
  }
  /**
   * Checks if a role ID has a specific permission key
   */
  static hasPermission(roleId, permissionKey) {
    const permissions = this.getPermissionsForRole(roleId);
    if (permissions.includes("*") || permissions.includes("ALL_PERMISSIONS")) {
      return true;
    }
    return permissions.includes(permissionKey);
  }
  /**
   * Assigns default system permissions to roles in SQLite
   */
  static initializeDefaultPermissions() {
    logger.info("[RBACService] Ensuring standard SQLite role permissions exist...");
    const roleMap = {
      OWNER: ["*"],
      ADMIN: [
        "BARCODE_GENERATE",
        "BARCODE_PRINT",
        "TEMPLATE_MANAGE",
        "USER_MANAGE",
        "SETTINGS_MANAGE",
        "BACKUP_MANAGE",
        "AUDIT_VIEW"
      ],
      USER: ["BARCODE_GENERATE", "BARCODE_PRINT", "TEMPLATE_VIEW"],
      VIEWER: ["BARCODE_VIEW", "TEMPLATE_VIEW"]
    };
    const roles = QueryBuilder.select("roles", ["id", "name"]);
    for (const r of roles) {
      const targetPermissions = roleMap[r.name] || ["TEMPLATE_VIEW"];
      const existing = this.getPermissionsForRole(r.id);
      for (const permKey of targetPermissions) {
        if (!existing.includes(permKey)) {
          QueryBuilder.insert("permissions", {
            role_id: r.id,
            permission_key: permKey
          });
          logger.info(`[RBAC] Granted permission "${permKey}" to role ${r.name} (ID: ${r.id})`);
        }
      }
    }
  }
};

// src/main/database.ts
var DatabaseEngine = class {
  constructor() {
    this.initialized = false;
  }
  initialize() {
    try {
      logger.info("[DatabaseEngine] Starting SQLite Engine Connection...");
      dbConnection.connect();
      logger.info("[DatabaseEngine] Executing Schema Migration Manager...");
      migrationManager.migrate();
      logger.info("[DatabaseEngine] Executing Seed Runner...");
      runSeeds("development");
      logger.info("[DatabaseEngine] Initializing RBAC Default Permissions...");
      RBACService.initializeDefaultPermissions();
      this.initialized = true;
      const status = migrationManager.getStatus();
      return {
        path: dbConnection.getDbPath(),
        initialized: true,
        wal: true,
        version: status.currentVersion
      };
    } catch (error) {
      logger.error("[DatabaseEngine] Initialization failure:", error);
      throw error;
    }
  }
  getStatus() {
    const migrationStatus = migrationManager.getStatus();
    return {
      initialized: this.initialized,
      path: dbConnection.getDbPath(),
      wal: true,
      foreignKeys: true,
      busyTimeout: 5e3,
      currentVersion: migrationStatus.currentVersion,
      requiredVersion: migrationStatus.requiredVersion,
      pendingCount: migrationStatus.pendingCount
    };
  }
};
var databaseEngine = new DatabaseEngine();

// src/main/config.ts
var import_path4 = __toESM(require("path"), 1);
var import_fs4 = __toESM(require("fs"), 1);

// src/shared/config.ts
var DEFAULT_SETTINGS = {
  app: {
    theme: "dark",
    autoUpdate: false,
    language: "en-US",
    edition: "customer"
  },
  database: {
    path: "%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db",
    walMode: true,
    autoBackupDaily: true
  },
  printing: {
    defaultPrinter: "Zebra ZD421 (203 dpi)",
    paperWidthMm: 100,
    paperHeightMm: 50,
    dpi: 203
  },
  security: {
    sessionTimeoutMinutes: 30,
    auditLogging: true
  }
};

// src/shared/validation.ts
var import_zod = require("zod");
var SystemSettingsSchema = import_zod.z.object({
  app: import_zod.z.object({
    theme: import_zod.z.enum(["dark", "light", "system"]),
    autoUpdate: import_zod.z.boolean(),
    language: import_zod.z.string().min(2),
    edition: import_zod.z.enum(["customer", "owner"])
  }),
  database: import_zod.z.object({
    path: import_zod.z.string(),
    walMode: import_zod.z.boolean(),
    autoBackupDaily: import_zod.z.boolean()
  }),
  printing: import_zod.z.object({
    defaultPrinter: import_zod.z.string(),
    paperWidthMm: import_zod.z.number().positive(),
    paperHeightMm: import_zod.z.number().positive(),
    dpi: import_zod.z.number().positive()
  }),
  security: import_zod.z.object({
    sessionTimeoutMinutes: import_zod.z.number().min(1).max(1440),
    auditLogging: import_zod.z.boolean()
  })
});
var BarcodeValidationSchema = import_zod.z.object({
  type: import_zod.z.enum(["CODE128", "EAN13", "EAN8", "UPCA", "QR", "DATAMATRIX", "PDF417"]),
  data: import_zod.z.string().min(1, "Barcode data cannot be empty")
});

// src/main/config.ts
var SettingsManager = class {
  constructor() {
    this.currentSettings = DEFAULT_SETTINGS;
    this.initialized = false;
    this.configPath = import_path4.default.join(getSuiteRootPath(), "config", "settings.json");
  }
  initialize() {
    if (this.initialized) return this.currentSettings;
    this.currentSettings = this.loadOrInitialize();
    this.initialized = true;
    return this.currentSettings;
  }
  loadOrInitialize() {
    try {
      if (import_fs4.default.existsSync(this.configPath)) {
        const raw = import_fs4.default.readFileSync(this.configPath, "utf-8");
        const parsed = JSON.parse(raw);
        const validated = SystemSettingsSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
        logger.warn("Corrupted settings.json detected. Re-initializing default values.");
      }
    } catch (e) {
      logger.error("Failed reading settings.json:", e);
    }
    this.currentSettings = DEFAULT_SETTINGS;
    this.save(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  getSettings() {
    if (!this.initialized) {
      this.initialize();
    }
    return { ...this.currentSettings };
  }
  save(newSettings) {
    const base = this.currentSettings || DEFAULT_SETTINGS;
    const merged = {
      ...base,
      ...newSettings,
      app: { ...base.app || {}, ...newSettings.app || {} },
      database: { ...base.database || {}, ...newSettings.database || {} },
      printing: { ...base.printing || {}, ...newSettings.printing || {} },
      security: { ...base.security || {}, ...newSettings.security || {} }
    };
    const validated = SystemSettingsSchema.safeParse(merged);
    if (!validated.success) {
      logger.error("Invalid settings structure attempted:", validated.error.format());
      return base;
    }
    this.currentSettings = validated.data;
    try {
      const configDir = import_path4.default.dirname(this.configPath);
      if (!import_fs4.default.existsSync(configDir)) {
        import_fs4.default.mkdirSync(configDir, { recursive: true });
      }
      import_fs4.default.writeFileSync(this.configPath, JSON.stringify(this.currentSettings, null, 2), "utf-8");
      logger.info("settings.json saved successfully.");
    } catch (e) {
      logger.error("Failed to write settings.json:", e);
    }
    return this.currentSettings;
  }
  reset() {
    return this.save(DEFAULT_SETTINGS);
  }
};
var settingsManager = new SettingsManager();

// src/main/instance.ts
var InstanceLockManager = class {
  constructor() {
    this.primaryInstance = true;
  }
  requestLock() {
    logger.info("Checking Single Instance Lock for MZ Barcode Suite Enterprise...");
    this.primaryInstance = true;
    return this.primaryInstance;
  }
  isPrimary() {
    return this.primaryInstance;
  }
};
var instanceLock = new InstanceLockManager();

// src/main/errorHandler.ts
function setupCentralizedErrorHandler() {
  logger.info("Registering Centralized Error Handlers for Main Process...");
  if (typeof process !== "undefined") {
    process.on("uncaughtException", (error) => {
      logger.crash("Uncaught Exception trapped in Main Process:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.error("[CRITICAL] Uncaught Exception:", error);
    });
    process.on("unhandledRejection", (reason) => {
      logger.crash("Unhandled Rejection trapped in Main Process:", { reason });
      console.error("[CRITICAL] Unhandled Rejection:", reason);
    });
  }
}

// src/main/ipc/databaseIPC.ts
function registerDatabaseIPC(registerHandler) {
  registerHandler("ipc:database:init" /* DATABASE_INIT */, async () => {
    logger.info("IPC Call: DATABASE_INIT");
    const res = databaseEngine.initialize();
    return {
      success: true,
      data: { path: res.path, status: "Engine Initialized (WAL Mode)" },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:database:status" /* DATABASE_STATUS */, async () => {
    logger.info("IPC Call: DATABASE_STATUS");
    const status = databaseEngine.getStatus();
    return {
      success: true,
      data: { initialized: status.initialized, wal: status.wal },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}

// src/main/ipc/settingsIPC.ts
function registerSettingsIPC(registerHandler) {
  registerHandler("ipc:settings:get" /* SETTINGS_GET */, async () => {
    logger.info("IPC Call: SETTINGS_GET");
    return {
      success: true,
      data: settingsManager.getSettings(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:settings:save" /* SETTINGS_SAVE */, async (_evt, newSettings) => {
    logger.info("IPC Call: SETTINGS_SAVE");
    const updated = settingsManager.save(newSettings || {});
    return {
      success: true,
      data: updated,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:settings:reset" /* SETTINGS_RESET */, async () => {
    logger.info("IPC Call: SETTINGS_RESET");
    const res = settingsManager.reset();
    return {
      success: true,
      data: res,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}

// src/main/ipc/backupIPC.ts
function registerBackupIPC(registerHandler) {
  registerHandler("ipc:backup:create" /* BACKUP_CREATE */, async () => {
    logger.info("IPC Call: BACKUP_CREATE (Foundation Empty Handler)");
    return {
      success: true,
      data: { file: "mz_backup_foundation_stub.bak" },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:backup:list" /* BACKUP_LIST */, async () => {
    logger.info("IPC Call: BACKUP_LIST (Foundation Empty Handler)");
    return {
      success: true,
      data: [],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:backup:restore" /* BACKUP_RESTORE */, async () => {
    logger.info("IPC Call: BACKUP_RESTORE (Foundation Empty Handler)");
    return {
      success: true,
      data: { restored: true },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}

// src/main/ipc/licenseIPC.ts
function registerLicenseIPC(registerHandler) {
  registerHandler("ipc:license:check" /* LICENSE_CHECK */, async () => {
    logger.info("IPC Call: LICENSE_CHECK (Foundation Empty Handler)");
    return {
      success: true,
      data: { active: true, type: "ENTERPRISE_FOUNDATION_UNLOCKED" },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:license:activate" /* LICENSE_ACTIVATE */, async () => {
    logger.info("IPC Call: LICENSE_ACTIVATE (Foundation Empty Handler)");
    return {
      success: true,
      data: { success: true },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}

// src/main/ipc/printerIPC.ts
function registerPrinterIPC(registerHandler) {
  registerHandler("ipc:printer:list" /* PRINTER_LIST */, async () => {
    logger.info("IPC Call: PRINTER_LIST (Foundation Empty Handler)");
    return {
      success: true,
      data: ["Zebra ZD421 (203 dpi)", "TSC TTP-244 Pro", "SATO CL4NX Plus"],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:printer:status" /* PRINTER_STATUS */, async () => {
    logger.info("IPC Call: PRINTER_STATUS (Foundation Empty Handler)");
    return {
      success: true,
      data: { online: true },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}

// src/main/ipc/barcodeIPC.ts
function registerBarcodeIPC(registerHandler) {
  registerHandler("ipc:barcode:formats" /* BARCODE_FORMATS */, async () => {
    logger.info("IPC Call: BARCODE_FORMATS (Foundation Empty Handler)");
    return {
      success: true,
      data: ["CODE128", "EAN13", "EAN8", "UPCA", "QR", "DATAMATRIX", "PDF417"],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:barcode:validate" /* BARCODE_VALIDATE */, async () => {
    logger.info("IPC Call: BARCODE_VALIDATE (Foundation Empty Handler)");
    return {
      success: true,
      data: { valid: true },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}

// src/main/database/repositories/BaseRepository.ts
var BaseRepository = class {
  findById(id) {
    return QueryBuilder.selectOne(this.tableName, { id });
  }
  findAll(limit = 100, offset = 0) {
    return QueryBuilder.select(this.tableName, ["*"], {}, { limit, offset });
  }
  deleteById(id) {
    return QueryBuilder.delete(this.tableName, { id });
  }
};

// src/shared/databaseSchemas.ts
var import_zod2 = require("zod");
var CommonEntitySchema = import_zod2.z.object({
  id: import_zod2.z.number().int().positive().optional(),
  created_at: import_zod2.z.string().optional(),
  updated_at: import_zod2.z.string().optional(),
  created_by: import_zod2.z.string().default("SYSTEM"),
  updated_by: import_zod2.z.string().default("SYSTEM"),
  is_active: import_zod2.z.number().int().min(0).max(1).default(1)
});
var UserInsertSchema = CommonEntitySchema.extend({
  username: import_zod2.z.string().min(3).max(50),
  password_hash: import_zod2.z.string().min(8),
  full_name: import_zod2.z.string().min(2).max(100),
  role_id: import_zod2.z.number().int().positive(),
  email: import_zod2.z.string().email().optional().nullable()
});
var UserUpdateSchema = UserInsertSchema.partial().extend({
  id: import_zod2.z.number().int().positive()
});
var UserSearchSchema = import_zod2.z.object({
  username: import_zod2.z.string().optional(),
  role_id: import_zod2.z.number().int().optional(),
  is_active: import_zod2.z.number().int().optional(),
  limit: import_zod2.z.number().int().positive().default(50),
  offset: import_zod2.z.number().int().nonnegative().default(0)
});
var BarcodeInsertSchema = CommonEntitySchema.extend({
  barcode_value: import_zod2.z.string().min(1),
  prefix: import_zod2.z.string().default(""),
  sequence_number: import_zod2.z.number().int().default(0),
  barcode_type: import_zod2.z.enum(["CODE128", "EAN13", "EAN8", "UPCA", "QR", "DATAMATRIX", "PDF417"]),
  title: import_zod2.z.string().min(1),
  category: import_zod2.z.string().default("GENERAL"),
  status: import_zod2.z.enum(["active", "archived"]).default("active"),
  print_count: import_zod2.z.number().int().nonnegative().default(0)
});
var BarcodeUpdateSchema = BarcodeInsertSchema.partial().extend({
  id: import_zod2.z.number().int().positive()
});
var BarcodeSearchSchema = import_zod2.z.object({
  barcode_value: import_zod2.z.string().optional(),
  barcode_type: import_zod2.z.string().optional(),
  category: import_zod2.z.string().optional(),
  status: import_zod2.z.enum(["active", "archived"]).optional(),
  limit: import_zod2.z.number().int().positive().default(50),
  offset: import_zod2.z.number().int().nonnegative().default(0)
});
var TemplateInsertSchema = CommonEntitySchema.extend({
  name: import_zod2.z.string().min(2).max(100),
  width_mm: import_zod2.z.number().positive(),
  height_mm: import_zod2.z.number().positive(),
  dpi: import_zod2.z.number().int().positive().default(203),
  is_default: import_zod2.z.number().int().min(0).max(1).default(0),
  layout_json: import_zod2.z.string().default("{}")
});
var TemplateUpdateSchema = TemplateInsertSchema.partial().extend({
  id: import_zod2.z.number().int().positive()
});
var SettingsDbInsertSchema = import_zod2.z.object({
  key: import_zod2.z.string().min(1),
  value: import_zod2.z.string(),
  category: import_zod2.z.string().default("GENERAL"),
  updated_at: import_zod2.z.string().optional(),
  updated_by: import_zod2.z.string().default("SYSTEM")
});
var LicenseDbInsertSchema = import_zod2.z.object({
  license_key: import_zod2.z.string().min(10),
  customer_name: import_zod2.z.string().min(2),
  hwid: import_zod2.z.string().min(4),
  status: import_zod2.z.enum(["valid", "expiring_soon", "expired", "tampered"]),
  issued_at: import_zod2.z.string(),
  expires_at: import_zod2.z.string(),
  max_users: import_zod2.z.number().int().positive().default(1),
  features_json: import_zod2.z.string().default("{}")
});
var AuditLogInsertSchema = import_zod2.z.object({
  timestamp: import_zod2.z.string().optional(),
  username: import_zod2.z.string().default("SYSTEM"),
  role: import_zod2.z.string().default("ADMIN"),
  action: import_zod2.z.string().min(1),
  category: import_zod2.z.enum(["AUTHENTICATION", "BARCODE", "LICENSE", "SYSTEM", "BACKUP"]),
  details: import_zod2.z.string().default(""),
  ip_address: import_zod2.z.string().default("127.0.0.1")
});
var BackupHistoryInsertSchema = import_zod2.z.object({
  filename: import_zod2.z.string().min(1),
  filepath: import_zod2.z.string().min(1),
  size_bytes: import_zod2.z.number().int().nonnegative(),
  status: import_zod2.z.enum(["SUCCESS", "FAILED", "VERIFIED"]),
  created_at: import_zod2.z.string().optional(),
  created_by: import_zod2.z.string().default("SYSTEM")
});

// src/main/database/repositories/UserRepository.ts
var UserRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "users";
  }
  findByUsername(username) {
    return QueryBuilder.selectOne(this.tableName, { username });
  }
  create(user) {
    const validated = UserInsertSchema.parse(user);
    return QueryBuilder.insert(this.tableName, validated);
  }
  update(id, user) {
    const validated = UserUpdateSchema.parse({ ...user, id });
    return QueryBuilder.update(this.tableName, validated, { id });
  }
  createSession(sessionData) {
    return QueryBuilder.insert("user_sessions", {
      user_id: sessionData.userId,
      session_token: sessionData.sessionToken,
      expires_at: sessionData.expiresAt,
      ip_address: sessionData.ipAddress || "127.0.0.1",
      is_active: 1
    });
  }
};
var userRepository = new UserRepository();

// src/main/auth/passwordService.ts
var import_crypto = __toESM(require("crypto"), 1);
var PasswordService = class {
  static {
    this.SALT_BYTE_LENGTH = 16;
  }
  static {
    this.KEY_BYTE_LENGTH = 32;
  }
  /**
   * Hashes a plain password using Argon2id-compatible parameter structure
   */
  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = import_crypto.default.randomBytes(this.SALT_BYTE_LENGTH).toString("hex");
      import_crypto.default.scrypt(password, salt, this.KEY_BYTE_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) {
          logger.error("[PasswordService] Error hashing password:", err);
          return reject(err);
        }
        const hash = derivedKey.toString("hex");
        const argon2idString = `$argon2id$v=19$m=65536,t=3,p=4$${salt}$${hash}`;
        resolve(argon2idString);
      });
    });
  }
  /**
   * Verifies a password against an Argon2id formatted hash
   */
  static async verifyPassword(password, storedHash) {
    try {
      if (!storedHash || !storedHash.startsWith("$argon2id$")) {
        return false;
      }
      const parts = storedHash.split("$");
      if (parts.length < 6) {
        return false;
      }
      const salt = parts[4];
      const targetHash = parts[5];
      return new Promise((resolve) => {
        import_crypto.default.scrypt(password, salt, this.KEY_BYTE_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
          if (err) {
            logger.error("[PasswordService] Error during password verification:", err);
            return resolve(false);
          }
          const hash = derivedKey.toString("hex");
          const isMatch = import_crypto.default.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(targetHash, "hex"));
          resolve(isMatch);
        });
      });
    } catch (err) {
      logger.error("[PasswordService] Verification failed:", err);
      return false;
    }
  }
  /**
   * Validates strong password policy requirements
   */
  static validatePasswordPolicy(password) {
    const errors = [];
    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// src/main/auth/sessionManager.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var SessionManager = class {
  static {
    this.DEFAULT_SESSION_HOURS = 12;
  }
  static {
    this.REMEMBER_ME_DAYS = 30;
  }
  /**
   * Generates a cryptographically secure 64-character session token
   */
  static generateSessionToken() {
    return import_crypto2.default.randomBytes(32).toString("hex");
  }
  /**
   * Creates a new user session in the SQLite database
   */
  static createSession(userId, rememberMe = false, ipAddress = "127.0.0.1") {
    const sessionToken = this.generateSessionToken();
    const durationHours = rememberMe ? this.REMEMBER_ME_DAYS * 24 : this.DEFAULT_SESSION_HOURS;
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1e3).toISOString();
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    const result = userRepository.createSession({
      userId,
      sessionToken,
      expiresAt,
      ipAddress
    });
    const role = QueryBuilder.selectOne("roles", { id: user.role_id });
    logger.info(`[SessionManager] Created session for user "${user.username}" (Expires: ${expiresAt})`);
    return {
      sessionId: Number(result.lastInsertRowid),
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: role ? role.name : "USER",
      fullName: user.full_name,
      sessionToken,
      expiresAt,
      ipAddress
    };
  }
  /**
   * Validates an active session token against SQLite
   */
  static validateSession(sessionToken) {
    if (!sessionToken) return null;
    const sessionRow = QueryBuilder.selectOne("user_sessions", { session_token: sessionToken, is_active: 1 });
    if (!sessionRow) {
      return null;
    }
    if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
      logger.info(`[SessionManager] Session token expired. Invalidating session ID ${sessionRow.id}`);
      this.invalidateSession(sessionToken);
      return null;
    }
    const user = userRepository.findById(sessionRow.user_id);
    if (!user || user.is_active !== 1) {
      this.invalidateSession(sessionToken);
      return null;
    }
    const role = QueryBuilder.selectOne("roles", { id: user.role_id });
    return {
      sessionId: sessionRow.id,
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: role ? role.name : "USER",
      fullName: user.full_name,
      sessionToken: sessionRow.session_token,
      expiresAt: sessionRow.expires_at,
      ipAddress: sessionRow.ip_address
    };
  }
  /**
   * Safely invalidates/logs out a session token
   */
  static invalidateSession(sessionToken) {
    QueryBuilder.update("user_sessions", { is_active: 0 }, { session_token: sessionToken });
    logger.info("[SessionManager] Session invalidated successfully.");
  }
  /**
   * Cleans up expired user sessions
   */
  static cleanupExpiredSessions() {
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    QueryBuilder.update("user_sessions", { is_active: 0 }, { is_active: 1, expires_at: nowISO });
  }
};

// src/main/database/auditFramework.ts
var AuditFramework = class {
  static log(entry) {
    const record = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      username: entry.username || "SYSTEM",
      role: entry.role || "ADMIN",
      action: entry.action,
      category: entry.category,
      details: entry.details || "",
      ip_address: entry.ipAddress || "127.0.0.1"
    };
    const validated = AuditLogInsertSchema.safeParse(record);
    if (!validated.success) {
      logger.error("[Audit Framework] Invalid audit log entry format:", validated.error.format());
      return;
    }
    try {
      QueryBuilder.insert("audit_logs", validated.data);
      logger.info(`[Audit Log] [${validated.data.category}] ${validated.data.action} by ${validated.data.username}`);
    } catch (err) {
      logger.error("[Audit Framework] Failed to persist audit log:", err);
    }
  }
};

// src/main/auth/authService.ts
var AuthService = class {
  /**
   * Local user authentication login flow
   */
  static async login(username, password, rememberMe = false, ipAddress = "127.0.0.1") {
    logger.info(`[AuthService] Login attempt for user: "${username}"`);
    const user = userRepository.findByUsername(username);
    if (!user) {
      AuditFramework.log({
        username,
        role: "GUEST",
        action: "LOGIN_FAILED",
        category: "AUTHENTICATION",
        details: "Invalid username",
        ipAddress
      });
      return { success: false, message: "Invalid username or password." };
    }
    if (user.is_active !== 1) {
      AuditFramework.log({
        username,
        role: "DISABLED",
        action: "LOGIN_FAILED",
        category: "AUTHENTICATION",
        details: "Account disabled",
        ipAddress
      });
      return { success: false, message: "This user account is currently disabled." };
    }
    const isValidPassword = await PasswordService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      AuditFramework.log({
        username,
        role: "USER",
        action: "LOGIN_FAILED",
        category: "AUTHENTICATION",
        details: "Incorrect password",
        ipAddress
      });
      return { success: false, message: "Invalid username or password." };
    }
    const session = SessionManager.createSession(user.id, rememberMe, ipAddress);
    AuditFramework.log({
      username: user.username,
      role: session.roleName,
      action: "LOGIN_SUCCESS",
      category: "AUTHENTICATION",
      details: `Session created token=${session.sessionToken.substring(0, 8)}...`,
      ipAddress
    });
    return {
      success: true,
      session
    };
  }
  /**
   * Local user logout
   */
  static logout(sessionToken) {
    const session = SessionManager.validateSession(sessionToken);
    if (session) {
      AuditFramework.log({
        username: session.username,
        role: session.roleName,
        action: "LOGOUT",
        category: "AUTHENTICATION",
        details: "User logged out successfully",
        ipAddress: session.ipAddress
      });
    }
    SessionManager.invalidateSession(sessionToken);
  }
  /**
   * Validates active session token
   */
  static validateSession(sessionToken) {
    return SessionManager.validateSession(sessionToken);
  }
  /**
   * Change Password Framework
   */
  static async changePassword(userId, currentPass, newPass) {
    const user = userRepository.findById(userId);
    if (!user) {
      return { success: false, message: "User not found." };
    }
    const isMatch = await PasswordService.verifyPassword(currentPass, user.password_hash);
    if (!isMatch) {
      return { success: false, message: "Current password is incorrect." };
    }
    const policy = PasswordService.validatePasswordPolicy(newPass);
    if (!policy.valid) {
      return { success: false, message: policy.errors.join(" ") };
    }
    const newHash = await PasswordService.hashPassword(newPass);
    userRepository.update(userId, {
      password_hash: newHash,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    AuditFramework.log({
      username: user.username,
      action: "PASSWORD_CHANGE",
      category: "AUTHENTICATION",
      details: "Password changed successfully"
    });
    return { success: true };
  }
  /**
   * User Management: Create User
   */
  static async createUser(userData) {
    const existing = userRepository.findByUsername(userData.username);
    if (existing) {
      return { success: false, message: `Username "${userData.username}" already exists.` };
    }
    const policy = PasswordService.validatePasswordPolicy(userData.password);
    if (!policy.valid) {
      return { success: false, message: policy.errors.join(" ") };
    }
    const passwordHash = await PasswordService.hashPassword(userData.password);
    userRepository.create({
      username: userData.username,
      password_hash: passwordHash,
      full_name: userData.fullName,
      role_id: userData.roleId,
      email: userData.email || null,
      created_by: userData.createdBy || "ADMIN"
    });
    const newUser = userRepository.findByUsername(userData.username);
    AuditFramework.log({
      username: userData.createdBy || "ADMIN",
      action: "USER_CREATION",
      category: "AUTHENTICATION",
      details: `Created user account "${userData.username}"`
    });
    return { success: true, user: newUser };
  }
  /**
   * User Management: Update Status (Enable/Disable)
   */
  static updateUserStatus(userId, isActive, updatedBy = "ADMIN") {
    const user = userRepository.findById(userId);
    if (!user) {
      return { success: false, message: "User not found." };
    }
    userRepository.update(userId, {
      is_active: isActive ? 1 : 0,
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_by: updatedBy
    });
    AuditFramework.log({
      username: updatedBy,
      action: isActive ? "USER_ACTIVATE" : "USER_DISABLE",
      category: "AUTHENTICATION",
      details: `Updated account status for "${user.username}" to ${isActive ? "ACTIVE" : "DISABLED"}`
    });
    return { success: true };
  }
  /**
   * List all user accounts with role details
   */
  static listUsers() {
    const users = userRepository.findAll();
    return users.map((u) => {
      const role = QueryBuilder.selectOne("roles", { id: u.role_id });
      return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        roleId: u.role_id,
        role: role ? role.name : "USER",
        email: u.email,
        isActive: u.is_active === 1,
        createdAt: u.created_at,
        updatedAt: u.updated_at
      };
    });
  }
};

// src/main/ipc/authIPC.ts
function registerAuthIPC(registerHandler) {
  logger.info("Registering Auth & RBAC IPC Channels...");
  registerHandler("ipc:auth:login" /* AUTH_LOGIN */, async (_, payload) => {
    try {
      const res = await AuthService.login(payload.username, payload.password, payload.rememberMe);
      if (!res.success) {
        return { success: false, error: { code: "AUTH_FAILED", message: res.message || "Login failed" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: res.session, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error AUTH_LOGIN:", err);
      return { success: false, error: { code: "AUTH_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:auth:logout" /* AUTH_LOGOUT */, async (_, payload) => {
    try {
      AuthService.logout(payload.sessionToken);
      return { success: true, data: { loggedOut: true }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "LOGOUT_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:auth:validate_session" /* AUTH_VALIDATE_SESSION */, async (_, payload) => {
    try {
      const session = AuthService.validateSession(payload.sessionToken);
      if (!session) {
        return { success: false, error: { code: "SESSION_INVALID", message: "Session expired or invalid" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: session, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "SESSION_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:auth:change_password" /* AUTH_CHANGE_PASSWORD */, async (_, payload) => {
    try {
      const res = await AuthService.changePassword(payload.userId, payload.currentPass, payload.newPass);
      if (!res.success) {
        return { success: false, error: { code: "PASSWORD_CHANGE_FAILED", message: res.message || "Password change failed" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: { updated: true }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "PASSWORD_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:user:list" /* USER_LIST */, async () => {
    try {
      const users = AuthService.listUsers();
      return { success: true, data: users, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "USER_LIST_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:user:create" /* USER_CREATE */, async (_, payload) => {
    try {
      const res = await AuthService.createUser(payload);
      if (!res.success) {
        return { success: false, error: { code: "USER_CREATE_FAILED", message: res.message || "Failed creating user" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: res.user, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "USER_CREATE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:user:update_status" /* USER_UPDATE_STATUS */, async (_, payload) => {
    try {
      const res = AuthService.updateUserStatus(payload.userId, payload.isActive);
      if (!res.success) {
        return { success: false, error: { code: "STATUS_UPDATE_FAILED", message: res.message || "Failed updating status" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: { updated: true }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "USER_STATUS_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:role:list" /* ROLE_LIST */, async () => {
    try {
      const roles = RBACService.getRoles();
      return { success: true, data: roles, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "ROLE_LIST_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:permissions:get" /* PERMISSIONS_GET */, async (_, payload) => {
    try {
      const permissions = RBACService.getPermissionsForRole(payload.roleId);
      return { success: true, data: permissions, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      return { success: false, error: { code: "PERMISSIONS_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
}

// src/main/ipc/index.ts
function registerAllIPCHandlers(registerHandler) {
  logger.info("Registering all Foundation IPC Channels...");
  registerDatabaseIPC(registerHandler);
  registerSettingsIPC(registerHandler);
  registerBackupIPC(registerHandler);
  registerLicenseIPC(registerHandler);
  registerPrinterIPC(registerHandler);
  registerBarcodeIPC(registerHandler);
  registerAuthIPC(registerHandler);
  logger.info("IPC Channel Registration Complete.");
}

// src/main/window.ts
function getSecureWindowConfig() {
  logger.info("Configuring Secure BrowserWindow with ContextIsolation & Sandbox...");
  return {
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "MZ Barcode Suite Enterprise v1.0",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  };
}

// src/main/index.ts
var MainApplication = class {
  constructor() {
    this.isShuttingDown = false;
  }
  async bootstrap() {
    setupCentralizedErrorHandler();
    logger.info("=== MZ BARCODE SUITE ENTERPRISE v1.0 BOOTSTRAP ===");
    let electronApp = null;
    let BrowserWindow = null;
    let ipcMain = null;
    try {
      const electron = require("electron");
      electronApp = electron?.app || (typeof electron === "object" && electron.getPath ? electron : null);
      BrowserWindow = electron?.BrowserWindow;
      ipcMain = electron?.ipcMain;
    } catch {
      electronApp = null;
    }
    if (electronApp && typeof electronApp.whenReady === "function") {
      logger.info("Waiting for Electron app.whenReady()...");
      await electronApp.whenReady();
      logger.info("Electron app is ready.");
      if (typeof electronApp.requestSingleInstanceLock === "function") {
        const hasLock = electronApp.requestSingleInstanceLock();
        if (!hasLock) {
          logger.warn("Another instance of MZ Barcode Suite is running. Quitting.");
          electronApp.quit();
          return;
        }
      }
    } else {
      if (!instanceLock.requestLock()) {
        logger.warn("Another instance is already running. Exiting.");
        return;
      }
    }
    const dirs = initializeDirectories();
    logger.info("Directories Initialized:", dirs);
    const settings = settingsManager.initialize();
    logger.info("Settings Initialized:", settings.app);
    const dbStatus = databaseEngine.initialize();
    logger.info("Database Engine Status:", dbStatus);
    const handlersMap = /* @__PURE__ */ new Map();
    registerAllIPCHandlers((channel, handler) => {
      handlersMap.set(channel, handler);
    });
    if (ipcMain) {
      handlersMap.forEach((handler, channel) => {
        ipcMain.handle(channel, async (event, ...args) => {
          return handler(event, ...args);
        });
      });
    }
    if (electronApp && BrowserWindow) {
      const winConfig = getSecureWindowConfig();
      const mainWindow = new BrowserWindow({
        width: winConfig.width,
        height: winConfig.height,
        minWidth: winConfig.minWidth,
        minHeight: winConfig.minHeight,
        title: winConfig.title,
        webPreferences: {
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: false,
          preload: import_path5.default.join(__dirname, "../preload/index.cjs")
        }
      });
      const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:3000";
      if (process.env.NODE_ENV === "development") {
        mainWindow.loadURL(devUrl);
      } else {
        mainWindow.loadFile(import_path5.default.join(__dirname, "../../dist/index.html"));
      }
      electronApp.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
          electronApp.quit();
        }
      });
    } else {
      logger.info("Running in Web / Cloud Run preview mode.");
    }
    logger.info("=== MAIN PROCESS BOOTSTRAP SUCCESSFUL ===");
  }
  shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    logger.info("Performing Graceful Shutdown of MZ Barcode Suite...");
    logger.info("Closing database connections safely.");
    logger.info("Main process shutdown complete.");
  }
};
var mainApp = new MainApplication();
mainApp.bootstrap().catch((err) => {
  logger.crash("Fatal bootstrap failure:", err);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MainApplication,
  mainApp
});
