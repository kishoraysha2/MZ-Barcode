import React from 'react';
import {
  Barcode,
  Printer,
  Key,
  HardDrive,
  Users,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Layers,
  Search
} from 'lucide-react';
import { MetricCard, Card, Badge, Button } from '../components/common/UIComponents';
import { BarcodeRecord, SystemPrinter, LicenseStatus } from '../types';

interface DashboardViewProps {
  barcodes: BarcodeRecord[];
  printers: SystemPrinter[];
  license: LicenseStatus;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  barcodes,
  printers,
  license,
  onNavigate,
}) => {
  const activePrinter = printers.find((p) => p.isDefault) || printers[0];
  const latestBarcode = barcodes[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Atomic Barcode Engine Ready
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Next sequential number: <code className="font-mono text-amber-600 dark:text-amber-400 font-bold">MZ-00000108</code> (Code128 / QR Code)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => onNavigate('generator')} icon={Plus} size="sm">
            Generate Barcode
          </Button>
          <Button onClick={() => onNavigate('history')} variant="outline" size="sm" icon={Search}>
            Search History
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Barcodes Generated"
          value={barcodes.length + 107}
          subtext="Auto-increment sequence active"
          icon={Barcode}
          trend={{ value: '+18 today', positive: true }}
          color="amber"
        />
        <MetricCard
          title="Active Thermal Printer"
          value={activePrinter ? 'Zebra ZD421' : 'None'}
          subtext={activePrinter ? `${activePrinter.dpi} DPI • ${activePrinter.port}` : 'Offline'}
          icon={Printer}
          color="cyan"
        />
        <MetricCard
          title="Offline RSA License"
          value={`${license.daysRemaining} Days`}
          subtext={`HWID: ${license.hwid.slice(0, 12)}...`}
          icon={Key}
          color="purple"
        />
        <MetricCard
          title="Database WAL Engine"
          value="Healthy"
          subtext="SQLite 34 KB • Auto WAL"
          icon={HardDrive}
          color="emerald"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Barcode Generation Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Barcode Generation Log"
            subtitle="Atomic SQLite history feed with total print spools"
            action={
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                View Full Log <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2 font-medium">Barcode #</th>
                    <th className="pb-2 font-medium">Title / Item</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Prints</th>
                    <th className="pb-2 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {barcodes.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-mono font-bold text-amber-600 dark:text-amber-400">{b.barcodeNumber}</td>
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{b.title}</td>
                      <td className="py-2.5">
                        <Badge variant={b.type === 'CODE128' ? 'amber' : 'purple'}>{b.type}</Badge>
                      </td>
                      <td className="py-2.5 font-mono">{b.printCount}</td>
                      <td className="py-2.5 text-slate-400 font-mono text-[11px]">{b.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('generator')}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition text-left group shadow-xs cursor-pointer"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Barcode className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Batch Barcode Generator</h4>
              <p className="text-[11px] text-slate-400 mt-1">Generate 1 to 1000 sequential Code128 / QR tags in 1 click.</p>
            </button>

            <button
              onClick={() => onNavigate('designer')}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition text-left group shadow-xs cursor-pointer"
            >
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Label Designer Studio</h4>
              <p className="text-[11px] text-slate-400 mt-1">Customize 50mm x 25mm thermal layout elements & company logo.</p>
            </button>

            <button
              onClick={() => onNavigate('backup')}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition text-left group shadow-xs cursor-pointer"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HardDrive className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">WAL Backup Checkpoint</h4>
              <p className="text-[11px] text-slate-400 mt-1">Create compressed AES-256 SQLite database backups instantly.</p>
            </button>
          </div>
        </div>

        {/* Right Column: Active Printers & License Card */}
        <div className="space-y-6">
          {/* Latest Barcode Live Preview Card */}
          <Card title="Latest Generated Barcode" subtitle="Live Vector Render Engine Preview">
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400 mb-1">CODE128 VECTOR RENDER</span>
              {/* Simulated Crisp Barcode Graphics */}
              <div className="my-2 p-2 bg-white rounded border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <svg className="w-48 h-16" viewBox="0 0 200 60">
                  <rect x="10" y="5" width="4" height="40" fill="#0f172a" />
                  <rect x="16" y="5" width="2" height="40" fill="#0f172a" />
                  <rect x="22" y="5" width="6" height="40" fill="#0f172a" />
                  <rect x="32" y="5" width="2" height="40" fill="#0f172a" />
                  <rect x="38" y="5" width="8" height="40" fill="#0f172a" />
                  <rect x="50" y="5" width="3" height="40" fill="#0f172a" />
                  <rect x="58" y="5" width="5" height="40" fill="#0f172a" />
                  <rect x="68" y="5" width="2" height="40" fill="#0f172a" />
                  <rect x="74" y="5" width="7" height="40" fill="#0f172a" />
                  <rect x="86" y="5" width="4" height="40" fill="#0f172a" />
                  <rect x="94" y="5" width="2" height="40" fill="#0f172a" />
                  <rect x="100" y="5" width="6" height="40" fill="#0f172a" />
                  <rect x="110" y="5" width="3" height="40" fill="#0f172a" />
                  <rect x="118" y="5" width="8" height="40" fill="#0f172a" />
                  <rect x="130" y="5" width="2" height="40" fill="#0f172a" />
                  <rect x="136" y="5" width="5" height="40" fill="#0f172a" />
                  <rect x="146" y="5" width="3" height="40" fill="#0f172a" />
                  <rect x="154" y="5" width="6" height="40" fill="#0f172a" />
                  <rect x="165" y="5" width="4" height="40" fill="#0f172a" />
                  <rect x="174" y="5" width="2" height="40" fill="#0f172a" />
                  <rect x="180" y="5" width="5" height="40" fill="#0f172a" />
                </svg>
                <span className="font-mono text-xs font-black text-slate-900 tracking-widest mt-1">
                  {latestBarcode ? latestBarcode.barcodeNumber : 'MZ-00000101'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {latestBarcode ? latestBarcode.title : 'Industrial Motor Shaft'}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Button onClick={() => onNavigate('generator')} size="sm" variant="outline">
                  Reprint Label
                </Button>
              </div>
            </div>
          </Card>

          {/* Connected Thermal Printers List */}
          <Card title="Connected Thermal Printers" subtitle="Win32 Spoolers detected via Electron">
            <div className="space-y-3">
              {printers.map((p) => (
                <div key={p.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Printer className={`h-4 w-4 ${p.status === 'ready' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</h5>
                      <span className="text-[10px] text-slate-400">{p.paperType} • {p.dpi} DPI</span>
                    </div>
                  </div>
                  <Badge variant={p.status === 'ready' ? 'emerald' : 'gray'}>
                    {p.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
