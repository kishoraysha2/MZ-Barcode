import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { TemplateInsertSchema, TemplateUpdateSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface LabelTemplateRow {
  id: number;
  name: string;
  width_mm: number;
  height_mm: number;
  dpi: number;
  is_default: number;
  layout_json: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

export class TemplateRepository extends BaseRepository<LabelTemplateRow> {
  protected tableName = 'label_templates';

  public findByName(name: string): LabelTemplateRow | undefined {
    return QueryBuilder.selectOne<LabelTemplateRow>(this.tableName, { name });
  }

  public create(template: Record<string, any>): QueryResult {
    const validated = TemplateInsertSchema.parse(template);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public update(id: number, template: Record<string, any>): QueryResult {
    const validated = TemplateUpdateSchema.parse({ ...template, id });
    return QueryBuilder.update(this.tableName, validated, { id });
  }

  public createPrintJob(job: { printerName: string; templateId?: number; barcodeId?: number; copies?: number }): QueryResult {
    return QueryBuilder.insert('print_jobs', {
      printer_name: job.printerName,
      template_id: job.templateId || null,
      barcode_id: job.barcodeId || null,
      copies: job.copies || 1,
      status: 'PENDING',
    });
  }
}

export const templateRepository = new TemplateRepository();
