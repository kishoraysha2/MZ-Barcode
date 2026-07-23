import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useUserSessionStore } from '../../renderer/stores/userSessionStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials } = useUserSessionStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await loginWithCredentials(username, password, rememberMe);

    setLoading(false);

    if (result.success) {
      setSuccessMsg('Authenticated successfully via SQLite & Argon2id session engine.');
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } else {
      setErrorMsg(result.message || 'Invalid credentials or inactive user account.');
    }
  };

  const setDemoUser = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-3">
            <ShieldCheck className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold tracking-wide">MZ BARCODE SUITE</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Authentication & RBAC Engine v1.0</p>
        </div>

        {/* Quick Demo Credentials Preset Selector */}
        <div className="mb-5 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px]">
          <div className="text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-amber-500" /> Select Demo Role Credentials:
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <button
              type="button"
              onClick={() => setDemoUser('owner', 'OwnerPass123!')}
              className="px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/20 text-left transition"
            >
              👑 Owner (OwnerPass123!)
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('admin', 'AdminPass123!')}
              className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 text-left transition"
            >
              🛡️ Admin (AdminPass123!)
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('operator1', 'UserPass123!')}
              className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 text-left transition"
            >
              👤 User (UserPass123!)
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('inspector', 'ViewerPass123!')}
              className="px-2.5 py-1.5 bg-slate-500/10 border border-slate-500/30 text-slate-400 rounded-lg hover:bg-slate-500/20 text-left transition"
            >
              👁️ Viewer (ViewerPass123!)
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
              />
              Remember Me (30 Days Session)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Authenticating Argon2id...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Local Secure Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
