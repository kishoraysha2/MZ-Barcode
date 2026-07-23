import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { barcodeRepository } from '../database/repositories/BarcodeRepository';
import { BarcodeEngine, BarcodeGenerateOptions } from '../services/BarcodeEngine';
import { logger } from '../logger';

export function registerBarcodeIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.BARCODE_FORMATS, async (): Promise<IPCResponse<string[]>> => {
    return {
      success: true,
      data: ['Code128', 'Code39', 'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E', 'QR Code', 'Data Matrix', 'PDF417'],
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.BARCODE_VALIDATE, async (_, payload: unknown): Promise<IPCResponse<{ valid: boolean; error?: string }>> => {
    try {
      const p = payload as { value: string; format?: string; type?: string };
      const valRes = BarcodeEngine.validate(p.type || p.format || 'Code128', p.value || '');
      return {
        success: true,
        data: { valid: valRes.valid, error: valRes.error },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.BARCODE_GENERATE, async (_, payload: unknown): Promise<IPCResponse<any>> => {
    try {
      const opts = payload as BarcodeGenerateOptions;
      const res = await BarcodeEngine.generate(opts);
      if (!res.success) {
        return { success: false, error: { code: 'GENERATE_FAILED', message: res.error || 'Barcode generation failed' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: res, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error BARCODE_GENERATE:', err);
      return { success: false, error: { code: 'GENERATE_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.BARCODE_PREVIEW, async (_, payload: unknown): Promise<IPCResponse<any>> => {
    try {
      const opts = payload as BarcodeGenerateOptions;
      const res = await BarcodeEngine.preview(opts);
      if (!res.success) {
        return { success: false, error: { code: 'PREVIEW_FAILED', message: res.error || 'Barcode preview failed' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: res, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error BARCODE_PREVIEW:', err);
      return { success: false, error: { code: 'PREVIEW_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.BARCODE_EXPORT, async (_, payload: unknown): Promise<IPCResponse<any>> => {
    try {
      const opts = payload as BarcodeGenerateOptions & { format?: 'svg' | 'png' };
      const res = await BarcodeEngine.export(opts);
      if (!res.success) {
        return { success: false, error: { code: 'EXPORT_FAILED', message: res.error || 'Barcode export failed' }, timestamp: new Date().toISOString() };
      }
      return { success: true, data: res, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error BARCODE_EXPORT:', err);
      return { success: false, error: { code: 'EXPORT_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
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

