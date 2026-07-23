import { create } from 'zustand';
import { AppEdition } from '../../shared/types';

export interface ApplicationStatusState {
  edition: AppEdition;
  activeView: string;
  sidebarCollapsed: boolean;
  isSearchOpen: boolean;
  showBlueprintDrawer: boolean;
  setEdition: (edition: AppEdition) => void;
  setActiveView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleBlueprintDrawer: () => void;
}

export const useApplicationStatusStore = create<ApplicationStatusState>((set) => ({
  edition: 'customer',
  activeView: 'dashboard',
  sidebarCollapsed: false,
  isSearchOpen: false,
  showBlueprintDrawer: false,
  setEdition: (edition) => set({ edition }),
  setActiveView: (activeView) => set({ activeView }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  toggleBlueprintDrawer: () => set((state) => ({ showBlueprintDrawer: !state.showBlueprintDrawer })),
}));
