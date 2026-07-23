import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { barcodeRepository } from '../database/repositories/BarcodeRepository';
import { logger } from '../logger';

export function registerBarcodeIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.BARCODE_FORMATS, async (): Promise<IPCResponse<string[]>> => {
    return {
      success: true,
      data: ['CODE128', 'EAN13', 'EAN8', 'UPCA', 'QR', 'DATAMATRIX', 'PDF417'],
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.BARCODE_VALIDATE, async (): Promise<IPCResponse<{ valid: boolean }>> => {
    return {
      success: true,
      data: { valid: true },
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.BARCODE_GET_ALL, async (): Promise<IPCResponse<any[]>> => {
    try {
      const records = barcodeRepository.findAll();
      return { success: true, data: records, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error BARCODE_GET_ALL:', err);
      return { success: false, error: { code: 'BARCODE_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.BARCODE_CREATE, async (_, payload: unknown): Promise<IPCResponse<any>> => {
    try {
      const record = barcodeRepository.create(payload as any);
      return { success: true, data: record, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error BARCODE_CREATE:', err);
      return { success: false, error: { code: 'BARCODE_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.BARCODE_GET_NEXT_SEQUENCE, async (_, prefixPayload?: unknown): Promise<IPCResponse<any>> => {
    try {
      const pref = (prefixPayload as string) || 'MZ-';
      const seq = barcodeRepository.peekNextSequenceValue(pref);
      const nextBarcodeNumber = `${pref}${String(seq).padStart(8, '0')}`;
      return { success: true, data: { prefix: pref, nextSequence: seq, nextBarcodeNumber }, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error BARCODE_GET_NEXT_SEQUENCE:', err);
      return { success: false, error: { code: 'BARCODE_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });
}
