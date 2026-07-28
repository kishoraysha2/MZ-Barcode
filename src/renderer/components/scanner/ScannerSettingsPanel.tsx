import React from 'react';
import { Sliders, Volume2, Focus, Key, Save, Play, Check } from 'lucide-react';
import { useScannerStore } from '../../stores/scannerStore';
import { playSuccessBeep, playErrorBeep } from '../../../utils/audioBeep';

export const ScannerSettingsPanel: React.FC = () => {
  const { settings, saveSettings } = useScannerStore();
  const [savedMessage, setSavedMessage] = React.useState(false);

  const handleChange = (key: keyof typeof settings, value: any) => {
    saveSettings({ [key]: value });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Scanner Configuration & USB Wedge Settings</h3>
            <p className="text-xs text-slate-400">Manage hardware prefix, suffix, audio chimes, and timing parameters</p>
          </div>
        </div>

        {savedMessage && (
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Settings Auto-Saved
          </span>
        )}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USB Prefix & Suffix Settings */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Scanner Input Framing
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Scanner Prefix Character(s)
            </label>
            <input
              type="text"
              value={settings.prefix}
              onChange={(e) => handleChange('prefix', e.target.value)}
              placeholder="e.g. STX or empty"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-slate-500">Stripped from scanned input automatically if detected.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Scanner Suffix Key
            </label>
            <select
              value={settings.suffix}
              onChange={(e) => handleChange('suffix', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Enter">Enter (CR/LF - Standard USB HID)</option>
              <option value="Tab">Tab Key</option>
              <option value="None">None (No Suffix)</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">Triggers scan execution immediately upon detection.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Duplicate Scan Delay (Milliseconds)
            </label>
            <input
              type="number"
              step="100"
              value={settings.duplicateScanDelay}
              onChange={(e) => handleChange('duplicateScanDelay', parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-slate-500">Suppresses identical scan bursts within time threshold.</p>
          </div>
        </div>

        {/* Audio & Focus Behavior Settings */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Audio Chimes & Interface Behavior
          </h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-200">Play Success Sound Chime</span>
              <input
                type="checkbox"
                checked={settings.successSound}
                onChange={(e) => handleChange('successSound', e.target.checked)}
                className="h-4 w-4 rounded-xs border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-200">Play Error Sound Buzz</span>
              <input
                type="checkbox"
                checked={settings.errorSound}
                onChange={(e) => handleChange('errorSound', e.target.checked)}
                className="h-4 w-4 rounded-xs border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-200">Auto Clear Input Bar After Scan</span>
              <input
                type="checkbox"
                checked={settings.autoClear}
                onChange={(e) => handleChange('autoClear', e.target.checked)}
                className="h-4 w-4 rounded-xs border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-200">Continuous Scan Mode</span>
              <input
                type="checkbox"
                checked={settings.continuousScanMode}
                onChange={(e) => handleChange('continuousScanMode', e.target.checked)}
                className="h-4 w-4 rounded-xs border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => playSuccessBeep()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Test Success Beep
            </button>

            <button
              onClick={() => playErrorBeep()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Test Error Beep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
