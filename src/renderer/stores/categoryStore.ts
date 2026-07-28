import { create } from 'zustand';
import { CategoryInfo, CreateCategoryPayload, UpdateCategoryPayload } from '../../shared/categoryTypes';
import { electronBridge } from '../../preload/bridge';
import { useUserSessionStore } from './userSessionStore';

export interface CategoryState {
  categories: CategoryInfo[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<CategoryInfo[]>;
  createCategory: (payload: CreateCategoryPayload) => Promise<CategoryInfo>;
  updateCategory: (id: number, payload: UpdateCategoryPayload) => Promise<CategoryInfo>;
  deleteCategory: (id: number) => Promise<boolean>;
}

/**
 * @deprecated Use `useCategoryStore` exported from `createMasterStore` instead (`createMasterStore('categories')`).
 */
export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await electronBridge.getCategories();
      if (res.success && res.data) {
        set({ categories: res.data, isLoading: false });
        return res.data;
      } else {
        const errorMsg = res.error?.message || 'Failed to fetch categories';
        set({ error: errorMsg, isLoading: false });
        return [];
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to fetch categories';
      set({ error: errorMsg, isLoading: false });
      return [];
    }
  },

  createCategory: async (payload) => {
    set({ isLoading: true, error: null });
    const userRole = useUserSessionStore.getState().role;
    try {
      const res = await electronBridge.createCategory({
        ...payload,
        userRole,
      } as any);

      if (res.success && res.data) {
        await get().fetchCategories();
        set({ isLoading: false });
        return res.data;
      } else {
        const errorMsg = res.error?.message || 'Failed to create category';
        set({ error: errorMsg, isLoading: false });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to create category';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  updateCategory: async (id, payload) => {
    set({ isLoading: true, error: null });
    const userRole = useUserSessionStore.getState().role;
    try {
      const res = await electronBridge.updateCategory(id, {
        ...payload,
        userRole,
      } as any);

      if (res.success && res.data) {
        await get().fetchCategories();
        set({ isLoading: false });
        return res.data;
      } else {
        const errorMsg = res.error?.message || 'Failed to update category';
        set({ error: errorMsg, isLoading: false });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update category';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    const userRole = useUserSessionStore.getState().role;
    try {
      const res = await electronBridge.deleteCategory({
        id,
        userRole,
      } as any);

      if (res.success && res.data) {
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      } else {
        const errorMsg = res.error?.message || 'Failed to delete category';
        set({ error: errorMsg, isLoading: false });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to delete category';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },
}));
