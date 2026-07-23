import { BarcodeEngine } from './BarcodeEngine';

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
