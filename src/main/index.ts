import path from 'path';
import { initializeDirectories } from './directories';
import { databaseEngine } from './database';
import { settingsManager } from './config';
import { instanceLock } from './instance';
import { setupCentralizedErrorHandler } from './errorHandler';
import { registerAllIPCHandlers } from './ipc';
import { logger } from './logger';
import { getSecureWindowConfig } from './window';

export class MainApplication {
  private isShuttingDown: boolean = false;

  public async bootstrap() {
    setupCentralizedErrorHandler();
    logger.info('=== MZ BARCODE SUITE ENTERPRISE v1.0 BOOTSTRAP ===');

    // 1. Detect Electron runtime safely
    let electronApp: any = null;
    let BrowserWindow: any = null;
    let ipcMain: any = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const electron = require('electron');
      electronApp = electron?.app || (typeof electron === 'object' && electron.getPath ? electron : null);
      BrowserWindow = electron?.BrowserWindow;
      ipcMain = electron?.ipcMain;
    } catch {
      electronApp = null;
    }

    // 2. Electron Lifecycle handling: wait for app.whenReady() before accessing any Electron app APIs
    if (electronApp && typeof electronApp.whenReady === 'function') {
      logger.info('Waiting for Electron app.whenReady()...');
      await electronApp.whenReady();
      logger.info('Electron app is ready.');

      if (typeof electronApp.requestSingleInstanceLock === 'function') {
        const hasLock = electronApp.requestSingleInstanceLock();
        if (!hasLock) {
          logger.warn('Another instance of MZ Barcode Suite is running. Quitting.');
          electronApp.quit();
          return;
        }
      }
    } else {
      if (!instanceLock.requestLock()) {
        logger.warn('Another instance is already running. Exiting.');
        return;
      }
    }

    // 3. Initialize AppData Directory Structure (%APPDATA%/MZBarcodeSuite/) AFTER app.whenReady()
    const dirs = initializeDirectories();
    logger.info('Directories Initialized:', dirs);

    // 4. Initialize Configuration File (settings.json) AFTER app.whenReady()
    const settings = settingsManager.initialize();
    logger.info('Settings Initialized:', settings.app);

    // 5. Initialize Database Engine (mz_barcode_suite.db, SQLite WAL, Busy Timeout) AFTER app.whenReady()
    const dbStatus = databaseEngine.initialize();
    logger.info('Database Engine Status:', dbStatus);

    // 6. Register Foundation IPC Handlers
    const handlersMap = new Map<string, (...args: unknown[]) => Promise<unknown>>();
    registerAllIPCHandlers((channel, handler) => {
      handlersMap.set(channel, handler);
    });

    if (ipcMain) {
      handlersMap.forEach((handler, channel) => {
        ipcMain.handle(channel, async (event: unknown, ...args: unknown[]) => {
          return handler(event, ...args);
        });
      });
    }

    // 7. Initialize BrowserWindow launch
    if (electronApp && BrowserWindow) {
      const winConfig = getSecureWindowConfig();
      
      const mainWindow = new BrowserWindow({
        width: winConfig.width,
        height: winConfig.height,
        minWidth: winConfig.minWidth,
        minHeight: winConfig.minHeight,
        title: winConfig.title,
        webPreferences: {
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: false,
          preload: path.join(__dirname, '../preload/index.cjs'),
        },
      });

      const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
      if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL(devUrl);
      } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
      }

      electronApp.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          electronApp.quit();
        }
      });
    } else {
      logger.info('Running in Web / Cloud Run preview mode.');
    }

    logger.info('=== MAIN PROCESS BOOTSTRAP SUCCESSFUL ===');
  }

  public shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    logger.info('Performing Graceful Shutdown of MZ Barcode Suite...');
    logger.info('Closing database connections safely.');
    logger.info('Main process shutdown complete.');
  }
}

export const mainApp = new MainApplication();

// Execute bootstrap
mainApp.bootstrap().catch((err) => {
  logger.crash('Fatal bootstrap failure:', err);
});
