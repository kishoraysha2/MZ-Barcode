import React, { useEffect, useState } from 'react';
import { LicenseView } from '../../views/LicenseView';
import { electronBridge } from '../../preload/bridge';
import { LicenseStatus } from '../../types';

export const LicensePage: React.FC = () => {
  const [license, setLicense] = useState<LicenseStatus>({
    isActivated: false,
    customerName: 'Not Configured',
    hwid: 'Not Configured',
    activationKey: '',
    issuedAt: 'Not Configured',
    expiresAt: 'Not Configured',
    daysRemaining: 0,
    durationDays: 0,
    maxUsers: 0,
    status: 'Not Configured',
    lastClockCheck: 'Not Configured',
  });

  useEffect(() => {
    async function loadLicense() {
      try {
        const res = await electronBridge.getLicenseStatus();
        if (res.success && res.data) {
          setLicense(res.data as LicenseStatus);
        }
      } catch (err) {
        console.error('Failed loading license status:', err);
      }
    }
    loadLicense();
  }, []);

  return <LicenseView license={license} />;
};
