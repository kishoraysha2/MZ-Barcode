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

  public findByBarcodeValue(barcodeValue: string): BarcodeRow | undefined {
    return QueryBuilder.selectOne<BarcodeRow>(this.tableName, { barcode_value: barcodeValue });
  }

  public create(barcode: Record<string, any>): QueryResult {
    const validated = BarcodeInsertSchema.parse(barcode);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public update(id: number, barcode: Record<string, any>): QueryResult {
    const validated = BarcodeUpdateSchema.parse({ ...barcode, id });
    return QueryBuilder.update(this.tableName, validated, { id });
  }

  public getNextSequenceValue(prefix: string): number {
    const existing = QueryBuilder.selectOne<{ current_value: number }>('barcode_sequences', { prefix });
    if (existing) {
      const nextVal = existing.current_value + 1;
      QueryBuilder.update('barcode_sequences', { current_value: nextVal, updated_at: new Date().toISOString() }, { prefix });
      return nextVal;
    }

    QueryBuilder.insert('barcode_sequences', { prefix, current_value: 1, increment_by: 1 });
    return 1;
  }
}

export const barcodeRepository = new BarcodeRepository();
