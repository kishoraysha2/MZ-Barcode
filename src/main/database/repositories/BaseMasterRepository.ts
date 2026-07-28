import { dbConnection } from '../connection';
import { MasterEntity, CreateMasterPayload, UpdateMasterPayload, MasterModuleName, MASTER_MODULE_CONFIGS } from '../../../shared/masterTypes';
import { auditRepository } from './AuditRepository';
import crypto from 'crypto';

export interface MasterRow {
  id: string;
  name: string;
  code: string;
  description: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface UserContext {
  username?: string;
  role?: string;
  ipAddress?: string;
}

export class BaseMasterRepository {
  protected tableName: string;
  protected moduleName: MasterModuleName;

  constructor(moduleName: MasterModuleName) {
    this.moduleName = moduleName;
    this.tableName = MASTER_MODULE_CONFIGS[moduleName].tableName;
  }

  protected mapRowToEntity(row: MasterRow): MasterEntity {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description || '',
      sortOrder: row.sort_order ?? 0,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by || 'SYSTEM',
      updatedBy: row.updated_by || 'SYSTEM',
    };
  }

  public getAll(includeInactive = true): MasterEntity[] {
    try {
      const sql = includeInactive
        ? `SELECT * FROM ${this.tableName} ORDER BY sort_order ASC, name ASC;`
        : `SELECT * FROM ${this.tableName} WHERE is_active = 1 ORDER BY sort_order ASC, name ASC;`;
      const rows = dbConnection.all<MasterRow>(sql);
      return rows.map((r) => this.mapRowToEntity(r));
    } catch (err) {
      console.error(`[BaseMasterRepository:${this.tableName}] getAll error:`, err);
      return [];
    }
  }

  public getActive(): MasterEntity[] {
    return this.getAll(false);
  }

  public findById(id: string): MasterEntity | null {
    try {
      const row = dbConnection.get<MasterRow>(
        `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1;`,
        [id]
      );
      return row ? this.mapRowToEntity(row) : null;
    } catch (err) {
      console.error(`[BaseMasterRepository:${this.tableName}] findById error:`, err);
      return null;
    }
  }

  public findByName(name: string): MasterEntity | null {
    if (!name) return null;
    try {
      const row = dbConnection.get<MasterRow>(
        `SELECT * FROM ${this.tableName} WHERE LOWER(name) = LOWER(?) LIMIT 1;`,
        [name.trim()]
      );
      return row ? this.mapRowToEntity(row) : null;
    } catch (err) {
      console.error(`[BaseMasterRepository:${this.tableName}] findByName error:`, err);
      return null;
    }
  }

  public findByCode(code: string): MasterEntity | null {
    if (!code) return null;
    try {
      const row = dbConnection.get<MasterRow>(
        `SELECT * FROM ${this.tableName} WHERE LOWER(code) = LOWER(?) LIMIT 1;`,
        [code.trim()]
      );
      return row ? this.mapRowToEntity(row) : null;
    } catch (err) {
      console.error(`[BaseMasterRepository:${this.tableName}] findByCode error:`, err);
      return null;
    }
  }

  public checkDuplicate(name: string, code: string, excludeId?: string): { nameExists: boolean; codeExists: boolean } {
    const trimmedName = (name || '').trim();
    const trimmedCode = (code || '').trim();

    let nameSql = `SELECT id FROM ${this.tableName} WHERE LOWER(name) = LOWER(?)`;
    let codeSql = `SELECT id FROM ${this.tableName} WHERE LOWER(code) = LOWER(?)`;
    const nameParams: any[] = [trimmedName];
    const codeParams: any[] = [trimmedCode];

    if (excludeId) {
      nameSql += ` AND id != ?`;
      codeSql += ` AND id != ?`;
      nameParams.push(excludeId);
      codeParams.push(excludeId);
    }

    nameSql += ` LIMIT 1;`;
    codeSql += ` LIMIT 1;`;

    const nameMatch = dbConnection.get(nameSql, nameParams);
    const codeMatch = dbConnection.get(codeSql, codeParams);

    return {
      nameExists: Boolean(nameMatch),
      codeExists: Boolean(codeMatch),
    };
  }

