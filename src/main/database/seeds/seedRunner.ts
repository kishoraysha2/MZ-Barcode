import { runDevelopmentSeeds } from './devSeeds';
import { runProductionSeeds } from './prodSeed';
import { logger } from '../../logger';

export function runSeeds(environment: 'development' | 'production' = 'development'): void {
  logger.info(`[Seed Runner] Environment mode: ${environment}`);
  if (environment === 'production') {
    runProductionSeeds();
  } else {
    runDevelopmentSeeds();
  }
}
