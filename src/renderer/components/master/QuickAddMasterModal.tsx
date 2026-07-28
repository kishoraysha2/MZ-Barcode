import React, { useState } from 'react';
import { Plus, RefreshCw, X, Layers, Building, Tag, PackageCheck, Truck } from 'lucide-react';
import { MasterModuleName, MASTER_MODULE_CONFIGS, MasterEntity } from '../../../shared/masterTypes';
import { MASTER_STORES } from '../../stores/createMasterStore';
import { useUserSessionStore } from '../../stores/userSessionStore';

interface QuickAddMasterModalProps {
  moduleName: MasterModuleName;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (createdItem: MasterEntity) => void;
}

export const QuickAddMasterModal: React.FC<QuickAddMasterModalProps> = ({
  moduleName,
  isOpen,
  onClose,
  onCreated,
}) => {
  const config = MASTER_MODULE_CONFIGS[moduleName];
  const store = MASTER_STORES[moduleName]();
  const userRole = useUserSessionStore((state) => state.role);

  const [name, setName] = useState('');
  const [code, setCode] = useState(`${config.codePrefix}-${Math.floor(100 + Math.random() * 900)}`);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName) {
      setError('Name is required.');
      return;
    }
    if (!trimmedCode) {
      setError('Code is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await store.createItem({
        name: trimmedName,
        code: trimmedCode,
        description: description.trim(),
        isActive: true,
      });

      onCreated(created);
      onClose();
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err?.message || `Failed to create ${config.singularName}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModuleIcon = () => {
    switch (moduleName) {
      case 'categories':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'units':
        return <PackageCheck className="w-5 h-5 text-cyan-400" />;
      case 'brands':
        return <Tag className="w-5 h-5 text-amber-400" />;
      case 'warehouses':
        return <Building className="w-5 h-5 text-emerald-400" />;
      case 'suppliers':
        return <Truck className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl">
              {getModuleIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Quick Add {config.singularName}</h3>
              <p className="text-xs text-slate-400">Master Data Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Code <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${config.singularName} name`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional brief description"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Save & Select</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