  public create(payload: CreateMasterPayload, userContext?: UserContext): MasterEntity {
    const trimmedName = (payload.name || '').trim();
    const trimmedCode = (payload.code || '').trim().toUpperCase();

    if (!trimmedName) {
      throw new Error(`${MASTER_MODULE_CONFIGS[this.moduleName].singularName} name is required.`);
    }
    if (!trimmedCode) {
      throw new Error(`${MASTER_MODULE_CONFIGS[this.moduleName].singularName} code is required.`);
    }

    const dup = this.checkDuplicate(trimmedName, trimmedCode);
    if (dup.nameExists) {
      throw new Error(`Name "${trimmedName}" already exists.`);
    }
    if (dup.codeExists) {
      throw new Error(`Code "${trimmedCode}" already exists.`);
    }

    const uuid = crypto.randomUUID ? crypto.randomUUID() : `${this.moduleName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const description = (payload.description || '').trim();
    const sortOrder = payload.sortOrder !== undefined ? Number(payload.sortOrder) : 0;
    const isActive = payload.isActive !== false ? 1 : 0;
    const username = userContext?.username || 'SYSTEM';
    const role = userContext?.role || 'ADMIN';
    const now = new Date().toISOString();

    dbConnection.run(
      `INSERT INTO ${this.tableName} (id, name, code, description, sort_order, is_active, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [uuid, trimmedName, trimmedCode, description, sortOrder, isActive, now, now, username, username]
    );

    const created = this.findById(uuid);
    if (!created) {
      throw new Error(`Failed to create ${MASTER_MODULE_CONFIGS[this.moduleName].singularName}.`);
    }

    // Write Audit Log
    try {
      auditRepository.logAction({
        username,
        role,
        action: `MASTER_CREATE_${this.moduleName.toUpperCase()}`,
        category: 'MASTER_DATA',
        details: `Created ${MASTER_MODULE_CONFIGS[this.moduleName].singularName}: ${created.name} (${created.code}) [ID: ${created.id}]`,
        ip_address: userContext?.ipAddress || '127.0.0.1',
      });
    } catch (auditErr) {
      console.error('Audit logging failed:', auditErr);
    }

    return created;
  }

  public update(id: string, payload: UpdateMasterPayload, userContext?: UserContext): MasterEntity {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`${MASTER_MODULE_CONFIGS[this.moduleName].singularName} with ID "${id}" not found.`);
    }

    let name = existing.name;
    let code = existing.code;

    if (payload.name !== undefined) {
      const trimmedName = payload.name.trim();
      if (!trimmedName) throw new Error('Name cannot be empty.');
      name = trimmedName;
    }

    if (payload.code !== undefined) {
      const trimmedCode = payload.code.trim().toUpperCase();
      if (!trimmedCode) throw new Error('Code cannot be empty.');
      code = trimmedCode;
    }

    const dup = this.checkDuplicate(name, code, id);
    if (payload.name !== undefined && dup.nameExists) {
      throw new Error(`Name "${name}" already exists.`);
    }
    if (payload.code !== undefined && dup.codeExists) {
      throw new Error(`Code "${code}" already exists.`);
    }

    const description = payload.description !== undefined ? payload.description.trim() : existing.description;
    const sortOrder = payload.sortOrder !== undefined ? Number(payload.sortOrder) : existing.sortOrder;
    const isActive = payload.isActive !== undefined ? (payload.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);
    const username = userContext?.username || 'SYSTEM';
    const role = userContext?.role || 'ADMIN';
    const now = new Date().toISOString();

    dbConnection.run(
      `UPDATE ${this.tableName}
       SET name = ?, code = ?, description = ?, sort_order = ?, is_active = ?, updated_at = ?, updated_by = ?
       WHERE id = ?;`,
      [name, code, description, sortOrder, isActive, now, username, id]
    );

    const updated = this.findById(id);
    if (!updated) {
      throw new Error(`Failed to update ${MASTER_MODULE_CONFIGS[this.moduleName].singularName}.`);
    }

    // Write Audit Log
    try {
      auditRepository.logAction({
        username,
        role,
        action: `MASTER_UPDATE_${this.moduleName.toUpperCase()}`,
        category: 'MASTER_DATA',
        details: `Updated ${MASTER_MODULE_CONFIGS[this.moduleName].singularName}: ${updated.name} (${updated.code}) [ID: ${updated.id}]`,
        ip_address: userContext?.ipAddress || '127.0.0.1',
      });
    } catch (auditErr) {
      console.error('Audit logging failed:', auditErr);
    }

    return updated;
  }

  public enable(id: string, userContext?: UserContext): MasterEntity {
    return this.update(id, { isActive: true }, userContext);
  }

  public disable(id: string, userContext?: UserContext): MasterEntity {
    return this.update(id, { isActive: false }, userContext);
  }

  public delete(id: string, userContext?: UserContext): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    dbConnection.run(`DELETE FROM ${this.tableName} WHERE id = ?;`, [id]);

    const username = userContext?.username || 'SYSTEM';
    const role = userContext?.role || 'OWNER';

    // Write Audit Log
    try {
      auditRepository.logAction({
        username,
        role,
        action: `MASTER_DELETE_${this.moduleName.toUpperCase()}`,
        category: 'MASTER_DATA',
        details: `Deleted ${MASTER_MODULE_CONFIGS[this.moduleName].singularName}: ${existing.name} (${existing.code}) [ID: ${existing.id}]`,
        ip_address: userContext?.ipAddress || '127.0.0.1',
      });
    } catch (auditErr) {
      console.error('Audit logging failed:', auditErr);
    }

    return true;
  }
}

// Master module repository singleton instances
export const categoryMasterRepository = new BaseMasterRepository('categories');
export const unitMasterRepository = new BaseMasterRepository('units');
export const brandMasterRepository = new BaseMasterRepository('brands');
export const warehouseMasterRepository = new BaseMasterRepository('warehouses');
export const supplierMasterRepository = new BaseMasterRepository('suppliers');

export const MASTER_REPOSITORIES: Record<MasterModuleName, BaseMasterRepository> = {
  categories: categoryMasterRepository,
  units: unitMasterRepository,
  brands: brandMasterRepository,
  warehouses: warehouseMasterRepository,
  suppliers: supplierMasterRepository,
};
