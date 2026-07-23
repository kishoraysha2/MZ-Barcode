import React, { useState } from 'react';
import {
  History,
  Search,
  FileSpreadsheet,
  Printer,
  Tag,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/common/UIComponents';
import { BarcodeRecord } from '../types';

interface HistoryViewProps {
  barcodes: BarcodeRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ barcodes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedBarcode, setSelectedBarcode] = useState<BarcodeRecord | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(barcodes.map((b) => b.category)))];

  // Filtering
  const filteredBarcodes = barcodes.filter((b) => {
    const matchesSearch =
      b.barcodeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    const matchesType = typeFilter === 'ALL' || b.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,BarcodeNumber,Prefix,Sequence,Type,Title,Category,CreatedBy,CreatedAt,PrintCount\n' +
      filteredBarcodes
        .map(
          (b) =>
            `${b.id},${b.barcodeNumber},${b.prefix},${b.sequenceNumber},${b.type},"${b.title}",${b.category},${b.createdBy},${b.createdAt},${b.printCount}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MZ_Barcode_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMsg('Exported history CSV report!');
    setTimeout(() => setExportMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History className="h-6 w-6 text-amber-500" /> Barcode Audit History & Records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full atomic history log stored in SQLite WAL database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" icon={FileSpreadsheet}>
            Export CSV / Excel
          </Button>
        </div>
      </div>

      {exportMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {exportMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search barcode number, title, operator..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories
                .filter((c) => c !== 'ALL')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Types (CODE128, QR...)</option>
              <option value="CODE128">CODE128</option>
              <option value="QR">QR Code</option>
              <option value="EAN13">EAN13</option>
              <option value="DATAMATRIX">DataMatrix</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Barcode Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono bg-slate-50 dark:bg-slate-950/50">
                <th className="p-3">Barcode #</th>
                <th className="p-3">Title / Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Symbology</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-center">Print Count</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredBarcodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Inbox className="h-8 w-8 text-slate-500 stroke-1" />
                      <span className="font-bold text-slate-300">No Records</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBarcodes.map((b, idx) => (
                  <tr key={b.id ? `bc-${b.id}-${idx}` : `bc-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{b.barcodeNumber}</td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{b.title}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        <Tag className="h-3 w-3" /> {b.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant={b.type === 'CODE128' ? 'amber' : 'purple'}>{b.type}</Badge>
                    </td>
                    <td className="p-3 text-slate-400">{b.createdBy}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{b.createdAt}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {b.printCount}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedBarcode(b)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 rounded border border-amber-500/20"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedBarcode && (
        <Modal isOpen={!!selectedBarcode} onClose={() => setSelectedBarcode(null)} title="Barcode Item Details">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
                {selectedBarcode.type} BARCODE VECTOR
              </span>
              <div className="font-mono text-xl font-black text-amber-500 tracking-wider">
                {selectedBarcode.barcodeNumber}
              </div>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Title:</span>
                <span className="font-bold">{selectedBarcode.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Category:</span>
                <span>{selectedBarcode.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Sequence Index:</span>
                <span className="font-mono">{selectedBarcode.sequenceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Created By:</span>
                <span>{selectedBarcode.createdBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Created Timestamp:</span>
                <span className="font-mono">{selectedBarcode.createdAt}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setSelectedBarcode(null)} variant="outline">
                Close
              </Button>
              <Button onClick={() => setSelectedBarcode(null)} icon={Printer}>
                Reprint Label
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
