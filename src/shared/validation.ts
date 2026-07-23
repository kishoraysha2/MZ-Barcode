import { z } from 'zod';

export const SystemSettingsSchema = z.object({
  app: z.object({
    theme: z.enum(['dark', 'light', 'system']),
    autoUpdate: z.boolean(),
    language: z.string().min(2),
    edition: z.enum(['customer', 'owner']),
  }),
  database: z.object({
    path: z.string(),
    walMode: z.boolean(),
    autoBackupDaily: z.boolean(),
  }),
  printing: z.object({
    defaultPrinter: z.string(),
    paperWidthMm: z.number().positive(),
    paperHeightMm: z.number().positive(),
    dpi: z.number().positive(),
  }),
  security: z.object({
    sessionTimeoutMinutes: z.number().min(1).max(1440),
    auditLogging: z.boolean(),
  }),
});

export const BarcodeValidationSchema = z.object({
  type: z.enum(['CODE128', 'EAN13', 'EAN8', 'UPCA', 'QR', 'DATAMATRIX', 'PDF417']),
  data: z.string().min(1, 'Barcode data cannot be empty'),
});

export type ValidatedSystemSettings = z.infer<typeof SystemSettingsSchema>;
