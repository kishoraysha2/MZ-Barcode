import { QueryBuilder } from '../queryBuilder';
import { logger } from '../../logger';

export function runProductionSeeds(): void {
  logger.info('[Seed Runner] Running Production Clean Seed Initializer...');

  const roles = [
    { name: 'OWNER', description: 'System Owner & Software Issuer' },
    { name: 'ADMIN', description: 'Enterprise Administrator' },
    { name: 'USER', description: 'Standard Operator User' },
    { name: 'VIEWER', description: 'Read-only Inspector' },
  ];

  for (const role of roles) {
    const existing = QueryBuilder.selectOne('roles', { name: role.name });
    if (!existing) {
      QueryBuilder.insert('roles', role);
      logger.info(`[Production Seed] Initialized Mandatory Role: ${role.name}`);
    }
  }

  logger.info('[Seed Runner] Production Clean Seed Complete.');
}
