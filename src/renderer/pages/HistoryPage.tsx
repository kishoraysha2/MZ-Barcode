import React, { useEffect, useState } from 'react';
import { HistoryView } from '../../views/HistoryView';
import { electronBridge } from '../../preload/bridge';
import { BarcodeRecord } from '../../types';

export const HistoryPage: React.FC = () => {
  const [barcodes, setBarcodes] = useState<BarcodeRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadBarcodes() {
      try {
        const res = await electronBridge.getAllBarcodes();
        if (isMounted && res.success && Array.isArray(res.data)) {
          const mapped: BarcodeRecord[] = res.data.map((b: any) => ({
            id: b.id,
            barcodeNumber: b.barcode_value,
            prefix: b.prefix || 'MZ-',
            sequenceNumber: b.sequence_number || 1,
            type: b.barcode_type || 'CODE128',
            title: b.title,
            category: b.category || 'General',
            createdBy: b.created_by || 'Admin',
            createdAt: b.created_at,
            printCount: b.print_count || 1,
            status: b.status || 'active',
          }));
          setBarcodes(mapped);
        }
      } catch (err) {
        console.error('Failed to load barcodes for HistoryPage:', err);
      }
    }

    loadBarcodes();

    return () => {
      isMounted = false;
    };
  }, []);

  return <HistoryView barcodes={barcodes} />;
};
