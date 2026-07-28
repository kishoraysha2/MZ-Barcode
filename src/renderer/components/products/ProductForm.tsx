import React, { useState, useEffect } from 'react';
import {
  Package,
  Tag,
  MapPin,
  DollarSign,
  Layers,
  Hash,
  Barcode,
  CheckCircle2,
  X,
  Plus,
  Image as ImageIcon,
  PackageCheck,
  Building,
  Truck,
} from 'lucide-react';
import { ProductInfo } from '../../../shared/scannerTypes';
import { MasterModuleName, MasterEntity } from '../../../shared/masterTypes';
import {
  useCategoryStore,
  useUnitStore,
  useBrandStore,
  useWarehouseStore,
  useSupplierStore,
} from '../../stores/createMasterStore';
import { useUserSessionStore } from '../../stores/userSessionStore';
import { QuickAddMasterModal } from '../master/QuickAddMasterModal';

export const PRODUCT_CATEGORIES = [
  'GENERAL',
  'HARDWARE',
  'SUPPLIES',
  'ASSET',
  'ELECTRONICS',
  'ACCESSORIES',
] as const;

export interface ProductFormProps {
  initialData?: (Partial<ProductInfo> & {
    categoryId?: string;
    unitId?: string;
    brandId?: string;
    warehouseId?: string;
    supplierId?: string;
  }) | null;
  initialBarcode?: string;
  isBarcodeReadOnly?: boolean;
  onSubmit: (data: Partial<ProductInfo> & Record<string, any>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMsg?: string | null;
  submitButtonText?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  initialBarcode = '',
  isBarcodeReadOnly = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMsg = null,
  submitButtonText,
}) => {
  const role = useUserSessionStore((s) => s.role);
  const canAddMaster = role === 'OWNER' || role === 'ADMIN';

  // Master Stores
  const categoryStore = useCategoryStore();
  const unitStore = useUnitStore();
  const brandStore = useBrandStore();
  const warehouseStore = useWarehouseStore();
  const supplierStore = useSupplierStore();

  // Selected Master IDs
  const [categoryId, setCategoryId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');

  // Quick Add Modal States
  const [activeQuickAddModule, setActiveQuickAddModule] = useState<MasterModuleName | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('0.00');
  const [price, setPrice] = useState('0.00');
  const [stock, setStock] = useState('0');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'>('ACTIVE');
  const [location, setLocation] = useState('Aisle 1 - Shelf A');
  const [imageUrl, setImageUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Fetch Master Data on Mount
  useEffect(() => {
    categoryStore.fetchActiveItems();
    unitStore.fetchActiveItems();
    brandStore.fetchActiveItems();
    warehouseStore.fetchActiveItems();
    supplierStore.fetchActiveItems();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setBarcode(initialData.barcode || initialBarcode || '');
      setSku(initialData.sku || '');
      setInternalCode(initialData.internalCode || '');
      setCategoryId(initialData.categoryId || categoryStore.activeItems[0]?.id || '');
      setUnitId(initialData.unitId || unitStore.activeItems[0]?.id || '');
      setBrandId(initialData.brandId || brandStore.activeItems[0]?.id || '');
      setWarehouseId(initialData.warehouseId || warehouseStore.activeItems[0]?.id || '');
      setSupplierId(initialData.supplierId || supplierStore.activeItems[0]?.id || '');
      setPurchasePrice(initialData.purchasePrice !== undefined ? String(initialData.purchasePrice) : '0.00');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '0.00');
      setStock(initialData.stock !== undefined ? String(initialData.stock) : '0');
      setStatus((initialData.status as any) || 'ACTIVE');
      setLocation(initialData.location || 'Aisle 1 - Shelf A');
      setImageUrl(initialData.imageUrl || '');
    } else {
      setName(initialBarcode ? `Scanned Item (${initialBarcode})` : '');
      setBarcode(initialBarcode || '');
      setSku(initialBarcode ? `SKU-${initialBarcode}` : '');
      setInternalCode(initialBarcode ? `INT-${initialBarcode}` : '');
      setCategoryId(categoryStore.activeItems[0]?.id || '');
      setUnitId(unitStore.activeItems[0]?.id || '');
      setBrandId(brandStore.activeItems[0]?.id || '');
      setWarehouseId(warehouseStore.activeItems[0]?.id || '');
      setSupplierId(supplierStore.activeItems[0]?.id || '');
      setPurchasePrice('0.00');
      setPrice('0.00');
      setStock('0');
      setStatus('ACTIVE');
      setLocation('Aisle 1 - Shelf A');
      setImageUrl('');
    }
    setLocalError(null);
  }, [initialData, initialBarcode, categoryStore.activeItems.length, unitStore.activeItems.length]);

  const handleQuickAddSuccess = (moduleName: MasterModuleName, createdItem: MasterEntity) => {
    switch (moduleName) {
      case 'categories':
        setCategoryId(createdItem.id);
        break;
      case 'units':
        setUnitId(createdItem.id);
        break;
      case 'brands':
        setBrandId(createdItem.id);
        break;
      case 'warehouses':
        setWarehouseId(createdItem.id);
        break;
      case 'suppliers':
        setSupplierId(createdItem.id);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedName = name.trim();
    const trimmedBarcode = barcode.trim();

    if (!trimmedName) {
      setLocalError('Product Name is required.');
      return;
    }
    if (!trimmedBarcode) {
      setLocalError('Barcode Number is required.');
      return;
    }

    const selectedCategoryObj = categoryStore.activeItems.find((c) => c.id === categoryId);

    const payload = {
      name: trimmedName,
      barcode: trimmedBarcode,
      sku: sku.trim() || `SKU-${trimmedBarcode}`,
      internalCode: internalCode.trim() || `INT-${trimmedBarcode}`,
      category: selectedCategoryObj ? selectedCategoryObj.name : 'GENERAL',
      category_id: categoryId,
      unit_id: unitId,
      brand_id: brandId,
      warehouse_id: warehouseId,
      supplier_id: supplierId,
      purchasePrice: parseFloat(purchasePrice) || 0,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      status,
      location: location.trim() || 'Aisle 1 - Shelf A',
      imageUrl: imageUrl.trim(),
    };

    await onSubmit(payload);
  };

  const displayedError = localError || errorMsg;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {displayedError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium flex items-center justify-between">
            <span>{displayedError}</span>
            <button
              type="button"
              onClick={() => setLocalError(null)}
              className="text-rose-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Product Name / Title <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Thermal Label Printer"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Barcode Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Barcode Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                readOnly={isBarcodeReadOnly}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. MZ-88492014"
                className={`w-full rounded-xl border border-slate-700 pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none ${
                  isBarcodeReadOnly
                    ? 'bg-slate-800/40 text-slate-400 cursor-not-allowed border-slate-800'
                    : 'bg-slate-800/80 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {/* DYNAMIC MASTER: Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Category</label>
              {canAddMaster && (
                <button
                  type="button"
                  onClick={() => setActiveQuickAddModule('categories')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  title="Quick Add Category"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Category...</option>
                {categoryStore.activeItems.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC MASTER: Unit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Unit of Measure</label>
              {canAddMaster && (
                <button
                  type="button"
                  onClick={() => setActiveQuickAddModule('units')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  title="Quick Add Unit"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="relative">
              <PackageCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Unit...</option>
                {unitStore.activeItems.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC MASTER: Brand */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Brand</label>
              {canAddMaster && (
                <button
                  type="button"
                  onClick={() => setActiveQuickAddModule('brands')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition"
                  title="Quick Add Brand"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Brand...</option>
                {brandStore.activeItems.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} ({brand.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC MASTER: Warehouse */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Warehouse Location</label>
              {canAddMaster && (
                <button
                  type="button"
                  onClick={() => setActiveQuickAddModule('warehouses')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  title="Quick Add Warehouse"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Warehouse...</option>
                {warehouseStore.activeItems.map((whs) => (
                  <option key={whs.id} value={whs.id}>
                    {whs.name} ({whs.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC MASTER: Supplier */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Supplier</label>
              {canAddMaster && (
                <button
                  type="button"
                  onClick={() => setActiveQuickAddModule('suppliers')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition"
                  title="Quick Add Supplier"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Supplier...</option>
                {supplierStore.activeItems.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SKU-PRN-8849"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Internal Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Code</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                placeholder="e.g. INT-8849"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Price ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Selling Price ($) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Stock Quantity <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Status</label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
            </div>
          </div>

          {/* Warehouse Aisle Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Aisle / Shelf Detail</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle 4 - Shelf B"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/product.png"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition"
          >
            {isSubmitting
              ? 'Saving...'
              : submitButtonText || (initialData ? 'Update Product' : 'Save Product')}
          </button>
        </div>
      </form>

      {/* QUICK ADD MASTER MODAL */}
      {activeQuickAddModule && (
        <QuickAddMasterModal
          moduleName={activeQuickAddModule}
          isOpen={true}
          onClose={() => setActiveQuickAddModule(null)}
          onCreated={(createdItem) => handleQuickAddSuccess(activeQuickAddModule, createdItem)}
        />
      )}
    </>
  );
};
