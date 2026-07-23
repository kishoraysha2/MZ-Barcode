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

  public findActiveLicense(): LicenseInfoRow | undefined {
    return QueryBuilder.selectOne<LicenseInfoRow>(this.tableName, { status: 'valid' });
  }

  public saveLicense(license: Record<string, any>): QueryResult {
    const validated = LicenseDbInsertSchema.parse(license);
    const existing = QueryBuilder.selectOne<LicenseInfoRow>(this.tableName, { license_key: validated.license_key });
    if (existing) {
      return QueryBuilder.update(this.tableName, validated, { id: existing.id });
    }
    return QueryBuilder.insert(this.tableName, validated);
  }
}

export const licenseRepository = new LicenseRepository();
