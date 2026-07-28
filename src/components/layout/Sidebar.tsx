import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Barcode,
  ScanLine,
  History,
  Layout,
  Users,
  HardDrive,
  Settings,
  Key,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Database,
  Sliders,
  FileText,
  Lock,
  Sparkles,
  Printer,
  ShieldCheck,
  Unlock,
  Package,
  Layers,
  PackageCheck,
  Tag,
  Building,
  Truck,
} from 'lucide-react';
import { AppEdition, UserRole } from '../../types';
import { electronBridge } from '../../preload/bridge';

interface SidebarProps {
  edition: AppEdition;
  activeRole: UserRole;
  activeView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  edition,
  activeRole,
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
}) => {
  const [licenseInfo, setLicenseInfo] = useState({
    isActivated: false,
    daysRemaining: 0,
    hwid: 'Not Configured',
  });

  useEffect(() => {
    async function loadLicense() {
      try {
        const res = await electronBridge.getLicenseStatus();
        if (res.success && res.data) {
          setLicenseInfo({
            isActivated: Boolean(res.data.isActivated),
            daysRemaining: res.data.daysRemaining || 0,
            hwid: res.data.hwid || 'Not Configured',
          });
        }
      } catch (err) {
        // Default unconfigured
      }
    }
    loadLicense();
  }, []);
  // Customer Suite Nav
  const customerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'master_categories', label: 'Categories Master', icon: Layers, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'master_units', label: 'Units Master', icon: PackageCheck, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'master_brands', label: 'Brands Master', icon: Tag, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'master_warehouses', label: 'Warehouses Master', icon: Building, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'master_suppliers', label: 'Suppliers Master', icon: Truck, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'scanner', label: 'Barcode Scanner', icon: ScanLine, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'generator', label: 'Barcode Generator', icon: Barcode, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'history', label: 'History & Search', icon: History, roles: ['OWNER', 'ADMIN', 'USER'] },
    { id: 'designer', label: 'Label Designer', icon: Layout, roles: ['OWNER', 'ADMIN'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['OWNER', 'ADMIN'] },
    { id: 'backup', label: 'Backup & Restore', icon: HardDrive, roles: ['OWNER', 'ADMIN'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['OWNER', 'ADMIN'] },
    { id: 'license', label: 'License & HWID', icon: Key, roles: ['OWNER', 'ADMIN', 'USER'] },
  ];

  // Developer Owner Console Nav
  const ownerNavItems = [
    { id: 'owner_dashboard', label: 'Owner Overview', icon: ShieldCheck, roles: ['OWNER'] },
    { id: 'license_generator', label: 'RSA License Signer', icon: Key, roles: ['OWNER'] },
    { id: 'recovery_keys', label: 'Emergency Unlock', icon: Unlock, roles: ['OWNER'] },
    { id: 'db_inspector', label: 'Customer DB Inspector', icon: Database, roles: ['OWNER'] },
    { id: 'audit_logs', label: 'Security Audit Logs', icon: FileText, roles: ['OWNER'] },
    { id: 'dev_settings', label: 'Developer Settings', icon: Sliders, roles: ['OWNER'] },
  ];

  const currentItems = edition === 'customer' ? customerNavItems : ownerNavItems;

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 relative select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Upper Navigation Section */}
      <div className="p-2 space-y-4">
        {/* Section Label */}
        {!collapsed && (
          <div className="px-3 pt-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-500">
            <span>{edition === 'customer' ? 'Customer Suite Nav' : 'Owner Console Nav'}</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
              edition === 'customer' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/20 text-purple-300'
            }`}>
              {edition === 'customer' ? 'App 1' : 'App 2'}
            </span>
          </div>
        )}

        {/* Menu Items */}
        <nav className="space-y-1">
          {currentItems.map((item) => {
            const Icon = item.icon;
            const isAllowed = item.roles.includes(activeRole);
            const active = activeView === item.id;

            if (!isAllowed) {
              return null; // Strict RBAC filtering
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                  active
                    ? edition === 'customer'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active
                      ? edition === 'customer'
                        ? 'text-amber-400'
                        : 'text-purple-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Toggle Collapse */}
      <div className="p-2 border-t border-slate-800/80 space-y-2">
        {!collapsed && edition === 'customer' && (
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mb-1">
              <span className={`flex items-center gap-1 font-bold ${licenseInfo.isActivated ? 'text-emerald-400' : 'text-amber-500'}`}>
                <ShieldCheck className="h-3 w-3" /> {licenseInfo.isActivated ? 'HWID Locked' : 'License Inactive'}
              </span>
              <span>{licenseInfo.isActivated ? `${licenseInfo.daysRemaining} Days` : 'Not Configured'}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div className={`h-full ${licenseInfo.isActivated ? 'bg-amber-500 w-[55%]' : 'bg-rose-500/50 w-[0%]'}`} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 truncate">
              HWID: {licenseInfo.hwid}
            </p>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-xs ml-2 font-medium">Collapse Navigation</span>}
        </button>
      </div>
    </aside>
  );
};
