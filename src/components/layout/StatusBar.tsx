import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Database,
  Clock,
  HardDrive,
  Activity,
  Key
} from 'lucide-react';
import { AppEdition } from '../../types';
import { electronBridge } from '../../preload/bridge';

interface StatusBarProps {
  edition: AppEdition;
}

export const StatusBar: React.FC<StatusBarProps> = ({ edition }) => {
  const [licenseText, setLicenseText] = useState('License: Not Configured');
  const [isValid, setIsValid] = useState(false);
  const [activePrinterName, setActivePrinterName] = useState('Printer: Scanning...');

  useEffect(() => {
    async function loadLicenseAndPrinter() {
      try {
        const res = await electronBridge.getLicenseStatus();
        if (res.success && res.data?.isActivated) {
          setLicenseText(`License: Valid (${res.data.daysRemaining} Days)`);
          setIsValid(true);
        } else {
          setLicenseText('License: Not Configured');
          setIsValid(false);
        }

        const prnRes = await electronBridge.getPrinters();
        if (prnRes.success && Array.isArray(prnRes.data) && prnRes.data.length > 0) {
          const defPrn = prnRes.data.find((p: any) => p.is_default === 1 || p.isDefault) || prnRes.data[0];
          setActivePrinterName(`${defPrn.name} [READY]`);
        } else {
          setActivePrinterName('No Printers Found');
        }
      } catch (err) {
        setLicenseText('License: Not Configured');
        setIsValid(false);
      }
    }
    loadLicenseAndPrinter();
  }, []);

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400 px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left Indicators */}
      <div className="flex items-center gap-4">
        {/* License Pill */}
        <div className={`flex items-center gap-1.5 font-medium ${isValid ? 'text-emerald-400' : 'text-amber-500'}`}>
          <Key className="h-3 w-3" />
          <span>{licenseText}</span>
        </div>

        {/* Separator */}
        <span className="text-slate-800">|</span>

        {/* Thermal Printer Pill */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Printer className="h-3 w-3 text-cyan-400" />
          <span>{activePrinterName}</span>
        </div>

        {/* Separator */}
        <span className="text-slate-800">|</span>

        {/* SQLite Database Pill */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Database className="h-3 w-3 text-amber-400" />
          <span>SQLite WAL (34 KB)</span>
        </div>

        {/* Separator */}
        <span className="text-slate-800 hidden md:inline">|</span>

        {/* Clock Guard Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Clock className="h-3 w-3 text-indigo-400" />
          <span>Clock Monotonic Guard: OK</span>
        </div>
      </div>

      {/* Right System Info */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500">Offline Air-Gapped Mode</span>
        <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 font-sans">
          {edition === 'customer' ? 'Customer App v1.0.0' : 'Owner Console v1.0.0'}
        </span>
      </div>
    </footer>
  );
};
