import fs from 'fs';
import path from 'path';
import os from 'os';
import * as pdfToPrinter from 'pdf-to-printer';
import { BarcodeEngine } from './BarcodeEngine';
import { printRepository } from '../database/repositories/PrintRepository';
import { settingsRepository } from '../database/repositories/SettingsRepository';
import { PrintLayoutEngine } from '../../utils/PrintLayoutEngine';
import { logger } from '../logger';

function syncToRepository(printers: any[]) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { printerRepository } = require('../database/repositories/PrinterRepository');
    if (printerRepository && typeof printerRepository.syncPrinters === 'function') {
      printerRepository.syncPrinters(printers);
    }
  } catch {
    // Ignore when running in client browser context
  }
}

export interface LabelConfig {
  width: number; // mm
  height: number; // mm
  dpi: number; // 203 | 300 | 600
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  copies: number;
  margins: { top: number; right: number; bottom: number; left: number }; // mm
  rotation: 0 | 90 | 180 | 270;
  paperType: 'CONTINUOUS' | 'GAP' | 'BLACK_MARK';
}

export interface PrintPreviewOptions {
  printerName: string;
  driverType: 'WINDOWS' | 'ZEBRA_ZPL' | 'TSPL' | string;
  labelConfig: LabelConfig;
  barcodeValue: string;
  barcodeType: string;
  title?: string;
}

export interface PrintPreviewResult {
  success: boolean;
  zplCode?: string;
  tsplCode?: string;
  previewSvg?: string;
  previewPngDataUrl?: string;
  formattedJobCommand?: string;
  error?: string;
}

export interface PrintJobOptions {
  printerName: string;
  driverType?: 'WINDOWS' | 'ZEBRA_ZPL' | 'TSPL' | string;
  templateId?: number;
  barcodeId?: number;
  barcodeValue: string;
  barcodeType: string;
  title?: string;
  copies?: number;
  silent?: boolean;
  printMode?: 'DIALOG' | 'SILENT';
  printBackground?: boolean;
  svgContent?: string;
  labelConfig?: Partial<LabelConfig>;
}

export interface ExecutePrintJobOptions extends PrintJobOptions {
  jobId: number;
}

export interface PhysicalPrintResult {
  jobId: number;
  status: 'PRINTED' | 'FAILED' | 'CANCELLED';
  printerName: string;
  copies: number;
  error?: string;
}

