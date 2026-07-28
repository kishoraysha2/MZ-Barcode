export const migration0010 = {
  version: 10,
  name: '0010_categories',
  up: `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );

    CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
    CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order, name);

    INSERT OR IGNORE INTO categories (name, description, sort_order) VALUES
      ('GENERAL', 'General uncategorized items', 1),
      ('HARDWARE', 'Physical equipment and hardware devices', 2),
      ('SUPPLIES', 'Consumables, packaging, and office supplies', 3),
      ('ASSET', 'Fixed company assets and serialized tools', 4),
      ('ELECTRONICS', 'Electronic parts and gadgets', 5),
      ('ACCESSORIES', 'Peripherals and auxiliary accessories', 6);
  `,
  down: `
    DROP TABLE IF EXISTS categories;
  `,
};
