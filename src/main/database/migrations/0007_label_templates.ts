export const migration0007 = {
  version: 7,
  name: '0007_label_templates',
  up: `
    CREATE TABLE IF NOT EXISTS label_templates_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'CUSTOM',
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      margin_top_mm REAL NOT NULL DEFAULT 0,
      margin_bottom_mm REAL NOT NULL DEFAULT 0,
      margin_left_mm REAL NOT NULL DEFAULT 0,
      margin_right_mm REAL NOT NULL DEFAULT 0,
      padding_mm REAL NOT NULL DEFAULT 0,
      gap_mm REAL NOT NULL DEFAULT 0,
      orientation TEXT NOT NULL DEFAULT 'PORTRAIT',
      dpi INTEGER NOT NULL DEFAULT 203,
      is_system INTEGER NOT NULL DEFAULT 0,
      is_default INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );

    CREATE TABLE IF NOT EXISTS label_templates (
      id TEXT PRIMARY KEY,
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

    INSERT OR IGNORE INTO label_templates_new (id, name, width_mm, height_mm, dpi, is_default, is_active, created_at, updated_at, created_by, updated_by)
    SELECT CAST(id AS TEXT), name, width_mm, height_mm, dpi, is_default, is_active, created_at, updated_at, created_by, updated_by
    FROM label_templates;

    DROP TABLE IF EXISTS label_templates;
    ALTER TABLE label_templates_new RENAME TO label_templates;

    CREATE TABLE IF NOT EXISTS label_elements (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      element_type TEXT NOT NULL,
      name TEXT NOT NULL,
      x_mm REAL NOT NULL,
      y_mm REAL NOT NULL,
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      z_index INTEGER NOT NULL DEFAULT 0,
      rotation REAL NOT NULL DEFAULT 0,
      alignment TEXT NOT NULL DEFAULT 'LEFT',
      is_locked INTEGER NOT NULL DEFAULT 0,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      is_printable INTEGER NOT NULL DEFAULT 1,
      group_id TEXT,
      properties_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES label_templates(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_label_templates_name ON label_templates(name);
    CREATE INDEX IF NOT EXISTS idx_label_templates_category ON label_templates(category);
    CREATE INDEX IF NOT EXISTS idx_label_elements_template_id ON label_elements(template_id);
  `,
  down: `
    DROP TABLE IF EXISTS label_elements;
    DROP TABLE IF EXISTS label_templates;
  `,
};
