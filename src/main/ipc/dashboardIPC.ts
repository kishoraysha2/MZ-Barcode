import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { dashboardRepository } from '../database/repositories/DashboardRepository';
import { logger } from '../logger';

export function registerDashboardIPC(
  registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void
) {
  logger.info('Registering Dashboard IPC Channels...');

  registerHandler(IPC_CHANNELS.DASHBOARD_GET_OVERVIEW, async () => {
    try {
      const overview = await dashboardRepository.getOverview();
      return { success: true, data: overview, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error DASHBOARD_GET_OVERVIEW:', err);
      return { success: false, error: { code: 'DASHBOARD_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.DASHBOARD_GET_STATISTICS, async () => {
    try {
      const stats = dashboardRepository.getStatistics();
      return { success: true, data: stats, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error DASHBOARD_GET_STATISTICS:', err);
      return { success: false, error: { code: 'DASHBOARD_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });

  registerHandler(IPC_CHANNELS.DASHBOARD_GET_RECENT_BARCODES, async (_, limitPayload?: unknown) => {
    try {
      const limit = typeof limitPayload === 'number' ? limitPayload : 10;
      const barcodes = dashboardRepository.getRecentBarcodes(limit);
      return { success: true, data: barcodes, timestamp: new Date().toISOString() };
    } catch (err) {
      logger.error('IPC Error DASHBOARD_GET_RECENT_BARCODES:', err);
      return { success: false, error: { code: 'DASHBOARD_ERROR', message: (err as Error).message }, timestamp: new Date().toISOString() };
    }
  });
}
