import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { QueryResult } from '../connection';

export interface PrinterProfileRow {
  id: number;
  name: string;
  driver_type: 'WINDOWS' | 'ZEBRA_ZPL' | 'TSPL' | string;
  is_default: number;
  dpi: number;
  paper_type: string;
  port: string;
  config_json: string;
  created_at: string;
  updated_at: string;
}

export class PrinterProfileRepository extends BaseRepository<PrinterProfileRow> {
  protected tableName = 'printer_profiles';

  public getAllProfiles(): PrinterProfileRow[] {
    const profiles = QueryBuilder.select<PrinterProfileRow>(this.tableName, ['*']);
    if (profiles.length === 0) {
      // Seed default profiles if table is empty
      this.seedDefaultProfiles();
      return QueryBuilder.select<PrinterProfileRow>(this.tableName, ['*']);
    }
    return profiles;
  }

  public getDefaultProfile(): PrinterProfileRow | undefined {
    const profiles = this.getAllProfiles();
    return profiles.find((p) => p.is_default === 1) || profiles[0];
  }

  public createProfile(profile: Partial<PrinterProfileRow> & { name: string }): QueryResult {
    return QueryBuilder.insert(this.tableName, {
      name: profile.name,
      driver_type: profile.driver_type || 'WINDOWS',
      is_default: profile.is_default ? 1 : 0,
      dpi: profile.dpi || 203,
      paper_type: profile.paper_type || 'Continuous',
      port: profile.port || 'USB001',
      config_json: profile.config_json || '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  private seedDefaultProfiles() {
    const defaults = [
      {
        name: 'Canon G3010 series',
        driver_type: 'WINDOWS',
        is_default: 1,
        dpi: 203,
        paper_type: 'Continuous 50mm x 25mm',
        port: 'USB001',
        config_json: JSON.stringify({ darkness: 15, printSpeed: 4 }),
      },
      {
        name: 'Microsoft Print to PDF',
        driver_type: 'WINDOWS',
        is_default: 0,
        dpi: 300,
        paper_type: 'A4',
        port: 'PORTPROMPT:',
        config_json: JSON.stringify({ density: 10, speed: 3 }),
      },
      {
        name: 'Generic Windows Spool Printer Driver',
        driver_type: 'WINDOWS',
        is_default: 0,
        dpi: 203,
        paper_type: 'Standard Thermal Paper',
        port: 'LPT1',
        config_json: JSON.stringify({ spoolMode: 'RAW' }),
      },
    ];

    for (const d of defaults) {
      try {
        QueryBuilder.insert(this.tableName, d);
      } catch (err) {
        // Ignore duplicate insert on seed
      }
    }
  }
}

export const printerProfileRepository = new PrinterProfileRepository();
