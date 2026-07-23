export const migration0003 = {
  version: 3,
  name: '0003_barcodes',
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
  `,
};
