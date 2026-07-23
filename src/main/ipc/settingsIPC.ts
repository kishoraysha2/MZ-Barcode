import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { settingsManager } from '../config';
import { settingsRepository } from '../database/repositories/SettingsRepository';
import { auditRepository } from '../database/repositories/AuditRepository';
import { IPCResponse, SystemSettings } from '../../shared/types';
import { logger } from '../logger';

export function registerSettingsIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.SETTINGS_GET, async (): Promise<IPCResponse<SystemSettings>> => {
    logger.info('IPC Call: SETTINGS_GET');
    const settings = settingsRepository.getSettings() || settingsManager.getSettings();
    return {
      success: true,
      data: settings,
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.SETTINGS_SAVE, async (_evt: unknown, newSettings?: unknown): Promise<IPCResponse<SystemSettings>> => {
    logger.info('IPC Call: SETTINGS_SAVE');
    const updated = settingsRepository.saveSettings((newSettings as Partial<SystemSettings>) || {});
    settingsManager.save(updated);
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

  registerHandler(IPC_CHANNELS.AUDIT_LOGS_GET, async (): Promise<IPCResponse<any[]>> => {
    logger.info('IPC Call: AUDIT_LOGS_GET');
    const logs = auditRepository.findAll();
    return {
      success: true,
      data: logs.map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        user: l.username,
        role: l.role,
        action: l.action,
        category: l.category,
        details: l.details,
      })),
      timestamp: new Date().toISOString(),
    };
  });
}
