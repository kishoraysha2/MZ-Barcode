import { logger } from './logger';

export function setupCentralizedErrorHandler() {
  logger.info('Registering Centralized Error Handlers for Main Process...');

  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error: Error) => {
      logger.crash('Uncaught Exception trapped in Main Process:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      console.error('[CRITICAL] Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.crash('Unhandled Rejection trapped in Main Process:', { reason });
      console.error('[CRITICAL] Unhandled Rejection:', reason);
    });
  }
}
