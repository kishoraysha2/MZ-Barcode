import React, { useRef, useEffect } from 'react';
import { ScanLine, Search, X, Focus, RefreshCw, Volume2, ShieldCheck } from 'lucide-react';
import { useScannerStore } from '../../stores/scannerStore';

export const ScanInputBar: React.FC = () => {
  const {
    currentInput,
    setCurrentInput,
    clearCurrentInput,
    processScan,
    isLoading,
    autoFocus,
    toggleAutoFocus,
    settings,
  } = useScannerStore();

  const inputRef = useRef<HTMLInputElement>(null);

  // Maintain auto focus if enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, isLoading]);

  // Global USB Keyboard Wedge keydown interceptor if autoFocus is active and activeElement is body
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!autoFocus) return;
      // If user is focused elsewhere on input/textarea/select, don't intercept
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        processScan();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      // Delay slightly to let input value update, or trigger scan immediately
      setTimeout(() => {
        processScan(pastedText);
      }, 50);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Main Live Scan Input Box */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-blue-400">
            <ScanLine className={`h-5 w-5 ${isLoading ? 'animate-pulse text-amber-400' : 'text-blue-400'}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Scan barcode with USB HID scanner or type code..."
            className="w-full rounded-xl border border-blue-500/30 bg-slate-950 py-3 pl-11 pr-24 text-base font-mono text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
            {currentInput && (
              <button
                onClick={clearCurrentInput}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => processScan()}
              disabled={isLoading || !currentInput.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors disabled:opacity-40"
            >
              {isLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              Scan
            </button>
          </div>
        </div>

        {/* Toolbar Quick Controls */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3 lg:border-t-0 lg:pt-0">
          <button
            onClick={toggleAutoFocus}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
              autoFocus
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-xs'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
            }`}
            title="Auto focus maintains input focus for rapid scanning"
          >
            <Focus className="h-3.5 w-3.5" />
            Auto Focus {autoFocus ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-mono text-[11px] text-slate-300">USB Wedge Active</span>
          </div>

          {(settings.successSound || settings.errorSound) && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-emerald-400" title="Audio Chime Active">
              <Volume2 className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
