import { BaseRepository } from './BaseRepository';
import { dbConnection } from '../connection';
import { CategoryInfo, CreateCategoryPayload, UpdateCategoryPayload } from '../../../shared/categoryTypes';

export interface CategoryRow {
  id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

/**
 * @deprecated Use `BaseMasterRepository('categories')` operating on `master_categories`.
 * Legacy repository retained for backwards-compatibility or rollback scenarios.
 */
export class CategoryRepository extends BaseRepository<CategoryRow> {
  protected tableName = 'categories';

  public findAllCategories(includeInactive = false): CategoryInfo[] {
    try {
      const sql = includeInactive
        ? `SELECT * FROM categories ORDER BY sort_order ASC, name ASC;`
        : `SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC;`;

      const rows = dbConnection.all<CategoryRow>(sql);
      return rows.map((r) => this.mapRowToCategory(r));
    } catch (err) {
      console.error('[CategoryRepository] findAllCategories error:', err);
      return [];
    }
  }

  public findCategoryById(id: number): CategoryInfo | null {
    try {
      const row = dbConnection.get<CategoryRow>(`SELECT * FROM categories WHERE id = ? LIMIT 1;`, [id]);
      return row ? this.mapRowToCategory(row) : null;
    } catch (err) {
      console.error('[CategoryRepository] findCategoryById error:', err);
      return null;
    }
  }

  public findCategoryByName(name: string): CategoryInfo | null {
    try {
      const row = dbConnection.get<CategoryRow>(
        `SELECT * FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1;`,
        [name.trim()]
      );
      return row ? this.mapRowToCategory(row) : null;
    } catch (err) {
      console.error('[CategoryRepository] findCategoryByName error:', err);
      return null;
    }
  }

  public createCategory(payload: CreateCategoryPayload): CategoryInfo {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new Error('Category name is required.');
    }

    // Check duplicate category name (case-insensitive)
    const existing = this.findCategoryByName(trimmedName);
    if (existing) {
      throw new Error(`Category "${trimmedName}" already exists.`);
    }

    const sortOrder = payload.sortOrder !== undefined ? payload.sortOrder : 0;
    const isActive = payload.isActive !== false ? 1 : 0;
    const description = payload.description?.trim() || '';
    const createdBy = payload.createdBy || 'SYSTEM';

    const res = dbConnection.run(
      `INSERT INTO categories (name, description, sort_order, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [trimmedName, description, sortOrder, isActive, createdBy, createdBy]
    );

    const insertedId = Number(res.lastInsertRowid);
    const created = this.findCategoryById(insertedId);
    if (!created) {
      throw new Error('Failed to retrieve newly created category.');
    }
    return created;
  }

  public updateCategory(id: number, payload: UpdateCategoryPayload): CategoryInfo {
    const existing = this.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    let name = existing.name;
    if (payload.name !== undefined) {
      const trimmedName = payload.name.trim();
      if (!trimmedName) {
        throw new Error('Category name cannot be empty.');
      }
      // Check duplicate category name if name changed
      const dup = dbConnection.get<CategoryRow>(
        `SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ? LIMIT 1;`,
        [trimmedName, id]
      );
      if (dup) {
        throw new Error(`Category name "${trimmedName}" already exists.`);
      }
      name = trimmedName;
    }

    const description = payload.description !== undefined ? payload.description.trim() : existing.description || '';
    const sortOrder = payload.sortOrder !== undefined ? payload.sortOrder : existing.sortOrder;
    const isActive = payload.isActive !== undefined ? (payload.isActive ? 1 : 0) : existing.isActive ? 1 : 0;
    const updatedBy = payload.updatedBy || 'SYSTEM';
    const now = new Date().toISOString();

    dbConnection.run(
      `UPDATE categories
       SET name = ?, description = ?, sort_order = ?, is_active = ?, updated_by = ?, updated_at = ?
       WHERE id = ?;`,
      [name, description, sortOrder, isActive, updatedBy, now, id]
    );

    const updated = this.findCategoryById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated category.');
    }
    return updated;
  }

  public deleteCategory(id: number): boolean {
    const existing = this.findCategoryById(id);
    if (!existing) {
      return false;
    }
    const res = dbConnection.run(`DELETE FROM categories WHERE id = ?;`, [id]);
    return res.changes > 0;
  }

  private mapRowToCategory(r: CategoryRow): CategoryInfo {
    return {
      id: r.id,
      name: r.name,
      description: r.description || '',
      sortOrder: r.sort_order ?? 0,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      createdBy: r.created_by,
      updatedBy: r.updated_by,
    };
  }
}

export const categoryRepository = new CategoryRepository();
