export const migration0004 = {
  version: 4,
  name: '0004_templates_printers',
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
  `,
};
