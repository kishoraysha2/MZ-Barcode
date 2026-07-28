import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';

export const DeleteConfirmModal: React.FC = () => {
  const { isDeleteModalOpen, productToDelete, closeDeleteModal, deleteProduct, isLoading } = useProductStore();

  if (!isDeleteModalOpen || !productToDelete) return null;

  const handleDelete = async () => {
    await deleteProduct(productToDelete.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirm Product Deletion</h3>
            <p className="text-xs text-rose-300">Action requires Owner/Admin authorization</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-800/60 p-4 border border-slate-700/50">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete product <strong className="text-white">{productToDelete.name}</strong>?
          </p>
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
            <p>Barcode: <span className="font-mono text-slate-200">{productToDelete.barcode}</span></p>
            <p>SQLite Record ID: <span className="font-mono text-slate-200">#{productToDelete.id}</span></p>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          This operation will permanently remove the product record from the SQLite database. This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 shadow-lg shadow-rose-600/30 transition"
          >
            <Trash2 className="h-4 w-4" />
            {isLoading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
