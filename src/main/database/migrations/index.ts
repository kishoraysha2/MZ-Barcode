import { migration0001 } from './0001_initial';
import { migration0002 } from './0002_users';
import { migration0003 } from './0003_barcodes';
import { migration0004 } from './0004_templates_printers';
import { migration0005 } from './0005_audit_license_backup';
import { migration0006 } from './0006_sprint5_tables';
import { migration0007 } from './0007_label_templates';
import { migration0008 } from './0008_fix_print_jobs_schema';

export interface Migration {
  version: number;
  name: string;
  up: string | ((db: any) => void);
  down: string | ((db: any) => void);
}

export const ALL_MIGRATIONS: Migration[] = [
  migration0001,
  migration0002,
  migration0003,
  migration0004,
  migration0005,
  migration0006,
  migration0007,
  migration0008,
];


