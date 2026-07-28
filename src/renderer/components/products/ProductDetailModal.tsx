import React from 'react';
import { X, Package, Tag, MapPin, DollarSign, Layers, Hash, Barcode, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';

export const ProductDetailModal: React.FC = () => {
  const { isViewModalOpen, viewingProduct, closeViewModal } = useProductStore();

  if (!isViewModalOpen || !viewingProduct) return null;

  const getStatusBadge = (status?: string, stock?: number) => {
    if (stock === 0 || status === 'OUT_OF_STOCK') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
          <AlertTriangle className="h-3.5 w-3.5" /> Out of Stock
        </span>
      );
    }
    if (status === 'INACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-400 border border-slate-500/20">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" /> Active
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{viewingProduct.name}</h2>
              <p className="text-xs text-slate-400 font-mono">Barcode: {viewingProduct.barcode}</p>
            </div>
          </div>
          <button
            onClick={closeViewModal}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Details Content */}
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Catalog Status</span>
              {getStatusBadge(viewingProduct.status, viewingProduct.stock)}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block mb-1">Selling Price</span>
              <span className="text-2xl font-bold text-emerald-400">
                ${viewingProduct.price ? viewingProduct.price.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-blue-400" /> Purchase Price
              </span>
              <p className="text-sm font-semibold text-slate-200">
                ${viewingProduct.purchasePrice ? viewingProduct.purchasePrice.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Package className="h-3.5 w-3.5 text-amber-400" /> Stock Quantity
              </span>
              <p className="text-sm font-semibold text-slate-200">{viewingProduct.stock} units</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Tag className="h-3.5 w-3.5 text-purple-400" /> Category
              </span>
              <p className="text-sm font-semibold text-slate-200">{viewingProduct.category || 'GENERAL'}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Hash className="h-3.5 w-3.5 text-cyan-400" /> SKU
              </span>
              <p className="text-sm font-semibold text-slate-200 font-mono">{viewingProduct.sku || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" /> Warehouse Location
              </span>
              <p className="text-sm font-semibold text-slate-200">{viewingProduct.location || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> Internal Code
              </span>
              <p className="text-sm font-semibold text-slate-200 font-mono">
                {viewingProduct.internalCode || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Created: {viewingProduct.createdAt || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> SQLite ID: #{viewingProduct.id}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeViewModal}
            className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
