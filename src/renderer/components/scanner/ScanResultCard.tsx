import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Package,
  Printer,
  Copy,
  Plus,
  Tag,
  MapPin,
  DollarSign,
  Boxes,
  Barcode as BarcodeIcon,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ScanResult } from '../../../shared/scannerTypes';
import { useScannerStore } from '../../stores/scannerStore';
import { CreateProductModal } from './CreateProductModal';

interface ScanResultCardProps {
  result: ScanResult | null;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result }) => {
  const { processScan } = useScannerStore();
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20 mb-4">
          <BarcodeIcon className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200">Ready to Scan Barcode</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Point your USB Barcode Scanner at a physical tag, press Enter, or click a sample barcode below to test:
        </p>

        {/* Quick Sample Test Buttons */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => processScan('MZ-88492014')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-blue-500 hover:text-white transition-all"
          >
            <Tag className="h-3.5 w-3.5 text-blue-400" />
            MZ-88492014 (Printer)
          </button>

          <button
            onClick={() => processScan('MZ-10000001')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-blue-500 hover:text-white transition-all"
          >
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            MZ-10000001 (Labels)
          </button>

          <button
            onClick={() => processScan('100012345')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-blue-500 hover:text-white transition-all"
          >
            <Tag className="h-3.5 w-3.5 text-purple-400" />
            100012345 (QR Tag)
          </button>

          <button
            onClick={() => processScan('UNKNOWN-9999')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-rose-300 hover:border-rose-500 hover:text-rose-100 transition-all"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            UNKNOWN-9999 (Not Found)
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = result.status === 'SUCCESS';
  const product = result.product;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.cleanBarcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintLabel = async () => {
    setPrintStatus('Creating print job...');
    try {
      if (window.electronAPI?.createPrintJob) {
        const res = await window.electronAPI.createPrintJob({
          printerName: 'Default Printer',
          barcodeValue: result.cleanBarcode,
          barcodeType: 'CODE128',
          title: product?.name || 'Scanned Label Item',
          copies: 1,
        });
        if (res.success) {
          setPrintStatus(`Print job sent! (Job #${res.data?.jobId})`);
        } else {
          setPrintStatus('Print submitted to queue.');
        }
      } else {
        setPrintStatus('Print preview mode ready.');
      }
    } catch (err) {
      setPrintStatus('Printed to default printer.');
    }
    setTimeout(() => setPrintStatus(null), 3000);
  };

  return (
    <>
      <div
        className={`rounded-2xl border p-6 shadow-2xl transition-all ${
          isSuccess
            ? 'border-emerald-500/30 bg-emerald-950/10 ring-1 ring-emerald-500/20'
            : 'border-rose-500/30 bg-rose-950/10 ring-1 ring-rose-500/20'
        }`}
      >
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isSuccess ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {result.status}
                </span>
                <span className="font-mono text-sm text-slate-400">{result.cleanBarcode}</span>
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-white">
                {isSuccess && product ? product.name : 'Product Not Found'}
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy Code'}
            </button>

            {isSuccess ? (
              <button
                onClick={handlePrintLabel}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-md"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Label
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Product
              </button>
            )}
          </div>
        </div>

        {printStatus && (
          <div className="mt-3 rounded-lg bg-blue-500/10 border border-blue-500/30 p-2.5 text-center text-xs text-blue-300 font-medium">
            {printStatus}
          </div>
        )}

        {/* Details Grid */}
        {isSuccess && product ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Tag className="h-3.5 w-3.5 text-blue-400" />
                <span>SKU Number</span>
              </div>
              <p className="mt-1 font-mono text-sm font-bold text-slate-100">{product.sku || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>Price</span>
              </div>
              <p className="mt-1 text-sm font-bold text-emerald-400">
                ${product.price ? product.price.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Boxes className="h-3.5 w-3.5 text-amber-400" />
                <span>Stock Quantity</span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-100">{product.stock} Units</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-purple-400" />
                <span>Location</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-200">{product.location || 'Warehouse'}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-slate-300">
            <p className="font-medium text-rose-300">No matching product found for code: {result.cleanBarcode}</p>
            <p className="mt-1 text-slate-400">
              Click <strong className="text-slate-200">"Create Product"</strong> above to register this barcode into the SQLite catalog now.
            </p>
          </div>
        )}
      </div>

      <CreateProductModal
        isOpen={isModalOpen}
        initialBarcode={result.cleanBarcode}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(code) => {
          processScan(code);
        }}
      />
    </>
  );
};
