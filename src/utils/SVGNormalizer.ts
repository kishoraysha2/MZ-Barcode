/**
 * SVGNormalizer Utility
 * Normalizes raw SVG string attributes so vector graphics scale fluidly inside responsive preview containers.
 */

export class SVGNormalizer {
  /**
   * Normalizes an SVG string for responsive container fitting.
   * - Derives missing viewBox from width/height attributes if necessary.
   * - Sets responsive width="100%" and height="100%".
   * - Ensures preserveAspectRatio="xMidYMid meet".
   * - Preserves internal barcode paths, images, and geometry intact.
   */
  public static normalizeSvg(svgString: string): string {
    if (!svgString || typeof svgString !== 'string') return '';

    const svg = svgString.trim();
    if (!svg) return '';

    // Extract the top-level opening <svg ...> tag
    const tagMatch = svg.match(/^<svg\b[^>]*>/i);
    if (!tagMatch) return svg;

    let openingTag = tagMatch[0];
    const rest = svg.slice(openingTag.length);

    // 1. Synthesize/Derive missing viewBox if absent on top-level <svg>
    if (!/viewBox=/i.test(openingTag)) {
      const widthMatch = openingTag.match(/\bwidth=["']?([\d.]+)(?:px)?["']?/i);
      const heightMatch = openingTag.match(/\bheight=["']?([\d.]+)(?:px)?["']?/i);

      if (widthMatch && heightMatch) {
        const w = parseFloat(widthMatch[1]);
        const h = parseFloat(heightMatch[1]);
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
          openingTag = openingTag.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}"`);
        }
      }
    }

    // 2. Ensure top-level width and height are width="100%" and height="100%"
    if (/\bwidth=/i.test(openingTag)) {
      openingTag = openingTag.replace(/\bwidth=["']?[^"'>]+["']?/i, 'width="100%"');
    } else {
      openingTag = openingTag.replace(/<svg\b/i, '<svg width="100%"');
    }

    if (/\bheight=/i.test(openingTag)) {
      openingTag = openingTag.replace(/\bheight=["']?[^"'>]+["']?/i, 'height="100%"');
    } else {
      openingTag = openingTag.replace(/<svg\b/i, '<svg height="100%"');
    }

    // 3. Ensure preserveAspectRatio="xMidYMid meet" on top-level <svg>
    if (/preserveAspectRatio=/i.test(openingTag)) {
      openingTag = openingTag.replace(/preserveAspectRatio=["']?[^"'>]+["']?/i, 'preserveAspectRatio="xMidYMid meet"');
    } else {
      openingTag = openingTag.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet"');
    }

    return openingTag + rest;
  }
}

export const normalizeSvg = SVGNormalizer.normalizeSvg;
