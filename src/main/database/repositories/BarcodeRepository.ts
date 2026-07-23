import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { BarcodeInsertSchema, BarcodeUpdateSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface BarcodeRow {
  id: number;
  barcode_value: string;
  prefix: string;
  sequence_number: number;
  barcode_type: string;
  title: string;
  category: string;
  status: string;
  print_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

export class BarcodeRepository extends BaseRepository<BarcodeRow> {
  protected tableName = 'barcodes';
  private items: BarcodeRow[] = [];
  private sequenceMap: Map<string, number> = new Map();

  public findByBarcodeValue(barcodeValue: string): BarcodeRow | undefined {
    return this.items.find((b) => b.barcode_value === barcodeValue) || QueryBuilder.selectOne<BarcodeRow>(this.tableName, { barcode_value: barcodeValue });
  }

  public findRecent(limit = 10): BarcodeRow[] {
    return [...this.items].sort((a, b) => b.id - a.id).slice(0, limit);
  }

  public findAll(limit = 100, offset = 0): BarcodeRow[] {
    const list = [...this.items].sort((a, b) => b.id - a.id);
    return list.slice(offset, offset + limit);
  }

  public count(): number {
    return this.items.length;
  }

  public getTotalPrintCount(): number {
    return this.items.reduce((sum, b) => sum + (b.print_count || 0), 0);
  }

  public create(barcode: Record<string, any>): BarcodeRow {
    const validated = BarcodeInsertSchema.parse(barcode);
    const id = barcode.id || Date.now() + Math.floor(Math.random() * 1000);
    const createdAt = barcode.created_at || new Date().toISOString().replace('T', ' ').slice(0, 19);

    const row: BarcodeRow = {
      id,
      barcode_value: validated.barcode_value,
      prefix: validated.prefix || '',
      sequence_number: validated.sequence_number || 1,
      barcode_type: validated.barcode_type,
      title: validated.title,
      category: validated.category || 'General',
      status: validated.status || 'active',
      print_count: validated.print_count || 1,
      created_at: createdAt,
      updated_at: createdAt,
      created_by: validated.created_by || 'Customer Admin',
      updated_by: validated.created_by || 'Customer Admin',
      is_active: 1,
    };

    this.items.unshift(row);
    QueryBuilder.insert(this.tableName, validated);

    // Update sequence counter
    if (row.prefix) {
      const curr = this.sequenceMap.get(row.prefix) || 1;
      if (row.sequence_number >= curr) {
        this.sequenceMap.set(row.prefix, row.sequence_number + 1);
      }
    }

    return row;
  }

  public update(id: number, barcode: Record<string, any>): QueryResult {
    const validated = BarcodeUpdateSchema.parse({ ...barcode, id });
    const idx = this.items.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.items[idx] = {
        ...this.items[idx],
        ...barcode,
        updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
    }
    return QueryBuilder.update(this.tableName, validated, { id });
  }

  public delete(id: number): QueryResult {
    this.items = this.items.filter((b) => b.id !== id);
    return QueryBuilder.delete(this.tableName, { id });
  }

  public peekNextSequenceValue(prefix = 'MZ-'): number {
    return this.sequenceMap.get(prefix) || 1;
  }

  public getNextSequenceValue(prefix = 'MZ-'): number {
    const nextVal = this.peekNextSequenceValue(prefix);
    this.sequenceMap.set(prefix, nextVal + 1);
    return nextVal;
  }
}

export const barcodeRepository = new BarcodeRepository();
