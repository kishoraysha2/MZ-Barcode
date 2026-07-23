import React, { useEffect, useState } from 'react';
import { SettingsView } from '../../views/SettingsView';
import { electronBridge } from '../../preload/bridge';
import { AuditLogItem } from '../../types';

export const SettingsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [defaultPrinterName, setDefaultPrinterName] = useState<string>('Not Configured');

  useEffect(() => {
    async function loadSettingsAndLogs() {
      try {
        const [logsRes, setRes] = await Promise.all([
          electronBridge.getAuditLogs(),
          electronBridge.getSettings(),
        ]);

        if (logsRes.success && Array.isArray(logsRes.data)) {
          const mappedLogs: AuditLogItem[] = logsRes.data.map((l: any) => ({
            id: l.id,
            timestamp: l.created_at || l.timestamp,
            user: l.username || l.user || 'System',
            action: l.action,
            details: l.details,
          }));
          setAuditLogs(mappedLogs);
        }

        if (setRes.success && setRes.data?.printing) {
          setDefaultPrinterName(setRes.data.printing.defaultPrinter || 'Not Configured');
        }
      } catch (err) {
        console.error('Failed loading settings or audit logs:', err);
      }
    }

    loadSettingsAndLogs();
  }, []);

  return <SettingsView auditLogs={auditLogs} defaultPrinterName={defaultPrinterName} />;
};
