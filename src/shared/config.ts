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
    defaultPrinter: 'Default',
    printMode: 'DIALOG',
    silentPrinting: false,
    rememberLastPrinter: true,
    paperWidthMm: 50,
    paperHeightMm: 25,
    dpi: 203,
    copies: 1,
    orientation: 'PORTRAIT',
    paperSize: 'CUSTOM',
    margins: { top: 2, right: 2, bottom: 2, left: 2 },
    printBackground: true,
  },
  security: {
    sessionTimeoutMinutes: 30,
    auditLogging: true,
  },
};

