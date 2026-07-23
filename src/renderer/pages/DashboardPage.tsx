import React from 'react';
import { DashboardView } from '../../views/DashboardView';
import { INITIAL_BARCODES, MOCK_PRINTERS, MOCK_LICENSE } from '../../data/mockData';
import { useApplicationStatusStore } from '../stores/applicationStatusStore';

export const DashboardPage: React.FC = () => {
  const setActiveView = useApplicationStatusStore((s) => s.setActiveView);

  return (
    <DashboardView
      barcodes={INITIAL_BARCODES}
      printers={MOCK_PRINTERS}
      license={MOCK_LICENSE}
      onNavigate={setActiveView}
    />
  );
};
