import React from 'react';
import { LabelDesignerView } from '../../views/LabelDesignerView';
import { LabelTemplate } from '../../types';

const DEFAULT_TEMPLATES: LabelTemplate[] = [
  {
    id: 1,
    name: 'Standard Industrial Label (50mm x 25mm)',
    widthMm: 50,
    heightMm: 25,
    dpi: 203,
    isDefault: true,
    elementsCount: 5,
    updatedAt: new Date().toISOString().slice(0, 10),
  },
  {
    id: 2,
    name: 'Large Shipping Pallet Tag (100mm x 150mm)',
    widthMm: 100,
    heightMm: 150,
    dpi: 300,
    isDefault: false,
    elementsCount: 8,
    updatedAt: new Date().toISOString().slice(0, 10),
  },
];

export const DesignerPage: React.FC = () => {
  return <LabelDesignerView templates={DEFAULT_TEMPLATES} />;
};
