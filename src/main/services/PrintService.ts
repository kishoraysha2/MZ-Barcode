import { BarcodeEngine } from './BarcodeEngine';

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
  labelConfig?: Partial<LabelConfig>;
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
}
