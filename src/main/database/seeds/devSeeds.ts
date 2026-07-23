import { QueryBuilder } from '../queryBuilder';
import { logger } from '../../logger';

export function runDevelopmentSeeds(): void {
  logger.info('[Seed Runner] Executing Development Seed Datasets...');

  // 1. Roles Seed
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
      logger.info(`[Seed] Seeded Role: ${role.name}`);
    }
  }

  // 2. Default Admin User Seed
  const adminRole = QueryBuilder.selectOne<{ id: number }>('roles', { name: 'ADMIN' });
  if (adminRole) {
    const existingAdmin = QueryBuilder.selectOne('users', { username: 'admin' });
    if (!existingAdmin) {
      QueryBuilder.insert('users', {
        username: 'admin',
        password_hash: '$argon2id$v=19$m=65536,t=3,p=4$mz_enterprise_admin_hash_stub',
        full_name: 'Enterprise Admin',
        role_id: adminRole.id,
        email: 'admin@mzbarcodesuite.com',
        created_by: 'SYSTEM_SEED',
      });
      logger.info('[Seed] Seeded Default Admin User: admin');
    }
  }

  // 3. Default Label Templates Seed
  const templates = [
    {
      name: 'Standard Shipping 100x50mm',
      width_mm: 100,
      height_mm: 50,
      dpi: 203,
      is_default: 1,
      layout_json: JSON.stringify({ barcodeType: 'CODE128', showText: true }),
    },
    {
      name: 'Asset Tag QR 50x25mm',
      width_mm: 50,
      height_mm: 25,
      dpi: 203,
      is_default: 0,
      layout_json: JSON.stringify({ barcodeType: 'QR', showText: true }),
    },
  ];

  for (const tpl of templates) {
    const existingTpl = QueryBuilder.selectOne('label_templates', { name: tpl.name });
    if (!existingTpl) {
      QueryBuilder.insert('label_templates', tpl);
      logger.info(`[Seed] Seeded Label Template: ${tpl.name}`);
    }
  }

  logger.info('[Seed Runner] Development Seed Complete.');
}
