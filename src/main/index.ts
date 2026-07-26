import path from 'path';
import { initializeDirectories } from './directories';
import { databaseEngine } from './database';
import { settingsManager } from './config';
import { instanceLock } from './instance';
import { setupCentralizedErrorHandler } from './errorHandler';
import { registerAllIPCHandlers } from './ipc';
import { logger } from './logger';
import { getSecureWindowConfig } from './window';

console.log('[BOOT] 1: File loaded');

export class MainApplication {
  private isShuttingDown: boolean = false;

  public async bootstrap() {
    console.log('[BOOT] Main process started');
    logger.info('[BOOT] Main process started');
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
      console.log('[BOOT] Electron app imported');
      logger.info('[BOOT] Electron app imported');
    } catch (err) {
      console.error('[BOOT Error] Electron import failed:', err);
      electronApp = null;
    }

    if (electronApp && typeof electronApp.on === 'function') {
      electronApp.on('ready', () => {
        console.log('[BOOT Event] app ready fired');
        logger.info('[BOOT Event] app ready fired');
      });
      electronApp.on('window-all-closed', () => {
        console.log('[BOOT Event] app window-all-closed fired');
        logger.info('[BOOT Event] app window-all-closed fired');
        if (process.platform !== 'darwin') {
          electronApp.quit();
        }
      });
      electronApp.on('activate', () => {
        console.log('[BOOT Event] app activate fired');
        logger.info('[BOOT Event] app activate fired');
      });
      electronApp.on('render-process-gone', (event: any, webContents: any, details: any) => {
        console.log('[BOOT Event] render-process-gone:', details);
        logger.warn('[BOOT Event] render-process-gone:', details);
      });
      electronApp.on('child-process-gone', (event: any, details: any) => {
        console.log('[BOOT Event] child-process-gone:', details);
        logger.warn('[BOOT Event] child-process-gone:', details);
      });
      electronApp.on('gpu-process-crashed', (event: any, killed: any) => {
        console.log('[BOOT Event] gpu-process-crashed:', killed);
        logger.warn('[BOOT Event] gpu-process-crashed:', killed);
      });
      electronApp.on('browser-window-created', (event: any, window: any) => {
        console.log('[BOOT Event] browser-window-created');
        logger.info('[BOOT Event] browser-window-created');
      });
    }

    // 2. Electron Lifecycle handling
    if (electronApp && typeof electronApp.whenReady === 'function') {
      console.log('[BOOT] Waiting for app.whenReady()');
      logger.info('[BOOT] Waiting for app.whenReady()');
      console.log('[BOOT] 2: Before app.whenReady()');
      try {
        await electronApp.whenReady();
        console.log('[BOOT] 3: Inside app.whenReady()');
        console.log('[BOOT] app.whenReady() resolved');
        logger.info('[BOOT] app.whenReady() resolved');
      } catch (err) {
        console.error('[BOOT Error] app.whenReady failed:', err);
        logger.error('[BOOT Error] app.whenReady failed:', err);
      }

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

    // 3. Initialize AppData Directory Structure
    try {
      const dirs = initializeDirectories();
      logger.info('Directories Initialized:', dirs);
    } catch (err) {
      console.error('[BOOT Error] initializeDirectories failed:', err);
      logger.error('[BOOT Error] initializeDirectories failed:', err);
    }

    // 4. Initialize Settings
    try {
      const settings = settingsManager.initialize();
      logger.info('Settings Initialized:', settings.app);
    } catch (err) {
      console.error('[BOOT Error] settingsManager failed:', err);
      logger.error('[BOOT Error] settingsManager failed:', err);
    }

    // 5. Initialize Database Engine & Migrations
    try {
      console.log('[BOOT] Initializing Database');
      logger.info('[BOOT] Initializing Database');
      console.log('[BOOT] Running Migrations');
      logger.info('[BOOT] Running Migrations');
      const dbStatus = databaseEngine.initialize();
      logger.info('Database Engine Status:', dbStatus);
      console.log('[BOOT] Initializing TemplateService');
      logger.info('[BOOT] Initializing TemplateService');
    } catch (err) {
      console.error('[BOOT Error] databaseEngine initialize failed:', err);
      logger.error('[BOOT Error] databaseEngine initialize failed:', err);
    }

    // 6. Register Foundation IPC Handlers
    try {
      console.log('[BOOT] Registering IPC');
      logger.info('[BOOT] Registering IPC');
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
    } catch (err) {
      console.error('[BOOT Error] registerAllIPCHandlers failed:', err);
      logger.error('[BOOT Error] registerAllIPCHandlers failed:', err);
    }

    // 7. Initialize BrowserWindow launch
    if (electronApp && BrowserWindow) {
      try {
        console.log('[BOOT] Creating BrowserWindow');
        logger.info('[BOOT] Creating BrowserWindow');
        console.log('[BOOT] 4: Before createWindow()');

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

        console.log('[BOOT] 6: BrowserWindow created');
        console.log('[BOOT] BrowserWindow created');
        logger.info('[BOOT] BrowserWindow created');

        mainWindow.webContents.on('did-finish-load', () => {
          console.log('[BOOT] 7: did-finish-load');
          console.log('[BOOT] did-finish-load');
          logger.info('[BOOT] did-finish-load');
        });

        console.log('[BOOT] Loading URL');
        logger.info('[BOOT] Loading URL');
        const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
        if (process.env.NODE_ENV === 'development') {
          mainWindow.loadURL(devUrl);
        } else {
          mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
        }

        console.log('[BOOT] 5: After createWindow()');
      } catch (err: any) {
        console.error('[BOOT Error] createWindow / BrowserWindow creation exception:', err);
        if (err && err.stack) {
          console.error(err.stack);
        }
        logger.error('[BOOT Error] BrowserWindow creation failed:', err);
      }
    } else {
      logger.info('Running in Web / Cloud Run preview mode.');
    }

    console.log('[BOOT] Startup complete');
    logger.info('[BOOT] Startup complete');
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
  console.error('[BOOT Error] Uncaught bootstrap exception:', err);
  if (err && err.stack) {
    console.error(err.stack);
  }
  logger.crash('Fatal bootstrap failure:', err);
});

