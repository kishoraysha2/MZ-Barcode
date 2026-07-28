import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { ProductInfo } from '../../../shared/scannerTypes';
import { ProductForm } from './ProductForm';

export const ProductFormModal: React.FC = () => {
  const { isFormModalOpen, editingProduct, closeFormModal, createProduct, updateProduct, isLoading } = useProductStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isFormModalOpen) return null;

  const handleSubmit = async (payload: Partial<ProductInfo>) => {
    setErrorMsg(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save product record');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingProduct
                  ? `Editing Product ID: #${editingProduct.id}`
                  : 'Enter product details to synchronize with SQLite catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={closeFormModal}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Canonical Form Component */}
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          onCancel={closeFormModal}
          isSubmitting={isLoading}
          errorMsg={errorMsg}
          submitButtonText={editingProduct ? 'Update Product' : 'Save Product'}
        />
      </div>
    </div>
  );
};

