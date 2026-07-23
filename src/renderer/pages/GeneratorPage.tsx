import React, { useEffect, useState } from 'react';
import { BarcodeGeneratorView } from '../../views/BarcodeGeneratorView';
import { useApplicationStatusStore } from '../stores/applicationStatusStore';
import { electronBridge } from '../../preload/bridge';
import { BarcodeRecord } from '../../types';

export const GeneratorPage: React.FC = () => {
  const setActiveView = useApplicationStatusStore((s) => s.setActiveView);
  const [initialSequence, setInitialSequence] = useState<number>(1);

  useEffect(() => {
    async function fetchNextSeq() {
      try {
        const res = await electronBridge.getNextSequence('MZ-');
        if (res.success && res.data) {
          setInitialSequence(res.data.nextSequence);
        }
      } catch (err) {
        console.error('Failed fetching sequence:', err);
      }
    }
    fetchNextSeq();
  }, []);

  const handleAddBarcode = async (record: BarcodeRecord) => {
    try {
      await electronBridge.createBarcode({
        barcode_value: record.barcodeNumber,
        prefix: record.prefix,
        sequence_number: record.sequenceNumber,
        barcode_type: record.type,
        title: record.title,
        category: record.category,
        created_by: record.createdBy,
        print_count: record.printCount,
      });
    } catch (err) {
      console.error('Failed creating barcode in database:', err);
    }
  };

  return (
    <BarcodeGeneratorView
      onAddBarcode={handleAddBarcode}
      onNavigate={setActiveView}
      initialSeqStart={initialSequence}
    />
  );
};
