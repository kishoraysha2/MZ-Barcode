import { scannerRepository } from '../database/repositories/ScannerRepository';
import { ProductInfo, ScanRecord, ScanResult, ScannerSettings, ScanProcessOptions } from '../../shared/scannerTypes';
import { logger } from '../logger';

export class ScannerService {
  private settings: ScannerSettings = {
    prefix: '',
    suffix: 'Enter',
    autoClear: true,
    autoFocus: true,
    successSound: true,
    errorSound: true,
    continuousScanMode: false,
    duplicateScanDelay: 1000,
  };

  private lastScannedBarcode: string = '';
  private lastScanTimestamp: number = 0;

  public getSettings(): ScannerSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<ScannerSettings>): ScannerSettings {
    this.settings = { ...this.settings, ...newSettings };
    logger.info('[ScannerService] Updated scanner settings:', this.settings);
    return this.getSettings();
  }

  public async processScan(options: ScanProcessOptions): Promise<ScanResult> {
    const rawBarcode = options.barcode || '';
    const now = Date.now();

    console.log("========== PROCESS SCAN CALLED ==========");
    console.log("[SCAN] Barcode:", rawBarcode);

    let cleanBarcode = rawBarcode.trim();

    // Strip prefix if configured
    if (this.settings.prefix && cleanBarcode.startsWith(this.settings.prefix)) {
      cleanBarcode = cleanBarcode.substring(this.settings.prefix.length);
    }

    // Duplicate scan suppression check
    if (
      this.settings.duplicateScanDelay > 0 &&
      cleanBarcode === this.lastScannedBarcode &&
      now - this.lastScanTimestamp < this.settings.duplicateScanDelay
    ) {
      logger.warn(`[ScannerService] Suppressed duplicate scan for '${cleanBarcode}' within ${this.settings.duplicateScanDelay}ms`);
      return {
        success: false,
        barcode: rawBarcode,
        cleanBarcode,
        product: null,
        status: 'INVALID',
        message: `Duplicate scan suppressed (${this.settings.duplicateScanDelay}ms delay active)`,
        timestamp: new Date().toISOString(),
      };
    }

    this.lastScannedBarcode = cleanBarcode;
    this.lastScanTimestamp = now;

    if (!cleanBarcode) {
      return {
        success: false,
        barcode: rawBarcode,
        cleanBarcode: '',
        product: null,
        status: 'INVALID',
        message: 'Empty or invalid barcode string',
        timestamp: new Date().toISOString(),
      };
    }

    // Search SQLite products / barcodes table
    const product = scannerRepository.findProductByCode(cleanBarcode);

    let status: 'SUCCESS' | 'NOT_FOUND' = 'NOT_FOUND';
    let message = 'Product Not Found';

    if (product) {
      status = 'SUCCESS';
      message = `Product Found: ${product.name}`;
    }

    // Save into SQLite scan_history table
    const record: ScanRecord = scannerRepository.saveScanHistory({
      barcode: cleanBarcode,
      productId: product?.id || null,
      productName: product?.name,
      sku: product?.sku,
      category: product?.category,
      price: product?.price,
      stock: product?.stock,
      location: product?.location,
      userId: options.userId || 'Customer Admin',
      deviceName: options.deviceName || 'USB HID Scanner',
      status,
    });

    logger.info(`[ScannerService] Processed scan for barcode '${cleanBarcode}': Status=${status}`);

    return {
      success: status === 'SUCCESS',
      barcode: rawBarcode,
      cleanBarcode,
      product,
      status,
      message,
      scanRecord: record,
      timestamp: new Date().toISOString(),
    };
  }

  public getScanHistory(limit = 50): ScanRecord[] {
    return scannerRepository.getRecentScanHistory(limit);
  }

  public clearScanHistory(): boolean {
    return scannerRepository.clearScanHistory();
  }

  public getAllProducts(): ProductInfo[] {
    return scannerRepository.getAllProducts();
  }

  public createProduct(productData: Partial<ProductInfo>): ProductInfo {
    this.lastScannedBarcode = '';
    this.lastScanTimestamp = 0;
    return scannerRepository.createProduct(productData);
  }

  public updateProduct(id: number, productData: Partial<ProductInfo>): ProductInfo {
    this.lastScannedBarcode = '';
    this.lastScanTimestamp = 0;
    return scannerRepository.updateProduct(id, productData);
  }

  public deleteProduct(id: number): boolean {
    return scannerRepository.deleteProduct(id);
  }
}

export const scannerService = new ScannerService();
