import React from 'react';
import { BarcodeGeneratorView } from '../../views/BarcodeGeneratorView';
import { useApplicationStatusStore } from '../stores/applicationStatusStore';

export const GeneratorPage: React.FC = () => {
  const setActiveView = useApplicationStatusStore((s) => s.setActiveView);

  return (
    <BarcodeGeneratorView
      onAddBarcode={() => {}}
      onNavigate={setActiveView}
    />
  );
};
