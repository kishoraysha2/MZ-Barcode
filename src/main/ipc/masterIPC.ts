import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { MASTER_REPOSITORIES } from '../database/repositories/BaseMasterRepository';
import { IPCResponse } from '../../shared/types';
import { MasterEntity, MasterModuleName, CreateMasterPayload, UpdateMasterPayload } from '../../shared/masterTypes';
import { logger } from '../logger';

function extractModuleName(payload: unknown): MasterModuleName {
  if (typeof payload === 'string') return payload as MasterModuleName;
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, any>;
    if (typeof p.moduleName === 'string') return p.moduleName as MasterModuleName;
    if (p.moduleName && typeof p.moduleName === 'object' && typeof p.moduleName.moduleName === 'string') {
      return p.moduleName.moduleName as MasterModuleName;
    }
  }
  return 'categories';
}

export function registerMasterIPC(
  registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void
) {
  // 1. MASTER_GET_ALL
  registerHandler(IPC_CHANNELS.MASTER_GET_ALL, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<MasterEntity[]>> => {
    logger.info('IPC Call: MASTER_GET_ALL', payload);
    try {
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const items = repo.getAll(true);
      return {
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_GET_ALL failed:', err);
      return {
        success: false,
        error: { code: 'GET_ALL_FAILED', message: err?.message || 'Failed to fetch master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });

  // 2. MASTER_GET_ACTIVE
  registerHandler(IPC_CHANNELS.MASTER_GET_ACTIVE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<MasterEntity[]>> => {
    logger.info('IPC Call: MASTER_GET_ACTIVE', payload);
    try {
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const items = repo.getActive();
      return {
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_GET_ACTIVE failed:', err);
      return {
        success: false,
        error: { code: 'GET_ACTIVE_FAILED', message: err?.message || 'Failed to fetch active master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });

  // 3. MASTER_CREATE
  registerHandler(IPC_CHANNELS.MASTER_CREATE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<MasterEntity>> => {
    logger.info('IPC Call: MASTER_CREATE', payload);
    try {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();
      const username = p.username || p.payload?.username || 'SYSTEM';

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions to create master data.' },
          timestamp: new Date().toISOString(),
        };
      }

      const createPayload: CreateMasterPayload = {
        name: p.name || p.payload?.name,
        code: p.code || p.payload?.code,
        description: p.description || p.payload?.description,
        sortOrder: p.sortOrder !== undefined ? p.sortOrder : p.payload?.sortOrder,
        isActive: p.isActive !== undefined ? p.isActive : p.payload?.isActive,
      };

      const created = repo.create(createPayload, {
        username,
        role,
      });

      return {
        success: true,
        data: created,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_CREATE failed:', err);
      return {
        success: false,
        error: { code: 'CREATE_FAILED', message: err?.message || 'Failed to create master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });

  // 4. MASTER_UPDATE
  registerHandler(IPC_CHANNELS.MASTER_UPDATE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<MasterEntity>> => {
    logger.info('IPC Call: MASTER_UPDATE', payload);
    try {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();
      const username = p.username || p.payload?.username || 'SYSTEM';

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions to update master data.' },
          timestamp: new Date().toISOString(),
        };
      }

      const updatePayload: UpdateMasterPayload = p.payload || {
        name: p.name,
        code: p.code,
        description: p.description,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
      };

      const updated = repo.update(p.id, updatePayload, {
        username,
        role,
      });

      return {
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_UPDATE failed:', err);
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: err?.message || 'Failed to update master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });

  // 5. MASTER_ENABLE
  registerHandler(IPC_CHANNELS.MASTER_ENABLE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<MasterEntity>> => {
    logger.info('IPC Call: MASTER_ENABLE', payload);
    try {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();
      const username = p.username || p.payload?.username || 'SYSTEM';

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions to enable master data.' },
          timestamp: new Date().toISOString(),
        };
      }

      const enabled = repo.enable(p.id, { username, role });
      return {
        success: true,
        data: enabled,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_ENABLE failed:', err);
      return {
        success: false,
        error: { code: 'ENABLE_FAILED', message: err?.message || 'Failed to enable master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });

  // 6. MASTER_DISABLE
  registerHandler(IPC_CHANNELS.MASTER_DISABLE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<MasterEntity>> => {
    logger.info('IPC Call: MASTER_DISABLE', payload);
    try {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();
      const username = p.username || p.payload?.username || 'SYSTEM';

      if (role === 'USER' || role === 'OPERATOR' || role === 'VIEWER') {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Read-only access. Insufficient permissions to disable master data.' },
          timestamp: new Date().toISOString(),
        };
      }

      const disabled = repo.disable(p.id, { username, role });
      return {
        success: true,
        data: disabled,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_DISABLE failed:', err);
      return {
        success: false,
        error: { code: 'DISABLE_FAILED', message: err?.message || 'Failed to disable master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });

  // 7. MASTER_DELETE
  registerHandler(IPC_CHANNELS.MASTER_DELETE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<boolean>> => {
    logger.info('IPC Call: MASTER_DELETE', payload);
    try {
      const p = (payload as any) || {};
      const moduleName = extractModuleName(payload);
      const repo = MASTER_REPOSITORIES[moduleName];

      if (!repo) {
        return {
          success: false,
          error: { code: 'INVALID_MODULE', message: `Master module "${moduleName}" not found.` },
          timestamp: new Date().toISOString(),
        };
      }

      const role = (p.userRole || p.role || p.payload?.userRole || p.payload?.role || 'USER').toString().toUpperCase();
      const username = p.username || p.payload?.username || 'SYSTEM';

      if (role !== 'OWNER' && role !== 'ADMIN') {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Insufficient permissions to delete master data records.' },
          timestamp: new Date().toISOString(),
        };
      }

      const deleted = repo.delete(p.id, { username, role });
      return {
        success: true,
        data: deleted,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: MASTER_DELETE failed:', err);
      return {
        success: false,
        error: { code: 'DELETE_FAILED', message: err?.message || 'Failed to delete master data.' },
        timestamp: new Date().toISOString(),
      };
    }
  });
}
