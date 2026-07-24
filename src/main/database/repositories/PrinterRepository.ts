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
  driver_type?: string;
}

export class PrinterRepository extends BaseRepository<PrinterRow> {
  protected tableName = 'printers';
  private printers: PrinterRow[] = [];

  public syncPrinters(printers: Array<any>): void {
    this.printers = printers.map((p, idx) => ({
      id: String(p.id || `prn-${idx + 1}`),
      name: p.name,
      is_default: p.is_default ?? (p.isDefault ? 1 : 0),
      status: p.status || 'ready',
      paper_type: p.paper_type || p.paperType || 'Continuous Label',
      dpi: p.dpi || 203,
      port: p.port || 'USB',
      driver_type: p.driver_type || p.driverType || 'WINDOWS',
    }));
  }

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
