import { create } from 'zustand';
import { ProductInfo } from '../../shared/scannerTypes';
import { electronBridge } from '../../preload/bridge';

export interface ProductState {
  products: ProductInfo[];
  isLoading: boolean;
  error: string | null;

  // Filters
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;

  // Modals & Selection
  editingProduct: ProductInfo | null;
  viewingProduct: ProductInfo | null;
  productToDelete: ProductInfo | null;
  isFormModalOpen: boolean;
  isViewModalOpen: boolean;
  isDeleteModalOpen: boolean;

  // Setters & Modal toggles
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  openCreateModal: () => void;
  openEditModal: (product: ProductInfo) => void;
  closeFormModal: () => void;
  openViewModal: (product: ProductInfo) => void;
  closeViewModal: () => void;
  openDeleteModal: (product: ProductInfo) => void;
  closeDeleteModal: () => void;

  // IPC Async Operations
  loadProducts: () => Promise<void>;
  createProduct: (data: Partial<ProductInfo>) => Promise<ProductInfo | null>;
  updateProduct: (id: number, data: Partial<ProductInfo>) => Promise<ProductInfo | null>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  categoryFilter: 'ALL',
  statusFilter: 'ALL',

  editingProduct: null,
  viewingProduct: null,
  productToDelete: null,
  isFormModalOpen: false,
  isViewModalOpen: false,
  isDeleteModalOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  openCreateModal: () => set({ editingProduct: null, isFormModalOpen: true }),
  openEditModal: (product) => set({ editingProduct: product, isFormModalOpen: true }),
  closeFormModal: () => set({ isFormModalOpen: false, editingProduct: null }),

  openViewModal: (product) => set({ viewingProduct: product, isViewModalOpen: true }),
  closeViewModal: () => set({ isViewModalOpen: false, viewingProduct: null }),

  openDeleteModal: (product) => set({ productToDelete: product, isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, productToDelete: null }),

  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const api = window.electronAPI?.getAllProducts ? window.electronAPI : electronBridge;
      console.log('[TRACE 3] Calling getAllProducts via IPC bridge...');
      const res = await api.getAllProducts();
      console.log('[TRACE 3.1] Renderer received rows from IPC:', res?.data?.length ?? 0, res);

      if (res.success && Array.isArray(res.data)) {
        set({ products: res.data, isLoading: false });
        console.log('[TRACE 4] Zustand store updated with products count:', res.data.length);
        return;
      }
      set({ isLoading: false });
    } catch (err: any) {
      console.error('[ProductStore] loadProducts failed:', err);
      set({ isLoading: false, error: err?.message || 'Failed to load products' });
    }
  },

  createProduct: async (data: Partial<ProductInfo>) => {
    set({ isLoading: true, error: null });
    try {
      const api = window.electronAPI?.createProduct ? window.electronAPI : electronBridge;
      let createdProduct: ProductInfo | null = null;
      const res = await api.createProduct(data);
      if (res.success && res.data) {
        createdProduct = res.data;
      } else {
        throw new Error(res.error?.message || 'Failed to create product via IPC');
      }

      if (createdProduct) {
        await get().loadProducts();
        set({ isFormModalOpen: false, editingProduct: null, isLoading: false });
        return createdProduct;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('[ProductStore] createProduct failed:', err);
      set({ isLoading: false, error: err?.message || 'Failed to create product' });
      throw err;
    }
  },

  updateProduct: async (id: number, data: Partial<ProductInfo>) => {
    set({ isLoading: true, error: null });
    try {
      const api = window.electronAPI?.updateProduct ? window.electronAPI : electronBridge;
      let updatedProduct: ProductInfo | null = null;
      const res = await api.updateProduct(id, data);
      if (res.success && res.data) {
        updatedProduct = res.data;
      } else {
        throw new Error(res.error?.message || 'Failed to update product via IPC');
      }

      if (updatedProduct) {
        await get().loadProducts();
        set({ isFormModalOpen: false, editingProduct: null, isLoading: false });
        return updatedProduct;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('[ProductStore] updateProduct failed:', err);
      set({ isLoading: false, error: err?.message || 'Failed to update product' });
      throw err;
    }
  },

  deleteProduct: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const api = window.electronAPI?.deleteProduct ? window.electronAPI : electronBridge;
      let success = false;
      const res = await api.deleteProduct(id);
      if (res.success) {
        success = true;
      } else {
        throw new Error(res.error?.message || 'Failed to delete product via IPC');
      }

      if (success) {
        await get().loadProducts();
        set({ isDeleteModalOpen: false, productToDelete: null, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.error('[ProductStore] deleteProduct failed:', err);
      set({ isLoading: false, error: err?.message || 'Failed to delete product' });
      return false;
    }
  },
}));
