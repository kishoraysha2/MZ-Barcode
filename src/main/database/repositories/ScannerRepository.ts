import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { ProductInfo, ScanRecord } from '../../../shared/scannerTypes';
import { barcodeRepository } from './BarcodeRepository';

export interface ProductRow {
  id: number;
  name: string;
  barcode: string;
  sku: string;
  internal_code: string;
  category: string;
  price: number;
  purchase_price?: number;
  stock: number;
  status?: string;
  location: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ScanHistoryRow {
  id: number;
  barcode: string;
  product_id: number | null;
  scan_time: string;
  user_id: string;
  device_name: string;
  status: string;
}

import { dbConnection } from '../connection';

export class ScannerRepository extends BaseRepository<ScanHistoryRow> {
  protected tableName = 'scan_history';
  private localHistory: ScanRecord[] = [];
  private localProducts: ProductInfo[] = [];

  public findByBarcode(barcode: string): ProductInfo | null {
    return this.findProductByCode(barcode);
  }

  public findProductByCode(code: string): ProductInfo | null {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    const dbPath = dbConnection.getDbPath();
    const sql = `SELECT * FROM products WHERE barcode = ? LIMIT 1;`;

    console.log('[LOOKUP] Database Path:', dbPath);
    console.log('[LOOKUP] SQL:', sql);
    console.log('[LOOKUP] Barcode:', code);

    // 1. Search in-memory / SQLite products
    const memMatch = this.localProducts.find(
      (p) =>
        p.barcode.toUpperCase() === cleanCode ||
        (p.sku && p.sku.toUpperCase() === cleanCode) ||
        (p.internalCode && p.internalCode.toUpperCase() === cleanCode)
    );
    if (memMatch) {
      console.log('[LOOKUP] Result:', memMatch);
      return memMatch;
    }

    try {
      const dbMatch = QueryBuilder.selectOne<ProductRow>('products', { barcode: code });
      if (dbMatch) {
        const prod = {
          id: dbMatch.id,
          name: dbMatch.name,
          barcode: dbMatch.barcode,
          sku: dbMatch.sku,
          internalCode: dbMatch.internal_code,
          category: dbMatch.category,
          price: dbMatch.price,
          stock: dbMatch.stock,
          location: dbMatch.location,
          imageUrl: dbMatch.image_url,
          createdAt: dbMatch.created_at,
          updatedAt: dbMatch.updated_at,
        };
        console.log('[LOOKUP] Result:', prod);
        return prod;
      }
    } catch (err) {
      console.error('[LOOKUP] QueryBuilder error:', err);
    }

    // 2. Fallback search in BarcodeRepository barcodes table
    const barcodeRecord = barcodeRepository.findByBarcodeValue(code);
    if (barcodeRecord) {
      const prod = {
        id: barcodeRecord.id,
        name: barcodeRecord.title || 'Barcoded Inventory Item',
        barcode: barcodeRecord.barcode_value,
        sku: `SKU-${barcodeRecord.barcode_value}`,
        internalCode: `INT-${barcodeRecord.barcode_value}`,
        category: barcodeRecord.category || 'GENERAL',
        price: 29.99,
        stock: 100,
        location: 'Main Warehouse - Bin 01',
        createdAt: barcodeRecord.created_at,
      };
      console.log('[LOOKUP] Result:', prod);
      return prod;
    }

    console.log('[LOOKUP] Result:', null);
    return null;
  }

  public saveScanHistory(params: {
    barcode: string;
    productId?: number | null;
    productName?: string;
    sku?: string;
    category?: string;
    price?: number;
    stock?: number;
    location?: string;
    userId?: string;
    deviceName?: string;
    status: 'SUCCESS' | 'NOT_FOUND' | 'INVALID';
  }): ScanRecord {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const record: ScanRecord = {
      id,
      barcode: params.barcode,
      productId: params.productId || null,
      productName: params.productName || (params.status === 'SUCCESS' ? 'Found Item' : 'Unknown Product'),
      sku: params.sku || '',
      category: params.category || 'General',
      price: params.price || 0,
      stock: params.stock || 0,
      location: params.location || 'N/A',
      scanTime: nowIso,
      userId: params.userId || 'Customer Admin',
      deviceName: params.deviceName || 'USB HID Scanner',
      status: params.status,
    };

    this.localHistory.unshift(record);

    try {
      QueryBuilder.insert(this.tableName, {
        barcode: params.barcode,
        product_id: params.productId || null,
        user_id: params.userId || 'Customer Admin',
        device_name: params.deviceName || 'USB HID Scanner',
        status: params.status,
      });
    } catch (err) {
      // Fallback silently to local state if db statement fails
    }

    return record;
  }

  public getRecentScanHistory(limit = 50): ScanRecord[] {
    return this.localHistory.slice(0, limit);
  }

  public clearScanHistory(): boolean {
    this.localHistory = [];
    try {
      dbConnection.run(`DELETE FROM ${this.tableName}`);
    } catch {}
    return true;
  }