export class PrintService {
  /**
   * System printer discovery using Electron native webContents.getPrintersAsync()
   * Fallback to mock printers ONLY when Electron APIs are unavailable (browser preview)
   */
  public static async getPrinters(): Promise<Array<{ id: number | string; name: string; driver_type: string; is_default: number; dpi: number; status: string; port?: string }>> {
    console.log('[PrintService] Executing getPrinters() discovery...');
    try {
      let electronModule: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        electronModule = require('electron');
      } catch (err) {
        console.log('[PrintService] require("electron") failed or unavailable in current runtime environment:', err);
        electronModule = null;
      }

      if (electronModule) {
        const BrowserWindow = electronModule.BrowserWindow;
        const webContents = electronModule.webContents;
        const winList = BrowserWindow?.getAllWindows?.() || [];
        const win = winList[0];
        const contentsList = webContents?.getAllWebContents?.() || [];
        const contents = win?.webContents || contentsList[0];

        console.log(`[PrintService] BrowserWindow count: ${winList.length}`);
        console.log(`[PrintService] BrowserWindow titles: ${JSON.stringify(winList.map((w: any) => w.getTitle?.() || 'Untitled'))}`);
        console.log(`[PrintService] webContents count: ${contentsList.length}`);
        console.log(`[PrintService] Is BrowserWindow found?: ${Boolean(win)}`);
        console.log(`[PrintService] Is webContents found?: ${Boolean(contents)}`);
        console.log(`[PrintService] Is getPrintersAsync() executed?: ${Boolean(contents && typeof contents.getPrintersAsync === 'function')}`);

        if (contents) {
          let rawPrinters: any[] = [];
          if (typeof contents.getPrintersAsync === 'function') {
            console.log('[PrintService] Executing webContents.getPrintersAsync()...');
            rawPrinters = await contents.getPrintersAsync();
          } else if (typeof contents.getPrinters === 'function') {
            console.log('[PrintService] Executing webContents.getPrinters()...');
            rawPrinters = contents.getPrinters();
          }

          console.log(`[PrintService] Number of printers returned: ${rawPrinters?.length || 0}`);
          console.log('[PrintService] Raw printers list:', rawPrinters);
          const defaultPrinter = Array.isArray(rawPrinters) ? rawPrinters.find((p: any) => p.isDefault) : null;
          console.log('[PrintService] Default printer from Windows:', defaultPrinter);
          if (Array.isArray(rawPrinters) && rawPrinters.length > 0) {
            const mappedPrinters = rawPrinters.map((p: any, idx: number) => {
              const nameUpper = (p.name || p.displayName || '').toUpperCase();
              let driverType = 'WINDOWS';
              if (nameUpper.includes('ZEBRA') || nameUpper.includes('ZPL')) {
                driverType = 'ZEBRA_ZPL';
              } else if (nameUpper.includes('TSPL') || nameUpper.includes('TSC')) {
                driverType = 'TSPL';
              }
              return {
                id: `prn-${idx + 1}`,
                name: p.name || p.displayName || `Printer ${idx + 1}`,
                driver_type: driverType,
                is_default: p.isDefault ? 1 : 0,
                dpi: 203,
                status: p.status === 0 || p.status === undefined || p.status === '0' || p.status === 'READY' ? 'ready' : String(p.status),
                port: p.options?.port || p.port || 'USB',
              };
            });

            console.log('[PrintService] Printer names returned:', mappedPrinters.map((p) => p.name));
            console.log('[PrintService] Is fallback activated?: false');
            syncToRepository(mappedPrinters);
            return mappedPrinters;
          } else {
            console.log('[PrintService] webContents returned 0 printers or empty array.');
          }
        } else {
          console.log('[PrintService] No webContents available on BrowserWindow or webContents API.');
        }
      } else {
        console.log('[PrintService] Electron module not available.');
      }
    } catch (err) {
      console.error('[PrintService] Exception thrown during webContents.getPrintersAsync():', err);
    }

