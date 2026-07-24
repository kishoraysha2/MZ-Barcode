/**
 * MZ Barcode Suite Enterprise - Print Layout Engine
 * Handles mm to px conversions, DPI calculations, page bounds, margins,
 * printable area calculations, and CSS print styling.
 */

export interface PageDimensions {
  widthMm: number;
  heightMm: number;
}

export interface MarginSettings {
  topMm: number;
  rightMm: number;
  bottomMm: number;
  leftMm: number;
}

export type PaperSizePreset = 'A4' | 'LETTER' | '50x25' | '60x40' | '100x50' | 'CUSTOM';
export type MarginPreset = 'NONE' | 'NARROW' | 'NORMAL' | 'WIDE' | 'CUSTOM';
export type Orientation = 'PORTRAIT' | 'LANDSCAPE';

export interface PrintableArea {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

export interface PaperConfig {
  preset: PaperSizePreset;
  widthMm: number;
  heightMm: number;
  orientation: Orientation;
  margins: MarginSettings;
  marginPreset: MarginPreset;
  dpi: number;
}

export class PrintLayoutEngine {
  public static readonly PAPER_PRESETS: Record<PaperSizePreset, { label: string; widthMm: number; heightMm: number }> = {
    'A4': { label: 'A4 (210 x 297 mm)', widthMm: 210, heightMm: 297 },
    'LETTER': { label: 'Letter (215.9 x 279.4 mm)', widthMm: 215.9, heightMm: 279.4 },
    '50x25': { label: '50 x 25 mm (Thermal Label)', widthMm: 50, heightMm: 25 },
    '60x40': { label: '60 x 40 mm (Thermal Label)', widthMm: 60, heightMm: 40 },
    '100x50': { label: '100 x 50 mm (Shipping Label)', widthMm: 100, heightMm: 50 },
    'CUSTOM': { label: 'Custom Paper Size', widthMm: 100, heightMm: 100 },
  };

  public static readonly MARGIN_PRESETS: Record<MarginPreset, { label: string; margins: MarginSettings }> = {
    'NONE': { label: 'None (0mm)', margins: { topMm: 0, rightMm: 0, bottomMm: 0, leftMm: 0 } },
    'NARROW': { label: 'Narrow (2mm)', margins: { topMm: 2, rightMm: 2, bottomMm: 2, leftMm: 2 } },
    'NORMAL': { label: 'Normal (5mm)', margins: { topMm: 5, rightMm: 5, bottomMm: 5, leftMm: 5 } },
    'WIDE': { label: 'Wide (10mm)', margins: { topMm: 10, rightMm: 10, bottomMm: 10, leftMm: 10 } },
    'CUSTOM': { label: 'Custom Margins', margins: { topMm: 2, rightMm: 2, bottomMm: 2, leftMm: 2 } },
  };

  /**
   * Convert millimeters to pixels at a given DPI
   */
  public static mmToPx(mm: number, dpi: number = 96): number {
    return Math.round((mm / 25.4) * dpi);
  }

  /**
   * Convert pixels to millimeters at a given DPI
   */
  public static pxToMm(px: number, dpi: number = 96): number {
    return Number(((px / dpi) * 25.4).toFixed(2));
  }

  /**
   * Calculate effective page bounds considering orientation
   */
  public static getPageBounds(
    preset: PaperSizePreset,
    orientation: Orientation,
    customWidthMm?: number,
    customHeightMm?: number
  ): PageDimensions {
    let base = this.PAPER_PRESETS[preset] || this.PAPER_PRESETS['50x25'];
    let w = preset === 'CUSTOM' && customWidthMm ? customWidthMm : base.widthMm;
    let h = preset === 'CUSTOM' && customHeightMm ? customHeightMm : base.heightMm;

    if (orientation === 'LANDSCAPE') {
      return { widthMm: Math.max(w, h), heightMm: Math.min(w, h) };
    }
    return { widthMm: Math.min(w, h), heightMm: Math.max(w, h) };
  }

  /**
   * Calculate printable area after margins
   */
  public static getPrintableArea(
    pageDimensions: PageDimensions,
    margins: MarginSettings,
    dpi: number = 96
  ): PrintableArea {
    const printableWidthMm = Math.max(1, pageDimensions.widthMm - margins.leftMm - margins.rightMm);
    const printableHeightMm = Math.max(1, pageDimensions.heightMm - margins.topMm - margins.bottomMm);

    return {
      widthMm: printableWidthMm,
      heightMm: printableHeightMm,
      widthPx: this.mmToPx(printableWidthMm, dpi),
      heightPx: this.mmToPx(printableHeightMm, dpi),
    };
  }

  /**
   * Calculate optimal preview scale factor to fit within container
   */
  public static calculateFitScale(
    pageWidthPx: number,
    pageHeightPx: number,
    containerWidthPx: number,
    containerHeightPx: number,
    paddingPx: number = 20
  ): number {
    const availW = Math.max(100, containerWidthPx - paddingPx * 2);
    const availH = Math.max(100, containerHeightPx - paddingPx * 2);

    const scaleX = availW / pageWidthPx;
    const scaleY = availH / pageHeightPx;

    return Math.min(scaleX, scaleY, 2.0); // Cap max fit scale to 2x
  }

  /**
   * Generate `@page` CSS rules for exact print output
   */
  public static generatePrintCss(config: PaperConfig): string {
    const bounds = this.getPageBounds(config.preset, config.orientation, config.widthMm, config.heightMm);
    const sizeCss = `${bounds.widthMm}mm ${bounds.heightMm}mm`;
    const marginCss = `${config.margins.topMm}mm ${config.margins.rightMm}mm ${config.margins.bottomMm}mm ${config.margins.leftMm}mm`;

    return `
      @page {
        size: ${sizeCss};
        margin: ${marginCss};
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body > *:not(#mz-printable-document-root) {
          display: none !important;
        }
        #root, .fixed, .modal-backdrop, [role="dialog"], .no-print {
          display: none !important;
        }
        #mz-printable-document-root {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: ${bounds.widthMm}mm !important;
          height: ${bounds.heightMm}mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
          visibility: visible !important;
          page-break-after: always;
        }
      }
    `;
  }
}
