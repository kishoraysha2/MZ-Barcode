import { logger } from './logger';

export interface WindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  title: string;
  webPreferences: {
    contextIsolation: boolean;
    sandbox: boolean;
    nodeIntegration: boolean;
    webSecurity: boolean;
    allowRunningInsecureContent: boolean;
  };
}

export function getSecureWindowConfig(): WindowConfig {
  logger.info('Configuring Secure BrowserWindow with ContextIsolation & Sandbox...');
  return {
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MZ Barcode Suite Enterprise v1.0',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  };
}

export const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;";
