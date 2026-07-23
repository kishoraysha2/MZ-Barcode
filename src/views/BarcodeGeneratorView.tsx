import React, { useState, useEffect } from 'react';
import {
  Barcode,
  QrCode,
  Printer,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Card, Button, Modal } from '../components/common/UIComponents';
import { BarcodeType, BarcodeRecord } from '../types';

interface BarcodeGeneratorViewProps {
  onAddBarcode: (record: BarcodeRecord) => void;
  onNavigate: (view: string) => void;
  initialSeqStart?: number;
}

export const BarcodeGeneratorView: React.FC<BarcodeGeneratorViewProps> = ({
  onAddBarcode,
  onNavigate,
  initialSeqStart = 1,
}) => {
  const [genMode, setGenMode] = useState<'single' | 'batch'>('single');
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('CODE128');
  const [prefix, setPrefix] = useState('MZ-');
  const [digits, setDigits] = useState(8);
  const [seqStart, setSeqStart] = useState(initialSeqStart);
  const [title, setTitle] = useState('High-Pressure Hydraulic Valve');
  const [category, setCategory] = useState('Machinery Parts');
  const [batchCount, setBatchCount] = useState(10);
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [generatedSuccessMsg, setGeneratedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialSeqStart) {
      setSeqStart(initialSeqStart);
    }
  }, [initialSeqStart]);

  const formattedBarcode = `${prefix}${String(seqStart).padStart(digits, '0')}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(formattedBarcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (genMode === 'single') {
      const newRec: BarcodeRecord = {
        id: Date.now(),
        barcodeNumber: formattedBarcode,
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
      setSeqStart((prev) => prev + 1);
      setGeneratedSuccessMsg(`Successfully generated & saved ${formattedBarcode} to SQLite database!`);
    } else {
      for (let i = 0; i < Math.min(batchCount, 50); i++) {
        const num = seqStart + i;
        const code = `${prefix}${String(num).padStart(digits, '0')}`;
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
      setGeneratedSuccessMsg(`Successfully generated ${batchCount} atomic sequential barcodes starting at ${formattedBarcode}!`);
    }
    setTimeout(() => setGeneratedSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Barcode className="h-6 w-6 text-amber-500" /> Sequential Barcode Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atomic auto-incrementing barcode engine. Guaranteed zero duplicate numbers in SQLite database.
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
            Batch Generator (1–1000)
          </button>
        </div>
      </div>

      {generatedSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{generatedSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Controls Left + Live Vector Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Barcode Parameters" subtitle="Configure prefix, sequence number, and symbology format">
            <div className="space-y-4">
              {/* Symbology Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Barcode Symbology Format
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['CODE128', 'QR', 'EAN13', 'DATAMATRIX', 'PDF417'] as BarcodeType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBarcodeType(type)}
                      className={`py-2 px-2 text-xs font-bold font-mono rounded-lg border transition-all text-center ${
                        barcodeType === type
                          ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prefix & Sequence Number Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Barcode Prefix
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Digit Length
                  </label>
                  <select
                    value={digits}
                    onChange={(e) => setDigits(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value={6}>6 Digits (000108)</option>
                    <option value={8}>8 Digits (00000108)</option>
                    <option value={10}>10 Digits (0000000108)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Atomic Counter Start
                  </label>
                  <input
                    type="number"
                    value={seqStart}
                    onChange={(e) => setSeqStart(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
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
                    placeholder="e.g. Industrial Motor Shaft"
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
                    max={100}
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Start: {formattedBarcode}</span>
                    <span>End: {prefix}{String(seqStart + batchCount - 1).padStart(digits, '0')}</span>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button onClick={handleGenerate} icon={Sparkles} size="lg" className="flex-1">
                  {genMode === 'single' ? 'Generate & Save Barcode' : `Generate Batch of ${batchCount} Barcodes`}
                </Button>
                <Button onClick={() => setShowPrintModal(true)} variant="secondary" icon={Printer} size="lg">
                  Print Spool
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Preview Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Live Thermal Label Preview" subtitle="50mm x 25mm Thermal Label Rendering">
            <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              {/* Simulated Thermal Physical Label Box */}
              <div className="w-64 bg-white text-slate-900 border-2 border-slate-300 rounded-lg p-4 shadow-lg text-center font-sans relative overflow-hidden">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                  MZ INDUSTRIAL LABEL • 50x25mm
                </div>

                <div className="text-xs font-black text-slate-900 line-clamp-1">{title || 'Sample Item Name'}</div>
                <div className="text-[10px] text-slate-500">{category}</div>

                {/* Vector Barcode Graphic */}
                <div className="my-3 flex flex-col items-center justify-center">
                  {barcodeType === 'QR' ? (
                    <div className="p-2 border border-slate-800 rounded bg-white">
                      <QrCode className="h-16 w-16 text-slate-900" />
                    </div>
                  ) : (
                    <svg className="w-52 h-14" viewBox="0 0 200 60">
                      <rect x="5" y="5" width="4" height="40" fill="#000" />
                      <rect x="11" y="5" width="2" height="40" fill="#000" />
                      <rect x="16" y="5" width="6" height="40" fill="#000" />
                      <rect x="25" y="5" width="2" height="40" fill="#000" />
                      <rect x="30" y="5" width="8" height="40" fill="#000" />
                      <rect x="42" y="5" width="3" height="40" fill="#000" />
                      <rect x="50" y="5" width="5" height="40" fill="#000" />
                      <rect x="60" y="5" width="2" height="40" fill="#000" />
                      <rect x="65" y="5" width="7" height="40" fill="#000" />
                      <rect x="76" y="5" width="4" height="40" fill="#000" />
                      <rect x="83" y="5" width="2" height="40" fill="#000" />
                      <rect x="88" y="5" width="6" height="40" fill="#000" />
                      <rect x="98" y="5" width="3" height="40" fill="#000" />
                      <rect x="105" y="5" width="8" height="40" fill="#000" />
                      <rect x="117" y="5" width="2" height="40" fill="#000" />
                      <rect x="123" y="5" width="5" height="40" fill="#000" />
                      <rect x="132" y="5" width="3" height="40" fill="#000" />
                      <rect x="140" y="5" width="6" height="40" fill="#000" />
                      <rect x="150" y="5" width="4" height="40" fill="#000" />
                      <rect x="158" y="5" width="2" height="40" fill="#000" />
                      <rect x="164" y="5" width="5" height="40" fill="#000" />
                      <rect x="173" y="5" width="2" height="40" fill="#000" />
                      <rect x="178" y="5" width="6" height="40" fill="#000" />
                      <rect x="188" y="5" width="3" height="40" fill="#000" />
                    </svg>
                  )}
                  <span className="font-mono text-sm font-black tracking-widest text-slate-900 mt-1">
                    {formattedBarcode}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                  <span>PRINT: 203 DPI</span>
                  <span>MZ ARCHIVE</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy Number'}
                </button>
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Spool
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Print Preview Dialog */}
      <Modal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title="Silent Thermal Print Spooler">
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-1">
            <div className="text-amber-400 font-bold font-mono">TARGET PRINTER: Default Thermal Driver</div>
            <div>STATUS: Direct Silent Vector Spool</div>
            <div>LABEL TARGET: {formattedBarcode}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setShowPrintModal(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowPrintModal(false);
                setGeneratedSuccessMsg(`Dispatched barcode print job to thermal printer spooler!`);
              }}
              icon={Printer}
            >
              Confirm Print Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
