import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';

export interface PrinterRow {
  id: string;
  name: string;
  is_default: number;
  status: string;
  paper_type: string;
  dpi: number;
  port: string;
}

export class PrinterRepository extends BaseRepository<PrinterRow> {
  protected tableName = 'printers';
  private printers: PrinterRow[] = [];

  public getDefaultPrinter(): PrinterRow | null {
    return this.printers.find((p) => p.is_default === 1) || (this.printers.length > 0 ? this.printers[0] : null);
  }

  public getPrinters(): PrinterRow[] {
    return this.printers;
  }

  public getPrinterStatus(name: string): { online: boolean; status: string } {
    const target = this.printers.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!target) {
      return { online: false, status: 'Not Configured' };
    }
    return { online: target.status === 'ready', status: target.status };
  }

  public savePrinter(printer: Partial<PrinterRow> & { name: string }): PrinterRow {
    const existingIdx = this.printers.findIndex((p) => p.name === printer.name);
    const row: PrinterRow = {
      id: printer.id || `prn-${Date.now()}`,
      name: printer.name,
      is_default: printer.is_default ?? (this.printers.length === 0 ? 1 : 0),
      status: printer.status || 'ready',
      paper_type: printer.paper_type || '50mm x 25mm Continuous Label',
      dpi: printer.dpi || 203,
      port: printer.port || 'USB001',
    };

    if (printer.is_default === 1) {
      this.printers.forEach((p) => {
        p.is_default = 0;
      });
    }

    if (existingIdx !== -1) {
      this.printers[existingIdx] = row;
    } else {
      this.printers.push(row);
    }

    return row;
  }
}

export const printerRepository = new PrinterRepository();
