import { SQLiteConnection } from '../connection';

export const migration0008 = {
  version: 8,
  name: '0008_fix_print_jobs_schema',
  up: (db: SQLiteConnection) => {
    const tableExists = db.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='print_jobs'"
    );
    if (!tableExists) {
      db.exec(`
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
      `);
      return;
    }

    const columns = db.all<{ name: string }>("PRAGMA table_info('print_jobs')").map((col) => col.name);

    if (!columns.includes('zpl_output')) {
      db.exec('ALTER TABLE print_jobs ADD COLUMN zpl_output TEXT;');
    }
    if (!columns.includes('tspl_output')) {
      db.exec('ALTER TABLE print_jobs ADD COLUMN tspl_output TEXT;');
    }
    if (!columns.includes('job_metadata_json')) {
      db.exec("ALTER TABLE print_jobs ADD COLUMN job_metadata_json TEXT DEFAULT '{}';");
    }
  },
  down: (_db: SQLiteConnection) => {
    // Migration rollback handler
  },
};
