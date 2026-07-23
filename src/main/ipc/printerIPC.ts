import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { printerRepository } from '../database/repositories/PrinterRepository';
import { printRepository } from '../database/repositories/PrintRepository';
import { printerProfileRepository } from '../database/repositories/PrinterProfileRepository';
import { PrintService, PrintPreviewOptions, PrintJobOptions } from '../services/PrintService';
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

  registerHandler(IPC_CHANNELS.PRINTER_GET_PROFILES, async (): Promise<IPCResponse<any[]>> => {
    try {
      const profiles = printerProfileRepository.getAllProfiles();
      return {
        success: true,
        data: profiles,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('IPC Error PRINTER_GET_PROFILES:', err);
      return { success: false, error: { code: 'PRINTER_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.PRINT_PREVIEW, async (_, payload: unknown): Promise<IPCResponse<any>> => {
    try {
      const opts = payload as PrintPreviewOptions;
      const previewRes = await PrintService.generatePreview(opts);
      if (!previewRes.success) {
        return { success: false, error: { code: 'PRINT_PREVIEW_FAILED', message: previewRes.error || 'Failed to generate print preview' }, timestamp: new Date().toISOString() };
      }
      return {
        success: true,
        data: previewRes,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('IPC Error PRINT_PREVIEW:', err);
      return { success: false, error: { code: 'PRINT_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.PRINT_CREATE_JOB, async (_, payload: unknown): Promise<IPCResponse<any>> => {
    try {
      const opts = payload as PrintJobOptions;
      const labelConfig = {
        width: opts.labelConfig?.width || 50,
        height: opts.labelConfig?.height || 25,
        dpi: opts.labelConfig?.dpi || 203,
        orientation: (opts.labelConfig?.orientation || 'PORTRAIT') as 'PORTRAIT' | 'LANDSCAPE',
        copies: opts.copies || opts.labelConfig?.copies || 1,
        margins: opts.labelConfig?.margins || { top: 2, right: 2, bottom: 2, left: 2 },
        rotation: (opts.labelConfig?.rotation || 0) as (0 | 90 | 180 | 270),
        paperType: (opts.labelConfig?.paperType || 'CONTINUOUS') as 'CONTINUOUS' | 'GAP' | 'BLACK_MARK',
      };

      const zplOutput = PrintService.generateZpl({
        labelConfig,
        barcodeValue: opts.barcodeValue,
        barcodeType: opts.barcodeType,
        title: opts.title,
      });

      const tsplOutput = PrintService.generateTspl({
        labelConfig,
        barcodeValue: opts.barcodeValue,
        barcodeType: opts.barcodeType,
        title: opts.title,
      });

      const dbRes = printRepository.createJob({
        printerName: opts.printerName,
        templateId: opts.templateId,
        barcodeId: opts.barcodeId,
        copies: opts.copies || 1,
        zplOutput,
        tsplOutput,
        metadata: {
          barcodeValue: opts.barcodeValue,
          barcodeType: opts.barcodeType,
          labelConfig,
        },
      });

      return {
        success: true,
        data: {
          jobId: dbRes.lastInsertRowid,
          status: 'PENDING',
          printerName: opts.printerName,
          copies: opts.copies || 1,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('IPC Error PRINT_CREATE_JOB:', err);
      return { success: false, error: { code: 'PRINT_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });
}

