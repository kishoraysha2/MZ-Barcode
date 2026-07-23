import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { databaseEngine } from '../database';
import { IPCResponse } from '../../shared/types';
import { logger } from '../logger';

export function registerDatabaseIPC(registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void) {
  registerHandler(IPC_CHANNELS.DATABASE_INIT, async (): Promise<IPCResponse<{ path: string; status: string }>> => {
    logger.info('IPC Call: DATABASE_INIT');
    const res = databaseEngine.initialize();
    return {
      success: true,
      data: { path: res.path, status: 'Engine Initialized (WAL Mode)' },
      timestamp: new Date().toISOString(),
    };
  });

  registerHandler(IPC_CHANNELS.DATABASE_STATUS, async (): Promise<IPCResponse<{ initialized: boolean; wal: boolean }>> => {
    logger.info('IPC Call: DATABASE_STATUS');
    const status = databaseEngine.getStatus();
    return {
      success: true,
      data: { initialized: status.initialized, wal: status.wal },
      timestamp: new Date().toISOString(),
    };
  });
}
