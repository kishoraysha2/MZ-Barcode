import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { printerRepository } from '../database/repositories/PrinterRepository';
import { logger } from '../logger';

export function registerPrinterIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.PRINTER_LIST, async (): Promise<IPCResponse<any[]>> => {
    try {
      const printers = printerRepository.getPrinters();
      return {
        success: true,
        data: printers,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('IPC Error PRINTER_LIST:', err);
      return { success: false, error: { code: 'PRINTER_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.PRINTER_GET_DEFAULT, async (): Promise<IPCResponse<any>> => {
    try {
      const def = printerRepository.getDefaultPrinter();
      return {
        success: true,
        data: def,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('IPC Error PRINTER_GET_DEFAULT:', err);
      return { success: false, error: { code: 'PRINTER_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.PRINTER_STATUS, async (_, printerNamePayload?: unknown): Promise<IPCResponse<{ online: boolean; status: string }>> => {
    try {
      const printerName = (printerNamePayload as string) || '';
      const status = printerRepository.getPrinterStatus(printerName);
      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('IPC Error PRINTER_STATUS:', err);
      return { success: false, error: { code: 'PRINTER_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });
}
