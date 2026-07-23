import { create } from 'zustand';

export interface SystemStatusState {
  isDatabaseReady: boolean;
  isIpcConnected: boolean;
  isLicenseActive: boolean;
  isPrinterSpoolReady: boolean;
  lastSyncTimestamp: string;
  setDatabaseReady: (ready: boolean) => void;
  setIpcConnected: (connected: boolean) => void;
  setLicenseActive: (active: boolean) => void;
  setPrinterSpoolReady: (ready: boolean) => void;
}

export const useSystemStatusStore = create<SystemStatusState>((set) => ({
  isDatabaseReady: true,
  isIpcConnected: true,
  isLicenseActive: true,
  isPrinterSpoolReady: true,
  lastSyncTimestamp: new Date().toISOString(),
  setDatabaseReady: (isDatabaseReady) => set({ isDatabaseReady }),
  setIpcConnected: (isIpcConnected) => set({ isIpcConnected }),
  setLicenseActive: (isLicenseActive) => set({ isLicenseActive }),
  setPrinterSpoolReady: (isPrinterSpoolReady) => set({ isPrinterSpoolReady }),
}));
