import React, { useState, useEffect } from 'react';
import { History, Trash2, Search, CheckCircle2, XCircle, Tag, Filter } from 'lucide-react';
import { useScannerStore } from '../../stores/scannerStore';

export const ScanHistoryTable: React.FC = () => {
  const { history, loadHistory, clearHistory, processScan } = useScannerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'NOT_FOUND'>('ALL');

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ? true : statusFilter === 'SUCCESS' ? item.status === 'SUCCESS' : item.status !== 'SUCCESS';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Scan Audit Log</h3>
            <p className="text-xs text-slate-400">{filteredHistory.length} total recorded scan logs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="w-48 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="NOT_FOUND">Not Found Only</option>
          </select>

          {/* Clear Button */}
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Device / User</th>
              <th className="px-4 py-3">Scan Time</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No scan history logs found.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => {
                const isSuccess = item.status === 'SUCCESS';
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-100">{item.barcode}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.productName || (isSuccess ? 'Found Product' : 'Unknown Product')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {item.deviceName} ({item.userId})
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{item.scanTime}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => processScan(item.barcode)}
                        className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-blue-500 hover:text-white transition-colors"
                      >
                        Re-Scan
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
