import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { useScannerStore } from '../../stores/scannerStore';
import { ProductInfo } from '../../../shared/scannerTypes';
import { ProductForm } from '../products/ProductForm';

interface CreateProductModalProps {
  isOpen: boolean;
  initialBarcode: string;
  onClose: () => void;
  onSuccess: (barcode: string) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  initialBarcode,
  onClose,
  onSuccess,
}) => {
  const { createProduct } = useScannerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (payload: Partial<ProductInfo>) => {
    console.log('[CreateProductModal] Scanner product creation submitted:', payload);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await createProduct(payload);
      setIsSubmitting(false);

      if (created) {
        console.log('[CreateProductModal] Product created successfully! Auto-scanning:', payload.barcode);
        onSuccess(payload.barcode || initialBarcode);
        onClose();
      } else {
        setErrorMsg('Failed to save product into database.');
      }
    } catch (err: any) {
      console.error('[CreateProductModal] Error saving scanner product:', err);
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'An unexpected error occurred while saving the product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Product</h3>
              <p className="text-xs text-slate-400">Add missing barcode to SQLite product catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Canonical Form Component */}
        <ProductForm
          initialBarcode={initialBarcode}
          isBarcodeReadOnly={false}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
          submitButtonText="Save Product"
        />
      </div>
    </div>
  );
};

