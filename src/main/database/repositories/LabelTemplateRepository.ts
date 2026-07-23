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

export class LabelTemplateRepository extends BaseRepository<LabelTemplateRow> {
  protected tableName = 'label_templates';

  public findByName(name: string): LabelTemplateRow | undefined {
    return QueryBuilder.selectOne<LabelTemplateRow>(this.tableName, { name });
  }

  public createTemplate(template: Record<string, unknown>): QueryResult {
    const validated = TemplateInsertSchema.parse(template);
    return QueryBuilder.insert(this.tableName, validated);
  }

  public updateTemplate(id: number, template: Record<string, unknown>): QueryResult {
    const validated = TemplateUpdateSchema.parse({ ...template, id });
    return QueryBuilder.update(this.tableName, validated, { id });
  }

  public getAllActive(): LabelTemplateRow[] {
    return QueryBuilder.select<LabelTemplateRow>(this.tableName, ['*'], { is_active: 1 });
  }
}

export const labelTemplateRepository = new LabelTemplateRepository();
