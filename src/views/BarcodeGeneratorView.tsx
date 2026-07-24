import React, { useState, useEffect } from 'react';
import {
  Barcode,
  Printer,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Download,
  AlertCircle,
  FileCode,
  Settings2,
} from 'lucide-react';
import { Card, Button, Modal } from '../components/common/UIComponents';
import { PrintPreviewModal } from '../components/PrintPreviewModal';
import { BarcodeRecord } from '../types';
import { electronBridge } from '../preload/bridge';

interface BarcodeGeneratorViewProps {
  onAddBarcode: (record: BarcodeRecord) => void;
  onNavigate: (view: string) => void;
  initialSeqStart?: number;
}

export const BarcodeGeneratorView: React.FC<BarcodeGeneratorViewProps> = ({
  onAddBarcode,
  initialSeqStart = 1,
}) => {
  const [genMode, setGenMode] = useState<'single' | 'batch'>('single');

  // Barcode Engine Parameters
  const [barcodeType, setBarcodeType] = useState<string>('Code128');
  const [useCustomValue, setUseCustomValue] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [prefix, setPrefix] = useState('MZ-');
  const [digits, setDigits] = useState(8);
  const [seqStart, setSeqStart] = useState(initialSeqStart);
  const [title, setTitle] = useState('High-Pressure Hydraulic Valve');
  const [category, setCategory] = useState('Machinery Parts');
  const [batchCount, setBatchCount] = useState(10);

  // Live Barcode Styling Controls
  const [widthScale, setWidthScale] = useState<number>(3);
  const [heightMm, setHeightMm] = useState<number>(15);
  const [marginPx, setMarginPx] = useState<number>(4);
  const [fontFamily, setFontFamily] = useState<string>('monospace');
  const [fontSizePx, setFontSizePx] = useState<number>(10);
  const [showHumanText, setShowHumanText] = useState<boolean>(true);

  // Label Configuration Model
  const [labelWidth, setLabelWidth] = useState<number>(50); // mm
  const [labelHeight, setLabelHeight] = useState<number>(25); // mm
  const [dpi, setDpi] = useState<number>(203);
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [copies, setCopies] = useState<number>(1);
  const [paperType, setPaperType] = useState<string>('CONTINUOUS');
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  // Render & Preview State
  const [previewSvg, setPreviewSvg] = useState<string>('');
  const [previewPng, setPreviewPng] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [generatedSuccessMsg, setGeneratedSuccessMsg] = useState<string | null>(null);

  // Print Preview & Spooling State
  const [driverType, setDriverType] = useState<'WINDOWS' | 'ZEBRA_ZPL' | 'TSPL'>('ZEBRA_ZPL');
  const [printersList, setPrintersList] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [zplCode, setZplCode] = useState<string>('');
  const [tsplCode, setTsplCode] = useState<string>('');
  const [formattedCmd, setFormattedCmd] = useState<string>('');

  useEffect(() => {
    if (initialSeqStart) {
      setSeqStart(initialSeqStart);
    }
  }, [initialSeqStart]);

  const generateSequentialValue = (
    seq: number,
    typeStr: string,
    prefixStr: string,
    digitsNum: number
  ): string => {
    const cleanType = typeStr.toUpperCase().replace(/[\s\-_]/g, '');
    const numSeq = String(seq);

    switch (cleanType) {
      case 'EAN13': {
        const numPrefix = prefixStr.replace(/\D/g, '') || '73500';
        const fillLen = Math.max(1, 12 - numPrefix.length);
        const paddedSeq = numSeq.padStart(fillLen, '0');
        return (numPrefix + paddedSeq).slice(0, 12);
      }
      case 'EAN8': {
        const numPrefix = prefixStr.replace(/\D/g, '') || '963';
        const fillLen = Math.max(1, 7 - numPrefix.length);
        const paddedSeq = numSeq.padStart(fillLen, '0');
        return (numPrefix + paddedSeq).slice(0, 7);
      }
      case 'UPCA': {
        const numPrefix = prefixStr.replace(/\D/g, '') || '012';
        const fillLen = Math.max(1, 11 - numPrefix.length);
        const paddedSeq = numSeq.padStart(fillLen, '0');
        return (numPrefix + paddedSeq).slice(0, 11);
      }
      case 'UPCE': {
        const numPrefix = prefixStr.replace(/\D/g, '') || '012';
        const fillLen = Math.max(1, 6 - numPrefix.length);
        const paddedSeq = numSeq.padStart(fillLen, '0');
        return (numPrefix + paddedSeq).slice(0, 6);
      }
      case 'CODE39': {
        const raw = `${prefixStr}${numSeq.padStart(digitsNum, '0')}`.toUpperCase();
        return raw.replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, 'X');
      }
      default: {
        return `${prefixStr}${numSeq.padStart(digitsNum, '0')}`;
      }
    }
  };

  const targetBarcodeValue = useCustomValue && customValue.trim().length > 0
    ? customValue.trim()
    : generateSequentialValue(seqStart, barcodeType, prefix, digits);

  // Instant Live Preview Trigger on Parameter Change
  useEffect(() => {
    let isSubscribed = true;

    async function updateLivePreview() {
      try {
        const res = await electronBridge.previewBarcode({
          value: targetBarcodeValue,
          type: barcodeType,
          width: widthScale,
          height: heightMm,
          margin: marginPx,
          font: fontFamily,
          fontSize: fontSizePx,
          showText: showHumanText,
        });

        if (!isSubscribed) return;

        if (res.success && res.data) {
          setPreviewSvg(res.data.svg || '');
          setPreviewPng(res.data.pngDataUrl || '');
          setValidationError(null);
        } else {
          setValidationError(res.error?.message || 'Invalid barcode format or value');
        }
      } catch (err) {
        if (isSubscribed) {
          setValidationError((err as Error).message);
        }
      }
    }

    updateLivePreview();

    return () => {
      isSubscribed = false;
    };
  }, [
    targetBarcodeValue,
    barcodeType,
    widthScale,
    heightMm,
    marginPx,
    fontFamily,
    fontSizePx,
    showHumanText,
  ]);

  // Load Printers & Profiles on Print Modal Open
  useEffect(() => {
    if (showPrintModal) {
      async function loadPrintersAndPreview() {
        try {
          const prnRes = await electronBridge.getPrinters();
          let effectivePrinter = selectedPrinter;
          if (prnRes.success && Array.isArray(prnRes.data) && prnRes.data.length > 0) {
            setPrintersList(prnRes.data);
            const defPrn = prnRes.data.find((p: any) => p.is_default === 1 || p.isDefault) || prnRes.data[0];
            if (defPrn?.name) {
              effectivePrinter = defPrn.name;
              setSelectedPrinter(defPrn.name);
            }
          }

          const printRes = await electronBridge.previewPrint({
            printerName: effectivePrinter || selectedPrinter,
            driverType,
            labelConfig: {
              width: labelWidth,
              height: labelHeight,
              dpi,
              orientation,
              copies,
              margins: { top: 2, right: 2, bottom: 2, left: 2 },
              rotation,
              paperType,
            },
            barcodeValue: targetBarcodeValue,
            barcodeType,
            title,
          });

          if (printRes.success && printRes.data) {
            setZplCode(printRes.data.zplCode || '');
            setTsplCode(printRes.data.tsplCode || '');
            setFormattedCmd(printRes.data.formattedJobCommand || '');
          }
        } catch (err) {
          console.error('Failed loading print preview:', err);
        }
      }

      loadPrintersAndPreview();
    }
  }, [
    showPrintModal,
    driverType,
    selectedPrinter,
    labelWidth,
    labelHeight,
    dpi,
    orientation,
    copies,
    rotation,
    paperType,
    targetBarcodeValue,
    barcodeType,
    title,
  ]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(targetBarcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSvg = async () => {
    try {
      const res = await electronBridge.exportBarcode({
        value: targetBarcodeValue,
        type: barcodeType,
        width: widthScale,
        height: heightMm,
        margin: marginPx,
        font: fontFamily,
        fontSize: fontSizePx,
        showText: showHumanText,
        format: 'svg',
      });

      if (res.success && res.data?.svgContent) {
        const blob = new Blob([res.data.svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${targetBarcodeValue}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed exporting SVG:', err);
    }
  };

  const handleExportPng = async () => {
    try {
      const res = await electronBridge.exportBarcode({
        value: targetBarcodeValue,
        type: barcodeType,
        width: widthScale,
        height: heightMm,
        margin: marginPx,
        font: fontFamily,
        fontSize: fontSizePx,
        showText: showHumanText,
        format: 'png',
      });

      if (res.success && res.data?.dataUrl) {
        const a = document.createElement('a');
        a.href = res.data.dataUrl;
        a.download = `${targetBarcodeValue}.png`;
        a.click();
      }
    } catch (err) {
      console.error('Failed exporting PNG:', err);
    }
  };

  const handleGenerate = () => {
    if (validationError) return;

    if (genMode === 'single') {
      const newRec: BarcodeRecord = {
        id: Date.now(),
        barcodeNumber: targetBarcodeValue,
        prefix,
        sequenceNumber: seqStart,
        type: barcodeType,
        title: title || 'Custom Barcode Item',
        category: category || 'General',
        createdBy: 'Customer Admin',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        printCount: 1,
        status: 'active',
      };
      onAddBarcode(newRec);
      if (!useCustomValue) {
        setSeqStart((prev) => prev + 1);
      }
      setGeneratedSuccessMsg(`Successfully generated & saved ${targetBarcodeValue} to SQLite database!`);
    } else {
      for (let i = 0; i < Math.min(batchCount, 50); i++) {
        const num = seqStart + i;
        const code = useCustomValue && customValue.trim().length > 0
          ? customValue.trim()
          : generateSequentialValue(num, barcodeType, prefix, digits);
        onAddBarcode({
          id: Date.now() + i,
          barcodeNumber: code,
          prefix,
          sequenceNumber: num,
          type: barcodeType,
          title: `${title} #${i + 1}`,
          category,
          createdBy: 'Customer Admin',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          printCount: 1,
          status: 'active',
        });
      }
      setSeqStart((prev) => prev + batchCount);
      setGeneratedSuccessMsg(`Successfully generated ${batchCount} atomic sequential barcodes starting at ${targetBarcodeValue}!`);
    }
    setTimeout(() => setGeneratedSuccessMsg(null), 4000);
  };

  const handleConfirmPrintJob = async () => {
    try {
      const res = await electronBridge.createPrintJob({
        printerName: selectedPrinter,
        driverType,
        barcodeValue: targetBarcodeValue,
        barcodeType,
        title,
        copies,
        labelConfig: {
          width: labelWidth,
          height: labelHeight,
          dpi,
          orientation,
          copies,
          paperType,
          rotation,
        },
      });

      setShowPrintModal(false);
      if (res.success && res.data) {
        setGeneratedSuccessMsg(`Dispatched print job #${res.data.jobId} to ${selectedPrinter} (${copies} copies)!`);
        setTimeout(() => setGeneratedSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Failed dispatching print job:', err);
    }
  };

  const handleSymbologySelect = (selectedType: string) => {
    setBarcodeType(selectedType);

    const cleanType = selectedType.toUpperCase().replace(/[\s\-_]/g, '');
    let validSample = '';
    switch (cleanType) {
      case 'EAN13':
        validSample = '7350053850015';
        if (prefix === 'MZ-') {
          setPrefix('73500');
          setDigits(7);
        }
        break;
      case 'EAN8':
        validSample = '96385074';
        if (prefix === 'MZ-') {
          setPrefix('963');
          setDigits(4);
        }
        break;
      case 'UPCA':
        validSample = '012345678905';
        if (prefix === 'MZ-') {
          setPrefix('012');
          setDigits(8);
        }
        break;
      case 'UPCE':
        validSample = '0123456';
        if (prefix === 'MZ-') {
          setPrefix('012');
          setDigits(4);
        }
        break;
      case 'CODE39':
        validSample = (useCustomValue && customValue ? customValue : targetBarcodeValue).toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, 'X') || 'MZ-0001';
        break;
      case 'QRCODE':
      case 'QR':
        validSample = 'https://mz-industrial.com/item/MZ-00000001';
        break;
      case 'DATAMATRIX':
        validSample = 'MZ-DATAMATRIX-0001';
        break;
      case 'PDF417':
        validSample = 'MZ-PDF417-0001';
        break;
      default:
        validSample = 'MZ-00000001';
        if (prefix === '73500' || prefix === '963' || prefix === '012') {
          setPrefix('MZ-');
          setDigits(8);
        }
        break;
    }

    setCustomValue(validSample);

    if (cleanType.includes('QR') || cleanType.includes('DATA') || cleanType.includes('PDF')) {
      setUseCustomValue(true);
    }
  };

  const supportedTypes = [
    { label: 'Code 128', value: 'Code128' },
    { label: 'Code 39', value: 'Code39' },
    { label: 'EAN-13', value: 'EAN-13' },
    { label: 'EAN-8', value: 'EAN-8' },
    { label: 'UPC-A', value: 'UPC-A' },
    { label: 'UPC-E', value: 'UPC-E' },
    { label: 'QR Code', value: 'QR Code' },
    { label: 'Data Matrix', value: 'Data Matrix' },
    { label: 'PDF417', value: 'PDF417' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Barcode className="h-6 w-6 text-amber-500" /> Enterprise Barcode Engine & Print Foundation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vector barcode generation, real-time live preview, and multi-driver thermal print engine.
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setGenMode('single')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              genMode === 'single'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Barcode
          </button>
          <button
            onClick={() => setGenMode('batch')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              genMode === 'batch'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch Generator (1–50)
          </button>
        </div>
      </div>

      {generatedSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{generatedSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Controls Left + Live Vector Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Barcode Engine & Symbology Settings" subtitle="Configure barcode type, input payload, and vector geometry parameters">
            <div className="space-y-4">
              {/* Symbology Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Barcode Symbology Format
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {supportedTypes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleSymbologySelect(t.value)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all text-center ${
                        barcodeType === t.value
                          ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Value Source Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payload Source</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseCustomValue(false)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        !useCustomValue ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Sequential Sequence
                    </button>
                    <button
                      onClick={() => setUseCustomValue(true)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        useCustomValue ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Custom Payload
                    </button>
                  </div>
                </div>

                {!useCustomValue ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Prefix
                      </label>
                      <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Digits
                      </label>
                      <select
                        value={digits}
                        onChange={(e) => setDigits(Number(e.target.value))}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      >
                        <option value={6}>6 Digits</option>
                        <option value={8}>8 Digits</option>
                        <option value={10}>10 Digits</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Sequence Counter
                      </label>
                      <input
                        type="number"
                        value={seqStart}
                        onChange={(e) => setSeqStart(Number(e.target.value))}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Direct Barcode Input Value
                    </label>
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder={`e.g. ${barcodeType === 'EAN-13' ? '735005385001' : 'MZ-990812'}`}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Title & Category Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Item / Product Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. High-Pressure Hydraulic Valve"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Machinery / Logistics"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Vector Geometry Controls */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Settings2 className="h-4 w-4 text-amber-500" />
                  <span>Geometry & Styling Controls</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Width Scale ({widthScale}x)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={widthScale}
                      onChange={(e) => setWidthScale(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Bar Height ({heightMm}mm)
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Margin Padding ({marginPx}px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={marginPx}
                      onChange={(e) => setMarginPx(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Font Size ({fontSizePx}pt)
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={20}
                      step={1}
                      value={fontSizePx}
                      onChange={(e) => setFontSizePx(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs"
                    >
                      <option value="monospace">Monospace</option>
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={showHumanText}
                        onChange={(e) => setShowHumanText(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>Show Human Readable Text</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Batch Count Slider if Batch Mode */}
              {genMode === 'batch' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-amber-500">
                    <span>Batch Quantity Count</span>
                    <span className="font-mono text-sm">{batchCount} Labels</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Start: {targetBarcodeValue}</span>
                    <span>End: {prefix}{String(seqStart + batchCount - 1).padStart(digits, '0')}</span>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={Boolean(validationError)}
                  icon={Sparkles}
                  size="lg"
                  className="flex-1"
                >
                  {genMode === 'single' ? 'Generate & Save Barcode' : `Generate Batch of ${batchCount} Barcodes`}
                </Button>
                <Button onClick={() => setShowPrintModal(true)} variant="secondary" icon={Printer} size="lg">
                  Print Spool
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Preview & Export Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Live Thermal Label Preview" subtitle="Instant SVG/PNG Vector Barcode Engine Preview">
            <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              {validationError ? (
                <div className="w-full p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                  <div className="text-xs font-bold text-rose-500">Generation Error</div>
                  <p className="text-[11px] text-slate-400 font-mono">{validationError}</p>
                </div>
              ) : (
                /* Thermal Physical Label Container */
                <div className="w-full max-w-xs bg-white text-slate-900 border-2 border-slate-300 rounded-lg p-4 shadow-lg text-center font-sans relative overflow-hidden">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                    MZ INDUSTRIAL LABEL • {labelWidth}x{labelHeight}mm
                  </div>

                  <div className="text-xs font-black text-slate-900 line-clamp-1">{title || 'Sample Product Name'}</div>
                  <div className="text-[10px] text-slate-500">{category || 'General'}</div>

                  {/* Render Live Vector/PNG Graphic */}
                  <div className="my-3 flex flex-col items-center justify-center min-h-[90px]">
                    {previewSvg ? (
                      <div
                        className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                        dangerouslySetInnerHTML={{ __html: previewSvg }}
                      />
                    ) : previewPng ? (
                      <img src={previewPng} alt="Barcode Preview" className="max-w-full h-auto" />
                    ) : (
                      <div className="text-xs text-slate-400 font-mono">Generating barcode...</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <span>{dpi} DPI • {paperType}</span>
                    <span>MZ ARCHIVE</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Copy, Export SVG, Export PNG, Print */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleExportSvg}
                  disabled={Boolean(validationError)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> SVG
                </button>

                <button
                  onClick={handleExportPng}
                  disabled={Boolean(validationError)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> PNG
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  disabled={Boolean(validationError)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Spool
                </button>
              </div>
            </div>
          </Card>

          {/* Label Model Configuration */}
          <Card title="Label Physical Model Settings" subtitle="Configure printer DPI, paper dimensions, orientation, and copies">
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Label Width (mm)</label>
                  <input
                    type="number"
                    value={labelWidth}
                    onChange={(e) => setLabelWidth(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Label Height (mm)</label>
                  <input
                    type="number"
                    value={labelHeight}
                    onChange={(e) => setLabelHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Resolution</label>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 font-mono"
                  >
                    <option value={203}>203 DPI</option>
                    <option value={300}>300 DPI</option>
                    <option value={600}>600 DPI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as 'PORTRAIT' | 'LANDSCAPE')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 font-mono"
                  >
                    <option value="PORTRAIT">Portrait</option>
                    <option value="LANDSCAPE">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Copies</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Paper Type</label>
                  <select
                    value={paperType}
                    onChange={(e) => setPaperType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                  >
                    <option value="CONTINUOUS">Continuous Roll</option>
                    <option value="GAP">Die-Cut Gap</option>
                    <option value="BLACK_MARK">Black Mark</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Rotation</label>
                  <select
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value) as 0 | 90 | 180 | 270)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 font-mono"
                  >
                    <option value={0}>0° Standard</option>
                    <option value={90}>90° Clockwise</option>
                    <option value={180}>180° Inverted</option>
                    <option value={270}>270° Counter-Clockwise</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Print Preview Engine Modal */}
      <PrintPreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        barcodeValue={targetBarcodeValue}
        barcodeType={barcodeType}
        title={title}
        previewSvg={previewSvg}
        previewPng={previewPng}
        initialLabelWidth={labelWidth}
        initialLabelHeight={labelHeight}
        initialCopies={copies}
        initialDpi={dpi}
      />
    </div>
  );
};
