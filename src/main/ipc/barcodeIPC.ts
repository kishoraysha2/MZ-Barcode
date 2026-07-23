import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { logger } from '../logger';

export function registerBarcodeIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.BARCODE_FORMATS, async (): Promise<IPCResponse<string[]>> => {
    logger.info('IPC Call: BARCODE_FORMATS (Foundation Empty Handler)');
    return {
      success: true,
      data: ['CODE128', 'EAN13', 'EAN8', 'UPCA', 'QR', 'DATAMATRIX', 'PDF417'],
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.BARCODE_VALIDATE, async (): Promise<IPCResponse<{ valid: boolean }>> => {
    logger.info('IPC Call: BARCODE_VALIDATE (Foundation Empty Handler)');
    return {
      success: true,
      data: { valid: true },
      timestamp: new Date().toISOString(),
    };
  });
}