  public getAllProducts(): ProductInfo[] {
    try {
      const rows = dbConnection.all<ProductRow>('SELECT * FROM products ORDER BY id DESC');
      console.log('[TRACE 1] Number of rows returned from SQLite products table:', rows?.length ?? 0);

      const dbProducts: ProductInfo[] = (rows || []).map((r) => ({
        id: r.id,
        name: r.name,
        barcode: r.barcode,
        sku: r.sku,
        internalCode: r.internal_code,
        category: r.category,
        price: r.price,
        purchasePrice: r.purchase_price ?? 0,
        stock: r.stock,
        status: r.status || 'ACTIVE',
        location: r.location,
        imageUrl: r.image_url,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      console.log('[TRACE 1.1] Total product rows returned from ScannerRepository:', dbProducts.length);
      return dbProducts;
    } catch (err) {
      console.error('[ScannerRepository] getAllProducts error:', err);
    }
    return [];
  }

  public createProduct(params: Partial<ProductInfo>): ProductInfo {
    console.log('[ScannerRepository] createProduct called with params:', params);
    const id = Date.now();
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const product: ProductInfo = {
      id,
      name: params.name || 'New Product',
      barcode: params.barcode || `MZ-${id}`,
      sku: params.sku || `SKU-${id}`,
      internalCode: params.internalCode || `INT-${id}`,
      category: params.category || 'GENERAL',
      price: typeof params.price === 'number' ? params.price : parseFloat(params.price as any) || 0.00,
      purchasePrice: typeof params.purchasePrice === 'number' ? params.purchasePrice : parseFloat(params.purchasePrice as any) || 0.00,
      stock: typeof params.stock === 'number' ? params.stock : parseInt(params.stock as any, 10) || 0,
      status: params.status || 'ACTIVE',
      location: params.location || 'Warehouse A',
      imageUrl: params.imageUrl || '',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.localProducts.unshift(product);

    const insertData = {
      name: product.name,
      barcode: product.barcode,
      sku: product.sku,
      internal_code: product.internalCode,
      category: product.category,
      price: product.price,
      purchase_price: product.purchasePrice,
      stock: product.stock,
      status: product.status,
      location: product.location,
      image_url: product.imageUrl,
    };

    try {
      console.log('[ScannerRepository] Executing SQLite INSERT into products table...');
      QueryBuilder.insert('products', insertData);
      
      const createdRow = QueryBuilder.selectOne<ProductRow>('products', { barcode: product.barcode });
      if (createdRow && createdRow.id) {
        product.id = createdRow.id;
      }
    } catch (err: any) {
      console.error('[CREATE PRODUCT] INSERT THREW EXCEPTION:', err);
      // Still keep in memory cache
    }

    return product;
  }

  public updateProduct(id: number, params: Partial<ProductInfo>): ProductInfo {
    console.log('[ScannerRepository] updateProduct called for id:', id, params);
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const updateData: Record<string, any> = {
      updated_at: nowIso,
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.barcode !== undefined) updateData.barcode = params.barcode;
    if (params.sku !== undefined) updateData.sku = params.sku;
    if (params.internalCode !== undefined) updateData.internal_code = params.internalCode;
    if (params.category !== undefined) updateData.category = params.category;
    if (params.price !== undefined) updateData.price = typeof params.price === 'number' ? params.price : parseFloat(params.price as any) || 0.00;
    if (params.purchasePrice !== undefined) updateData.purchase_price = typeof params.purchasePrice === 'number' ? params.purchasePrice : parseFloat(params.purchasePrice as any) || 0.00;
    if (params.stock !== undefined) updateData.stock = typeof params.stock === 'number' ? params.stock : parseInt(params.stock as any, 10) || 0;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.location !== undefined) updateData.location = params.location;
    if (params.imageUrl !== undefined) updateData.image_url = params.imageUrl;

    try {
      // Execute SQLite UPDATE
      QueryBuilder.update('products', updateData, { id });
      console.log('[ScannerRepository] SQLite UPDATE executed successfully for id:', id);
    } catch (err) {
      console.error('[ScannerRepository] updateProduct SQLite error:', err);
    }

    // Update in-memory localProducts list
    const index = this.localProducts.findIndex((p) => p.id === id || (params.barcode && p.barcode === params.barcode));
    let updatedProduct: ProductInfo;

    if (index !== -1) {
      this.localProducts[index] = {
        ...this.localProducts[index],
        ...params,
        updatedAt: nowIso,
      };
      updatedProduct = this.localProducts[index];
    } else {
      updatedProduct = {
        id,
        name: params.name || 'Updated Product',
        barcode: params.barcode || '',
        sku: params.sku || '',
        internalCode: params.internalCode || '',
        category: params.category || 'GENERAL',
        price: typeof params.price === 'number' ? params.price : parseFloat(params.price as any) || 0,
        purchasePrice: typeof params.purchasePrice === 'number' ? params.purchasePrice : parseFloat(params.purchasePrice as any) || 0,
        stock: typeof params.stock === 'number' ? params.stock : parseInt(params.stock as any, 10) || 0,
        status: params.status || 'ACTIVE',
        location: params.location || 'Warehouse A',
        imageUrl: params.imageUrl || '',
        updatedAt: nowIso,
      };
      this.localProducts.unshift(updatedProduct);
    }

    return updatedProduct;
  }

  public deleteProduct(id: number): boolean {
    console.log('[ScannerRepository] deleteProduct called for id:', id);
    try {
      dbConnection.run('DELETE FROM products WHERE id = ?', [id]);
      console.log('[ScannerRepository] SQLite DELETE executed successfully for id:', id);
    } catch (err) {
      console.error('[ScannerRepository] deleteProduct SQLite error:', err);
    }

    this.localProducts = this.localProducts.filter((p) => p.id !== id);
    return true;
  }
}

export const scannerRepository = new ScannerRepository();
