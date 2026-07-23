import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { logger } from '../logger';

export function registerPrinterIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.PRINTER_LIST, async (): Promise<IPCResponse<string[]>> => {
    logger.info('IPC Call: PRINTER_LIST (Foundation Empty Handler)');
    return {
      success: true,
      data: ['Zebra ZD421 (203 dpi)', 'TSC TTP-244 Pro', 'SATO CL4NX Plus'],
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.PRINTER_STATUS, async (): Promise<IPCResponse<{ online: boolean }>> => {
    logger.info('IPC Call: PRINTER_STATUS (Foundation Empty Handler)');
    return {
      success: true,
      data: { online: true },
      timestamp: new Date().toISOString(),
    };
  });
}
