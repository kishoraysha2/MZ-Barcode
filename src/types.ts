export type AppEdition = 'customer' | 'owner';

export type UserRole = 'OWNER' | 'ADMIN' | 'USER' | 'OPERATOR' | 'VIEWER';

export type BarcodeType = 'CODE128' | 'QR' | 'EAN13' | 'DATAMATRIX' | 'PDF417';

export interface UserAccount {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface BarcodeRecord {
  id: number;
  barcodeNumber: string;
  prefix: string;
  sequenceNumber: number;
  type: BarcodeType;
  title: string;
  category: string;
  createdBy: string;
  createdAt: string;
  printCount: number;
  status: 'active' | 'archived';
}

export interface LabelTemplate {
  id: number;
  name: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  isDefault: boolean;
  elementsCount: number;
  updatedAt: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user: string;
  role?: UserRole | string;
  action: string;
  category?: 'AUTHENTICATION' | 'BARCODE' | 'LICENSE' | 'SYSTEM' | 'BACKUP' | string;
  details: string;
  ipAddress?: string;
}

export interface LicenseStatus {
  isActivated: boolean;
  customerName: string;
  hwid: string;
  activationKey: string;
  issuedAt: string;
  expiresAt: string;
  daysRemaining: number;
  durationDays: number;
  maxUsers: number;
  status: 'valid' | 'expiring_soon' | 'expired' | 'tampered' | 'Not Configured' | string;
  lastClockCheck: string;
}

export interface SystemPrinter {
  id: string;
  name: string;
  isDefault: boolean;
  status: 'ready' | 'offline' | 'paper_out' | 'busy' | 'error' | 'printing' | string;
  paperType: string;
  dpi: number;
  port: string;
}
