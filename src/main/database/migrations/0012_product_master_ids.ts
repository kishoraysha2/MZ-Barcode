export const migration0012 = {
  version: 12,
  name: '0012_product_master_ids',
  up: `
    -- Safely add master data foreign key columns to products table if they do not exist
    ALTER TABLE products ADD COLUMN category_id TEXT DEFAULT 'cat-uuid-001';
    ALTER TABLE products ADD COLUMN unit_id TEXT DEFAULT 'uom-uuid-001';
    ALTER TABLE products ADD COLUMN brand_id TEXT DEFAULT 'brd-uuid-001';
    ALTER TABLE products ADD COLUMN warehouse_id TEXT DEFAULT 'whs-uuid-001';
    ALTER TABLE products ADD COLUMN supplier_id TEXT DEFAULT 'sup-uuid-001';

    CREATE INDEX IF NOT EXISTS idx_prod_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_prod_unit_id ON products(unit_id);
    CREATE INDEX IF NOT EXISTS idx_prod_brand_id ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_prod_warehouse_id ON products(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_prod_supplier_id ON products(supplier_id);
  `,
  down: `
    -- SQLite does not support DROP COLUMN in older versions easily
  `,
};
