import React, { useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatusBar } from '../../components/layout/StatusBar';
import { GlobalSearchModal } from '../../components/common/UIComponents';
import { useApplicationStatusStore } from '../stores/applicationStatusStore';
import { useUserSessionStore } from '../stores/userSessionStore';
import { useThemeStore } from '../stores/themeStore';
import { AppEdition, UserRole } from '../../shared/types';
import { BookOpen, ShieldCheck } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const {
    edition,
    activeView,
    sidebarCollapsed,
    isSearchOpen,
    showBlueprintDrawer,
    setEdition,
    setActiveView,
    setSidebarCollapsed,
    setSearchOpen,
    toggleBlueprintDrawer,
  } = useApplicationStatusStore();

  const { role, setRole } = useUserSessionStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const handleEditionChange = (newEdition: AppEdition) => {
    setEdition(newEdition);
    if (newEdition === 'owner') {
      setRole('OWNER');
      setActiveView('owner_dashboard');
    } else {
      if (role === 'OWNER') setRole('ADMIN');
      setActiveView('dashboard');
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      <Header
        edition={edition}
        onEditionChange={handleEditionChange}
        activeRole={role as UserRole}
        onRoleChange={(r) => setRole(r as UserRole)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        activeView={activeView}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          edition={edition}
          activeRole={role as UserRole}
          activeView={activeView}
          onSelectView={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                MZ Barcode Suite Enterprise Architecture Foundation Active
              </span>
              <span className="text-[10px] font-mono text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2">
                IPC / DB Engine: <code className="text-amber-500 font-bold">{activeView.toUpperCase()}</code>
              </span>
            </div>

            <button
              onClick={toggleBlueprintDrawer}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              {showBlueprintDrawer ? 'Hide Specs' : 'View Architecture Specs'}
            </button>
          </div>

          {showBlueprintDrawer && (
            <div className="mb-6 p-5 bg-slate-900 border border-purple-500/30 rounded-2xl text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-400" /> Sprint 1 Foundation Architecture
                </span>
                <span className="font-mono text-[10px] bg-purple-500/20 px-2 py-0.5 rounded">
                  IPC & SQLite WAL Engine
                </span>
              </div>
              <p className="text-slate-300">
                This desktop app foundation connects Electron Main, Context Isolated Preload, Zustand state stores, and type-safe IPC channels.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] font-mono">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold">SECURE IPC BRIDGE</span>
                  <p className="text-slate-400 mt-1">ContextBridge isolated, no raw node integration exposed.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-purple-400 font-bold">SQLITE WAL PATH</span>
                  <p className="text-slate-400 mt-1">%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold">STATE ENGINE</span>
                  <p className="text-slate-400 mt-1">Zustand theme, user session, application & system status stores.</p>
                </div>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>

      <StatusBar edition={edition} />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={setActiveView}
      />
    </div>
  );
};
