import React, { useEffect, useState } from 'react';
import { DashboardView } from '../../views/DashboardView';
import { useApplicationStatusStore } from '../stores/applicationStatusStore';
import { electronBridge } from '../../preload/bridge';
import { BarcodeRecord, SystemPrinter, LicenseStatus } from '../../types';

export const DashboardPage: React.FC = () => {
  const setActiveView = useApplicationStatusStore((s) => s.setActiveView);

  const [barcodes, setBarcodes] = useState<BarcodeRecord[]>([]);
  const [printers, setPrinters] = useState<SystemPrinter[]>([]);
  const [license, setLicense] = useState<LicenseStatus>({
    isActivated: false,
    customerName: 'Not Configured',
    hwid: 'Not Configured',
    activationKey: '',
    issuedAt: '',
    expiresAt: '',
    daysRemaining: 0,
    durationDays: 0,
    maxUsers: 0,
    status: 'Not Configured',
    lastClockCheck: 'Not Configured',
  });
  const [overview, setOverview] = useState({
    totalBarcodes: 0,
    totalPrints: 0,
    nextSequence: 'MZ-00000001',
    activePrinter: 'Not Configured',
    licenseStatus: 'Not Configured',
    licenseDaysRemaining: 0,
    hwid: 'Not Configured',
    databaseHealth: 'SQLite WAL Mode Engine Online',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [ovRes, barRes, prnRes, licRes] = await Promise.all([
          electronBridge.getDashboardOverview(),
          electronBridge.getRecentBarcodes(10),
          electronBridge.getPrinters(),
          electronBridge.getLicenseStatus(),
        ]);

        if (!isMounted) return;

        if (ovRes.success && ovRes.data) {
          setOverview({
            totalBarcodes: ovRes.data.totalBarcodes,
            totalPrints: ovRes.data.totalPrints,
            nextSequence: ovRes.data.nextSequence,
            activePrinter: ovRes.data.activePrinter,
            licenseStatus: ovRes.data.licenseStatus,
            licenseDaysRemaining: ovRes.data.licenseDaysRemaining,
            hwid: ovRes.data.hwid,
            databaseHealth: ovRes.data.databaseHealth,
          });
        }

        if (barRes.success && Array.isArray(barRes.data)) {
          const mapped: BarcodeRecord[] = barRes.data.map((b: any) => ({
            id: b.id,
            barcodeNumber: b.barcode_value,
            prefix: b.prefix || 'MZ-',
            sequenceNumber: b.sequence_number || 1,
            type: b.barcode_type || 'CODE128',
            title: b.title,
            category: b.category || 'General',
            createdBy: b.created_by || 'Admin',
            createdAt: b.created_at,
            printCount: b.print_count || 1,
            status: b.status || 'active',
          }));
          setBarcodes(mapped);
        }

        if (prnRes.success && Array.isArray(prnRes.data)) {
          const mappedPrinters: SystemPrinter[] = prnRes.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            isDefault: Boolean(p.isDefault || p.is_default),
            status: (p.status || 'offline') as 'ready' | 'offline' | 'error' | 'printing',
            paperType: p.paperType || p.paper_type || 'Continuous Label',
            dpi: p.dpi || 203,
            port: p.port || 'USB',
          }));
          setPrinters(mappedPrinters);
        }

        if (licRes.success && licRes.data) {
          setLicense(licRes.data as LicenseStatus);
        }
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardView
      barcodes={barcodes}
      printers={printers}
      license={license}
      overview={overview}
      onNavigate={setActiveView}
    />
  );
};
