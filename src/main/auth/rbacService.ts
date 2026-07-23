import { QueryBuilder } from '../database/queryBuilder';
import { logger } from '../logger';

export interface RoleInfo {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface PermissionInfo {
  id: number;
  roleId: number;
  permissionKey: string;
}

export class RBACService {
  /**
   * Retrieves all roles from the database
   */
  public static getRoles(): RoleInfo[] {
    const rows = QueryBuilder.select<{ id: number; name: string; description: string; is_active: number }>('roles', ['*']);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isActive: r.is_active === 1,
    }));
  }

  /**
   * Retrieves permissions for a given role ID from SQLite
   */
  public static getPermissionsForRole(roleId: number): string[] {
    const rows = QueryBuilder.select<{ permission_key: string }>('permissions', ['permission_key'], { role_id: roleId });
    return rows.map((r) => r.permission_key);
  }

  /**
   * Checks if a role ID has a specific permission key
   */
  public static hasPermission(roleId: number, permissionKey: string): boolean {
    const permissions = this.getPermissionsForRole(roleId);
    if (permissions.includes('*') || permissions.includes('ALL_PERMISSIONS')) {
      return true;
    }
    return permissions.includes(permissionKey);
  }

  /**
   * Assigns default system permissions to roles in SQLite
   */
  public static initializeDefaultPermissions(): void {
    logger.info('[RBACService] Ensuring standard SQLite role permissions exist...');

    const roleMap: Record<string, string[]> = {
      OWNER: ['*'],
      ADMIN: [
        'BARCODE_GENERATE',
        'BARCODE_PRINT',
        'TEMPLATE_MANAGE',
        'USER_MANAGE',
        'SETTINGS_MANAGE',
        'BACKUP_MANAGE',
        'AUDIT_VIEW',
      ],
      USER: ['BARCODE_GENERATE', 'BARCODE_PRINT', 'TEMPLATE_VIEW'],
      VIEWER: ['BARCODE_VIEW', 'TEMPLATE_VIEW'],
    };

    const roles = QueryBuilder.select<{ id: number; name: string }>('roles', ['id', 'name']);
    
    for (const r of roles) {
      const targetPermissions = roleMap[r.name] || ['TEMPLATE_VIEW'];
      const existing = this.getPermissionsForRole(r.id);

      for (const permKey of targetPermissions) {
        if (!existing.includes(permKey)) {
          QueryBuilder.insert('permissions', {
            role_id: r.id,
            permission_key: permKey,
          });
          logger.info(`[RBAC] Granted permission "${permKey}" to role ${r.name} (ID: ${r.id})`);
        }
      }
    }
  }
}
