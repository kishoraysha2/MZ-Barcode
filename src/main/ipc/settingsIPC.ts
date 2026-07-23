import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { settingsManager } from '../config';
import { IPCResponse, SystemSettings } from '../../shared/types';
import { logger } from '../logger';

export function registerSettingsIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.SETTINGS_GET, async (): Promise<IPCResponse<SystemSettings>> => {
    logger.info('IPC Call: SETTINGS_GET');
    return {
      success: true,
      data: settingsManager.getSettings(),
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SETTINGS_SAVE, async (_evt: unknown, newSettings?: unknown): Promise<IPCResponse<SystemSettings>> => {
    logger.info('IPC Call: SETTINGS_SAVE');
    const updated = settingsManager.save((newSettings as Partial<SystemSettings>) || {});
    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SETTINGS_RESET, async (): Promise<IPCResponse<SystemSettings>> => {
    logger.info('IPC Call: SETTINGS_RESET');
    const res = settingsManager.reset();
    return {
      success: true,
      data: res,
      timestamp: new Date().toISOString(),
    };
  });
}
