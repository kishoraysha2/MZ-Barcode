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
    printMode: z.enum(['DIALOG', 'SILENT']).optional().default('DIALOG'),
    silentPrinting: z.boolean().optional().default(false),
    rememberLastPrinter: z.boolean().optional().default(true),
    paperWidthMm: z.number().positive(),
    paperHeightMm: z.number().positive(),
    dpi: z.number().positive(),
    copies: z.number().optional().default(1),
    orientation: z.enum(['PORTRAIT', 'LANDSCAPE']).optional().default('PORTRAIT'),
    paperSize: z.string().optional().default('CUSTOM'),
    margins: z.object({
      top: z.number(),
      right: z.number(),
      bottom: z.number(),
      left: z.number(),
    }).optional().default({ top: 2, right: 2, bottom: 2, left: 2 }),
    printBackground: z.boolean().optional().default(true),
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
