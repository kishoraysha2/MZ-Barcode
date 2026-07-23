import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { QueryResult } from '../connection';

export interface PrintJobRow {
  id: number;
  printer_name: string;
  template_id?: number | null;
  barcode_id?: number | null;
  copies: number;
  status: string;
  zpl_output?: string | null;
  tspl_output?: string | null;
  job_metadata_json?: string | null;
  created_at?: string;
  completed_at?: string | null;
}

export class PrintRepository extends BaseRepository<PrintJobRow> {
  protected tableName = 'print_jobs';

  public createJob(job: {
    printerName: string;
    templateId?: number;
    barcodeId?: number;
    copies?: number;
    zplOutput?: string;
    tsplOutput?: string;
    metadata?: Record<string, unknown>;
  }): QueryResult {
    return QueryBuilder.insert(this.tableName, {
      printer_name: job.printerName,
      template_id: job.templateId || null,
      barcode_id: job.barcodeId || null,
      copies: job.copies || 1,
      status: 'PENDING',
      zpl_output: job.zplOutput || null,
      tspl_output: job.tsplOutput || null,
      job_metadata_json: job.metadata ? JSON.stringify(job.metadata) : '{}',
      created_at: new Date().toISOString(),
    });
  }

  public markCompleted(id: number): QueryResult {
    return QueryBuilder.update(
      this.tableName,
      { status: 'COMPLETED', completed_at: new Date().toISOString() },
      { id }
    );
  }

  public getPendingJobs(): PrintJobRow[] {
    return QueryBuilder.select<PrintJobRow>(this.tableName, ['*'], { status: 'PENDING' });
  }

  public getRecentJobs(limit: number = 20): PrintJobRow[] {
    return QueryBuilder.select<PrintJobRow>(this.tableName, ['*'], {}, { limit });
  }
}

export const printRepository = new PrintRepository();
