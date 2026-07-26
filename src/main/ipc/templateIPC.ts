import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { templateService } from '../services/TemplateService';
import { logger } from '../logger';

function createResponse<T>(data?: T, errorMsg?: string) {
  const timestamp = new Date().toISOString();
  if (errorMsg) {
    return {
      success: false,
      error: { code: 'TEMPLATE_ERROR', message: errorMsg },
      timestamp,
    };
  }
  return {
    success: true,
    data,
    timestamp,
  };
}

export function registerTemplateIPC(
  registerHandler: (channel: string, handler: (event: unknown, ...args: unknown[]) => Promise<unknown>) => void
) {
  logger.info('Registering Template IPC Handlers...');

  // template:list
  registerHandler(IPC_CHANNELS.TEMPLATE_LIST, async () => {
    try {
      const templates = templateService.getAllTemplates();
      return createResponse(templates);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:get
  registerHandler(IPC_CHANNELS.TEMPLATE_GET, async (_event, ...args) => {
    try {
      const id = args[0] as string;
      const template = templateService.getTemplate(id);
      return createResponse(template);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:create
  registerHandler(IPC_CHANNELS.TEMPLATE_CREATE, async (_event, ...args) => {
    try {
      const payload = args[0] as any;
      const created = templateService.createTemplate(payload);
      return createResponse(created);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:update
  registerHandler(IPC_CHANNELS.TEMPLATE_UPDATE, async (_event, ...args) => {
    logger.info('[TRACE 3] IPC "template:update" received in main process with payload:', args[0]);
    try {
      const payload = args[0] as any;
      const updated = templateService.updateTemplate(payload);
      logger.info('[TRACE 3.1] templateService.updateTemplate completed successfully, returning data');
      return createResponse(updated);
    } catch (err) {
      logger.error('[TRACE 3.2] templateService.updateTemplate threw error:', (err as Error).message);
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:delete
  registerHandler(IPC_CHANNELS.TEMPLATE_DELETE, async (_event, ...args) => {
    try {
      const id = args[0] as string;
      const deleted = templateService.deleteTemplate(id);
      return createResponse(deleted);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:duplicate
  registerHandler(IPC_CHANNELS.TEMPLATE_DUPLICATE, async (_event, ...args) => {
    try {
      const payload = (args[0] || {}) as { id: string; newName?: string };
      const duplicated = templateService.duplicateTemplate(payload.id, payload.newName);
      return createResponse(duplicated);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:export
  registerHandler(IPC_CHANNELS.TEMPLATE_EXPORT, async (_event, ...args) => {
    try {
      const id = args[0] as string;
      const jsonStr = templateService.exportTemplate(id);
      return createResponse(jsonStr);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });

  // template:import
  registerHandler(IPC_CHANNELS.TEMPLATE_IMPORT, async (_event, ...args) => {
    try {
      const jsonContent = args[0] as string;
      const imported = templateService.importTemplate(jsonContent);
      return createResponse(imported);
    } catch (err) {
      return createResponse(undefined, (err as Error).message);
    }
  });
}
