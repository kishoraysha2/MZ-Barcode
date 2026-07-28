import { Migration } from './index';

/**
 * Migration 0013: Deprecate Legacy Categories Table
 *
 * Migrates any remaining custom entries from legacy `categories` into `master_categories`,
 * and drops the legacy `categories` table safely.
 */
export const migration0013: Migration = {
  version: 13,
  name: '0013_deprecate_legacy_categories',
  up: `
    INSERT OR IGNORE INTO master_categories (
      id,
      name,
      code,
      description,
      sort_order,
      is_active,
      created_at,
      updated_at,
      created_by,
      updated_by
    )
    SELECT
      'cat-legacy-' || CAST(id AS TEXT),
      name,
      'CAT-LEG-' || CAST(id AS TEXT),
      COALESCE(description, ''),
      COALESCE(sort_order, 0),
      COALESCE(is_active, 1),
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(updated_at, CURRENT_TIMESTAMP),
      COALESCE(created_by, 'SYSTEM'),
      COALESCE(updated_by, 'SYSTEM')
    FROM categories
    WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='categories');

    DROP TABLE IF EXISTS categories;
  `,
  down: `
    -- Recreate legacy categories table if rolling back
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
  `,
};
