import { create } from 'zustand';
import { ScanResult, ScanRecord, ScannerSettings, ProductInfo } from '../../shared/scannerTypes';
import { playSuccessBeep, playErrorBeep } from '../../utils/audioBeep';

export interface ScannerState {
  currentInput: string;
  lastResult: ScanResult | null;
  history: ScanRecord[];
  settings: ScannerSettings;
  isLoading: boolean;
  activeTab: 'scan' | 'history' | 'settings' | 'camera';
  autoFocus: boolean;
  totalScansCount: number;
  successScansCount: number;

  setCurrentInput: (val: string) => void;
  clearCurrentInput: () => void;
  setActiveTab: (tab: 'scan' | 'history' | 'settings' | 'camera') => void;
  toggleAutoFocus: () => void;

  processScan: (overrideBarcode?: string) => Promise<ScanResult | null>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: (newSettings: Partial<ScannerSettings>) => Promise<void>;
  createProduct: (product: Partial<ProductInfo>) => Promise<ProductInfo | null>;
}

const defaultSettings: ScannerSettings = {
  prefix: '',
  suffix: 'Enter',
  autoClear: true,
  autoFocus: true,
  successSound: true,
  errorSound: true,
  continuousScanMode: false,
  duplicateScanDelay: 1000,
};

const fallbackProductsCache: Record<string, ProductInfo> = {
  'MZ-88492014': { id: 1, name: 'Enterprise Thermal Barcode Label Printer', barcode: 'MZ-88492014', sku: 'SKU-PRN-8849', category: 'HARDWARE', price: 349.99, stock: 18, location: 'Aisle 4 - Shelf B' },
  'MZ-10000001': { id: 2, name: 'Standard Shipping Label Roll (100x50mm)', barcode: 'MZ-10000001', sku: 'SKU-LBL-10050', category: 'SUPPLIES', price: 24.50, stock: 142, location: 'Aisle 1 - Shelf A' },
  'MZ-10000002': { id: 3, name: 'Wireless USB Barcode Scanner Wedge', barcode: 'MZ-10000002', sku: 'SKU-SCN-0002', category: 'HARDWARE', price: 89.00, stock: 35, location: 'Aisle 4 - Shelf C' },
  '100012345': { id: 5, name: 'Industrial QR Asset Code Tag', barcode: '100012345', sku: 'SKU-QR-10001', category: 'ASSET', price: 12.99, stock: 500, location: 'Aisle 3 - Shelf D' },
};

