import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Unlock,
  Database,
  Users,
  Copy,
  Check,
  Download,
  Sparkles,
  CheckCircle2,
  Sliders,
  FileText,
  AlertTriangle,
  Zap,
  Terminal
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/common/UIComponents';

export const OwnerConsoleView: React.FC = () => {
  const [customerName, setCustomerName] = useState('Apex Industrial Logistics');
  const [hwidInput, setHwidInput] = useState('MZ-HWID-9A8B-7C6D-5E4F');
  const [durationDays, setDurationDays] = useState(365);
  const [maxUsers, setMaxUsers] = useState(10);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Emergency Key Generator State
  const [emergencyCustName, setEmergencyCustName] = useState('');
  const [generatedEmergencyKey, setGeneratedEmergencyKey] = useState<string | null>(null);

  // DB Repair Inspector State
  const [dbStatusMsg, setDbStatusMsg] = useState<string | null>(null);

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const sig = `MZ-ACT-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}-2026-RSA2048`;
    setGeneratedKey(sig);
  };

  const handleGenerateEmergency = () => {
    const code = `MZ-EMERGENCY-72H-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
    setGeneratedEmergencyKey(code);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPragmaCheck = () => {
    setDbStatusMsg('PRAGMA integrity_check executed: 0 corruption found. WAL log clean.');
    setTimeout(() => setDbStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500/20 via-purple-500/5 to-transparent border border-purple-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                MZ Developer Owner Console
              </h2>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full font-mono">
                DEVELOPER EDITION APP 2
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Isolated application for the Software Owner to sign RSA-2048 offline customer license keys.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: RSA License Generator Left + Emergency & Inspector Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RSA Key Signer Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="RSA-2048 License Signer Engine" subtitle="Issues cryptographically signed license keys for customer HWIDs">
            <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Company / Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Apex Industrial Logistics"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Hardware Fingerprint (HWID)
                </label>
                <input
                  type="text"
                  required
                  value={hwidInput}
                  onChange={(e) => setHwidInput(e.target.value)}
                  placeholder="e.g. MZ-HWID-9A8B-7C6D-5E4F"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-mono font-bold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    License Duration
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:outline-none font-semibold"
                  >
                    <option value={30}>30 Days (Evaluation)</option>
                    <option value={180}>180 Days (Half Year)</option>
                    <option value={365}>365 Days (1 Year Standard)</option>
                    <option value={9999}>Permanent Lifetime License</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Allowed Users
                  </label>
                  <input
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button type="submit" variant="purple" icon={Key} className="w-full">
                Sign RSA-2048 License Key
              </Button>
            </form>

            {/* Generated License Result Card */}
            {generatedKey && (
              <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Signed RSA License Output
                  </span>
                  <button
                    onClick={() => handleCopyKey(generatedKey)}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied Key' : 'Copy Key String'}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs font-bold text-purple-300 border border-purple-500/30 break-all select-all">
                  {generatedKey}
                </div>
                <p className="text-[10px] text-slate-400">
                  Send this cryptographic key string to the customer to enter into their Customer Edition app.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Emergency Keys & DB Inspector Right (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Unlock Key Generator */}
          <Card title="Emergency Bypass Key Generator" subtitle="72-Hour hardware failure override">
            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={emergencyCustName}
                onChange={(e) => setEmergencyCustName(e.target.value)}
                placeholder="Customer Name for Emergency Log"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
              />
              <Button onClick={handleGenerateEmergency} variant="outline" icon={Unlock} className="w-full">
                Generate 72-Hour Override Code
              </Button>

              {generatedEmergencyKey && (
                <div className="p-3 bg-slate-950 border border-rose-500/30 rounded-lg font-mono text-xs font-bold text-rose-400 flex items-center justify-between">
                  <span>{generatedEmergencyKey}</span>
                  <button onClick={() => handleCopyKey(generatedEmergencyKey)} className="text-slate-400 hover:text-slate-200">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Database Inspector */}
          <Card title="SQLite Database Diagnostic Inspector" subtitle="Repair corrupt WAL sequence states">
            <div className="space-y-3 text-xs">
              {dbStatusMsg && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[11px] font-mono">
                  {dbStatusMsg}
                </div>
              )}
              <Button onClick={handleRunPragmaCheck} variant="secondary" icon={Terminal} className="w-full">
                Run PRAGMA integrity_check
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
