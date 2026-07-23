import React from 'react';
import { LabelDesignerView } from '../../views/LabelDesignerView';
import { INITIAL_TEMPLATES } from '../../data/mockData';

export const DesignerPage: React.FC = () => {
  return <LabelDesignerView templates={INITIAL_TEMPLATES} />;
};
