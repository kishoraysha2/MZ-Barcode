import React, { useState } from 'react';
import { X, Tag, Plus, AlertCircle } from 'lucide-react';
import { useCategoryStore } from '../../stores/categoryStore';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (categoryName: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { createCategory } = useCategoryStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await createCategory({
        name: trimmedName,
        description: description.trim(),
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: true,
      });

      setIsSubmitting(false);
      setName('');
      setDescription('');
      setSortOrder('0');
      onCreated(created.name);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Failed to create category.');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Category</h3>
              <p className="text-xs text-slate-400">Create a new product classification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PACKAGING, CHEMICALS, HARDWARE"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or description of this product category"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Display Sort Order <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-800 pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
