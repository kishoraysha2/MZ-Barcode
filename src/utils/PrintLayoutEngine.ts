/**
 * MZ Barcode Suite Enterprise - Print Layout Engine
 * Handles mm to px conversions, DPI calculations, page bounds, margins,
 * printable area calculations, and CSS print styling.
 */

import { normalizeSvg } from './SVGNormalizer';

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

export interface LabelHtmlOptions {
  labelConfig: {
    width: number;
    height: number;
    orientation?: Orientation;
    margins?: MarginSettings | { top?: number; right?: number; bottom?: number; left?: number; topMm?: number; rightMm?: number; bottomMm?: number; leftMm?: number };
    copies?: number;
  };
  barcodeValue: string;
  barcodeType: string;
  title?: string;
  svgContent?: string;
  pngDataUrl?: string;
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
    const base = this.PAPER_PRESETS[preset] || this.PAPER_PRESETS['50x25'];
    const w = preset === 'CUSTOM' && customWidthMm ? customWidthMm : base.widthMm;
    const h = preset === 'CUSTOM' && customHeightMm ? customHeightMm : base.heightMm;

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
    paddingPx: number = 20,
    fillRatio: number = 1.0
  ): number {
    const availW = Math.max(50, containerWidthPx - paddingPx * 2);
    const availH = Math.max(50, containerHeightPx - paddingPx * 2);

    const targetW = availW * fillRatio;
    const targetH = availH * fillRatio;

    const scaleX = targetW / pageWidthPx;
    const scaleY = targetH / pageHeightPx;

    const fitScale = Math.min(scaleX, scaleY);
    return Math.max(0.1, fitScale);
  }

  /**
   * Build unified, single-source-of-truth HTML document for both Preview and Print execution
   */
  public static buildLabelHtml(options: LabelHtmlOptions): string {
    const { labelConfig, barcodeValue, barcodeType, title, svgContent, pngDataUrl } = options;

    const w = labelConfig.width || 50;
    const h = labelConfig.height || 25;
    const orientation = labelConfig.orientation || 'PORTRAIT';
    const copies = labelConfig.copies || 1;

    const m = labelConfig.margins || {};
    const topMm = (m as MarginSettings).topMm ?? (m as any).top ?? 0;
    const rightMm = (m as MarginSettings).rightMm ?? (m as any).right ?? 0;
    const bottomMm = (m as MarginSettings).bottomMm ?? (m as any).bottom ?? 0;
    const leftMm = (m as MarginSettings).leftMm ?? (m as any).left ?? 0;

    let pngUrl = pngDataUrl || '';
    if (!pngUrl && svgContent) {
      const match = svgContent.match(/href=["'](data:image\/png;base64,[^"']+)["']/i) || svgContent.match(/src=["'](data:image\/png;base64,[^"']+)["']/i);
      if (match && match[1]) {
        pngUrl = match[1];
      }
    }

    let normalizedGraphic = '';
    if (pngUrl) {
      normalizedGraphic = `<img src="${pngUrl}" alt="Barcode Graphic" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: 0 auto;" />`;
    } else if (svgContent) {
      normalizedGraphic = normalizeSvg(svgContent);
    } else {
      normalizedGraphic = `<div style="font-family: monospace; font-size: 11pt; font-weight: bold; border: 2px solid black; padding: 4px; text-align: center;">*${barcodeValue}*</div>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print Label - ${barcodeValue}</title>
  <style>
    @page {
      size: ${w}mm ${h}mm ${orientation === 'LANDSCAPE' ? 'landscape' : 'portrait'};
      margin: 0;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${w}mm !important;
      height: ${h}mm !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mz-printable-document-root {
      width: ${w}mm;
      height: ${h}mm;
      padding: ${topMm}mm ${rightMm}mm ${bottomMm}mm ${leftMm}mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      background: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .label-header {
      width: 100%;
      text-align: center;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #1e293b;
      font-size: 9.5pt;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 2px;
    }
    .label-barcode-container {
      flex: 1 1 0%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 2px 0;
      overflow: hidden;
    }
    .label-barcode-container svg {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      display: block !important;
    }
    .label-barcode-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .label-footer {
      width: 100%;
      border-top: 1px solid #e2e8f0;
      padding-top: 2px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-left: 2px;
      padding-right: 2px;
    }
  </style>
</head>
<body>
  <div id="mz-printable-document-root">
    <div class="label-header">${title || ''}</div>
    <div class="label-barcode-container">
      ${normalizedGraphic}
    </div>
    <div class="label-footer">
      <span>${barcodeType}</span>
      <span>${copies} COPIES</span>
    </div>
  </div>
</body>
</html>`;
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

