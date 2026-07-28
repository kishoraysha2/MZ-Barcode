import React, { useState } from 'react';
import { Camera, Scan, ShieldCheck, Video, RefreshCw, Sparkles, Layers } from 'lucide-react';

export const CameraScannerView: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Camera Barcode Scanner Architecture</h3>
              <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 uppercase">
                Module Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">Integrated video stream frame analyzer & optical 1D/2D decoder pipeline</p>
          </div>
        </div>

        <button
          onClick={() => setIsCameraActive(!isCameraActive)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all ${
            isCameraActive
              ? 'bg-rose-600 hover:bg-rose-500'
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          <Video className="h-4 w-4" />
          {isCameraActive ? 'Stop Camera Stream' : 'Initialize Camera Stream'}
        </button>
      </div>

      {/* Viewfinder Mockup Canvas */}
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-12 overflow-hidden min-h-[280px]">
        {/* Optical Scanning Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

        {isCameraActive ? (
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative h-48 w-72 rounded-2xl border-2 border-dashed border-purple-500 bg-purple-950/20 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-bounce"></div>
              <Scan className="h-12 w-12 text-purple-400 animate-pulse" />
              <div className="absolute bottom-2 inset-x-2 rounded bg-black/60 py-1 text-[11px] font-mono text-purple-200">
                1080p Optical Frame Analyzer Active
              </div>
            </div>
            <p className="mt-3 text-xs text-purple-300 font-medium">Position barcode inside viewfinder box to auto-capture</p>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400 mb-3 ring-1 ring-purple-500/20">
              <Camera className="h-8 w-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Optical Camera Decoder Interface</h4>
            <p className="mt-1 max-w-md text-xs text-slate-400">
              The camera scanning module architecture supports WebRTC MediaDevices, resolution auto-scaling, and ZXing/BarcodeDetector APIs.
            </p>
          </div>
        )}
      </div>

      {/* Architectural Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 font-semibold text-purple-400 mb-1">
            <ShieldCheck className="h-4 w-4" />
            Supported Formats
          </div>
          <p className="text-[11px] text-slate-400">CODE128, EAN-13, EAN-8, UPC-A, QR Code, DataMatrix, PDF417</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
            <RefreshCw className="h-4 w-4" />
            Auto Focus & Exposure
          </div>
          <p className="text-[11px] text-slate-400">Hardware Torch control, Continuous Autofocus, Exposure Lock</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
            <Sparkles className="h-4 w-4" />
            IPC Integration
          </div>
          <p className="text-[11px] text-slate-400">Directly routes detected strings to <code className="text-emerald-300">ScannerService.processScan()</code></p>
        </div>
      </div>
    </div>
  );
};