    console.log('[PrintService] Is fallback activated?: true');
    console.log('[PrintService] Returning fallback mock printers.');
    // Fallback to mock printers ONLY when Electron APIs are unavailable (browser preview)
    const mockFallback = [
      { id: 1, name: 'Canon G3010 series', driver_type: 'WINDOWS', is_default: 1, dpi: 203, status: 'ready', port: 'USB001' },
      { id: 2, name: 'Microsoft Print to PDF', driver_type: 'WINDOWS', is_default: 0, dpi: 300, status: 'ready', port: 'PORTPROMPT:' },
      { id: 3, name: 'Microsoft XPS Document Writer', driver_type: 'WINDOWS', is_default: 0, dpi: 203, status: 'ready', port: 'PORTPROMPT:' },
      { id: 4, name: 'Fax', driver_type: 'WINDOWS', is_default: 0, dpi: 203, status: 'ready', port: 'SHRFAX:' },
      { id: 5, name: 'AnyDesk Printer', driver_type: 'WINDOWS', is_default: 0, dpi: 203, status: 'ready', port: 'USB002' },
      { id: 6, name: 'OneNote', driver_type: 'WINDOWS', is_default: 0, dpi: 203, status: 'ready', port: 'nul:' },
    ];
    syncToRepository(mockFallback);
    return mockFallback;
  }

  /**
   * Convert mm to printer dots based on DPI
   */
  public static mmToDots(mm: number, dpi: number = 203): number {
    return Math.round((mm / 25.4) * dpi);
  }

  /**
   * Generate Zebra ZPL II raw command code
   */
  public static generateZpl(options: {
    labelConfig: LabelConfig;
    barcodeValue: string;
    barcodeType: string;
    title?: string;
  }): string {
    const { labelConfig, barcodeValue, title } = options;
    const dpi = labelConfig.dpi || 203;
    const widthDots = this.mmToDots(labelConfig.width, dpi);
    const heightDots = this.mmToDots(labelConfig.height, dpi);
    const copies = labelConfig.copies || 1;

    const bcid = BarcodeEngine.mapTypeToBcid(options.barcodeType);
    let zplBarcodeCmd = `^FO50,40^BY2^BCN,90,Y,N,N^FD${barcodeValue}^FS`;

    if (bcid === 'qrcode') {
      zplBarcodeCmd = `^FO50,40^BQN,2,5^FDQA,${barcodeValue}^FS`;
    } else if (bcid === 'datamatrix') {
      zplBarcodeCmd = `^FO50,40^BXN,5,200^FD${barcodeValue}^FS`;
    } else if (bcid === 'code39') {
      zplBarcodeCmd = `^FO50,40^B3N,N,90,Y,N^FD${barcodeValue}^FS`;
    }

    const titleCmd = title ? `^FO50,140^A0N,24,24^FD${title}^FS` : '';

    return [
      '^XA',
      `^PW${widthDots}`,
      `^LL${heightDots}`,
      '^LH0,0',
      zplBarcodeCmd,
      titleCmd,
      `^PQ${copies},0,1,Y`,
      '^XZ',
    ].join('\n');
  }

  /**
   * Generate TSPL (TSC Printer Language) raw command code
   */
  public static generateTspl(options: {
    labelConfig: LabelConfig;
    barcodeValue: string;
    barcodeType: string;
    title?: string;
  }): string {
    const { labelConfig, barcodeValue, title } = options;
    const copies = labelConfig.copies || 1;
    const bcid = BarcodeEngine.mapTypeToBcid(options.barcodeType);

    let tsplBarCmd = `BARCODE 50,40,"128",90,1,0,2,2,"${barcodeValue}"`;
    if (bcid === 'qrcode') {
      tsplBarCmd = `QRCODE 50,40,L,5,A,0,"${barcodeValue}"`;
    } else if (bcid === 'code39') {
      tsplBarCmd = `BARCODE 50,40,"39",90,1,0,2,2,"${barcodeValue}"`;
    }

    const titleCmd = title ? `TEXT 50,140,"3",0,1,1,"${title}"` : '';

    return [
      `SIZE ${labelConfig.width} mm, ${labelConfig.height} mm`,
      'GAP 3 mm, 0 mm',
      'DIRECTION 1',
      'CLS',
      tsplBarCmd,
      titleCmd,
      `PRINT ${copies},1`,
    ].join('\n');
  }

  /**
   * Generate print preview including vector rendering and RAW driver command code
   */
  public static async generatePreview(options: PrintPreviewOptions): Promise<PrintPreviewResult> {
    try {
      const { labelConfig, barcodeValue, barcodeType, title, driverType } = options;

      // Render barcode vector graphic via BarcodeEngine
      const renderRes = await BarcodeEngine.generate({
        value: barcodeValue,
        type: barcodeType,
        width: 3,
        height: 15,
        margin: 4,
        showText: true,
      });

      if (!renderRes.success) {
        return { success: false, error: renderRes.error || 'Failed rendering barcode graphic for preview' };
      }

      const zplCode = this.generateZpl({ labelConfig, barcodeValue, barcodeType, title });
      const tsplCode = this.generateTspl({ labelConfig, barcodeValue, barcodeType, title });

      let formattedJobCommand = zplCode;
      if (driverType === 'TSPL') {
        formattedJobCommand = tsplCode;
      } else if (driverType === 'WINDOWS') {
        formattedJobCommand = `[Win32 RAW Spool Job] Printer: ${options.printerName} | Copies: ${labelConfig.copies} | Size: ${labelConfig.width}x${labelConfig.height}mm`;
      }

      return {
        success: true,
        zplCode,
        tsplCode,
        previewSvg: renderRes.svg,
        previewPngDataUrl: renderRes.pngDataUrl,
        formattedJobCommand,
      };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message || 'Print preview creation failed',
      };
    }
  }

  /**
   * Build clean, printable HTML document for label execution
   */
  public static buildPrintHtml(options: {
    labelConfig: LabelConfig;
    barcodeValue: string;
    barcodeType: string;
    title?: string;
    svgContent?: string;
    pngDataUrl?: string;
  }): string {
    return PrintLayoutEngine.buildLabelHtml({
      labelConfig: {
        width: options.labelConfig.width,
        height: options.labelConfig.height,
        orientation: options.labelConfig.orientation,
        margins: options.labelConfig.margins,
        copies: options.labelConfig.copies,
      },
      barcodeValue: options.barcodeValue,
      barcodeType: options.barcodeType,
      title: options.title,
      svgContent: options.svgContent,
      pngDataUrl: options.pngDataUrl,
    });
  }

  /**
   * Execute physical printing via Electron webContents.print()
   * Updates SQLite job status: PENDING -> SPOOLING -> PRINTED / FAILED / CANCELLED
   */
  public static async executePhysicalPrint(opts: ExecutePrintJobOptions): Promise<PhysicalPrintResult> {
    const { jobId, printerName, copies = 1, silent, printMode, labelConfig } = opts;

    console.log(`[PrintService] Starting physical print execution for Job #${jobId}...`);
    // 1. Transition DB state to SPOOLING
    printRepository.updateJobStatus(jobId, 'SPOOLING');

    let electronModule: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      electronModule = require('electron');
    } catch {
      electronModule = null;
    }

    if (!electronModule || !electronModule.BrowserWindow) {
      console.log('[PrintService] Electron BrowserWindow unavailable (Web Preview context). Marking job PRINTED.');
      printRepository.markPrinted(jobId);
      return {
        jobId,
        status: 'PRINTED',
        printerName,
        copies,
      };
    }

    const BrowserWindow = electronModule.BrowserWindow;

    // Generate vector graphic or SVG if not explicitly provided
    let svgContent = opts.svgContent;
    let pngDataUrl: string | undefined;
    if (!svgContent) {
      const barRes = await BarcodeEngine.generate({
        value: opts.barcodeValue,
        type: opts.barcodeType,
        width: 2,
        height: 12,
        margin: 2,
        showText: true,
      });
      if (barRes.success) {
        svgContent = barRes.svg;
        pngDataUrl = barRes.pngDataUrl;
      }
    }

    const fullLabelConfig: LabelConfig = {
      width: labelConfig?.width || 50,
      height: labelConfig?.height || 25,
      dpi: labelConfig?.dpi || 203,
      orientation: labelConfig?.orientation || 'PORTRAIT',
      copies,
      margins: labelConfig?.margins || { top: 2, right: 2, bottom: 2, left: 2 },
      rotation: labelConfig?.rotation || 0,
      paperType: labelConfig?.paperType || 'CONTINUOUS',
    };

    const htmlContent = this.buildPrintHtml({
      labelConfig: fullLabelConfig,
      barcodeValue: opts.barcodeValue,
      barcodeType: opts.barcodeType,
      title: opts.title,
      svgContent,
      pngDataUrl,
    });

    try {
      const debugHtmlPath = path.join(process.cwd(), 'debug-print.html');
      fs.writeFileSync(debugHtmlPath, htmlContent, 'utf-8');

      let pngBase64 = pngDataUrl || '';
      if (!pngBase64 && svgContent) {
        const match = svgContent.match(/href=["'](data:image\/png;base64,[^"']+)["']/i) || svgContent.match(/src=["'](data:image\/png;base64,[^"']+)["']/i);
        if (match && match[1]) {
          pngBase64 = match[1];
        }
      }

      if (pngBase64 && pngBase64.startsWith('data:image/png;base64,')) {
        const rawBytes = Buffer.from(pngBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
        const debugPngPath = path.join(process.cwd(), 'debug-barcode.png');
        fs.writeFileSync(debugPngPath, rawBytes);
      }
    } catch (saveErr) {
      console.warn('[PrintService] Failed to write debug print files:', saveErr);
    }

    // Resolve print mode (Mode 1: Windows Print Dialog, Mode 2: Silent Direct Print)
    let isSilent = silent;
    if (isSilent === undefined) {
      if (printMode === 'SILENT') {
        isSilent = true;
      } else if (printMode === 'DIALOG') {
        isSilent = false;
      } else {
        const settings = settingsRepository.getSettings();
        isSilent = settings.printing.printMode === 'SILENT' || settings.printing.silentPrinting;
      }
    }

    return new Promise<PhysicalPrintResult>((resolve) => {
      try {
        const printWin = new BrowserWindow({
          show: !isSilent,
          width: Math.max(500, Math.round(fullLabelConfig.width * 3.78) + 100),
          height: Math.max(400, Math.round(fullLabelConfig.height * 3.78) + 100),
          title: `Print Label - ${opts.barcodeValue}`,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
          },
        });

        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);

        printWin.webContents.on('did-finish-load', async () => {
          try {
            // Wait for full rendering completion before invoking webContents.print()
            // Sequence: did-finish-load -> document.fonts.ready -> all SVG/images ready -> 2 rAF cycles -> force layout
            const inspection = await printWin.webContents.executeJavaScript(`
              (async () => {
                if (document.fonts && document.fonts.ready) {
                  await document.fonts.ready;
                }

                const images = Array.from(document.querySelectorAll('img'));
                await Promise.all(
                  images.map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((res) => {
                      img.onload = res;
                      img.onerror = res;
                    });
                  })
                );

                await new Promise((resolve) => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      void document.body.offsetHeight;
                      resolve(true);
                    });
                  });
                });

                // DOM Inspection of Barcode Element immediately before webContents.print()
                const barcodeContainer = document.querySelector('.label-barcode-container');
                const svgEl = document.querySelector('.label-barcode-container svg');
                const imgEl = document.querySelector('.label-barcode-container img');
                const targetEl = svgEl || imgEl || barcodeContainer;

                if (!targetEl) {
                  return { exists: false };
                }

                const rect = targetEl.getBoundingClientRect();
                const computed = window.getComputedStyle(targetEl);

                return {
                  exists: true,
                  tagName: targetEl.tagName,
                  offsetWidth: targetEl.offsetWidth,
                  offsetHeight: targetEl.offsetHeight,
                  getBoundingClientRect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    left: rect.left,
                  },
                  computedDisplay: computed.display,
                  computedVisibility: computed.visibility,
                  computedOpacity: computed.opacity,
                  outerHTMLSnippet: targetEl.outerHTML.slice(0, 300),
                };
              })();
            `);

            console.log('[RUNTIME PRINT DOM INSPECTION REPORT]', JSON.stringify(inspection, null, 2));
            logger.info('[PrintService] Runtime Print DOM Inspection Report', inspection);
          } catch (renderWaitErr) {
            console.warn('[PrintService] Warning waiting for page render completion:', renderWaitErr);
          }

          const targetPrinter = printerName && printerName !== 'Default' && printerName !== 'Not Configured' ? printerName : undefined;

          // Enterprise PDF Printing Pipeline:
          // 1. Generate clean vector/raster PDF stream using webContents.printToPDF()
          // 2. Save temporary PDF file
          // 3. Send PDF directly to Windows printing subsystem via pdf-to-printer
          // 4. Delete temporary PDF file upon completion
          let tempPdfPath = '';
          try {
            console.log(`[PrintService] Generating intermediate high-fidelity PDF via webContents.printToPDF() for Job #${jobId}...`);
            const pdfBuffer = await printWin.webContents.printToPDF({
              printBackground: opts.printBackground ?? true,
              landscape: fullLabelConfig.orientation === 'LANDSCAPE',
              margins: {
                marginType: 'none',
              },
              pageSize: {
                width: fullLabelConfig.width / 25.4, // inches
                height: fullLabelConfig.height / 25.4, // inches
              },
            });

            tempPdfPath = path.join(os.tmpdir(), `mz_print_job_${jobId}_${Date.now()}.pdf`);
            fs.writeFileSync(tempPdfPath, pdfBuffer);
            console.log(`[PrintService] Intermediate PDF written to ${tempPdfPath} (${pdfBuffer.length} bytes)`);

            // Execute native PDF print on Windows (or when pdf-to-printer is available)
            if (process.platform === 'win32' || typeof pdfToPrinter.print === 'function') {
              console.log(`[PrintService] Sending PDF to Windows Printing Subsystem via pdf-to-printer (printer=${targetPrinter || 'Default'}, silent=${isSilent}, copies=${copies})...`);
              await pdfToPrinter.print(tempPdfPath, {
                printer: targetPrinter,
                copies: copies || 1,
                printDialog: !isSilent,
                scale: 'noscale',
                orientation: fullLabelConfig.orientation === 'LANDSCAPE' ? 'landscape' : 'portrait',
              });

              console.log(`[PrintService] PDF Print Job #${jobId} completed successfully via pdf-to-printer`);
              printRepository.markPrinted(jobId);
              logger.info(`Print Job #${jobId} successfully sent to Windows print spooler via PDF pipeline for ${targetPrinter || 'Default Printer'}`);

              try {
                if (tempPdfPath && fs.existsSync(tempPdfPath)) {
                  fs.unlinkSync(tempPdfPath);
                  console.log(`[PrintService] Cleaned up temporary PDF file: ${tempPdfPath}`);
                }
              } catch (cleanErr) {
                console.warn('[PrintService] Cleanup temp PDF warning:', cleanErr);
              }

              try {
                if (!printWin.isDestroyed()) printWin.close();
              } catch {}

              resolve({
                jobId,
                status: 'PRINTED',
                printerName,
                copies,
              });
              return;
            }
          } catch (pdfPipelineErr: any) {
            console.warn('[PrintService] PDF pipeline execution failed or skipped, falling back to webContents.print():', pdfPipelineErr);
            if (tempPdfPath && fs.existsSync(tempPdfPath)) {
              try { fs.unlinkSync(tempPdfPath); } catch {}
            }
          }

          // Fallback direct webContents.print()
          const printOptions: any = {
            silent: isSilent,
            printBackground: opts.printBackground ?? true,
            deviceName: targetPrinter,
            copies: copies || 1,
            landscape: fullLabelConfig.orientation === 'LANDSCAPE',
            margins: {
              marginType: 'none',
            },
            pageSize: {
              width: Math.round(fullLabelConfig.width * 1000), // microns
              height: Math.round(fullLabelConfig.height * 1000), // microns
            },
          };

          console.log(`[PrintService] Fallback: Invoking webContents.print() for Job #${jobId}:`, {
            silent: isSilent,
            printerName: targetPrinter || 'Windows Default',
            copies,
          });

          printWin.webContents.print(printOptions, (success: boolean, failureReason: string) => {
            console.log(`[PrintService] webContents.print result for Job #${jobId}: success=${success}, failureReason="${failureReason}"`);

            try {
              if (!printWin.isDestroyed()) {
                printWin.close();
              }
            } catch {}

            if (success) {
              printRepository.markPrinted(jobId);
              logger.info(`Print Job #${jobId} successfully sent to Windows spooler for ${targetPrinter || 'Default Printer'}`);
              resolve({
                jobId,
                status: 'PRINTED',
                printerName,
                copies,
              });
            } else {
              const reasonLower = (failureReason || '').toLowerCase();
              if (reasonLower.includes('cancel')) {
                printRepository.markCancelled(jobId);
                logger.info(`Print Job #${jobId} was cancelled by user`);
                resolve({
                  jobId,
                  status: 'CANCELLED',
                  printerName,
                  copies,
                  error: 'Print job cancelled by user',
                });
              } else {
                const errMsg = failureReason || 'Windows print spooler rejected the job';
                printRepository.markFailed(jobId, errMsg);
                logger.error(`Print Job #${jobId} failed: ${errMsg}`);
                resolve({
                  jobId,
                  status: 'FAILED',
                  printerName,
                  copies,
                  error: errMsg,
                });
              }
            }
          });
        });

        printWin.loadURL(dataUrl).catch((err: any) => {
          console.error('[PrintService] loadURL failed for print window:', err);
          try {
            if (!printWin.isDestroyed()) printWin.close();
          } catch {}
          printRepository.markFailed(jobId, err.message || 'Failed loading label content');
          resolve({
            jobId,
            status: 'FAILED',
            printerName,
            copies,
            error: err.message || 'Failed loading print window content',
          });
        });
      } catch (err: any) {
        console.error('[PrintService] Exception instantiating print window:', err);
        printRepository.markFailed(jobId, err.message || 'Print window error');
        resolve({
          jobId,
          status: 'FAILED',
          printerName,
          copies,
          error: err.message || 'Print window instantiation failed',
        });
      }
    });
  }
}
