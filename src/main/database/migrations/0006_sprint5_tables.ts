export const migration0006 = {
  version: 6,
  name: '0006_sprint5_tables',
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
  `,
};
