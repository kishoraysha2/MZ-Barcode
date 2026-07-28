import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { categoryRepository } from '../database/repositories/CategoryRepository';
import { IPCResponse } from '../../shared/types';
import { CategoryInfo, CreateCategoryPayload, UpdateCategoryPayload } from '../../shared/categoryTypes';
import { logger } from '../logger';

/**
 * @deprecated Use `registerMasterIPC` for unified Enterprise Master Data handlers.
 */
export function registerCategoryIPC(
  registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void
) {
  registerHandler(IPC_CHANNELS.CATEGORY_GET_ALL, async (): Promise<IPCResponse<CategoryInfo[]>> => {
    logger.info('IPC Call: CATEGORY_GET_ALL');
    try {
      const categories = categoryRepository.findAllCategories();
      return {
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: CATEGORY_GET_ALL failed:', err);
      return {
        success: false,
        error: {
          code: 'GET_CATEGORIES_FAILED',
          message: err?.message || 'Failed to fetch categories',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.CATEGORY_CREATE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<CategoryInfo>> => {
    logger.info('IPC Call: CATEGORY_CREATE', payload);
    try {
      const p = (payload as any) || {};
      const userRole = p.userRole || p.role;
      if (userRole === 'USER' || userRole === 'OPERATOR' || userRole === 'VIEWER') {
        return {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'Insufficient permissions. Users have read-only access to categories.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const created = categoryRepository.createCategory({
        name: p.name,
        description: p.description,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
        createdBy: p.createdBy || p.username || 'SYSTEM',
      });

      return {
        success: true,
        data: created,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: CATEGORY_CREATE failed:', err);
      return {
        success: false,
        error: {
          code: 'CREATE_CATEGORY_FAILED',
          message: err?.message || 'Failed to create category',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.CATEGORY_UPDATE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<CategoryInfo>> => {
    logger.info('IPC Call: CATEGORY_UPDATE', payload);
    try {
      const p = (payload as any) || {};
      const { id, category, userRole, role } = p;
      const effectiveRole = userRole || role;

      if (effectiveRole === 'USER' || effectiveRole === 'OPERATOR' || effectiveRole === 'VIEWER') {
        return {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'Insufficient permissions. Users cannot update categories.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const updated = categoryRepository.updateCategory(id, category || p);
      return {
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: CATEGORY_UPDATE failed:', err);
      return {
        success: false,
        error: {
          code: 'UPDATE_CATEGORY_FAILED',
          message: err?.message || 'Failed to update category',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.CATEGORY_DELETE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<boolean>> => {
    logger.info('IPC Call: CATEGORY_DELETE', payload);
    try {
      const p = (payload as any) || {};
      const id = typeof payload === 'number' ? payload : p.id;
      const effectiveRole = p.userRole || p.role;

      if (effectiveRole && effectiveRole !== 'OWNER') {
        return {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'Insufficient permissions. Only Owner can delete categories.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const deleted = categoryRepository.deleteCategory(id);
      return {
        success: true,
        data: deleted,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: CATEGORY_DELETE failed:', err);
      return {
        success: false,
        error: {
          code: 'DELETE_CATEGORY_FAILED',
          message: err?.message || 'Failed to delete category',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });
}
