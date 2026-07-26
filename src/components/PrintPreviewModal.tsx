import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sliders,
  Check,
  X,
  AlertTriangle,
  FileText,
  Copy,
  Layout,
  Settings,
  Layers,
  Barcode,
} from 'lucide-react';
import { Modal, Button, Badge } from './common/UIComponents';
import { electronBridge } from '../preload/bridge';
import {
  PrintLayoutEngine,
  PaperSizePreset,
  MarginPreset,
  Orientation,
  PaperConfig,
  MarginSettings,
} from '../utils/PrintLayoutEngine';
import { normalizeSvg } from '../utils/SVGNormalizer';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  barcodeValue: string;
  barcodeType: string;
  title?: string;
  previewSvg?: string;
  previewPng?: string;
  initialLabelWidth?: number;
  initialLabelHeight?: number;
  initialCopies?: number;
  initialDpi?: number;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  barcodeValue,
  barcodeType,
  title = 'Sample Item Barcode',
  previewSvg = '',
  previewPng = '',
  initialLabelWidth = 50,
  initialLabelHeight = 25,
  initialCopies = 1,
  initialDpi = 203,
}) => {
  // Printer Discovery State
  const [printers, setPrinters] = useState<Array<{ name: string; driver_type?: string; dpi?: number; is_default?: number }>>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [driverType, setDriverType] = useState<string>('ZEBRA_ZPL');

  // Page & Print Config State
  const [paperPreset, setPaperPreset] = useState<PaperSizePreset>('50x25');
  const [customWidthMm, setCustomWidthMm] = useState<number>(initialLabelWidth);
  const [customHeightMm, setCustomHeightMm] = useState<number>(initialLabelHeight);
  const [orientation, setOrientation] = useState<Orientation>('PORTRAIT');
  const [marginPreset, setMarginPreset] = useState<MarginPreset>('NARROW');
  const [customMargins, setCustomMargins] = useState<MarginSettings>({ topMm: 2, rightMm: 2, bottomMm: 2, leftMm: 2 });
  const [dpi, setDpi] = useState<number>(initialDpi);
  const [copies, setCopies] = useState<number>(initialCopies);
  const [printOutputMode, setPrintOutputMode] = useState<'DIALOG' | 'SILENT'>('DIALOG');

  // Zoom & Viewport Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100); // Percentage 25% - 400%
  const [previewMode, setPreviewMode] = useState<'fit' | 'actual' | 'fitWidth' | 'fitHeight'>('fit');
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Status & Feedback
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccessMsg, setPrintSuccessMsg] = useState<string | null>(null);
  const [printErrorMsg, setPrintErrorMsg] = useState<string | null>(null);

  // Ensure printable root element exists in DOM
  useEffect(() => {
    let printRoot = document.getElementById('mz-printable-document-root');
    if (!printRoot) {
      printRoot = document.createElement('div');
      printRoot.id = 'mz-printable-document-root';
      document.body.appendChild(printRoot);
    }
  }, []);

  // Sync initial sizes on open
  useEffect(() => {
    if (isOpen) {
      setCustomWidthMm(initialLabelWidth);
      setCustomHeightMm(initialLabelHeight);
      setDpi(initialDpi);
      setCopies(initialCopies);

      // Fetch printers list from main service via IPC
      console.log('[PrintPreviewModal] Requesting printers via electronBridge.getPrinters()...');
      electronBridge.getPrinters().then((res) => {
        console.log('[PrintPreviewModal] Stage 1 - IPC response:', JSON.stringify(res));
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          console.log('[PrintPreviewModal] Stage 2 - Renderer extracted array:', res.data);
          setPrinters(res.data);
          console.log('[PrintPreviewModal] Stage 3 - React state updated (printers count):', res.data.length);
          const defaultPrn = res.data.find((p) => p.is_default === 1 || p.isDefault) || res.data[0];
          setSelectedPrinter(defaultPrn.name);
          if (defaultPrn.driver_type) {
            setDriverType(defaultPrn.driver_type);
          }
        } else {
          console.log('[PrintPreviewModal] Stage 2 - IPC response empty/failed, using fallback array:', res);
          const fallbackArr = [
            { name: 'Canon G3010 series', driver_type: 'WINDOWS', dpi: 203, is_default: 1 },
            { name: 'Microsoft Print to PDF', driver_type: 'WINDOWS', dpi: 300, is_default: 0 },
            { name: 'Microsoft XPS Document Writer', driver_type: 'WINDOWS', dpi: 203, is_default: 0 },
          ];
          setPrinters(fallbackArr);
          setSelectedPrinter('Canon G3010 series');
        }
      });
    }
  }, [isOpen, initialLabelWidth, initialLabelHeight, initialDpi, initialCopies]);

  // Handle printer dropdown selection
  const handleSelectPrinter = (printerName: string) => {
    setSelectedPrinter(printerName);
    const found = printers.find((p) => p.name === printerName);
    if (found?.driver_type) {
      setDriverType(found.driver_type);
    }
    if (found?.dpi) {
      setDpi(found.dpi);
    }
  };

  // Get effective margins based on preset
  const activeMargins: MarginSettings =
    marginPreset === 'CUSTOM'
      ? customMargins
      : PrintLayoutEngine.MARGIN_PRESETS[marginPreset].margins;

  // Get physical page dimensions
  const pageBounds = PrintLayoutEngine.getPageBounds(
    paperPreset,
    orientation,
    customWidthMm,
    customHeightMm
  );

  // Get printable area
  const printable = PrintLayoutEngine.getPrintableArea(pageBounds, activeMargins, dpi);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(400, prev + 25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(25, prev - 25));
  };

  const handleRecalculateScale = () => {
    if (!previewContainerRef.current) return;
    const containerW = previewContainerRef.current.clientWidth || 600;
    const containerH = previewContainerRef.current.clientHeight || 450;
    const pagePxW = PrintLayoutEngine.mmToPx(pageBounds.widthMm, 96);
    const pagePxH = PrintLayoutEngine.mmToPx(pageBounds.heightMm, 96);

    if (previewMode === 'fit') {
      const fitScale = PrintLayoutEngine.calculateFitScale(pagePxW, pagePxH, containerW, containerH, 20, 1.0);
      setZoomLevel(Math.round(fitScale * 100));
    } else if (previewMode === 'actual') {
      setZoomLevel(100);
    } else if (previewMode === 'fitWidth') {
      const availW = Math.max(100, containerW - 32);
      const scale = availW / pagePxW;
      setZoomLevel(Math.max(25, Math.round(scale * 100)));
    } else if (previewMode === 'fitHeight') {
      const availH = Math.max(100, containerH - 32);
      const scale = availH / pagePxH;
      setZoomLevel(Math.max(25, Math.round(scale * 100)));
    }
  };

  // Auto fit/scale on modal open, dimension changes, or mode changes
  useEffect(() => {
    if (!isOpen) return;
    handleRecalculateScale();
  }, [isOpen, pageBounds.widthMm, pageBounds.heightMm, orientation, previewMode]);

  // Observe preview container size changes
  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      handleRecalculateScale();
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [previewMode, pageBounds.widthMm, pageBounds.heightMm]);

  // Ensure SVG root tag has preserveAspectRatio="xMidYMid meet" and viewBox for vector scaling
  const formattedPreviewSvg = useMemo(() => {
    return normalizeSvg(previewSvg);
  }, [previewSvg]);

  // Console Runtime Debug Logging
  useEffect(() => {
    if (!isOpen || !previewContainerRef.current) return;
    const elem = previewContainerRef.current;
    const containerW = elem.clientWidth || 600;
    const containerH = elem.clientHeight || 450;
    const physWmm = pageBounds.widthMm;
    const physHmm = pageBounds.heightMm;
    const pagePxW = PrintLayoutEngine.mmToPx(physWmm, 96);
    const pagePxH = PrintLayoutEngine.mmToPx(physHmm, 96);

    const fitScale = (zoomLevel / 100).toFixed(4);
    const renderedW = Math.round(pagePxW * (zoomLevel / 100));
    const renderedH = Math.round(pagePxH * (zoomLevel / 100));

    const computedStyle = window.getComputedStyle(elem);
    const transform = computedStyle ? computedStyle.transform : 'none';

    console.log('[RUNTIME DEBUG - PRINT PREVIEW MODAL VIEWPORT]', {
      containerWidthPx: containerW,
      containerHeightPx: containerH,
      physicalWidthMm: physWmm,
      physicalHeightMm: physHmm,
      convertedWidthPx: Math.round(pagePxW),
      convertedHeightPx: Math.round(pagePxH),
      computedFitScale: fitScale,
      finalRenderedSvgWidth: `${renderedW}px (100%)`,
      finalRenderedSvgHeight: `${renderedH}px (100%)`,
      actualDomWidth: elem.clientWidth,
      actualDomHeight: elem.clientHeight,
      cssTransformsApplied: transform,
      scaleApplied: `scale(${fitScale})`,
      zoomValue: `${zoomLevel}% (Mode: ${previewMode})`,
      preserveAspectRatioOverridden: formattedPreviewSvg.includes('preserveAspectRatio="xMidYMid meet"'),
    });
  }, [isOpen, pageBounds.widthMm, pageBounds.heightMm, zoomLevel, previewMode, formattedPreviewSvg]);

  // Dispatch Print Job
  const handleExecutePrint = async () => {
    try {
      setIsPrinting(true);
      setPrintSuccessMsg(null);
      setPrintErrorMsg(null);

      const paperConfig: PaperConfig = {
        preset: paperPreset,
        widthMm: pageBounds.widthMm,
        heightMm: pageBounds.heightMm,
        orientation,
        margins: activeMargins,
        marginPreset,
        dpi,
      };

      // 1. Dispatch through IPC Print Service backend
      const res = await electronBridge.createPrintJob({
        printerName: selectedPrinter,
        driverType,
        barcodeValue,
        barcodeType,
        title,
        copies,
        printMode: printOutputMode,
        svgContent: formattedPreviewSvg || previewSvg,
        pngDataUrl: previewPng,
        labelConfig: {
          width: pageBounds.widthMm,
          height: pageBounds.heightMm,
          dpi,
          orientation,
          copies,
          margins: {
            top: activeMargins.topMm,
            right: activeMargins.rightMm,
            bottom: activeMargins.bottomMm,
            left: activeMargins.leftMm,
          },
        },
      });

      // 2. Trigger browser print stylesheet mode for immediate physical print preview / PDF download
      const styleEl = document.createElement('style');
      styleEl.id = 'mz-print-preview-stylesheet';
      styleEl.innerHTML = PrintLayoutEngine.generatePrintCss(paperConfig);
      document.head.appendChild(styleEl);

      setIsPrinting(false);

      if (res.data?.status === 'PRINTED' || (res.success && res.data?.status !== 'CANCELLED' && res.data?.status !== 'FAILED')) {
        setPrintSuccessMsg(`Print Sent Successfully to ${selectedPrinter || 'Default Printer'} (${copies} copies)`);
      } else if (res.data?.status === 'CANCELLED') {
        setPrintErrorMsg('Print job was cancelled by user');
      } else {
        const errText = res.data?.error || res.error?.message || 'Windows print spooler rejected the job';
        setPrintErrorMsg(`Print Failed: ${errText}`);
      }

      setTimeout(() => {
        setPrintSuccessMsg(null);
        setPrintErrorMsg(null);
        // Clean up injected style tag
        const el = document.getElementById('mz-print-preview-stylesheet');
        if (el) el.remove();
      }, 5000);
    } catch (err) {
      console.error('Failed executing print job:', err);
      setIsPrinting(false);
      setPrintErrorMsg('Print dispatch exception occurred');
    }
  };

  // Printable isolated document portal target
  const printRoot = typeof document !== 'undefined' ? document.getElementById('mz-printable-document-root') : null;

  const printableDocumentPortal = printRoot
    ? createPortal(
        <div
          style={{
            width: `${pageBounds.widthMm}mm`,
            height: `${pageBounds.heightMm}mm`,
            paddingTop: `${activeMargins.topMm}mm`,
            paddingRight: `${activeMargins.rightMm}mm`,
            paddingBottom: `${activeMargins.bottomMm}mm`,
            paddingLeft: `${activeMargins.leftMm}mm`,
            boxSizing: 'border-box',
          }}
          className="bg-white text-slate-900 flex flex-col items-center justify-between overflow-hidden"
        >
          <div className="text-center font-sans font-bold tracking-tight text-slate-900 truncate w-full text-xs">
            {title}
          </div>
          <div className="flex-1 w-full flex items-center justify-center my-1 overflow-hidden">
            {formattedPreviewSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: formattedPreviewSvg }}
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:block opacity-100"
              />
            ) : previewPng ? (
              <img src={previewPng} alt="Barcode Graphic" className="max-w-full max-h-full object-contain" />
            ) : null}
          </div>
          <div className="w-full border-t border-slate-300 pt-0.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-slate-700">
            <span>{barcodeType}</span>
            <span>{copies} COPIES</span>
          </div>
        </div>,
        printRoot
      )
    : null;

  return (
    <>
      {printableDocumentPortal}
      <Modal isOpen={isOpen} onClose={onClose} title="Enterprise Print Engine - Page Setup & Preview" maxWidth="max-w-5xl">
        <div className="flex flex-col md:flex-row gap-5 text-xs text-slate-800 dark:text-slate-200">
          {/* LEFT COLUMN: Controls & Settings Panel */}
          <div className="w-full md:w-80 shrink-0 space-y-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 md:pr-5">
            {/* Printer Discovery Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5 text-amber-500" />
                Target Printer
              </label>
              <select
                value={selectedPrinter}
                onChange={(e) => handleSelectPrinter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100"
              >
                {(() => {
                  console.log('[PrintPreviewModal] Stage 4 - Dropdown runtime array:', printers.map((p) => p.name));
                  return printers.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ));
                })()}
              </select>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Driver: <strong className="font-mono text-amber-500">{driverType}</strong></span>
                <span>Res: <strong className="font-mono text-amber-500">{dpi} DPI</strong></span>
              </div>
            </div>

            {/* Print Output Mode Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                Print Output Mode
              </label>
              <select
                value={printOutputMode}
                onChange={(e) => setPrintOutputMode(e.target.value as 'DIALOG' | 'SILENT')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
              >
                <option value="DIALOG">Windows Print Dialog (Interactive)</option>
                <option value="SILENT">Silent Direct Print (Background)</option>
              </select>
            </div>

            {/* Paper Size Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                Paper / Label Size
              </label>
              <select
                value={paperPreset}
                onChange={(e) => setPaperPreset(e.target.value as PaperSizePreset)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
              >
                {Object.entries(PrintLayoutEngine.PAPER_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>

              {/* Custom dimensions inputs if custom selected */}
              {paperPreset === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Width (mm)</span>
                    <input
                      type="number"
                      value={customWidthMm}
                      onChange={(e) => setCustomWidthMm(Math.max(10, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Height (mm)</span>
                    <input
                      type="number"
                      value={customHeightMm}
                      onChange={(e) => setCustomHeightMm(Math.max(10, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Orientation & Copies */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Layout className="h-3.5 w-3.5 text-amber-500" />
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100"
                >
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5 text-amber-500" />
                  Copies
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Margins Settings */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                Page Margins
              </label>
              <select
                value={marginPreset}
                onChange={(e) => setMarginPreset(e.target.value as MarginPreset)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
              >
                {Object.entries(PrintLayoutEngine.MARGIN_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>

              {marginPreset === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Top (mm)</span>
                    <input
                      type="number"
                      value={customMargins.topMm}
                      onChange={(e) => setCustomMargins({ ...customMargins, topMm: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-950 border rounded px-1.5 py-0.5 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block">Right (mm)</span>
                    <input
                      type="number"
                      value={customMargins.rightMm}
                      onChange={(e) => setCustomMargins({ ...customMargins, rightMm: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-950 border rounded px-1.5 py-0.5 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bottom (mm)</span>
                    <input
                      type="number"
                      value={customMargins.bottomMm}
                      onChange={(e) => setCustomMargins({ ...customMargins, bottomMm: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-950 border rounded px-1.5 py-0.5 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block">Left (mm)</span>
                    <input
                      type="number"
                      value={customMargins.leftMm}
                      onChange={(e) => setCustomMargins({ ...customMargins, leftMm: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-950 border rounded px-1.5 py-0.5 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Printable Bounds Summary Box */}
            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1 text-[11px]">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Print Bounds</span>
                <Badge variant="amber">{pageBounds.widthMm} x {pageBounds.heightMm} mm</Badge>
              </div>
              <div className="text-slate-500 flex justify-between text-[10px]">
                <span>Printable Area:</span>
                <span className="font-mono text-emerald-500 font-semibold">{printable.widthMm} x {printable.heightMm} mm</span>
              </div>
              <div className="text-slate-500 flex justify-between text-[10px]">
                <span>Dots ({dpi} DPI):</span>
                <span className="font-mono text-slate-400">{PrintLayoutEngine.mmToPx(pageBounds.widthMm, dpi)} x {PrintLayoutEngine.mmToPx(pageBounds.heightMm, dpi)} px</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Live Page Canvas & Zoom Viewport (Stable flex container occupying remaining space) */}
          <div className="flex-1 min-w-0 md:min-w-[400px] flex flex-col min-h-[420px] bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-hidden relative">
            {/* Zoom Toolbar */}
            <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-xs p-2 rounded-lg border border-slate-800 mb-3 z-10 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Mode:</span>
                  <select
                    value={previewMode}
                    onChange={(e) => setPreviewMode(e.target.value as any)}
                    className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded px-2 py-1 text-xs font-medium focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="fit">Fit to View</option>
                    <option value="actual">Actual Size (100%)</option>
                    <option value="fitWidth">Fit Width</option>
                    <option value="fitHeight">Fit Height</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>

                  <select
                    value={[50, 75, 100, 125, 150, 200, 400].includes(zoomLevel) ? zoomLevel : ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val) setZoomLevel(val);
                    }}
                    className="bg-slate-900 text-amber-400 border border-slate-700/80 rounded px-1.5 py-1 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {!([50, 75, 100, 125, 150, 200, 400].includes(zoomLevel)) && (
                      <option value="">{zoomLevel}%</option>
                    )}
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                    <option value={400}>400%</option>
                  </select>

                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <span className="hidden sm:inline">{barcodeType}</span>
                <span className="text-amber-500 font-bold">{barcodeValue}</span>
              </div>
            </div>

            {/* Interactive Scalable Page Canvas Box */}
            <div
              ref={previewContainerRef}
              className="flex-1 min-h-[280px] w-full flex items-center justify-center overflow-auto p-4 relative bg-slate-950/50 rounded-lg border border-dashed border-slate-800/80"
            >
              {/* Physical Paper Boundary Simulation */}
              <div
                style={{
                  width: `${PrintLayoutEngine.mmToPx(pageBounds.widthMm, 96) * (zoomLevel / 100)}px`,
                  height: `${PrintLayoutEngine.mmToPx(pageBounds.heightMm, 96) * (zoomLevel / 100)}px`,
                  transition: 'width 0.15s ease-out, height 0.15s ease-out',
                }}
                className="bg-white text-slate-900 shadow-2xl rounded-xs flex flex-col items-center justify-between border border-slate-300 relative overflow-hidden group"
              >
                {/* Margins Boundary Visualization Line */}
                <div
                  className="absolute inset-0 pointer-events-none border border-dashed border-rose-400/40 opacity-60 z-20"
                  style={{
                    top: `${PrintLayoutEngine.mmToPx(activeMargins.topMm, 96) * (zoomLevel / 100)}px`,
                    right: `${PrintLayoutEngine.mmToPx(activeMargins.rightMm, 96) * (zoomLevel / 100)}px`,
                    bottom: `${PrintLayoutEngine.mmToPx(activeMargins.bottomMm, 96) * (zoomLevel / 100)}px`,
                    left: `${PrintLayoutEngine.mmToPx(activeMargins.leftMm, 96) * (zoomLevel / 100)}px`,
                  }}
                />

                {/* Single Source of Truth Preview Document Frame */}
                <iframe
                  srcDoc={PrintLayoutEngine.buildLabelHtml({
                    labelConfig: {
                      width: pageBounds.widthMm,
                      height: pageBounds.heightMm,
                      orientation,
                      margins: activeMargins,
                      copies,
                    },
                    barcodeValue,
                    barcodeType,
                    title,
                    svgContent: formattedPreviewSvg || previewSvg,
                    pngDataUrl: previewPng,
                  })}
                  className="w-full h-full border-0 pointer-events-none select-none bg-white z-10"
                  title="Unified Label Preview"
                />
              </div>
            </div>

          {/* Success / Error Banners */}
          {printSuccessMsg && (
            <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-xs flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>{printSuccessMsg}</span>
            </div>
          )}

          {printErrorMsg && (
            <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{printErrorMsg}</span>
            </div>
          )}

          {/* Footer Action Controls */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono">
              Spooler Mode: <strong className="text-amber-400">{driverType}</strong>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={onClose} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleExecutePrint}
                disabled={isPrinting}
                icon={Printer}
                size="sm"
              >
                {isPrinting ? 'Spooling Print...' : `Print Label (${copies})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </>
);
};
