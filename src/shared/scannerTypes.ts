/**
 * Barcode Scanner Module Types - Sprint 7.0.0
 */

export interface ProductInfo {
  id: number;
  name: string;
  barcode: string;
  sku?: string;
  internalCode?: string;
  category?: string;
  price: number;
  purchasePrice?: number;
  stock: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | string;
  location?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanRecord {
  id: number;
  barcode: string;
  productId?: number | null;
  productName?: string;
  sku?: string;
  category?: string;
  price?: number;
  stock?: number;
  location?: string;
  scanTime: string;
  userId: string;
  deviceName: string;
  status: 'SUCCESS' | 'NOT_FOUND' | 'INVALID';
}

export interface ScannerSettings {
  prefix: string;
  suffix: string;
  autoClear: boolean;
  autoFocus: boolean;
  successSound: boolean;
  errorSound: boolean;
  continuousScanMode: boolean;
  duplicateScanDelay: number; // in milliseconds
}

export interface ScanProcessOptions {
  barcode: string;
  userId?: string;
  deviceName?: string;
  prefix?: string;
  suffix?: string;
}

export interface ScanResult {
  success: boolean;
  barcode: string;
  cleanBarcode: string;
  product?: ProductInfo | null;
  status: 'SUCCESS' | 'NOT_FOUND' | 'INVALID';
  message: string;
  scanRecord?: ScanRecord;
  timestamp: string;
}
