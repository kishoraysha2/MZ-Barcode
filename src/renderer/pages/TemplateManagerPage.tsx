import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layout,
  Plus,
  Download,
  Upload,
  Copy,
  Edit3,
  Trash2,
  Lock,
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
  FileJson,
  RefreshCw,
  SlidersHorizontal,
  X,
  FileText,
  Layers,
  Info
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/common/UIComponents';
import { electronBridge } from '../../preload/bridge';
import {
  LabelTemplate,
  LabelTemplateDTO,
  TemplateCategory,
  Orientation,
  LabelElementDTO,
} from '../../shared/types';

interface TemplateManagerPageProps {
  onOpenDesigner?: (template: LabelTemplate) => void;
}

const CATEGORIES: TemplateCategory[] = [
  'RETAIL',
  'LOGISTICS',
  'ASSET',
  'JEWELRY',
  'MEDICAL',
  'OFFICE',
  'WAREHOUSE',
  'CUSTOM',
];

export const TemplateManagerPage: React.FC<TemplateManagerPageProps> = ({ onOpenDesigner }) => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'recentlyUpdated' | 'category'>('recentlyUpdated');

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState<boolean>(false);
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);

  // Modal Form Inputs
  const [createForm, setCreateForm] = useState<{
    name: string;
    description: string;
    category: TemplateCategory;
    widthMm: number;
    heightMm: number;
    orientation: Orientation;
    dpi: number;
    sourceMode: 'BLANK' | 'COPY';
    copyFromId: string;
  }>({
    name: '',
    description: '',
    category: 'RETAIL',
    widthMm: 50,
    heightMm: 25,
    orientation: 'PORTRAIT',
    dpi: 203,
    sourceMode: 'BLANK',
    copyFromId: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [duplicateName, setDuplicateName] = useState<string>('');
  const [renameName, setRenameName] = useState<string>('');
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Templates via IPC
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await electronBridge.getLabelTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
        if (res.data.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(res.data[0].id);
        }
      } else {
        showToast('error', res.error?.message || 'Failed to load label templates');
      }
    } catch (err) {
      showToast('error', (err as Error).message || 'IPC error loading templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Selected Template Object
  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0] || null;
  }, [templates, selectedTemplateId]);

  // Filtered and Sorted Templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter((tpl) => {
        const matchesSearch =
          tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tpl.category && tpl.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
          selectedCategory === 'ALL' || tpl.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'recentlyUpdated') {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        if (sortBy === 'category') {
          return (a.category || '').localeCompare(b.category || '');
        }
        return 0;
      });
  }, [templates, searchQuery, selectedCategory, sortBy]);

  // --- HANDLERS ---

  // Create Template
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedName = createForm.name.trim();
    if (!trimmedName) {
      errors.name = 'Template name is required.';
    } else {
      const exists = templates.some(
        (t) => t.name.toLowerCase().trim() === trimmedName.toLowerCase()
      );
      if (exists) {
        errors.name = 'A template with this exact name already exists.';
      }
    }

    if (!createForm.widthMm || createForm.widthMm <= 0) {
      errors.widthMm = 'Width must be greater than 0 mm.';
    }

    if (!createForm.heightMm || createForm.heightMm <= 0) {
      errors.heightMm = 'Height must be greater than 0 mm.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    let elementsToCopy: LabelElementDTO[] = [];
    if (createForm.sourceMode === 'COPY' && createForm.copyFromId) {
      const src = templates.find((t) => t.id === createForm.copyFromId);
      if (src && src.elements) {
        elementsToCopy = src.elements.map((el) => {
          const { id, templateId, createdAt, updatedAt, ...rest } = el;
          return rest;
        });
      }
    }

    const templateDTO: LabelTemplateDTO = {
      name: trimmedName,
      description: createForm.description.trim() || undefined,
      category: createForm.category,
      widthMm: Number(createForm.widthMm),
      heightMm: Number(createForm.heightMm),
      orientation: createForm.orientation,
      dpi: Number(createForm.dpi),
      isDefault: false,
      isActive: true,
    };

    try {
      const res = await electronBridge.createLabelTemplate({
        template: templateDTO,
        elements: elementsToCopy,
      });

      if (res.success && res.data) {
        showToast('success', `Template "${res.data.name}" created successfully.`);
        setIsCreateOpen(false);
        setCreateForm({
          name: '',
          description: '',
          category: 'RETAIL',
          widthMm: 50,
          heightMm: 25,
          orientation: 'PORTRAIT',
          dpi: 203,
          sourceMode: 'BLANK',
          copyFromId: '',
        });
        await loadTemplates();
        setSelectedTemplateId(res.data.id);
      } else {
        showToast('error', res.error?.message || 'Failed to create label template.');
      }
    } catch (err) {
      showToast('error', (err as Error).message || 'Error executing IPC create command.');
    }
  };

  // Open Duplicate Dialog
  const handleOpenDuplicate = () => {
    if (!selectedTemplate) return;
    setDuplicateName(`${selectedTemplate.name} (Copy)`);
    setIsDuplicateOpen(true);
  };

  // Submit Duplicate
  const handleDuplicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const newName = duplicateName.trim() || `${selectedTemplate.name} (Copy)`;

    try {
      const res = await electronBridge.duplicateLabelTemplate({
        id: selectedTemplate.id,
        newName,
      });

      if (res.success && res.data) {
        showToast('success', `Duplicated template as "${res.data.name}".`);
        setIsDuplicateOpen(false);
        await loadTemplates();
        setSelectedTemplateId(res.data.id);
      } else {
        showToast('error', res.error?.message || 'Failed to duplicate template.');
      }
    } catch (err) {
      showToast('error', (err as Error).message || 'Error duplicating template.');
    }
  };

  // Open Rename Dialog
  const handleOpenRename = () => {
    if (!selectedTemplate || selectedTemplate.isSystem) return;
    setRenameName(selectedTemplate.name);
    setIsRenameOpen(true);
  };

  // Submit Rename
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || selectedTemplate.isSystem) return;

    const newName = renameName.trim();
    if (!newName) return;

    try {
      const res = await electronBridge.updateLabelTemplate({
        id: selectedTemplate.id,
        template: { name: newName },
      });

      if (res.success && res.data) {
        showToast('success', `Renamed template to "${res.data.name}".`);
        setIsRenameOpen(false);
        await loadTemplates();
      } else {
        showToast('error', res.error?.message || 'Failed to rename template.');
      }
    } catch (err) {
      showToast('error', (err as Error).message || 'Error updating template name.');
    }
  };

  // Submit Delete
  const handleDeleteConfirm = async () => {
    if (!selectedTemplate || selectedTemplate.isSystem) return;

    try {
      const res = await electronBridge.deleteLabelTemplate(selectedTemplate.id);
      if (res.success) {
        showToast('success', `Template "${selectedTemplate.name}" deleted.`);
        setIsDeleteOpen(false);
        setSelectedTemplateId(null);
        await loadTemplates();
      } else {
        showToast('error', res.error?.message || 'Failed to delete template.');
      }
    } catch (err) {
      showToast('error', (err as Error).message || 'Error deleting template.');
    }
  };

  // Export JSON
  const handleExport = async () => {
    if (!selectedTemplate) return;

    try {
      const res = await electronBridge.exportLabelTemplate(selectedTemplate.id);
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `template_${selectedTemplate.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('success', `Exported template to ${filename}`);
      } else {
        showToast('error', res.error?.message || 'Failed to export template.');
      }
    } catch (err) {
      showToast('error', (err as Error).message || 'Error exporting template JSON.');
    }
  };

  // Import JSON File Trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      setIsImportOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Submit Import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);

    const jsonText = importJsonText.trim();
    if (!jsonText) {
      setImportError('Please enter or select a valid JSON configuration.');
      return;
    }

    try {
      // Validate client-side first
      const parsed = JSON.parse(jsonText);
      if (!parsed.template || (!parsed.template.name && !parsed.template.widthMm)) {
        setImportError('Invalid template JSON format. Missing template object metadata.');
        return;
      }

      const res = await electronBridge.importLabelTemplate(jsonText);
      if (res.success && res.data) {
        showToast('success', `Successfully imported template "${res.data.name}".`);
        setIsImportOpen(false);
        setImportJsonText('');
        await loadTemplates();
        setSelectedTemplateId(res.data.id);
      } else {
        setImportError(res.error?.message || 'Import failed. Invalid schema.');
      }
    } catch (err) {
      setImportError(`Invalid JSON format: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layout className="h-6 w-6 text-amber-500" /> Label Template Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise template library, physical stock dimensions, and configuration management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Template
          </Button>
        </div>
      </div>

      {/* Notification Toast */}
      {toast && (
        <div
          className={`p-3 border text-xs font-semibold rounded-xl flex items-center justify-between transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toast.message}
          </div>
          <button onClick={() => setToast(null)}>
            <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Desktop Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT PANEL: TEMPLATE LIST ================= */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            {/* Search & Sort Toolbar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates by name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Category Selector */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Sort Selector */}
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="recentlyUpdated">Recently Updated</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Header Stats */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Showing {filteredTemplates.length} templates</span>
              <button
                onClick={loadTemplates}
                className="hover:text-amber-500 flex items-center gap-1 transition"
                title="Refresh List"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Template List Items */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <FileText className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No templates match your filters.
                  </p>
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                              {template.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              {template.widthMm} × {template.heightMm} mm
                            </span>
                            <span>•</span>
                            <span>{template.dpi || 203} DPI</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1">
                          {template.isSystem ? (
                            <Badge variant="purple" size="sm">
                              <Lock className="h-2.5 w-2.5" /> Read Only
                            </Badge>
                          ) : (
                            <Badge variant="emerald" size="sm">
                              CUSTOM
                            </Badge>
                          )}
                          <Badge variant="cyan" size="sm">
                            {template.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Footer date */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                        <span>
                          Updated:{' '}
                          {template.updatedAt
                            ? new Date(template.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        {template.elements && (
                          <span className="font-mono">{template.elements.length} Elements</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* ================= RIGHT PANEL: DETAILS & ACTIONS ================= */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTemplate ? (
            <Card className="p-5 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {selectedTemplate.name}
                    </h3>
                    {selectedTemplate.isSystem ? (
                      <Badge variant="purple" size="md">
                        <Lock className="h-3 w-3" /> System Template (Read Only)
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="md">
                        Custom User Template
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedTemplate.description || 'No description provided for this template preset.'}
                  </p>
                </div>

                <Badge variant="amber" size="md">
                  <Tag className="h-3 w-3" /> {selectedTemplate.category}
                </Badge>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                {/* Open Designer */}
                {onOpenDesigner && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => onOpenDesigner(selectedTemplate)}
                  >
                    Open Designer
                  </Button>
                )}

                {/* Duplicate */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  onClick={handleOpenDuplicate}
                >
                  Duplicate
                </Button>

                {/* Rename (Disabled for System) */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                  disabled={selectedTemplate.isSystem}
                  onClick={handleOpenRename}
                  title={selectedTemplate.isSystem ? 'System templates cannot be renamed' : 'Rename Template'}
                >
                  Rename
                </Button>

                {/* Export JSON */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleExport}
                >
                  Export JSON
                </Button>

                {/* Delete (Disabled for System) */}
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  disabled={selectedTemplate.isSystem}
                  onClick={() => setIsDeleteOpen(true)}
                  title={selectedTemplate.isSystem ? 'System templates cannot be deleted' : 'Delete Template'}
                >
                  Delete
                </Button>
              </div>

              {/* Specifications Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" /> Physical Specifications
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Width</span>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedTemplate.widthMm} mm
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Height</span>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedTemplate.heightMm} mm
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Orientation</span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedTemplate.orientation || 'PORTRAIT'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Print DPI</span>
                    <div className="text-sm font-bold font-mono text-amber-500 mt-0.5">
                      {selectedTemplate.dpi || 203} DPI
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-50/60 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] block">Element Count:</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {selectedTemplate.elements?.length || 0} Elements
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/60 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] block">Margins (T/B/L/R):</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {selectedTemplate.marginTopMm || 0}/{selectedTemplate.marginBottomMm || 0}/
                      {selectedTemplate.marginLeftMm || 0}/{selectedTemplate.marginRightMm || 0} mm
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/60 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] block">Padding / Gap:</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {selectedTemplate.paddingMm || 0}mm / {selectedTemplate.gapMm || 0}mm
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Preview Placeholder Box */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-amber-500" /> Physical Stock Aspect Wireframe
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Aspect Ratio: {selectedTemplate.widthMm} : {selectedTemplate.heightMm}
                  </span>
                </div>

                <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px]">
                  {/* Aspect-ratio Scaled Canvas Box */}
                  <div
                    className="bg-white dark:bg-slate-900 border-2 border-dashed border-amber-500/40 rounded-lg shadow-sm relative p-3 flex flex-col justify-between overflow-hidden transition-all"
                    style={{
                      width: '100%',
                      maxWidth: '280px',
                      aspectRatio: `${selectedTemplate.widthMm} / ${selectedTemplate.heightMm}`,
                      maxHeight: '220px',
                    }}
                  >
                    {/* Simulated Wireframe Elements */}
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-sm mb-1 flex items-center px-1">
                      <div className="w-1/2 h-1 bg-slate-400 dark:bg-slate-600 rounded-xs" />
                    </div>

                    <div className="w-full flex-1 my-1 border border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50 dark:bg-slate-950/60 flex flex-col items-center justify-center p-1 space-y-0.5">
                      <div className="w-3/4 h-6 bg-slate-800 dark:bg-slate-200 rounded-xs flex items-center justify-around px-1">
                        <div className="w-1 h-full bg-white dark:bg-slate-900" />
                        <div className="w-2 h-full bg-white dark:bg-slate-900" />
                        <div className="w-1 h-full bg-white dark:bg-slate-900" />
                        <div className="w-3 h-full bg-white dark:bg-slate-900" />
                      </div>
                      <div className="w-1/2 h-1 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-sm flex items-center justify-end px-1">
                      <div className="w-1/3 h-1 bg-amber-500 rounded-xs" />
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-3 text-center">
                    Dimension Ratio: {selectedTemplate.widthMm}.0mm × {selectedTemplate.heightMm}.0mm ({selectedTemplate.dpi || 203} DPI)
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-400 space-y-3">
              <Info className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">Select a template from the list to view specifications.</p>
            </Card>
          )}
        </div>
      </div>

      {/* ================= MODAL: CREATE TEMPLATE ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-500" /> Create Label Template
              </h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Medical Specimen Tag (40x20mm)"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none ${
                    formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-amber-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or usage purpose..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category & DPI Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, category: e.target.value as TemplateCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thermal Print DPI
                  </label>
                  <select
                    value={createForm.dpi}
                    onChange={(e) => setCreateForm({ ...createForm, dpi: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value={203}>203 DPI (Standard)</option>
                    <option value={300}>300 DPI (High Density)</option>
                    <option value={600}>600 DPI (Ultra Precision)</option>
                  </select>
                </div>
              </div>

              {/* Dimensions Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Width (mm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.widthMm}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, widthMm: Number(e.target.value) })
                    }
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none ${
                      formErrors.widthMm ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-amber-500'
                    }`}
                  />
                  {formErrors.widthMm && (
                    <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.widthMm}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Height (mm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.heightMm}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, heightMm: Number(e.target.value) })
                    }
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none ${
                      formErrors.heightMm ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-amber-500'
                    }`}
                  />
                  {formErrors.heightMm && (
                    <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.heightMm}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Orientation
                  </label>
                  <select
                    value={createForm.orientation}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, orientation: e.target.value as Orientation })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="PORTRAIT">PORTRAIT</option>
                    <option value="LANDSCAPE">LANDSCAPE</option>
                  </select>
                </div>
              </div>

              {/* Source Mode Option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Template Content Source
                </span>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sourceMode"
                      checked={createForm.sourceMode === 'BLANK'}
                      onChange={() => setCreateForm({ ...createForm, sourceMode: 'BLANK' })}
                    />
                    <span>Start Blank</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sourceMode"
                      checked={createForm.sourceMode === 'COPY'}
                      onChange={() => setCreateForm({ ...createForm, sourceMode: 'COPY' })}
                    />
                    <span>Copy Existing Template</span>
                  </label>
                </div>

                {createForm.sourceMode === 'COPY' && (
                  <select
                    value={createForm.copyFromId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, copyFromId: e.target.value })
                    }
                    className="w-full mt-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select Template to Copy --</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.widthMm}x{t.heightMm}mm)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dialog Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DUPLICATE TEMPLATE ================= */}
      {isDuplicateOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Copy className="h-5 w-5 text-amber-500" /> Duplicate Template
              </h3>
              <button onClick={() => setIsDuplicateOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleDuplicateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Template Name
                </label>
                <input
                  type="text"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDuplicateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Duplicate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RENAME TEMPLATE ================= */}
      {isRenameOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-500" /> Rename Template
              </h3>
              <button onClick={() => setIsRenameOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRenameOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Name
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {isDeleteOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Delete Template?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete template{' '}
              <strong className="text-slate-800 dark:text-slate-100">{selectedTemplate.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPORT JSON ================= */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileJson className="h-5 w-5 text-amber-500" /> Import Label Template JSON
              </h3>
              <button onClick={() => setIsImportOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  JSON Package Content
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste JSON template package content here..."
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setImportError(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
                {importError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{importError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImportOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Import Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
