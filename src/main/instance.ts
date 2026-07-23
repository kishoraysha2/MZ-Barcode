import { logger } from './logger';

export class InstanceLockManager {
  private primaryInstance: boolean = true;

  public requestLock(): boolean {
    logger.info('Checking Single Instance Lock for MZ Barcode Suite Enterprise...');
    // Simulated Electron app.requestSingleInstanceLock()
    this.primaryInstance = true;
    return this.primaryInstance;
  }

  public isPrimary(): boolean {
    return this.primaryInstance;
  }
}

export const instanceLock = new InstanceLockManager();
