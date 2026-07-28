import React, { useEffect } from 'react';
import {
  ScanLine,
  History,
  Sliders,
  Camera,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useScannerStore } from '../renderer/stores/scannerStore';
import { ScanInputBar } from '../renderer/components/scanner/ScanInputBar';
import { ScanResultCard } from '../renderer/components/scanner/ScanResultCard';
import { ScanHistoryTable } from '../renderer/components/scanner/ScanHistoryTable';
import { ScannerSettingsPanel } from '../renderer/components/scanner/ScannerSettingsPanel';
import { CameraScannerView } from '../renderer/components/scanner/CameraScannerView';

export const BarcodeScannerView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    lastResult,
    totalScansCount,
    successScansCount,
    loadHistory,
    loadSettings,
  } = useScannerStore();

  useEffect(() => {
    loadHistory();
    loadSettings();
  }, [loadHistory, loadSettings]);

  const successRate =
    totalScansCount > 0 ? Math.round((successScansCount / totalScansCount) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <ScanLine className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Barcode Scanner Module</h1>
                <span className="rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Sprint 7.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full USB HID Barcode Wedge, Keyboard Entry, & SQLite Product Validation
              </p>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 shadow-xs">
            <Activity className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Scans Today</p>
              <p className="font-mono text-xs font-bold text-white">{totalScansCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Success Rate</p>
              <p className="font-mono text-xs font-bold text-emerald-400">{successRate}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-400">USB Wedge</p>
              <p className="text-xs font-bold text-emerald-300">Ready & Listening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'scan'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <ScanLine className="h-4 w-4" />
          Live Scanner
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <History className="h-4 w-4" />
          Scan History
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Scanner Settings
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'camera'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Camera className="h-4 w-4" />
          Camera Scanner
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          <ScanInputBar />
          <ScanResultCard result={lastResult} />
        </div>
      )}

      {activeTab === 'history' && <ScanHistoryTable />}

      {activeTab === 'settings' && <ScannerSettingsPanel />}

      {activeTab === 'camera' && <CameraScannerView />}
    </div>
  );
};
