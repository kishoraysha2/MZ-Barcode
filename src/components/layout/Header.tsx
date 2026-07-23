import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Cpu,
  ChevronDown,
  Command,
  Lock,
  CheckCircle2,
  X,
  LogIn,
} from 'lucide-react';
import { AppEdition, UserRole } from '../../types';
import { useUserSessionStore } from '../../renderer/stores/userSessionStore';
import { LoginModal } from '../auth/LoginModal';

interface HeaderProps {
  edition: AppEdition;
  onEditionChange: (edition: AppEdition) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeView: string;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  edition,
  onEditionChange,
  activeRole,
  onRoleChange,
  darkMode,
  onToggleDarkMode,
  activeView,
  onOpenSearch,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { username, fullName, role, isAuthenticated, logout } = useUserSessionStore();

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  const notifications = [
    { id: 1, title: 'Database WAL Snapshot Complete', time: '10m ago', type: 'success' },
    { id: 2, title: 'Zebra ZD421 Calibrated (203 DPI)', time: '1h ago', type: 'info' },
    { id: 3, title: 'License Status: Not Configured', time: '3h ago', type: 'warning' },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 flex items-center justify-between shadow-xs">
      {/* Left: Branding & App Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm tracking-wider ${
            edition === 'customer'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
          }`}>
            MZ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                {edition === 'customer' ? 'MZ Barcode Suite' : 'MZ Owner Console'}
              </span>
              <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                edition === 'customer'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30'
              }`}>
                {edition === 'customer' ? 'Customer v1.0' : 'Developer Mode'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Enterprise Desktop Edition • Offline Windows
            </div>
          </div>
        </div>

        {/* Edition Switcher Pills */}
        <div className="hidden md:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 ml-2">
          <button
            onClick={() => onEditionChange('customer')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              edition === 'customer'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Switch to Customer Barcode Suite App"
          >
            <Cpu className="h-3.5 w-3.5" /> Client Suite
          </button>
          <button
            onClick={() => onEditionChange('owner')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              edition === 'owner'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-xs border border-purple-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Switch to System Owner Console Developer App"
          >
            <Shield className="h-3.5 w-3.5" /> Owner Console
          </button>
        </div>
      </div>

      {/* Middle: Global Quick Search Button */}
      <div className="hidden lg:flex items-center">
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-between w-72 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 transition-all group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            <span>Search barcodes, sequence, users...</span>
          </span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right: Role Switcher Demo Control + Theme + Notifications + User */}
      <div className="flex items-center gap-2.5">
        {/* Role Demo Switcher (For testing permissions) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Simulate Role:
          </span>
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="OWNER" className="bg-slate-900 text-purple-400">System Owner</option>
            <option value="ADMIN" className="bg-slate-900 text-amber-400">Customer Admin</option>
            <option value="USER" className="bg-slate-900 text-blue-400">Normal User</option>
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition relative"
            title="System Audit Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">System Activity Logs</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
          >
            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
              activeRole === 'OWNER'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : activeRole === 'ADMIN'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {username ? username.charAt(0).toUpperCase() : activeRole.charAt(0)}
            </div>
            <div className="hidden xl:block text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 leading-none">
                {fullName || (activeRole === 'OWNER' ? 'System Owner' : activeRole === 'ADMIN' ? 'Customer Admin' : 'Line Operator')}
              </div>
              <span className="text-[10px] text-slate-400">
                @{username || 'guest'} • {activeRole}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {fullName || 'Enterprise User'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Role: {activeRole} | Session Active</p>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-md text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 font-semibold"
                >
                  <LogIn className="h-3.5 w-3.5" /> Switch Account / Re-authenticate
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" /> User Profile & Session Token
                </button>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-1.5 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login / Auth Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};
