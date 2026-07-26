import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Barcode,
  Printer,
  FileText,
  Save,
  CheckCircle2,
  Inbox,
  Sliders
} from 'lucide-react';
import { Card, Button } from '../components/common/UIComponents';
import { AuditLogItem } from '../types';
import { electronBridge } from '../preload/bridge';

interface SettingsViewProps {
  auditLogs: AuditLogItem[];
  defaultPrinterName?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ auditLogs, defaultPrinterName = 'Not Configured' }) => {
  const [activeTab, setActiveTab] = useState<'company' | 'barcode' | 'printer' | 'logs'>('company');
  const [companyName, setCompanyName] = useState('Apex Industrial Logistics Inc.');
  const [companyAddress, setCompanyAddress] = useState('100 Industrial Parkway, Suite 400');
  const [prefix, setPrefix] = useState('MZ-');
  const [digits, setDigits] = useState(8);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Printing Settings State
  const [printMode, setPrintMode] = useState<'DIALOG' | 'SILENT'>('DIALOG');
  const [selectedPrinter, setSelectedPrinter] = useState<string>(defaultPrinterName);
  const [printersList, setPrintersList] = useState<Array<{ name: string; is_default?: number }>>([]);
  const [rememberLastPrinter, setRememberLastPrinter] = useState<boolean>(true);
  const [defaultCopies, setDefaultCopies] = useState<number>(1);
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [paperWidthMm, setPaperWidthMm] = useState<number>(50);
  const [paperHeightMm, setPaperHeightMm] = useState<number>(25);
  const [dpi, setDpi] = useState<number>(203);
  const [margins, setMargins] = useState<{ top: number; right: number; bottom: number; left: number }>({ top: 2, right: 2, bottom: 2, left: 2 });
  const [printBackground, setPrintBackground] = useState<boolean>(true);

  // Load Settings & Printers on Mount
  useEffect(() => {
    electronBridge.getSettings().then((res) => {
      if (res.success && res.data?.printing) {
        const p = res.data.printing;
        setPrintMode(p.printMode || (p.silentPrinting ? 'SILENT' : 'DIALOG'));
        if (p.defaultPrinter) setSelectedPrinter(p.defaultPrinter);
        if (p.rememberLastPrinter !== undefined) setRememberLastPrinter(p.rememberLastPrinter);
        if (p.copies) setDefaultCopies(p.copies);
        if (p.orientation) setOrientation(p.orientation);
        if (p.paperWidthMm) setPaperWidthMm(p.paperWidthMm);
        if (p.paperHeightMm) setPaperHeightMm(p.paperHeightMm);
        if (p.dpi) setDpi(p.dpi);
        if (p.margins) setMargins(p.margins);
        if (p.printBackground !== undefined) setPrintBackground(p.printBackground);
      }
    });

    electronBridge.getPrinters().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPrintersList(res.data);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      await electronBridge.saveSettings({
        printing: {
          defaultPrinter: selectedPrinter,
          printMode,
          silentPrinting: printMode === 'SILENT',
          rememberLastPrinter,
          paperWidthMm,
          paperHeightMm,
          dpi,
          copies: defaultCopies,
          orientation,
          paperSize: 'CUSTOM',
          margins,
          printBackground,
        },
      });
      setSavedMsg('System configuration and printing parameters updated in SQLite!');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err) {
      console.error('Failed saving settings:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-500" /> System Settings & Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure company branding, barcode auto-increment rules, and thermal print drivers.
          </p>
        </div>

        <Button onClick={handleSave} icon={Save}>
          Save Settings
        </Button>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {savedMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-bold">
        {[
          { id: 'company', label: 'Company Profile', icon: Building },
          { id: 'barcode', label: 'Barcode Rules', icon: Barcode },
          { id: 'printer', label: 'Thermal Printers', icon: Printer },
          { id: 'logs', label: 'Security Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 flex items-center gap-2 border-b-2 transition ${
                active
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'company' && (
        <Card title="Company Information" subtitle="Printed on label headers and export reports">
          <div className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'barcode' && (
        <Card title="Barcode Auto-Increment Rules" subtitle="Define system default sequence padding & prefix">
          <div className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Barcode Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Number Digit Padding</label>
              <select
                value={digits}
                onChange={(e) => setDigits(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
              >
                <option value={6}>6 Digits (e.g. MZ-000108)</option>
                <option value={8}>8 Digits (e.g. MZ-00000108)</option>
                <option value={10}>10 Digits (e.g. MZ-0000000108)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'printer' && (
        <Card title="Printing Engine & Spooler Configuration" subtitle="Configure printing modes, thermal drivers, paper dimensions, and margins">
          <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
            {/* Driver Summary Banner */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-2">
              <div className="text-amber-400 font-bold flex items-center justify-between">
                <span>PRIMARY SPOOLER DRIVER: {selectedPrinter || defaultPrinterName}</span>
                <span className="text-emerald-400 font-sans text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>• Mode: {printMode === 'SILENT' ? 'Silent Direct Printing (No Dialog)' : 'Show Windows Print Dialog'}</div>
                <div>• Connection: Win32 Spooler / Electron Native Print</div>
              </div>
            </div>

            {/* Printing Mode Selection */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <label className="block font-bold text-slate-900 dark:text-slate-100 text-sm">
                Printing Mode Selection
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`p-3.5 border rounded-xl cursor-pointer transition flex items-start gap-3 ${printMode === 'DIALOG' ? 'border-amber-500 bg-amber-500/10 text-slate-100' : 'border-slate-800 bg-slate-900/40 text-slate-400'}`}>
                  <input
                    type="radio"
                    name="printMode"
                    value="DIALOG"
                    checked={printMode === 'DIALOG'}
                    onChange={() => setPrintMode('DIALOG')}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <div className="font-bold text-slate-200 text-xs">Mode 1: Show Windows Print Dialog</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Prompts native Windows Print Dialog. Recommended for Canon, Epson, HP, Brother, and standard desktop printers.
                    </div>
                  </div>
                </label>

                <label className={`p-3.5 border rounded-xl cursor-pointer transition flex items-start gap-3 ${printMode === 'SILENT' ? 'border-amber-500 bg-amber-500/10 text-slate-100' : 'border-slate-800 bg-slate-900/40 text-slate-400'}`}>
                  <input
                    type="radio"
                    name="printMode"
                    value="SILENT"
                    checked={printMode === 'SILENT'}
                    onChange={() => setPrintMode('SILENT')}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <div className="font-bold text-slate-200 text-xs">Mode 2: Silent Direct Printing</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Directly sends jobs to Windows Print Spooler without showing dialogs. Essential for high-speed Zebra & TSC thermal printers.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Default Printer & Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Windows Printer
                </label>
                <select
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-bold"
                >
                  <option value="Default">Windows System Default Printer</option>
                  {printersList.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.is_default ? '(System Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Copies
                </label>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={defaultCopies}
                  onChange={(e) => setDefaultCopies(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Paper Dimensions & Orientation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Paper Width (mm)
                </label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={paperWidthMm}
                  onChange={(e) => setPaperWidthMm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Paper Height (mm)
                </label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={paperHeightMm}
                  onChange={(e) => setPaperHeightMm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-bold"
                >
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                </select>
              </div>
            </div>

            {/* Print Resolution & Margins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Print Resolution (DPI)
                </label>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                >
                  <option value={203}>203 DPI (Standard Thermal Barcode Printer)</option>
                  <option value={300}>300 DPI (High Resolution Desktop/Thermal)</option>
                  <option value={600}>600 DPI (Ultra Fine Laser/Office Printer)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Margins (Top, Right, Bottom, Left mm)
                </label>
                <div className="grid grid-cols-4 gap-1.5 font-mono">
                  <input
                    type="number"
                    value={margins.top}
                    onChange={(e) => setMargins({ ...margins, top: Number(e.target.value) })}
                    placeholder="Top"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-center"
                  />
                  <input
                    type="number"
                    value={margins.right}
                    onChange={(e) => setMargins({ ...margins, right: Number(e.target.value) })}
                    placeholder="Right"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-center"
                  />
                  <input
                    type="number"
                    value={margins.bottom}
                    onChange={(e) => setMargins({ ...margins, bottom: Number(e.target.value) })}
                    placeholder="Bottom"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-center"
                  />
                  <input
                    type="number"
                    value={margins.left}
                    onChange={(e) => setMargins({ ...margins, left: Number(e.target.value) })}
                    placeholder="Left"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberLastPrinter}
                  onChange={(e) => setRememberLastPrinter(e.target.checked)}
                  className="rounded border-slate-700 accent-amber-500"
                />
                Remember last selected printer across sessions
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={printBackground}
                  onChange={(e) => setPrintBackground(e.target.checked)}
                  className="rounded border-slate-700 accent-amber-500"
                />
                Force print background colors and CSS graphics
              </label>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card title="Security & Audit Logs" subtitle="Tamper-proof event logs recorded in SQLite">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <Inbox className="h-8 w-8 text-slate-500 stroke-1" />
              <p className="text-xs font-bold text-slate-300">No Records</p>
              <p className="text-[11px] text-slate-500">No audit logs stored in database yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono bg-slate-50 dark:bg-slate-950/50">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-2.5 text-slate-500">#{log.id}</td>
                      <td className="p-2.5 text-amber-500">{log.timestamp}</td>
                      <td className="p-2.5 font-bold">{log.user}</td>
                      <td className="p-2.5">{log.action}</td>
                      <td className="p-2.5 text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
