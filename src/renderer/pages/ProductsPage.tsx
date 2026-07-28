import React, { useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Barcode,
  Copy,
  Check,
} from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { useUserSessionStore } from '../stores/userSessionStore';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { ProductDetailModal } from '../components/products/ProductDetailModal';
import { DeleteConfirmModal } from '../components/products/DeleteConfirmModal';
import { ProductForm, PRODUCT_CATEGORIES } from '../components/products/ProductForm';
import { ProductInfo } from '../../shared/scannerTypes';

export const ProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    searchQuery,
    categoryFilter,
    statusFilter,
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    loadProducts,
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
  } = useProductStore();

  const { role } = useUserSessionStore();
  const [copiedBarcode, setCopiedBarcode] = React.useState<string | null>(null);

  const canDelete = useMemo(() => {
    const userRole = (role || '').toUpperCase();
    return userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'SYSTEM_ADMIN';
  }, [role]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  // Get unique categories for filter dropdown
  const categoriesList = useMemo(() => {
    const set = new Set<string>(PRODUCT_CATEGORIES);
    products.forEach((p) => {
      if (p.category) set.add(p.category.toUpperCase());
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter (Barcode or Product Name)
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q));

      // Category filter
      const matchesCategory =
        categoryFilter === 'ALL' ||
        (p.category && p.category.toUpperCase() === categoryFilter.toUpperCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'OUT_OF_STOCK') {
          matchesStatus = p.stock === 0 || p.status === 'OUT_OF_STOCK';
        } else if (statusFilter === 'ACTIVE') {
          matchesStatus = p.status === 'ACTIVE' && p.stock > 0;
        } else if (statusFilter === 'INACTIVE') {
          matchesStatus = p.status === 'INACTIVE';
        }
      }

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  console.log('[TRACE 5] ProductsPage rendered count:', {
    totalInStore: products.length,
    filteredForRender: filteredProducts.length,
    searchQuery,
    categoryFilter,
    statusFilter,
  });

  // Metric Cards
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'ACTIVE' && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0 || p.status === 'OUT_OF_STOCK').length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);

  const renderStatusBadge = (product: ProductInfo) => {
    if (product.stock === 0 || product.status === 'OUT_OF_STOCK') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
          <AlertTriangle className="h-3 w-3" /> Out of Stock
        </span>
      );
    }
    if (product.status === 'INACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-500/20">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3" /> Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="h-7 w-7 text-blue-500" />
            Product Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time SQLite persistent product inventory & barcode catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadProducts()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            title="Refresh Products"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Products</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalProducts}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Catalog</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{activeProducts}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Inventory Valuation</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Out of Stock Alerts</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Barcode or Name..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Barcode</th>
                <th className="px-4 py-3.5">Product Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-right">Purchase Price</th>
                <th className="px-4 py-3.5 text-right">Selling Price</th>
                <th className="px-4 py-3.5 text-center">Stock</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-slate-600" />
                      <p className="text-sm font-medium">No products found matching filters</p>
                      <p className="text-xs text-slate-600">Try adjusting search or click "Add New Product"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition">
                    {/* Barcode */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-slate-100 font-semibold">
                        <Barcode className="h-4 w-4 text-slate-500" />
                        <span>{product.barcode}</span>
                        <button
                          onClick={() => handleCopyBarcode(product.barcode)}
                          className="ml-1 text-slate-500 hover:text-slate-300 transition"
                          title="Copy Barcode"
                        >
                          {copiedBarcode === product.barcode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-semibold text-white block">{product.name}</span>
                        {product.sku && (
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 border border-slate-700">
                        <Tag className="h-3 w-3 text-purple-400" />
                        {product.category || 'GENERAL'}
                      </span>
                    </td>

                    {/* Purchase Price */}
                    <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-300">
                      ${product.purchasePrice ? product.purchasePrice.toFixed(2) : '0.00'}
                    </td>

                    {/* Selling Price */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                      ${product.price ? product.price.toFixed(2) : '0.00'}
                    </td>

                    {/* Stock Quantity */}
                    <td className="px-4 py-3.5 text-center font-semibold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-mono ${
                          product.stock === 0
                            ? 'bg-rose-500/20 text-rose-300'
                            : product.stock < 10
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">{renderStatusBadge(product)}</td>

                    {/* Created Date */}
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {product.createdAt ? product.createdAt.split('T')[0] : 'N/A'}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => openViewModal(product)}
                          className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-blue-600 hover:text-white transition"
                          title="View Product Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-amber-600 hover:text-white transition"
                          title="Edit Product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {/* Delete Button (Owner / Admin only) */}
                        {canDelete ? (
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-rose-600 hover:text-white transition"
                            title="Delete Product (Owner/Admin Only)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="rounded-lg bg-slate-800/40 p-1.5 text-slate-600 cursor-not-allowed"
                            title="Delete disabled (Requires Owner/Admin Role)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal />
      <ProductDetailModal />
      <DeleteConfirmModal />
    </div>
  );
};
