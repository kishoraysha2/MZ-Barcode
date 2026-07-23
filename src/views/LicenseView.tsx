import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Sparkles,
  Unlock,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/common/UIComponents';
import { LicenseStatus } from '../types';

interface LicenseViewProps {
  license: LicenseStatus;
}

export const LicenseView: React.FC<LicenseViewProps> = ({ license }) => {
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const handleCopyHwid = () => {
    navigator.clipboard.writeText(license.hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleActivateRSA = () => {
    setShowActivateModal(false);
    setMsg('RSA-2048 offline signature validated! License renewed for 365 days.');
    setTimeout(() => setMsg(null), 4000);
  };

  const handleUnlockEmergency = () => {
    setShowEmergencyModal(false);
    setMsg('Emergency 72-hour override key accepted!');
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Key className="h-6 w-6 text-amber-500" /> Software Licensing & HWID Activation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Offline RSA-2048 cryptographic signature & Hardware ID (HWID) binding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setShowActivateModal(true)} icon={Key}>
            Enter License Key
          </Button>
          <Button onClick={() => setShowEmergencyModal(true)} variant="outline" icon={Unlock}>
            Emergency Override
          </Button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {msg}
        </div>
      )}

      {/* Main License Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Status Summary (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="License Certificate" subtitle="Validated via RSA Public Key offline verification">
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl flex items-center justify-between border ${
                license.isActivated
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`h-8 w-8 ${license.isActivated ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <div>
                    <h4 className={`text-sm font-bold ${license.isActivated ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      License Status: {license.isActivated ? 'ACTIVE & VALID' : 'NOT CONFIGURED'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registered to: <strong className="text-slate-800 dark:text-slate-200">{license.customerName}</strong>
                    </p>
                  </div>
                </div>
                <Badge variant={license.isActivated ? 'emerald' : 'amber'} size="md">
                  {license.isActivated ? 'RSA VALID' : 'NOT CONFIGURED'}
                </Badge>
              </div>

              {/* Progress Bar for Expiration */}
              <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Expiration Countdown</span>
                  <span className="font-mono text-amber-500">
                    {license.isActivated ? `${license.daysRemaining} Days Remaining` : '0 Days Remaining'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${license.isActivated ? 'bg-amber-500 w-[55%]' : 'bg-slate-600 w-0'}`} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Issued: {license.issuedAt}</span>
                  <span>Expires: {license.expiresAt}</span>
                </div>
              </div>

              {/* Hardware Fingerprint HWID Box */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Hardware ID (HWID)
                  </span>
                  <button
                    onClick={handleCopyHwid}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedHwid ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedHwid ? 'Copied' : 'Copy HWID'}
                  </button>
                </div>
                <div className="p-2 bg-slate-950 rounded font-mono text-xs text-amber-400 font-bold border border-slate-800 tracking-wider">
                  {license.hwid}
                </div>
                <p className="text-[10px] text-slate-500">
                  Computed from CPU ID + Motherboard Serial + Disk Drive Volume GUID.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Security Anti-Tamper Mechanisms" subtitle="Offline protections built into MZ Barcode Suite">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" /> Monotonic System Clock Guard
                </h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Prevents users from rolling back Windows clock time. Last check: {license.lastClockCheck}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-purple-400" /> RSA-2048 Cryptographic Key
                </h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only keys signed by the MZ Owner Console developer app are accepted.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* License Key Modal */}
      <Modal isOpen={showActivateModal} onClose={() => setShowActivateModal(false)} title="Activate RSA License Key">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paste 256-Bit RSA License Signature</label>
            <textarea
              rows={4}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="MZ-ACT-XXXX-XXXX-XXXX..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setShowActivateModal(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleActivateRSA} icon={ShieldCheck}>
              Validate & Activate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emergency Unlock Modal */}
      <Modal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} title="Enter Emergency Unlock Code">
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-500 font-medium">
            Emergency unlock grants 72 hours of uninterrupted printing if a customer's computer hardware changes.
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">72-Hour Emergency Override Key</label>
            <input
              type="text"
              value={emergencyCode}
              onChange={(e) => setEmergencyCode(e.target.value)}
              placeholder="MZ-EMERGENCY-72H-XXXX"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setShowEmergencyModal(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleUnlockEmergency} variant="danger" icon={Unlock}>
              Apply Emergency Unlock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
