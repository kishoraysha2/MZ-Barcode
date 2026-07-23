import { z } from 'zod';

// Common Entity Metadata Schemas
export const CommonEntitySchema = z.object({
  id: z.number().int().positive().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().default('SYSTEM'),
  updated_by: z.string().default('SYSTEM'),
  is_active: z.number().int().min(0).max(1).default(1),
});

// User Schema Validation
export const UserInsertSchema = CommonEntitySchema.extend({
  username: z.string().min(3).max(50),
  password_hash: z.string().min(8),
  full_name: z.string().min(2).max(100),
  role_id: z.number().int().positive(),
  email: z.string().email().optional().nullable(),
});

export const UserUpdateSchema = UserInsertSchema.partial().extend({
  id: z.number().int().positive(),
});

export const UserSearchSchema = z.object({
  username: z.string().optional(),
  role_id: z.number().int().optional(),
  is_active: z.number().int().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Barcode Schema Validation
export const BarcodeInsertSchema = CommonEntitySchema.extend({
  barcode_value: z.string().min(1),
  prefix: z.string().default(''),
  sequence_number: z.number().int().default(0),
  barcode_type: z.enum(['CODE128', 'EAN13', 'EAN8', 'UPCA', 'QR', 'DATAMATRIX', 'PDF417']),
  title: z.string().min(1),
  category: z.string().default('GENERAL'),
  status: z.enum(['active', 'archived']).default('active'),
  print_count: z.number().int().nonnegative().default(0),
});

export const BarcodeUpdateSchema = BarcodeInsertSchema.partial().extend({
  id: z.number().int().positive(),
});

export const BarcodeSearchSchema = z.object({
  barcode_value: z.string().optional(),
  barcode_type: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Template Schema Validation
export const TemplateInsertSchema = CommonEntitySchema.extend({
  name: z.string().min(2).max(100),
  width_mm: z.number().positive(),
  height_mm: z.number().positive(),
  dpi: z.number().int().positive().default(203),
  is_default: z.number().int().min(0).max(1).default(0),
  layout_json: z.string().default('{}'),
});

export const TemplateUpdateSchema = TemplateInsertSchema.partial().extend({
  id: z.number().int().positive(),
});

// Settings Schema Validation
export const SettingsDbInsertSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  category: z.string().default('GENERAL'),
  updated_at: z.string().optional(),
  updated_by: z.string().default('SYSTEM'),
});

// License Info Schema Validation
export const LicenseDbInsertSchema = z.object({
  license_key: z.string().min(10),
  customer_name: z.string().min(2),
  hwid: z.string().min(4),
  status: z.enum(['valid', 'expiring_soon', 'expired', 'tampered']),
  issued_at: z.string(),
  expires_at: z.string(),
  max_users: z.number().int().positive().default(1),
  features_json: z.string().default('{}'),
});

// Audit Log Schema Validation
export const AuditLogInsertSchema = z.object({
  timestamp: z.string().optional(),
  username: z.string().default('SYSTEM'),
  role: z.string().default('ADMIN'),
  action: z.string().min(1),
  category: z.enum(['AUTHENTICATION', 'BARCODE', 'LICENSE', 'SYSTEM', 'BACKUP']),
  details: z.string().default(''),
  ip_address: z.string().default('127.0.0.1'),
});

// Backup History Schema Validation
export const BackupHistoryInsertSchema = z.object({
  filename: z.string().min(1),
  filepath: z.string().min(1),
  size_bytes: z.number().int().nonnegative(),
  status: z.enum(['SUCCESS', 'FAILED', 'VERIFIED']),
  created_at: z.string().optional(),
  created_by: z.string().default('SYSTEM'),
});
