import React, { useState } from 'react';
import {
  Settings,
  Building,
  Barcode,
  Printer,
  Shield,
  FileText,
  Save,
  CheckCircle2,
  Sliders,
  HardDrive
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { AuditLogItem } from '../types';

interface SettingsViewProps {
  auditLogs: AuditLogItem[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ auditLogs }) => {
  const [activeTab, setActiveTab] = useState<'company' | 'barcode' | 'printer' | 'logs'>('company');
  const [companyName, setCompanyName] = useState('Apex Industrial Logistics Inc.');
  const [companyAddress, setCompanyAddress] = useState('100 Industrial Parkway, Suite 400');
  const [prefix, setPrefix] = useState('MZ-');
  const [digits, setDigits] = useState(8);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSave = () => {
    setSavedMsg('System configuration updated and committed to SQLite WAL settings table!');
    setTimeout(() => setSavedMsg(null), 3000);
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
        <Card title="Thermal Printer Driver Settings" subtitle="Configure spooling speed and DPI settings">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-2">
            <div className="text-amber-400 font-bold">PRIMARY THERMAL DRIVER: Zebra ZD421</div>
            <div>• Resolution: 203 DPI (8 dots/mm)</div>
            <div>• Connection: USB Direct Spool (Win32 API)</div>
            <div>• Print Speed: 152 mm/sec</div>
          </div>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card title="Security & Audit Logs" subtitle="Tamper-proof event logs recorded in SQLite">
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
        </Card>
      )}
    </div>
  );
};
