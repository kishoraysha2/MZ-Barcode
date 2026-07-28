import { create } from 'zustand';
import { MasterEntity, MasterModuleName, CreateMasterPayload, UpdateMasterPayload } from '../../shared/masterTypes';
import { electronBridge } from '../../preload/bridge';
import { useUserSessionStore } from './userSessionStore';

export interface MasterStoreState {
  moduleName: MasterModuleName;
  items: MasterEntity[];
  activeItems: MasterEntity[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  page: number;
  pageSize: number;

  fetchItems: () => Promise<MasterEntity[]>;
  fetchActiveItems: () => Promise<MasterEntity[]>;
  createItem: (payload: CreateMasterPayload) => Promise<MasterEntity>;
  updateItem: (id: string, payload: UpdateMasterPayload) => Promise<MasterEntity>;
  enableItem: (id: string) => Promise<MasterEntity>;
  disableItem: (id: string) => Promise<MasterEntity>;
  deleteItem: (id: string) => Promise<boolean>;

  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  setPage: (page: number) => void;
}

export function createMasterStore(moduleName: MasterModuleName) {
  return create<MasterStoreState>((set, get) => ({
    moduleName,
    items: [],
    activeItems: [],
    isLoading: false,
    error: null,
    searchTerm: '',
    statusFilter: 'ALL',
    page: 1,
    pageSize: 10,

    setSearchTerm: (term: string) => set({ searchTerm: term, page: 1 }),
    setStatusFilter: (filter: 'ALL' | 'ACTIVE' | 'INACTIVE') => set({ statusFilter: filter, page: 1 }),
    setPage: (page: number) => set({ page }),

    fetchItems: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await electronBridge.masterGetAll(moduleName);
        if (res.success && res.data) {
          set({ items: res.data, isLoading: false });
          return res.data;
        } else {
          const errorMsg = res.error?.message || `Failed to fetch ${moduleName}`;
          set({ error: errorMsg, isLoading: false });
          return [];
        }
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to fetch ${moduleName}`;
        set({ error: errorMsg, isLoading: false });
        return [];
      }
    },

    fetchActiveItems: async () => {
      try {
        const res = await electronBridge.masterGetActive(moduleName);
        if (res.success && res.data) {
          set({ activeItems: res.data });
          return res.data;
        }
        return [];
      } catch (err) {
        console.error(`Failed to fetch active ${moduleName}:`, err);
        return [];
      }
    },

    createItem: async (payload: CreateMasterPayload) => {
      set({ isLoading: true, error: null });
      const userRole = useUserSessionStore.getState().role;
      const username = useUserSessionStore.getState().username || 'SYSTEM';

      try {
        const res = await electronBridge.masterCreate(moduleName, {
          ...payload,
          userRole,
          username,
        } as any);

        if (res.success && res.data) {
          await get().fetchItems();
          await get().fetchActiveItems();
          set({ isLoading: false });
          return res.data;
        } else {
          const errorMsg = res.error?.message || `Failed to create record in ${moduleName}`;
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to create record in ${moduleName}`;
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },

    updateItem: async (id: string, payload: UpdateMasterPayload) => {
      set({ isLoading: true, error: null });
      const userRole = useUserSessionStore.getState().role;
      const username = useUserSessionStore.getState().username || 'SYSTEM';

      try {
        const res = await electronBridge.masterUpdate(moduleName, id, {
          ...payload,
          userRole,
          username,
        } as any);

        if (res.success && res.data) {
          await get().fetchItems();
          await get().fetchActiveItems();
          set({ isLoading: false });
          return res.data;
        } else {
          const errorMsg = res.error?.message || `Failed to update record in ${moduleName}`;
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to update record in ${moduleName}`;
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },

    enableItem: async (id: string) => {
      set({ isLoading: true, error: null });
      const userRole = useUserSessionStore.getState().role;
      const username = useUserSessionStore.getState().username || 'SYSTEM';

      try {
        const res = await electronBridge.masterEnable(moduleName, id, {
          userRole,
          username,
        });

        if (res.success && res.data) {
          await get().fetchItems();
          await get().fetchActiveItems();
          set({ isLoading: false });
          return res.data;
        } else {
          const errorMsg = res.error?.message || `Failed to enable record in ${moduleName}`;
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to enable record in ${moduleName}`;
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },

    disableItem: async (id: string) => {
      set({ isLoading: true, error: null });
      const userRole = useUserSessionStore.getState().role;
      const username = useUserSessionStore.getState().username || 'SYSTEM';

      try {
        const res = await electronBridge.masterDisable(moduleName, id, {
          userRole,
          username,
        });

        if (res.success && res.data) {
          await get().fetchItems();
          await get().fetchActiveItems();
          set({ isLoading: false });
          return res.data;
        } else {
          const errorMsg = res.error?.message || `Failed to disable record in ${moduleName}`;
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to disable record in ${moduleName}`;
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },

    deleteItem: async (id: string) => {
      set({ isLoading: true, error: null });
      const userRole = useUserSessionStore.getState().role;
      const username = useUserSessionStore.getState().username || 'SYSTEM';

      try {
        const res = await electronBridge.masterDelete(moduleName, id, {
          userRole,
          username,
        });

        if (res.success && res.data) {
          await get().fetchItems();
          await get().fetchActiveItems();
          set({ isLoading: false });
          return true;
        } else {
          const errorMsg = res.error?.message || `Failed to delete record in ${moduleName}`;
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to delete record in ${moduleName}`;
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },
  }));
}

// Master module store instances
export const useCategoryStore = createMasterStore('categories');
export const useUnitStore = createMasterStore('units');
export const useBrandStore = createMasterStore('brands');
export const useWarehouseStore = createMasterStore('warehouses');
export const useSupplierStore = createMasterStore('suppliers');

export const MASTER_STORES = {
  categories: useCategoryStore,
  units: useUnitStore,
  brands: useBrandStore,
  warehouses: useWarehouseStore,
  suppliers: useSupplierStore,
};
