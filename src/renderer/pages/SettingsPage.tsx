import React from 'react';
import { SettingsView } from '../../views/SettingsView';
import { INITIAL_AUDIT_LOGS } from '../../data/mockData';

export const SettingsPage: React.FC = () => {
  return <SettingsView auditLogs={INITIAL_AUDIT_LOGS} />;
};
