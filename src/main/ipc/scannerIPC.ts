import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { scannerService } from '../services/ScannerService';
import { IPCResponse } from '../../shared/types';
import { ScanResult, ScanRecord, ScannerSettings, ProductInfo } from '../../shared/scannerTypes';
import { logger } from '../logger';

export function registerScannerIPC(
  registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void
) {
  registerHandler(IPC_CHANNELS.SCANNER_PROCESS, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<ScanResult>> => {
    logger.info('IPC Call: SCANNER_PROCESS', payload);
    const opts = (payload as any) || {};
    const result = await scannerService.processScan({
      barcode: opts.barcode || '',
      userId: opts.userId,
      deviceName: opts.deviceName,
      prefix: opts.prefix,
      suffix: opts.suffix,
    });
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SCANNER_GET_HISTORY, async (_evt: unknown, limitPayload?: unknown): Promise<IPCResponse<ScanRecord[]>> => {
    logger.info('IPC Call: SCANNER_GET_HISTORY');
    const limit = typeof limitPayload === 'number' ? limitPayload : 50;
    const history = scannerService.getScanHistory(limit);
    return {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SCANNER_CLEAR_HISTORY, async (): Promise<IPCResponse<boolean>> => {
    logger.info('IPC Call: SCANNER_CLEAR_HISTORY');
    const cleared = scannerService.clearScanHistory();
    return {
      success: true,
      data: cleared,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SCANNER_GET_SETTINGS, async (): Promise<IPCResponse<ScannerSettings>> => {
    logger.info('IPC Call: SCANNER_GET_SETTINGS');
    const settings = scannerService.getSettings();
    return {
      success: true,
      data: settings,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SCANNER_SAVE_SETTINGS, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<ScannerSettings>> => {
    logger.info('IPC Call: SCANNER_SAVE_SETTINGS', payload);
    const updated = scannerService.saveSettings((payload as Partial<ScannerSettings>) || {});
    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SCANNER_CREATE_PRODUCT, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<ProductInfo>> => {
    logger.info('IPC Call: SCANNER_CREATE_PRODUCT received payload:', payload);
    try {
      const product = scannerService.createProduct((payload as Partial<ProductInfo>) || {});
      logger.info('IPC Call: SCANNER_CREATE_PRODUCT successfully created product:', product);
      return {
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: SCANNER_CREATE_PRODUCT failed:', err);
      return {
        success: false,
        error: {
          code: 'CREATE_PRODUCT_FAILED',
          message: err?.message || 'Failed to create product in main process',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.PRODUCT_GET_ALL, async (): Promise<IPCResponse<ProductInfo[]>> => {
    logger.info('IPC Call: PRODUCT_GET_ALL');
    try {
      const products = scannerService.getAllProducts();
      console.log('[TRACE 2] ipcMain PRODUCT_GET_ALL handler returning rows count:', products.length);
      return {
        success: true,
        data: products,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: PRODUCT_GET_ALL failed:', err);
      return {
        success: false,
        error: {
          code: 'GET_ALL_PRODUCTS_FAILED',
          message: err?.message || 'Failed to fetch products from SQLite',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.PRODUCT_CREATE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<ProductInfo>> => {
    logger.info('IPC Call: PRODUCT_CREATE payload:', payload);
    try {
      const product = scannerService.createProduct((payload as Partial<ProductInfo>) || {});
      return {
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: PRODUCT_CREATE failed:', err);
      return {
        success: false,
        error: {
          code: 'CREATE_PRODUCT_FAILED',
          message: err?.message || 'Failed to create product',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.PRODUCT_UPDATE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<ProductInfo>> => {
    logger.info('IPC Call: PRODUCT_UPDATE payload:', payload);
    try {
      const { id, product } = (payload as { id: number; product: Partial<ProductInfo> }) || {};
      const updated = scannerService.updateProduct(id, product || {});
      return {
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: PRODUCT_UPDATE failed:', err);
      return {
        success: false,
        error: {
          code: 'UPDATE_PRODUCT_FAILED',
          message: err?.message || 'Failed to update product',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });

  registerHandler(IPC_CHANNELS.PRODUCT_DELETE, async (_evt: unknown, payload?: unknown): Promise<IPCResponse<boolean>> => {
    logger.info('IPC Call: PRODUCT_DELETE payload:', payload);
    try {
      const id = typeof payload === 'number' ? payload : (payload as any)?.id;
      const success = scannerService.deleteProduct(id);
      return {
        success,
        data: success,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      logger.error('IPC Call: PRODUCT_DELETE failed:', err);
      return {
        success: false,
        error: {
          code: 'DELETE_PRODUCT_FAILED',
          message: err?.message || 'Failed to delete product',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });
}
