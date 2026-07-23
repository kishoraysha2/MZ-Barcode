import { dbConnection } from './connection';
import { logger } from '../logger';

export class TransactionManager {
  private inTransaction: boolean = false;
  private savepointCount: number = 0;

  public async runInTransaction<T>(operation: () => Promise<T> | T): Promise<T> {
    if (this.inTransaction) {
      // Handle nested transaction using savepoint
      this.savepointCount++;
      const savepointName = `sp_${this.savepointCount}`;
      logger.info(`[Transaction] Creating Savepoint: ${savepointName}`);
      dbConnection.exec(`SAVEPOINT ${savepointName};`);

      try {
        const result = await operation();
        dbConnection.exec(`RELEASE SAVEPOINT ${savepointName};`);
        logger.info(`[Transaction] Released Savepoint: ${savepointName}`);
        return result;
      } catch (err) {
        dbConnection.exec(`ROLLBACK TO SAVEPOINT ${savepointName};`);
        logger.error(`[Transaction] Rolled back to Savepoint: ${savepointName}`, err);
        throw err;
      } finally {
        this.savepointCount--;
      }
    }

    // Outer primary transaction
    this.inTransaction = true;
    logger.info('[Transaction] BEGIN EXCLUSIVE TRANSACTION');

    try {
      const result = await operation();
      logger.info('[Transaction] COMMIT TRANSACTION');
      return result;
    } catch (err) {
      logger.error('[Transaction] ROLLBACK PRIMARY TRANSACTION:', err);
      throw err;
    } finally {
      this.inTransaction = false;
    }
  }

  public isTransactionActive(): boolean {
    return this.inTransaction;
  }
}

export const transactionManager = new TransactionManager();
