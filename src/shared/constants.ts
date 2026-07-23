/**
 * System Constants for MZ Barcode Suite Enterprise v1.0
 */
export const APP_METADATA = {
  NAME: 'MZ Barcode Suite Enterprise',
  SHORT_NAME: 'MZBarcodeSuite',
  VERSION: '1.0.0',
  BUILD: '1001',
  ORGANIZATION: 'MZ Enterprise Software',
  APP_ID: 'com.mz.barcodesuite.enterprise',
};

export const DIRECTORY_NAMES = {
  DATA: 'data',
  BACKUP: 'backup',
  LOGS: 'logs',
  LICENSE: 'license',
  CONFIG: 'config',
  CACHE: 'cache',
  TEMP: 'temp',
} as const;

export const DEFAULT_DB_FILENAME = 'mz_barcode_suite.db';
export const DEFAULT_SETTINGS_FILENAME = 'settings.json';

export const SQLITE_CONFIG = {
  WAL_MODE: true,
  FOREIGN_KEYS: true,
  BUSY_TIMEOUT: 5000,
};
