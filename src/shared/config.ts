import { SystemSettings } from './types';

export const DEFAULT_SETTINGS: SystemSettings = {
  app: {
    theme: 'dark',
    autoUpdate: false,
    language: 'en-US',
    edition: 'customer',
  },
  database: {
    path: '%APPDATA%/MZBarcodeSuite/data/mz_barcode_suite.db',
    walMode: true,
    autoBackupDaily: true,
  },
  printing: {
    defaultPrinter: 'Zebra ZD421 (203 dpi)',
    paperWidthMm: 100,
    paperHeightMm: 50,
    dpi: 203,
  },
  security: {
    sessionTimeoutMinutes: 30,
    auditLogging: true,
  },
};
