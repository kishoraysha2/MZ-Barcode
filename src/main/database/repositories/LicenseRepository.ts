import { BaseRepository } from './BaseRepository';
import { QueryBuilder } from '../queryBuilder';
import { LicenseDbInsertSchema } from '../../../shared/databaseSchemas';
import { QueryResult } from '../connection';

export interface LicenseInfoRow {
  id: number;
  license_key: string;
  customer_name: string;
  hwid: string;
  status: string;
  issued_at: string;
  expires_at: string;
  max_users: number;
  features_json: string;
  updated_at: string;
}

export class LicenseRepository extends BaseRepository<LicenseInfoRow> {
  protected tableName = 'license_info';
  private activeLicenseRow: LicenseInfoRow | undefined;

  public findActiveLicense(): LicenseInfoRow | undefined {
    return this.activeLicenseRow || QueryBuilder.selectOne<LicenseInfoRow>(this.tableName, { status: 'valid' });
  }

  public saveLicense(license: Record<string, any>): QueryResult {
    const validated = LicenseDbInsertSchema.parse(license);
    const existing = QueryBuilder.selectOne<LicenseInfoRow>(this.tableName, { license_key: validated.license_key });

    const row: LicenseInfoRow = {
      id: existing ? existing.id : Date.now(),
      license_key: validated.license_key,
      customer_name: validated.customer_name,
      hwid: validated.hwid,
      status: validated.status || 'valid',
      issued_at: validated.issued_at || new Date().toISOString(),
      expires_at: validated.expires_at || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      max_users: validated.max_users || 1,
      features_json: validated.features_json || '{}',
      updated_at: new Date().toISOString(),
    };

    this.activeLicenseRow = row;

    if (existing) {
      return QueryBuilder.update(this.tableName, validated, { id: existing.id });
    }
    return QueryBuilder.insert(this.tableName, validated);
  }

  public calculateDaysRemaining(expiresAt: string): number {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }
}

export const licenseRepository = new LicenseRepository();
