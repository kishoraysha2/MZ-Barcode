import React from 'react';
import { X, Search, Check, AlertTriangle, Info, HelpCircle } from 'lucide-react';

/* --- CARD COMPONENT --- */
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, subtitle, action }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          {title && <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

/* --- METRIC KPI CARD --- */
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  color?: 'amber' | 'blue' | 'emerald' | 'purple' | 'cyan';
}> = ({ title, value, subtext, icon: Icon, trend, color = 'amber' }) => {
  const colorMap = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 tracking-tight">{value}</div>
        {subtext && <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">{subtext}</span>}
        {trend && (
          <span className={`text-[11px] font-semibold mt-1 inline-block ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};

/* --- BADGE COMPONENT --- */
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'rose' | 'purple' | 'cyan' | 'gray';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'gray', size = 'sm' }) => {
  const variants = {
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    gray: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-md border font-mono ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

/* --- BUTTON COMPONENT --- */
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm font-bold',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white font-bold',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white font-bold',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
};

/* --- MODAL DIALOG --- */
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full ${maxWidth} p-6 relative overflow-hidden animate-in zoom-in-95 duration-150`}>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* --- GLOBAL SEARCH MODAL --- */
export const GlobalSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = React.useState('');

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Generate Sequential Barcode', view: 'generator', desc: 'Auto-increment barcode engine' },
    { label: 'View Barcode Audit History', view: 'history', desc: 'Filter, search & export records' },
    { label: 'Edit Label Templates', view: 'designer', desc: 'Visual 50x25mm thermal layout' },
    { label: 'User & Security Management', view: 'users', desc: 'Argon2 user accounts & roles' },
    { label: 'Database Backup & Restore', view: 'backup', desc: 'SQLite WAL compressed archives' },
    { label: 'RSA License & Hardware Lock', view: 'license', desc: 'Offline HWID activation' },
  ];

  const filteredLinks = quickLinks.filter(
    (l) => l.label.toLowerCase().includes(query.toLowerCase()) || l.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50">
          <Search className="h-5 w-5 text-amber-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, barcode number, or setting..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => {
                onNavigate(link.view);
                onClose();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition">
                  {link.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{link.desc}</div>
              </div>
              <kbd className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                Jump
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
