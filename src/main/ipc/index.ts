import { registerDatabaseIPC } from './databaseIPC';
import { registerDashboardIPC } from './dashboardIPC';
import { registerSettingsIPC } from './settingsIPC';
import { registerBackupIPC } from './backupIPC';
import { registerLicenseIPC } from './licenseIPC';
import { registerPrinterIPC } from './printerIPC';
import { registerBarcodeIPC } from './barcodeIPC';
import { registerAuthIPC } from './authIPC';
import { registerTemplateIPC } from './templateIPC';
import { logger } from '../logger';

export function registerAllIPCHandlers(
  registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void
) {
  logger.info('Registering all Foundation IPC Channels...');
  registerDatabaseIPC(registerHandler);
  registerDashboardIPC(registerHandler);
  registerSettingsIPC(registerHandler);
  registerBackupIPC(registerHandler);
  registerLicenseIPC(registerHandler);
  registerPrinterIPC(registerHandler);
  registerBarcodeIPC(registerHandler);
  registerAuthIPC(registerHandler);
  registerTemplateIPC(registerHandler);
  logger.info('IPC Channel Registration Complete.');
}
