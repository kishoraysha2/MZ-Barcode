import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { IPCResponse } from '../../shared/types';
import { logger } from '../logger';

export function registerBackupIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.BACKUP_CREATE, async (): Promise<IPCResponse<{ file: string }>> => {
    logger.info('IPC Call: BACKUP_CREATE (Foundation Empty Handler)');
    return {
      success: true,
      data: { file: 'mz_backup_foundation_stub.bak' },
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.BACKUP_LIST, async (): Promise<IPCResponse<string[]>> => {
    logger.info('IPC Call: BACKUP_LIST (Foundation Empty Handler)');
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.BACKUP_RESTORE, async (): Promise<IPCResponse<{ restored: boolean }>> => {
    logger.info('IPC Call: BACKUP_RESTORE (Foundation Empty Handler)');
    return {
      success: true,
      data: { restored: true },
      timestamp: new Date().toISOString(),
    };
  });
}
