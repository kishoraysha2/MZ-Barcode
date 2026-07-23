import { barcodeRepository, BarcodeRow } from './BarcodeRepository';
import { printerRepository } from './PrinterRepository';
import { licenseRepository } from './LicenseRepository';
import { userRepository } from './UserRepository';

export interface DashboardOverviewData {
  totalBarcodes: number;
  totalPrints: number;
  nextSequence: string;
  activePrinter: string;
  licenseStatus: string;
  licenseDaysRemaining: number;
  hwid: string;
  databaseHealth: string;
  databaseSizeKb: number;
}

export interface DashboardStatisticsData {
  totalBarcodes: number;
  totalPrints: number;
  activeUsersCount: number;
  totalTemplatesCount: number;
  databaseSizeKb: number;
}

export class DashboardRepository {
  public getOverview(): DashboardOverviewData {
    const totalBarcodes = barcodeRepository.count();
    const totalPrints = barcodeRepository.getTotalPrintCount();
    const nextSeqNum = barcodeRepository.peekNextSequenceValue('MZ-');
    const nextSequence = `MZ-${String(nextSeqNum).padStart(8, '0')}`;

    const defaultPrinter = printerRepository.getDefaultPrinter();
    const activePrinter = defaultPrinter ? defaultPrinter.name : 'Not Configured';

    const license = licenseRepository.findActiveLicense();
    const licenseStatus = license ? license.status : 'Not Configured';
    const licenseDaysRemaining = license ? licenseRepository.calculateDaysRemaining(license.expires_at) : 0;
    const hwid = license ? license.hwid : 'Not Configured';

    return {
      totalBarcodes,
      totalPrints,
      nextSequence,
      activePrinter,
      licenseStatus,
      licenseDaysRemaining,
      hwid,
      databaseHealth: 'SQLite WAL Mode Engine Online',
      databaseSizeKb: 34,
    };
  }

  public getStatistics(): DashboardStatisticsData {
    const totalBarcodes = barcodeRepository.count();
    const totalPrints = barcodeRepository.getTotalPrintCount();
    const activeUsersCount = userRepository.findAll().filter((u) => u.is_active === 1).length;

    return {
      totalBarcodes,
      totalPrints,
      activeUsersCount,
      totalTemplatesCount: 0,
      databaseSizeKb: 34,
    };
  }

  public getRecentBarcodes(limit = 10): BarcodeRow[] {
    return barcodeRepository.findRecent(limit);
  }
}

export const dashboardRepository = new DashboardRepository();
