/**
 * MZ Barcode Suite Enterprise v1.0
 * Physical Unit & Measurement Conversion Helpers
 *
 * All coordinates in the template engine are stored natively in Millimeters (mm).
 * Conversions to Screen Pixels (px) or Thermal Printer Dots occur purely at render time.
 */

// Standard screen resolution baseline (96 DPI = 3.7795275591 px per mm)
export const SCREEN_DPI = 96;
export const MM_PER_INCH = 25.4;
export const PX_PER_MM_96DPI = SCREEN_DPI / MM_PER_INCH; // ~3.7795275591

/**
 * Convert millimeters to screen pixels at given DPI
 */
export function mmToPx(mm: number, dpi: number = SCREEN_DPI): number {
  return (mm / MM_PER_INCH) * dpi;
}

/**
 * Convert screen pixels to millimeters at given DPI
 */
export function pxToMm(px: number, dpi: number = SCREEN_DPI): number {
  return (px / dpi) * MM_PER_INCH;
}

/**
 * Convert millimeters to thermal printer dots at printer DPI (e.g. 203 DPI, 300 DPI, 600 DPI)
 */
export function mmToDots(mm: number, printerDpi: number = 203): number {
  return Math.round((mm / MM_PER_INCH) * printerDpi);
}

/**
 * Convert thermal printer dots to millimeters
 */
export function dotsToMm(dots: number, printerDpi: number = 203): number {
  return (dots / printerDpi) * MM_PER_INCH;
}

/**
 * Convert typographic points (pt) to millimeters (1 pt = 1/72 inch)
 */
export function ptToMm(pt: number): number {
  return (pt / 72) * MM_PER_INCH;
}

/**
 * Convert millimeters to typographic points (pt)
 */
export function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}

/**
 * Format a millimeter measurement to a clean display string
 */
export function formatMm(mm: number, decimals: number = 1): string {
  return `${mm.toFixed(decimals)} mm`;
}
