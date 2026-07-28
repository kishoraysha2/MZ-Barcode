export const migration0011 = {
  version: 11,
  name: '0011_enterprise_master_data',
  up: `
    -- Categories Table
    CREATE TABLE IF NOT EXISTS master_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );
    CREATE INDEX IF NOT EXISTS idx_mcat_name ON master_categories(name);
    CREATE INDEX IF NOT EXISTS idx_mcat_code ON master_categories(code);

    -- Units Table
    CREATE TABLE IF NOT EXISTS master_units (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );
    CREATE INDEX IF NOT EXISTS idx_munit_name ON master_units(name);
    CREATE INDEX IF NOT EXISTS idx_munit_code ON master_units(code);

    -- Brands Table
    CREATE TABLE IF NOT EXISTS master_brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );
    CREATE INDEX IF NOT EXISTS idx_mbrand_name ON master_brands(name);
    CREATE INDEX IF NOT EXISTS idx_mbrand_code ON master_brands(code);

    -- Warehouses Table
    CREATE TABLE IF NOT EXISTS master_warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );
    CREATE INDEX IF NOT EXISTS idx_mwhs_name ON master_warehouses(name);
    CREATE INDEX IF NOT EXISTS idx_mwhs_code ON master_warehouses(code);

    -- Suppliers Table
    CREATE TABLE IF NOT EXISTS master_suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT DEFAULT 'SYSTEM',
      updated_by TEXT DEFAULT 'SYSTEM'
    );
    CREATE INDEX IF NOT EXISTS idx_msup_name ON master_suppliers(name);
    CREATE INDEX IF NOT EXISTS idx_msup_code ON master_suppliers(code);

    -- Seed Initial Enterprise Master Data with UUIDs
    INSERT OR IGNORE INTO master_categories (id, name, code, description, sort_order) VALUES
      ('cat-uuid-001', 'General', 'CAT-GEN', 'General uncategorized items', 1),
      ('cat-uuid-002', 'Hardware', 'CAT-HWD', 'Physical equipment and hardware tools', 2),
      ('cat-uuid-003', 'Supplies', 'CAT-SUP', 'Consumables, packaging, and office supplies', 3),
      ('cat-uuid-004', 'Electronics', 'CAT-ELE', 'Electronic parts and components', 4),
      ('cat-uuid-005', 'Accessories', 'CAT-ACC', 'Auxiliary parts and peripheral accessories', 5);

    INSERT OR IGNORE INTO master_units (id, name, code, description, sort_order) VALUES
      ('uom-uuid-001', 'Pieces', 'PCS', 'Individual count units', 1),
      ('uom-uuid-002', 'Boxes', 'BOX', 'Box container packs', 2),
      ('uom-uuid-003', 'Kilograms', 'KG', 'Weight measurement in kilograms', 3),
      ('uom-uuid-004', 'Meters', 'MTR', 'Length measurement in meters', 4),
      ('uom-uuid-005', 'Sets', 'SET', 'Assembled set packs', 5);

    INSERT OR IGNORE INTO master_brands (id, name, code, description, sort_order) VALUES
      ('brd-uuid-001', 'MZ Enterprise', 'MZ-ENT', 'Primary house brand products', 1),
      ('brd-uuid-002', 'LogiTech Pro', 'LOGI', 'Hardware and scanner equipment', 2),
      ('brd-uuid-003', 'Zebra Tech', 'ZEBRA', 'Thermal printers and barcode tech', 3),
      ('brd-uuid-004', 'Honeywell', 'HNW', 'Industrial scanner devices', 4);

    INSERT OR IGNORE INTO master_warehouses (id, name, code, description, sort_order) VALUES
      ('whs-uuid-001', 'Main Central Warehouse', 'WHS-MAIN', 'Primary distribution facility and hub', 1),
      ('whs-uuid-002', 'North Storage Annex', 'WHS-NTH', 'Secondary overflow regional storage', 2),
      ('whs-uuid-003', 'Retail Front Depot', 'WHS-RTL', 'Storefront quick pick inventory depot', 3);

    INSERT OR IGNORE INTO master_suppliers (id, name, code, description, sort_order) VALUES
      ('sup-uuid-001', 'Apex Logistics & Supply', 'SUP-APEX', 'Primary raw materials supplier', 1),
      ('sup-uuid-002', 'Global Barcode Systems', 'SUP-GBS', 'Hardware and printer media partner', 2),
      ('sup-uuid-003', 'Omni Components Ltd', 'SUP-OMNI', 'Electronics and component distributor', 3);
  `,
  down: `
    DROP TABLE IF EXISTS master_suppliers;
    DROP TABLE IF EXISTS master_warehouses;
    DROP TABLE IF EXISTS master_brands;
    DROP TABLE IF EXISTS master_units;
    DROP TABLE IF EXISTS master_categories;
  `,
};
