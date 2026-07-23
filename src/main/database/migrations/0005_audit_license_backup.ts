export const migration0005 = {
  version: 5,
  name: '0005_audit_license_backup',
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
  `,
};
