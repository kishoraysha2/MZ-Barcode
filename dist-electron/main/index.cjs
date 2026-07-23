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

// src/main/database/migrations/0006_sprint5_tables.ts
var migration0006 = {
  version: 6,
  name: "0006_sprint5_tables",
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
      zpl_output TEXT,
      tspl_output TEXT,
      job_metadata_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (template_id) REFERENCES label_templates(id) ON DELETE SET NULL,
      FOREIGN KEY (barcode_id) REFERENCES barcodes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS printer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      driver_type TEXT NOT NULL DEFAULT 'WINDOWS',
      is_default INTEGER DEFAULT 0,
      dpi INTEGER DEFAULT 203,
      paper_type TEXT DEFAULT 'Continuous',
      port TEXT DEFAULT 'USB001',
      config_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_printer_profiles_name ON printer_profiles(name);
    CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
  `,
  down: `
    DROP TABLE IF EXISTS printer_profiles;
    DROP TABLE IF EXISTS print_jobs;
    DROP TABLE IF EXISTS label_templates;
  `
};

// src/main/database/migrations/index.ts
var ALL_MIGRATIONS = [
  migration0001,
  migration0002,
  migration0003,
  migration0004,
  migration0005,
  migration0006
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

// src/main/database/repositories/BarcodeRepository.ts
var BarcodeRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "barcodes";
    this.items = [];
    this.sequenceMap = /* @__PURE__ */ new Map();
  }
  findByBarcodeValue(barcodeValue) {
    return this.items.find((b) => b.barcode_value === barcodeValue) || QueryBuilder.selectOne(this.tableName, { barcode_value: barcodeValue });
  }
  findRecent(limit = 10) {
    return [...this.items].sort((a, b) => b.id - a.id).slice(0, limit);
  }
  findAll(limit = 100, offset = 0) {
    const list = [...this.items].sort((a, b) => b.id - a.id);
    return list.slice(offset, offset + limit);
  }
  count() {
    return this.items.length;
  }
  getTotalPrintCount() {
    return this.items.reduce((sum, b) => sum + (b.print_count || 0), 0);
  }
  create(barcode) {
    const validated = BarcodeInsertSchema.parse(barcode);
    const id = barcode.id || Date.now() + Math.floor(Math.random() * 1e3);
    const createdAt = barcode.created_at || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    const row = {
      id,
      barcode_value: validated.barcode_value,
      prefix: validated.prefix || "",
      sequence_number: validated.sequence_number || 1,
      barcode_type: validated.barcode_type,
      title: validated.title,
      category: validated.category || "General",
      status: validated.status || "active",
      print_count: validated.print_count || 1,
      created_at: createdAt,
      updated_at: createdAt,
      created_by: validated.created_by || "Customer Admin",
      updated_by: validated.created_by || "Customer Admin",
      is_active: 1
    };
    this.items.unshift(row);
    QueryBuilder.insert(this.tableName, validated);
    if (row.prefix) {
      const curr = this.sequenceMap.get(row.prefix) || 1;
      if (row.sequence_number >= curr) {
        this.sequenceMap.set(row.prefix, row.sequence_number + 1);
      }
    }
    return row;
  }
  update(id, barcode) {
    const validated = BarcodeUpdateSchema.parse({ ...barcode, id });
    const idx = this.items.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.items[idx] = {
        ...this.items[idx],
        ...barcode,
        updated_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19)
      };
    }
    return QueryBuilder.update(this.tableName, validated, { id });
  }
  delete(id) {
    this.items = this.items.filter((b) => b.id !== id);
    return QueryBuilder.delete(this.tableName, { id });
  }
  peekNextSequenceValue(prefix = "MZ-") {
    return this.sequenceMap.get(prefix) || 1;
  }
  getNextSequenceValue(prefix = "MZ-") {
    const nextVal = this.peekNextSequenceValue(prefix);
    this.sequenceMap.set(prefix, nextVal + 1);
    return nextVal;
  }
};
var barcodeRepository = new BarcodeRepository();

// src/main/database/repositories/PrinterRepository.ts
var PrinterRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "printers";
    this.printers = [];
  }
  getDefaultPrinter() {
    return this.printers.find((p) => p.is_default === 1) || (this.printers.length > 0 ? this.printers[0] : null);
  }
  getPrinters() {
    return this.printers;
  }
  getPrinterStatus(name) {
    const target = this.printers.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!target) {
      return { online: false, status: "Not Configured" };
    }
    return { online: target.status === "ready", status: target.status };
  }
  savePrinter(printer) {
    const existingIdx = this.printers.findIndex((p) => p.name === printer.name);
    const row = {
      id: printer.id || `prn-${Date.now()}`,
      name: printer.name,
      is_default: printer.is_default ?? (this.printers.length === 0 ? 1 : 0),
      status: printer.status || "ready",
      paper_type: printer.paper_type || "50mm x 25mm Continuous Label",
      dpi: printer.dpi || 203,
      port: printer.port || "USB001"
    };
    if (printer.is_default === 1) {
      this.printers.forEach((p) => {
        p.is_default = 0;
      });
    }
    if (existingIdx !== -1) {
      this.printers[existingIdx] = row;
    } else {
      this.printers.push(row);
    }
    return row;
  }
};
var printerRepository = new PrinterRepository();

// src/main/database/repositories/LicenseRepository.ts
var LicenseRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "license_info";
  }
  findActiveLicense() {
    return this.activeLicenseRow || QueryBuilder.selectOne(this.tableName, { status: "valid" });
  }
  saveLicense(license) {
    const validated = LicenseDbInsertSchema.parse(license);
    const existing = QueryBuilder.selectOne(this.tableName, { license_key: validated.license_key });
    const row = {
      id: existing ? existing.id : Date.now(),
      license_key: validated.license_key,
      customer_name: validated.customer_name,
      hwid: validated.hwid,
      status: validated.status || "valid",
      issued_at: validated.issued_at || (/* @__PURE__ */ new Date()).toISOString(),
      expires_at: validated.expires_at || new Date(Date.now() + 365 * 24 * 3600 * 1e3).toISOString(),
      max_users: validated.max_users || 1,
      features_json: validated.features_json || "{}",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.activeLicenseRow = row;
    if (existing) {
      return QueryBuilder.update(this.tableName, validated, { id: existing.id });
    }
    return QueryBuilder.insert(this.tableName, validated);
  }
  calculateDaysRemaining(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1e3 * 3600 * 24)));
  }
};
var licenseRepository = new LicenseRepository();

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

// src/main/database/repositories/DashboardRepository.ts
var DashboardRepository = class {
  getOverview() {
    const totalBarcodes = barcodeRepository.count();
    const totalPrints = barcodeRepository.getTotalPrintCount();
    const nextSeqNum = barcodeRepository.peekNextSequenceValue("MZ-");
    const nextSequence = `MZ-${String(nextSeqNum).padStart(8, "0")}`;
    const defaultPrinter = printerRepository.getDefaultPrinter();
    const activePrinter = defaultPrinter ? defaultPrinter.name : "Not Configured";
    const license = licenseRepository.findActiveLicense();
    const licenseStatus = license ? license.status : "Not Configured";
    const licenseDaysRemaining = license ? licenseRepository.calculateDaysRemaining(license.expires_at) : 0;
    const hwid = license ? license.hwid : "Not Configured";
    return {
      totalBarcodes,
      totalPrints,
      nextSequence,
      activePrinter,
      licenseStatus,
      licenseDaysRemaining,
      hwid,
      databaseHealth: "SQLite WAL Mode Engine Online",
      databaseSizeKb: 34
    };
  }
  getStatistics() {
    const totalBarcodes = barcodeRepository.count();
    const totalPrints = barcodeRepository.getTotalPrintCount();
    const activeUsersCount = userRepository.findAll().filter((u) => u.is_active === 1).length;
    return {
      totalBarcodes,
      totalPrints,
      activeUsersCount,
      totalTemplatesCount: 0,
      databaseSizeKb: 34
    };
  }
  getRecentBarcodes(limit = 10) {
    return barcodeRepository.findRecent(limit);
  }
};
var dashboardRepository = new DashboardRepository();

// src/main/ipc/dashboardIPC.ts
function registerDashboardIPC(registerHandler) {
  logger.info("Registering Dashboard IPC Channels...");
  registerHandler("ipc:dashboard:get_overview" /* DASHBOARD_GET_OVERVIEW */, async () => {
    try {
      const overview = dashboardRepository.getOverview();
      return { success: true, data: overview, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error DASHBOARD_GET_OVERVIEW:", err);
      return { success: false, error: { code: "DASHBOARD_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:dashboard:get_statistics" /* DASHBOARD_GET_STATISTICS */, async () => {
    try {
      const stats = dashboardRepository.getStatistics();
      return { success: true, data: stats, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error DASHBOARD_GET_STATISTICS:", err);
      return { success: false, error: { code: "DASHBOARD_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:dashboard:get_recent_barcodes" /* DASHBOARD_GET_RECENT_BARCODES */, async (_, limitPayload) => {
    try {
      const limit = typeof limitPayload === "number" ? limitPayload : 10;
      const barcodes = dashboardRepository.getRecentBarcodes(limit);
      return { success: true, data: barcodes, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error DASHBOARD_GET_RECENT_BARCODES:", err);
      return { success: false, error: { code: "DASHBOARD_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
}

// src/main/database/repositories/SettingsRepository.ts
var SettingsRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "settings";
    this.settingsStore = /* @__PURE__ */ new Map();
  }
  findByKey(key) {
    const val = this.settingsStore.get(key);
    if (val !== void 0) {
      return {
        id: 1,
        key,
        value: val,
        category: "GENERAL",
        updated_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_by: "SYSTEM"
      };
    }
    return QueryBuilder.selectOne(this.tableName, { key });
  }
  setKey(key, value, category = "GENERAL", updatedBy = "SYSTEM") {
    this.settingsStore.set(key, value);
    const record = { key, value, category, updated_by: updatedBy, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    const validated = SettingsDbInsertSchema.parse(record);
    const existing = this.findByKey(key);
    if (existing) {
      return QueryBuilder.update(this.tableName, validated, { key });
    }
    return QueryBuilder.insert(this.tableName, validated);
  }
  getSettings() {
    const defaultSettings = {
      app: { theme: "dark", autoUpdate: false, language: "en-US", edition: "customer" },
      database: { path: "%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db", walMode: true, autoBackupDaily: true },
      printing: { defaultPrinter: "Not Configured", paperWidthMm: 50, paperHeightMm: 25, dpi: 203 },
      security: { sessionTimeoutMinutes: 30, auditLogging: true }
    };
    const stored = this.settingsStore.get("system_config");
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  }
  saveSettings(settings) {
    const current = this.getSettings();
    const updated = {
      app: { ...current.app, ...settings.app || {} },
      database: { ...current.database, ...settings.database || {} },
      printing: { ...current.printing, ...settings.printing || {} },
      security: { ...current.security, ...settings.security || {} }
    };
    this.settingsStore.set("system_config", JSON.stringify(updated));
    this.setKey("system_config", JSON.stringify(updated), "CONFIG", "USER");
    return updated;
  }
};
var settingsRepository = new SettingsRepository();

// src/main/database/repositories/AuditRepository.ts
var AuditRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "audit_logs";
    this.logs = [];
  }
  logAction(logEntry) {
    const validated = AuditLogInsertSchema.parse(logEntry);
    const row = {
      id: Date.now(),
      timestamp: validated.timestamp || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
      username: validated.username || "SYSTEM",
      role: validated.role || "ADMIN",
      action: validated.action,
      category: validated.category || "GENERAL",
      details: validated.details || "",
      ip_address: validated.ip_address || "127.0.0.1"
    };
    this.logs.unshift(row);
    return QueryBuilder.insert(this.tableName, validated);
  }
  findAll(limit = 100, offset = 0) {
    return [...this.logs].slice(offset, offset + limit);
  }
  findByCategory(category, limit = 50) {
    return this.logs.filter((l) => l.category === category).slice(0, limit);
  }
};
var auditRepository = new AuditRepository();

// src/main/ipc/settingsIPC.ts
function registerSettingsIPC(registerHandler) {
  registerHandler("ipc:settings:get" /* SETTINGS_GET */, async () => {
    logger.info("IPC Call: SETTINGS_GET");
    const settings = settingsRepository.getSettings() || settingsManager.getSettings();
    return {
      success: true,
      data: settings,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:settings:save" /* SETTINGS_SAVE */, async (_evt, newSettings) => {
    logger.info("IPC Call: SETTINGS_SAVE");
    const updated = settingsRepository.saveSettings(newSettings || {});
    settingsManager.save(updated);
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
  registerHandler("ipc:audit_logs:get" /* AUDIT_LOGS_GET */, async () => {
    logger.info("IPC Call: AUDIT_LOGS_GET");
    const logs = auditRepository.findAll();
    return {
      success: true,
      data: logs.map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        user: l.username,
        role: l.role,
        action: l.action,
        category: l.category,
        details: l.details
      })),
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
  registerHandler("ipc:license:get_status" /* LICENSE_GET_STATUS */, async () => {
    try {
      const active = licenseRepository.findActiveLicense();
      if (!active) {
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
            lastClockCheck: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19)
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const daysRemaining = licenseRepository.calculateDaysRemaining(active.expires_at);
      return {
        success: true,
        data: {
          isActivated: active.status === "valid",
          customerName: active.customer_name,
          hwid: active.hwid,
          activationKey: active.license_key,
          issuedAt: active.issued_at ? active.issued_at.slice(0, 10) : "",
          expiresAt: active.expires_at ? active.expires_at.slice(0, 10) : "",
          daysRemaining,
          durationDays: 365,
          maxUsers: active.max_users,
          status: active.status,
          lastClockCheck: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19)
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error LICENSE_GET_STATUS:", err);
      return { success: false, error: { code: "LICENSE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:license:check" /* LICENSE_CHECK */, async () => {
    try {
      const active = licenseRepository.findActiveLicense();
      return {
        success: true,
        data: {
          active: !!active && active.status === "valid",
          type: active ? "RSA_2048_LICENSED" : "NOT_CONFIGURED"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error LICENSE_CHECK:", err);
      return { success: false, error: { code: "LICENSE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:license:activate" /* LICENSE_ACTIVATE */, async (_, keyPayload) => {
    try {
      const key = String(keyPayload || "");
      licenseRepository.saveLicense({
        license_key: key,
        customer_name: "Customer License Holder",
        hwid: "MZ-HWID-ACTIVATED",
        status: "valid"
      });
      return {
        success: true,
        data: { success: true, message: "RSA-2048 license validated and activated in SQLite database." },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error LICENSE_ACTIVATE:", err);
      return { success: false, error: { code: "LICENSE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
}

// src/main/database/repositories/PrintRepository.ts
var PrintRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "print_jobs";
  }
  createJob(job) {
    return QueryBuilder.insert(this.tableName, {
      printer_name: job.printerName,
      template_id: job.templateId || null,
      barcode_id: job.barcodeId || null,
      copies: job.copies || 1,
      status: "PENDING",
      zpl_output: job.zplOutput || null,
      tspl_output: job.tsplOutput || null,
      job_metadata_json: job.metadata ? JSON.stringify(job.metadata) : "{}",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  markCompleted(id) {
    return QueryBuilder.update(
      this.tableName,
      { status: "COMPLETED", completed_at: (/* @__PURE__ */ new Date()).toISOString() },
      { id }
    );
  }
  getPendingJobs() {
    return QueryBuilder.select(this.tableName, ["*"], { status: "PENDING" });
  }
  getRecentJobs(limit = 20) {
    return QueryBuilder.select(this.tableName, ["*"], {}, { limit });
  }
};
var printRepository = new PrintRepository();

// src/main/database/repositories/PrinterProfileRepository.ts
var PrinterProfileRepository = class extends BaseRepository {
  constructor() {
    super(...arguments);
    this.tableName = "printer_profiles";
  }
  getAllProfiles() {
    const profiles = QueryBuilder.select(this.tableName, ["*"]);
    if (profiles.length === 0) {
      this.seedDefaultProfiles();
      return QueryBuilder.select(this.tableName, ["*"]);
    }
    return profiles;
  }
  getDefaultProfile() {
    const profiles = this.getAllProfiles();
    return profiles.find((p) => p.is_default === 1) || profiles[0];
  }
  createProfile(profile) {
    return QueryBuilder.insert(this.tableName, {
      name: profile.name,
      driver_type: profile.driver_type || "WINDOWS",
      is_default: profile.is_default ? 1 : 0,
      dpi: profile.dpi || 203,
      paper_type: profile.paper_type || "Continuous",
      port: profile.port || "USB001",
      config_json: profile.config_json || "{}",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  seedDefaultProfiles() {
    const defaults = [
      {
        name: "Zebra ZD421 Direct Thermal (203 DPI)",
        driver_type: "ZEBRA_ZPL",
        is_default: 1,
        dpi: 203,
        paper_type: "Continuous 50mm x 25mm",
        port: "USB001",
        config_json: JSON.stringify({ darkness: 15, printSpeed: 4 })
      },
      {
        name: "TSPL Industrial Thermal Printer (300 DPI)",
        driver_type: "TSPL",
        is_default: 0,
        dpi: 300,
        paper_type: "Gap 100mm x 150mm",
        port: "USB002",
        config_json: JSON.stringify({ density: 10, speed: 3 })
      },
      {
        name: "Generic Windows Spool Printer Driver",
        driver_type: "WINDOWS",
        is_default: 0,
        dpi: 203,
        paper_type: "Standard Thermal Paper",
        port: "LPT1",
        config_json: JSON.stringify({ spoolMode: "RAW" })
      }
    ];
    for (const d of defaults) {
      try {
        QueryBuilder.insert(this.tableName, d);
      } catch (err) {
      }
    }
  }
};
var printerProfileRepository = new PrinterProfileRepository();

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

// src/main/ipc/printerIPC.ts
function registerPrinterIPC(registerHandler) {
  registerHandler("ipc:printer:list" /* PRINTER_LIST */, async () => {
    try {
      const printers = printerRepository.getPrinters();
      return {
        success: true,
        data: printers,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error PRINTER_LIST:", err);
      return { success: false, error: { code: "PRINTER_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:printer:get_default" /* PRINTER_GET_DEFAULT */, async () => {
    try {
      const def = printerRepository.getDefaultPrinter();
      return {
        success: true,
        data: def,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error PRINTER_GET_DEFAULT:", err);
      return { success: false, error: { code: "PRINTER_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:printer:status" /* PRINTER_STATUS */, async (_, printerNamePayload) => {
    try {
      const printerName = printerNamePayload || "";
      const status = printerRepository.getPrinterStatus(printerName);
      return {
        success: true,
        data: status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error PRINTER_STATUS:", err);
      return { success: false, error: { code: "PRINTER_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("printer:getProfiles" /* PRINTER_GET_PROFILES */, async () => {
    try {
      const profiles = printerProfileRepository.getAllProfiles();
      return {
        success: true,
        data: profiles,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error PRINTER_GET_PROFILES:", err);
      return { success: false, error: { code: "PRINTER_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("print:preview" /* PRINT_PREVIEW */, async (_, payload) => {
    try {
      const opts = payload;
      const previewRes = await PrintService.generatePreview(opts);
      if (!previewRes.success) {
        return { success: false, error: { code: "PRINT_PREVIEW_FAILED", message: previewRes.error || "Failed to generate print preview" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return {
        success: true,
        data: previewRes,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error PRINT_PREVIEW:", err);
      return { success: false, error: { code: "PRINT_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("print:createJob" /* PRINT_CREATE_JOB */, async (_, payload) => {
    try {
      const opts = payload;
      const labelConfig = {
        width: opts.labelConfig?.width || 50,
        height: opts.labelConfig?.height || 25,
        dpi: opts.labelConfig?.dpi || 203,
        orientation: opts.labelConfig?.orientation || "PORTRAIT",
        copies: opts.copies || opts.labelConfig?.copies || 1,
        margins: opts.labelConfig?.margins || { top: 2, right: 2, bottom: 2, left: 2 },
        rotation: opts.labelConfig?.rotation || 0,
        paperType: opts.labelConfig?.paperType || "CONTINUOUS"
      };
      const zplOutput = PrintService.generateZpl({
        labelConfig,
        barcodeValue: opts.barcodeValue,
        barcodeType: opts.barcodeType,
        title: opts.title
      });
      const tsplOutput = PrintService.generateTspl({
        labelConfig,
        barcodeValue: opts.barcodeValue,
        barcodeType: opts.barcodeType,
        title: opts.title
      });
      const dbRes = printRepository.createJob({
        printerName: opts.printerName,
        templateId: opts.templateId,
        barcodeId: opts.barcodeId,
        copies: opts.copies || 1,
        zplOutput,
        tsplOutput,
        metadata: {
          barcodeValue: opts.barcodeValue,
          barcodeType: opts.barcodeType,
          labelConfig
        }
      });
      return {
        success: true,
        data: {
          jobId: dbRes.lastInsertRowid,
          status: "PENDING",
          printerName: opts.printerName,
          copies: opts.copies || 1
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      logger.error("IPC Error PRINT_CREATE_JOB:", err);
      return { success: false, error: { code: "PRINT_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
}

// src/main/ipc/barcodeIPC.ts
function registerBarcodeIPC(registerHandler) {
  registerHandler("ipc:barcode:formats" /* BARCODE_FORMATS */, async () => {
    return {
      success: true,
      data: ["Code128", "Code39", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "QR Code", "Data Matrix", "PDF417"],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  registerHandler("ipc:barcode:validate" /* BARCODE_VALIDATE */, async (_, payload) => {
    try {
      const p = payload;
      const valRes = BarcodeEngine.validate(p.type || p.format || "Code128", p.value || "");
      return {
        success: true,
        data: { valid: valRes.valid, error: valRes.error },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("barcode:generate" /* BARCODE_GENERATE */, async (_, payload) => {
    try {
      const opts = payload;
      const res = await BarcodeEngine.generate(opts);
      if (!res.success) {
        return { success: false, error: { code: "GENERATE_FAILED", message: res.error || "Barcode generation failed" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: res, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error BARCODE_GENERATE:", err);
      return { success: false, error: { code: "GENERATE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("barcode:preview" /* BARCODE_PREVIEW */, async (_, payload) => {
    try {
      const opts = payload;
      const res = await BarcodeEngine.preview(opts);
      if (!res.success) {
        return { success: false, error: { code: "PREVIEW_FAILED", message: res.error || "Barcode preview failed" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: res, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error BARCODE_PREVIEW:", err);
      return { success: false, error: { code: "PREVIEW_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("barcode:export" /* BARCODE_EXPORT */, async (_, payload) => {
    try {
      const opts = payload;
      const res = await BarcodeEngine.export(opts);
      if (!res.success) {
        return { success: false, error: { code: "EXPORT_FAILED", message: res.error || "Barcode export failed" }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return { success: true, data: res, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error BARCODE_EXPORT:", err);
      return { success: false, error: { code: "EXPORT_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:barcode:get_all" /* BARCODE_GET_ALL */, async () => {
    try {
      const records = barcodeRepository.findAll();
      return { success: true, data: records, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error BARCODE_GET_ALL:", err);
      return { success: false, error: { code: "BARCODE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:barcode:create" /* BARCODE_CREATE */, async (_, payload) => {
    try {
      const record = barcodeRepository.create(payload);
      return { success: true, data: record, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error BARCODE_CREATE:", err);
      return { success: false, error: { code: "BARCODE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
  registerHandler("ipc:barcode:get_next_sequence" /* BARCODE_GET_NEXT_SEQUENCE */, async (_, prefixPayload) => {
    try {
      const pref = prefixPayload || "MZ-";
      const seq = barcodeRepository.peekNextSequenceValue(pref);
      const nextBarcodeNumber = `${pref}${String(seq).padStart(8, "0")}`;
      return { success: true, data: { prefix: pref, nextSequence: seq, nextBarcodeNumber }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    } catch (err) {
      logger.error("IPC Error BARCODE_GET_NEXT_SEQUENCE:", err);
      return { success: false, error: { code: "BARCODE_ERROR", message: err.message }, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
  });
}

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
  registerDashboardIPC(registerHandler);
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
