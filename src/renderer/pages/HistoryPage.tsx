import React from 'react';
import { HistoryView } from '../../views/HistoryView';
import { INITIAL_BARCODES } from '../../data/mockData';

export const HistoryPage: React.FC = () => {
  return <HistoryView barcodes={INITIAL_BARCODES} />;
};
