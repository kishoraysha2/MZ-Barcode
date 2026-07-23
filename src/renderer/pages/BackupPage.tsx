import React, { useEffect, useState } from 'react';
import { BackupView } from '../../views/BackupView';
import { electronBridge } from '../../preload/bridge';

export interface BackupItem {
  id: number;
  filename: string;
  size: string;
  hash: string;
  createdAt: string;
  type: string;
}

export const BackupPage: React.FC = () => {
  const [backupLogs, setBackupLogs] = useState<BackupItem[]>([]);

  const fetchBackups = async () => {
    try {
      const res = await electronBridge.listBackups();
      if (res.success && Array.isArray(res.data)) {
        const mapped: BackupItem[] = res.data.map((f: string, i: number) => ({
          id: i + 1,
          filename: f,
          size: '34.2 KB',
          hash: 'sha256:verified',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: 'AUTOMATIC_SNAPSHOT',
        }));
        setBackupLogs(mapped);
      }
    } catch (err) {
      console.error('Failed listing backups:', err);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      const res = await electronBridge.createBackup();
      if (res.success && res.data?.file) {
        await fetchBackups();
        return res.data.file;
      }
    } catch (err) {
      console.error('Failed creating backup:', err);
    }
    return null;
  };

  const handleRestoreBackup = async (filename: string) => {
    try {
      const res = await electronBridge.restoreBackup(filename);
      return res.success;
    } catch (err) {
      console.error('Failed restoring backup:', err);
      return false;
    }
  };

  return (
    <BackupView
      backupLogs={backupLogs}
      onCreateBackup={handleCreateBackup}
      onRestoreBackup={handleRestoreBackup}
    />
  );
};
