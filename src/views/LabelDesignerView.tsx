import React, { useState } from 'react';
import {
  Layout,
  Layers,
  ZoomIn,
  ZoomOut,
  Grid,
  Type,
  Barcode,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Move,
  RotateCw,
  Copy,
  Trash2,
  Sliders
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LabelTemplate } from '../types';

interface LabelDesignerViewProps {
  templates: LabelTemplate[];
}

export const LabelDesignerView: React.FC<LabelDesignerViewProps> = ({ templates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(templates[0]);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedElement, setSelectedElement] = useState<string>('barcode');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Editable element properties
  const [elemConfig, setElemConfig] = useState({
    titleText: 'MZ INDUSTRIAL MOTOR SHAFT',
    titleX: 10,
    titleY: 8,
    fontSize: 10,
    barcodeX: 10,
    barcodeY: 22,
    barcodeWidth: 180,
    barcodeHeight: 35,
  });

  const handleSaveLayout = () => {
    setSaveMsg(`Saved custom layout template "${selectedTemplate.name}" to SQLite!`);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layout className="h-6 w-6 text-amber-500" /> Thermal Label Template Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Precision pixel-perfect visual editor for 203 & 300 DPI thermal roll label stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSaveLayout} icon={Save}>
            Save Template Layout
          </Button>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {saveMsg}
        </div>
      )}

      {/* Main Studio Grid: Toolbar Top, Canvas Center, Properties Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Templates & Canvas Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Studio Canvas Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Template Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Preset:</span>
              <select
                value={selectedTemplate.id}
                onChange={(e) => {
                  const t = templates.find((tmp) => tmp.id === Number(e.target.value));
                  if (t) setSelectedTemplate(t);
                }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.widthMm}mm x {t.heightMm}mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Canvas View Tools (Zoom, Grid) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                  showGrid
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
                title="Toggle Millimeter Grid Lines"
              >
                <Grid className="h-3.5 w-3.5" /> Grid
              </button>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Interactive Workstage */}
          <div className="bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-8 min-h-[380px] flex items-center justify-center relative overflow-auto shadow-inner">
            <div
              style={{
                width: `${selectedTemplate.widthMm * 5 * (zoom / 100)}px`,
                height: `${selectedTemplate.heightMm * 5 * (zoom / 100)}px`,
              }}
              className={`bg-white text-slate-900 rounded border-2 border-slate-400 shadow-2xl relative select-none transition-all ${
                showGrid ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:10px_10px]' : ''
              }`}
            >
              {/* Header Label Text Element */}
              <div
                onClick={() => setSelectedElement('title')}
                style={{
                  top: `${elemConfig.titleY}px`,
                  left: `${elemConfig.titleX}px`,
                  fontSize: `${elemConfig.fontSize}px`,
                }}
                className={`absolute font-black tracking-tight cursor-pointer px-1 py-0.5 rounded border ${
                  selectedElement === 'title' ? 'border-amber-500 bg-amber-500/10' : 'border-transparent'
                }`}
              >
                {elemConfig.titleText}
              </div>

              {/* Barcode Vector Element */}
              <div
                onClick={() => setSelectedElement('barcode')}
                style={{
                  top: `${elemConfig.barcodeY}px`,
                  left: `${elemConfig.barcodeX}px`,
                }}
                className={`absolute cursor-pointer p-1 rounded border flex flex-col items-center ${
                  selectedElement === 'barcode' ? 'border-amber-500 bg-amber-500/10' : 'border-transparent'
                }`}
              >
                <svg className="h-10 w-44" viewBox="0 0 200 50">
                  <rect x="5" y="5" width="4" height="35" fill="#000" />
                  <rect x="11" y="5" width="2" height="35" fill="#000" />
                  <rect x="16" y="5" width="6" height="35" fill="#000" />
                  <rect x="25" y="5" width="2" height="35" fill="#000" />
                  <rect x="30" y="5" width="8" height="35" fill="#000" />
                  <rect x="42" y="5" width="3" height="35" fill="#000" />
                  <rect x="50" y="5" width="5" height="35" fill="#000" />
                  <rect x="60" y="5" width="2" height="35" fill="#000" />
                  <rect x="65" y="5" width="7" height="35" fill="#000" />
                  <rect x="76" y="5" width="4" height="35" fill="#000" />
                  <rect x="83" y="5" width="2" height="35" fill="#000" />
                  <rect x="88" y="5" width="6" height="35" fill="#000" />
                  <rect x="98" y="5" width="3" height="35" fill="#000" />
                  <rect x="105" y="5" width="8" height="35" fill="#000" />
                  <rect x="117" y="5" width="2" height="35" fill="#000" />
                  <rect x="123" y="5" width="5" height="35" fill="#000" />
                  <rect x="132" y="5" width="3" height="35" fill="#000" />
                  <rect x="140" y="5" width="6" height="35" fill="#000" />
                </svg>
                <span className="font-mono text-[10px] font-black tracking-wider text-slate-900">MZ-00000108</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Properties Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card title="Element Inspector" subtitle={`Selected: ${selectedElement.toUpperCase()}`}>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Element Text Content
                </label>
                <input
                  type="text"
                  value={elemConfig.titleText}
                  onChange={(e) => setElemConfig({ ...elemConfig, titleText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">X Offset (mm)</label>
                  <input
                    type="number"
                    value={elemConfig.titleX}
                    onChange={(e) => setElemConfig({ ...elemConfig, titleX: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Y Offset (mm)</label>
                  <input
                    type="number"
                    value={elemConfig.titleY}
                    onChange={(e) => setElemConfig({ ...elemConfig, titleY: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Font Size (pt)</label>
                <input
                  type="number"
                  value={elemConfig.fontSize}
                  onChange={(e) => setElemConfig({ ...elemConfig, fontSize: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Button onClick={handleSaveLayout} className="w-full">
                  Apply Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