export const useScannerStore = create<ScannerState>((set, get) => ({
  currentInput: '',
  lastResult: null,
  history: [],
  settings: defaultSettings,
  isLoading: false,
  activeTab: 'scan',
  autoFocus: true,
  totalScansCount: 0,
  successScansCount: 0,

  setCurrentInput: (currentInput) => set({ currentInput }),
  clearCurrentInput: () => set({ currentInput: '' }),
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleAutoFocus: () => set((state) => ({ autoFocus: !state.autoFocus })),

  processScan: async (overrideBarcode?: string) => {
    const { currentInput, settings, history } = get();
    const barcodeToProcess = (overrideBarcode !== undefined ? overrideBarcode : currentInput).trim();

    if (!barcodeToProcess) return null;

    set({ isLoading: true });

    try {
      let res: ScanResult | null = null;

      if (window.electronAPI?.processScan) {
        const response = await window.electronAPI.processScan({
          barcode: barcodeToProcess,
          prefix: settings.prefix,
          suffix: settings.suffix,
        });
        if (response.success && response.data) {
          res = response.data;
        }
      }

      if (!res) {
        // Fallback local calculation
        const cleanVal = barcodeToProcess.trim();
        const fallbackMatch = fallbackProductsCache[cleanVal] || fallbackProductsCache[cleanVal.toUpperCase()];
        const isSuccess = !!fallbackMatch;
        res = {
          success: isSuccess,
          barcode: barcodeToProcess,
          cleanBarcode: cleanVal,
          product: fallbackMatch || null,
          status: isSuccess ? 'SUCCESS' : 'NOT_FOUND',
          message: isSuccess ? `Product Found for ${cleanVal}` : `Product Not Found for '${cleanVal}'`,
          timestamp: new Date().toISOString(),
          scanRecord: {
            id: Date.now(),
            barcode: cleanVal,
            productId: fallbackMatch?.id || null,
            productName: fallbackMatch?.name || 'Unknown Product',
            sku: fallbackMatch?.sku || '',
            category: fallbackMatch?.category || 'General',
            price: fallbackMatch?.price || 0,
            stock: fallbackMatch?.stock || 0,
            location: fallbackMatch?.location || 'N/A',
            scanTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
            userId: 'Customer Admin',
            deviceName: 'USB HID Scanner',
            status: isSuccess ? 'SUCCESS' : 'NOT_FOUND',
          },
        };
      }

      // Audio feedback trigger
      if (res.status === 'SUCCESS') {
        if (settings.successSound) playSuccessBeep();
      } else {
        if (settings.errorSound) playErrorBeep();
      }

      // Update history & stats
      const newRecord = res.scanRecord;
      const updatedHistory = newRecord ? [newRecord, ...history] : history;

      set((state) => ({
        lastResult: res,
        history: updatedHistory,
        totalScansCount: state.totalScansCount + 1,
        successScansCount: state.successScansCount + (res?.status === 'SUCCESS' ? 1 : 0),
        currentInput: settings.autoClear ? '' : state.currentInput,
        isLoading: false,
      }));

      return res;
    } catch (err) {
      console.error('[ScannerStore] processScan failed:', err);
      if (settings.errorSound) playErrorBeep();
      set({ isLoading: false });
      return null;
    }
  },

  loadHistory: async () => {
    try {
      if (window.electronAPI?.getScanHistory) {
        const response = await window.electronAPI.getScanHistory(50);
        if (response.success && response.data) {
          set({
            history: response.data,
            totalScansCount: response.data.length,
            successScansCount: response.data.filter((r) => r.status === 'SUCCESS').length,
          });
        }
      }
    } catch (err) {
      console.error('[ScannerStore] loadHistory failed:', err);
    }
  },

  clearHistory: async () => {
    try {
      if (window.electronAPI?.clearScanHistory) {
        await window.electronAPI.clearScanHistory();
      }
      set({ history: [], totalScansCount: 0, successScansCount: 0 });
    } catch (err) {
      console.error('[ScannerStore] clearHistory failed:', err);
    }
  },

  loadSettings: async () => {
    try {
      if (window.electronAPI?.getScannerSettings) {
        const response = await window.electronAPI.getScannerSettings();
        if (response.success && response.data) {
          set({ settings: response.data });
        }
      }
    } catch (err) {
      console.error('[ScannerStore] loadSettings failed:', err);
    }
  },

  saveSettings: async (newSettings: Partial<ScannerSettings>) => {
    const currentSettings = get().settings;
    const updated = { ...currentSettings, ...newSettings };
    set({ settings: updated });

    try {
      if (window.electronAPI?.saveScannerSettings) {
        await window.electronAPI.saveScannerSettings(newSettings);
      }
    } catch (err) {
      console.error('[ScannerStore] saveSettings failed:', err);
    }
  },

  createProduct: async (productData: Partial<ProductInfo>) => {
    console.log('[ScannerStore] createProduct action started with:', productData);
    console.log('electronAPI =', window.electronAPI);
    console.log('createScannerProduct =', window.electronAPI?.createScannerProduct);
    try {
      if (window.electronAPI?.createScannerProduct) {
        console.log('[ScannerStore] Invoking window.electronAPI.createScannerProduct IPC...');
        const res = await window.electronAPI.createScannerProduct(productData);
        console.log('[ScannerStore] createScannerProduct IPC response:', res);
        if (res && res.success && res.data) {
          // Add to local fallback cache as well
          const p = res.data;
          fallbackProductsCache[p.barcode] = p;
          fallbackProductsCache[p.barcode.toUpperCase()] = p;
          return p;
        } else {
          const errMsg = res?.error?.message || 'IPC returned unsuccessful response for product creation';
          console.error('[ScannerStore] IPC createScannerProduct failed:', errMsg);
          throw new Error(errMsg);
        }
      }

      // Standalone browser / fallback mode execution
      console.warn('[ScannerStore] window.electronAPI.createScannerProduct missing, executing local fallback product creation');
      const id = Date.now();
      const created: ProductInfo = {
        id,
        name: productData.name || 'New Scanned Product',
        barcode: productData.barcode || `MZ-${id}`,
        sku: productData.sku || `SKU-${id}`,
        category: productData.category || 'GENERAL',
        price: typeof productData.price === 'number' ? productData.price : parseFloat(productData.price as any) || 0,
        stock: typeof productData.stock === 'number' ? productData.stock : parseInt(productData.stock as any, 10) || 0,
        location: productData.location || 'Warehouse A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallbackProductsCache[created.barcode] = created;
      fallbackProductsCache[created.barcode.toUpperCase()] = created;
      console.log('[ScannerStore] Created product in local fallback cache:', created);

      return created;
    } catch (err: any) {
      console.error('[ScannerStore] createProduct failed with exception:', err);
      throw err; // Re-throw to caller so modal UI displays the error
    }
  },
}));
