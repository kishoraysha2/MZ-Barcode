import bwipjs from 'bwip-js';

export type SupportedBarcodeType =
  | 'Code128'
  | 'Code39'
  | 'EAN-13'
  | 'EAN-8'
  | 'UPC-A'
  | 'UPC-E'
  | 'QR Code'
  | 'Data Matrix'
  | 'PDF417'
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPCA'
  | 'UPCE'
  | 'QR'
  | 'DATAMATRIX'
  | 'PDF417';

export interface BarcodeGenerateOptions {
  value: string;
  type: SupportedBarcodeType | string;
  width?: number; // scale/width
  height?: number; // bar height
  margin?: number;
  font?: string;
  fontSize?: number;
  showText?: boolean;
  scale?: number;
}

export interface BarcodeGenerateResult {
  success: boolean;
  svg?: string;
  pngDataUrl?: string;
  type?: string;
  value?: string;
  error?: string;
}

export interface BarcodeValidationResult {
  valid: boolean;
  checksumValid?: boolean;
  formattedValue?: string;
  error?: string;
}

export class BarcodeEngine {
  /**
   * Map user-friendly font name to valid bwip-js font
   */
  public static mapFontToBwipFont(fontStr?: string): string {
    if (!fontStr) return 'Inconsolata';
    const f = fontStr.toLowerCase();
    if (f.includes('sans')) return 'OCR-B';
    if (f.includes('serif')) return 'OCR-A';
    if (f.includes('ocra')) return 'OCR-A';
    if (f.includes('ocrb')) return 'OCR-B';
    return 'Inconsolata';
  }

  /**
   * Map user-friendly barcode type string to bwip-js bcid identifier
   */
  public static mapTypeToBcid(typeStr: string): string {
    if (!typeStr) return 'code128';
    const t = typeStr.toUpperCase().replace(/[\s\-_]/g, '');
    switch (t) {
      case 'CODE128':
        return 'code128';
      case 'CODE39':
        return 'code39';
      case 'EAN13':
        return 'ean13';
      case 'EAN8':
        return 'ean8';
      case 'UPCA':
      case 'UPC':
        return 'upca';
      case 'UPCE':
        return 'upce';
      case 'QR':
      case 'QRCODE':
        return 'qrcode';
      case 'DATAMATRIX':
      case 'DATA':
        return 'datamatrix';
      case 'PDF417':
      case 'PDF':
        return 'pdf417';
      default:
        return 'code128';
    }
  }

