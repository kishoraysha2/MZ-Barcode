import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { logger } from '../logger';

export function registerLicenseIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.LICENSE_CHECK, async (): Promise<IPCResponse<{ active: boolean; type: string }>> => {
    logger.info('IPC Call: LICENSE_CHECK (Foundation Empty Handler)');
    return {
      success: true,
      data: { active: true, type: 'ENTERPRISE_FOUNDATION_UNLOCKED' },
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.LICENSE_ACTIVATE, async (): Promise<IPCResponse<{ success: boolean }>> => {
    logger.info('IPC Call: LICENSE_ACTIVATE (Foundation Empty Handler)');
    return {
      success: true,
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  });
}
