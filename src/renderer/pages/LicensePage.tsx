import React from 'react';
import { LicenseView } from '../../views/LicenseView';
import { MOCK_LICENSE } from '../../data/mockData';

export const LicensePage: React.FC = () => {
  return <LicenseView license={MOCK_LICENSE} />;
};
