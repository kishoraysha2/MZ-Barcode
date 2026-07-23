import { migration0001 } from './0001_initial';
import { migration0002 } from './0002_users';
import { migration0003 } from './0003_barcodes';
import { migration0004 } from './0004_templates_printers';
import { migration0005 } from './0005_audit_license_backup';

export interface Migration {
  version: number;
  name: string;
  up: string;
  down: string;
}

export const ALL_MIGRATIONS: Migration[] = [
  migration0001,
  migration0002,
  migration0003,
  migration0004,
  migration0005,
];