  /**
   * Calculate EAN-13 checksum digit for a 12-digit string
   */
  public static calculateEan13Checksum(digits12: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(digits12[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }

  /**
   * Calculate EAN-8 checksum digit for a 7-digit string
   */
  public static calculateEan8Checksum(digits7: string): number {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(digits7[i], 10);
      sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }

  /**
   * Calculate UPC-A checksum digit for an 11-digit string
   */
  public static calculateUpcaChecksum(digits11: string): number {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(digits11[i], 10);
      sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }

  /**
   * Validate barcode input, length, and checksum
   */
  public static validate(type: string, value: string): BarcodeValidationResult {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return { valid: false, error: 'Barcode value cannot be empty' };
    }

    const cleanVal = value.trim();
    const bcid = this.mapTypeToBcid(type);

    switch (bcid) {
      case 'code128': {
        if (!/^[\x00-\x7F]+$/.test(cleanVal)) {
          return { valid: false, error: 'Code 128 requires standard ASCII characters' };
        }
        return { valid: true, formattedValue: cleanVal };
      }
      case 'code39': {
        const uppercase = cleanVal.toUpperCase();
        if (!/^[A-Z0-9\-\.\ \$\/\+\%]+$/.test(uppercase)) {
          return { valid: false, error: 'Code 39 permits uppercase letters, digits, - . $ / + %' };
        }
        return { valid: true, formattedValue: uppercase };
      }
      case 'ean13': {
        const numeric = cleanVal.replace(/\D/g, '');
        if (numeric.length === 12) {
          const checksum = this.calculateEan13Checksum(numeric);
          return { valid: true, checksumValid: true, formattedValue: `${numeric}${checksum}` };
        } else if (numeric.length >= 13) {
          const base12 = numeric.slice(0, 12);
          const checksum = this.calculateEan13Checksum(base12);
          return { valid: true, checksumValid: true, formattedValue: `${base12}${checksum}` };
        }
        return { valid: false, error: 'EAN-13 requires numeric digits (12 or 13 digits)' };
      }
      case 'ean8': {
        const numeric = cleanVal.replace(/\D/g, '');
        if (numeric.length === 7) {
          const checksum = this.calculateEan8Checksum(numeric);
          return { valid: true, checksumValid: true, formattedValue: `${numeric}${checksum}` };
        } else if (numeric.length >= 8) {
          const base7 = numeric.slice(0, 7);
          const checksum = this.calculateEan8Checksum(base7);
          return { valid: true, checksumValid: true, formattedValue: `${base7}${checksum}` };
        }
        return { valid: false, error: 'EAN-8 requires numeric digits (7 or 8 digits)' };
      }
      case 'upca': {
        const numeric = cleanVal.replace(/\D/g, '');
        if (numeric.length === 11) {
          const checksum = this.calculateUpcaChecksum(numeric);
          return { valid: true, checksumValid: true, formattedValue: `${numeric}${checksum}` };
        } else if (numeric.length >= 12) {
          const base11 = numeric.slice(0, 11);
          const checksum = this.calculateUpcaChecksum(base11);
          return { valid: true, checksumValid: true, formattedValue: `${base11}${checksum}` };
        }
        return { valid: false, error: 'UPC-A requires numeric digits (11 or 12 digits)' };
      }
      case 'upce': {
        const numeric = cleanVal.replace(/\D/g, '');
        if (numeric.length >= 6 && numeric.length <= 8) {
          return { valid: true, formattedValue: numeric.slice(0, 8) };
        }
        return { valid: false, error: 'UPC-E requires between 6 and 8 numeric digits' };
      }
      case 'qrcode':
      case 'datamatrix':
      case 'pdf417': {
        if (cleanVal.length > 2000) {
          return { valid: false, error: '2D Barcode input exceeds maximum payload limit of 2000 characters' };
        }
        return { valid: true, formattedValue: cleanVal };
      }
      default:
        return { valid: true, formattedValue: cleanVal };
    }
  }

  /**
   * Generate SVG string and PNG Data URL asynchronously
   */
  public static async generate(options: BarcodeGenerateOptions): Promise<BarcodeGenerateResult> {
    try {
      const validation = this.validate(options.type, options.value);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Invalid barcode value or format',
        };
      }

      const valueToEncode = validation.formattedValue || options.value.trim();
      const bcid = this.mapTypeToBcid(options.type);

      const is2D = bcid === 'qrcode' || bcid === 'datamatrix' || bcid === 'pdf417';

      const bwipOptions: bwipjs.ToBufferOptions = {
        bcid,
        text: valueToEncode,
        scale: options.scale || options.width || 3,
        height: options.height || (is2D ? 20 : 15),
        includetext: options.showText !== false && !is2D,
        textxalign: 'center',
        textfont: this.mapFontToBwipFont(options.font),
        textsize: options.fontSize || 10,
        paddingwidth: options.margin || 5,
        paddingheight: options.margin || 5,
      };

      let pngDataUrl = '';

      if (typeof (bwipjs as any).toBuffer === 'function') {
        const pngBuffer = await new Promise<Buffer>((resolve, reject) => {
          (bwipjs as any).toBuffer(bwipOptions, (err: any, png: Buffer) => {
            if (err) reject(err);
            else resolve(png);
          });
        });
        pngDataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      } else if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        if (typeof (bwipjs as any).toCanvas === 'function') {
          (bwipjs as any).toCanvas(canvas, bwipOptions);
        } else if (typeof (bwipjs as any) === 'function') {
          (bwipjs as any)(canvas, bwipOptions);
        }
        pngDataUrl = canvas.toDataURL('image/png');
      }

      const svgString = pngDataUrl
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120" style="background:#fff"><image href="${pngDataUrl}" x="0" y="0" width="300" height="120"/></svg>`
        : '';

      return {
        success: true,
        svg: svgString,
        pngDataUrl,
        type: options.type,
        value: valueToEncode,
      };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message || 'Failed to render barcode vector graphics',
      };
    }
  }

  /**
   * Synchronous preview fallback or wrapper
   */
  public static async preview(options: BarcodeGenerateOptions): Promise<BarcodeGenerateResult> {
    return this.generate(options);
  }

  /**
   * Export barcode as SVG or PNG data payload
   */
  public static async export(options: BarcodeGenerateOptions & { format?: 'svg' | 'png' }): Promise<{
    success: boolean;
    dataUrl?: string;
    svgContent?: string;
    error?: string;
  }> {
    const res = await this.generate(options);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    if (options.format === 'svg') {
      return {
        success: true,
        svgContent: res.svg,
        dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(res.svg || '')}`,
      };
    }

    return {
      success: true,
      dataUrl: res.pngDataUrl,
    };
  }
}
