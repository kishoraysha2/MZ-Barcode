export const migration0009 = {
  version: 9,
  name: '0009_scan_history',
  up: `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      sku TEXT UNIQUE,
      internal_code TEXT UNIQUE,
      category TEXT DEFAULT 'General',
      price REAL DEFAULT 0.00,
      stock INTEGER DEFAULT 0,
      location TEXT DEFAULT 'Warehouse A',
      image_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scan_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      product_id INTEGER,
      scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT DEFAULT 'SYSTEM',
      device_name TEXT DEFAULT 'USB HID Scanner',
      status TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_internal_code ON products(internal_code);
    CREATE INDEX IF NOT EXISTS idx_scan_history_barcode ON scan_history(barcode);
    CREATE INDEX IF NOT EXISTS idx_scan_history_scan_time ON scan_history(scan_time);

    -- Seed sample products for testing
    INSERT OR IGNORE INTO products (id, name, barcode, sku, internal_code, category, price, stock, location)
    VALUES 
      (1, 'Enterprise Thermal Barcode Label Printer', 'MZ-88492014', 'SKU-PRN-8849', 'INT-88492014', 'HARDWARE', 349.99, 18, 'Aisle 4 - Shelf B'),
      (2, 'Standard Shipping Label Roll (100x50mm)', 'MZ-10000001', 'SKU-LBL-10050', 'INT-10000001', 'SUPPLIES', 24.50, 142, 'Aisle 1 - Shelf A'),
      (3, 'Wireless USB Barcode Scanner Wedge', 'MZ-10000002', 'SKU-SCN-0002', 'INT-10000002', 'HARDWARE', 89.00, 35, 'Aisle 4 - Shelf C'),
      (4, 'Asset Tag Heavy Duty Polymer Roll', 'MZ-10000003', 'SKU-AST-5025', 'INT-10000003', 'SUPPLIES', 42.00, 80, 'Aisle 2 - Shelf B'),
      (5, 'Industrial QR Asset Code Tag', '100012345', 'SKU-QR-10001', 'INT-100012345', 'ASSET', 12.99, 500, 'Aisle 3 - Shelf D');
  `,
  down: `
    DROP TABLE IF EXISTS scan_history;
    DROP TABLE IF EXISTS products;
  `,
};
