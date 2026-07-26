import React, { useState, useEffect } from 'react';
import {
  Layout,
  Layers,
  Save,
  CheckCircle2,
  Info,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LabelTemplate, LabelElement } from '../shared/types';
import { LabelDesignerCanvas } from '../components/designer/LabelDesignerCanvas';
import { electronBridge } from '../preload/bridge';

interface LabelDesignerViewProps {
  templates: LabelTemplate[];
  onTemplateUpdate?: (template: LabelTemplate) => void;
}

export const LabelDesignerView: React.FC<LabelDesignerViewProps> = ({ templates, onTemplateUpdate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(templates[0]);
  const [currentElements, setCurrentElements] = useState<LabelElement[]>(templates[0]?.elements || []);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const initialTemplateId = templates && templates.length > 0 ? templates[0]?.id : null;

  useEffect(() => {
    if (!initialTemplateId) return;

    let isMounted = true;
    const syncTemplate = async () => {
      const getRes = await electronBridge.getLabelTemplate(initialTemplateId);
      if (!isMounted) return;

      if (getRes.success && getRes.data) {
        const fresh = getRes.data as LabelTemplate;
        setSelectedTemplate(fresh);
        setCurrentElements(fresh.elements || []);
      } else {
        const t = templates.find((tmp) => String(tmp.id) === String(initialTemplateId)) || templates[0];
        if (t) {
          setSelectedTemplate(t);
          setCurrentElements(t.elements || []);
        }
      }
      setIsDirty(false);
      setSaveMsg(null);
      setErrorMsg(null);
    };

    syncTemplate();

    return () => {
      isMounted = false;
    };
  }, [initialTemplateId]);

  const handleTemplateChange = async (templateId: string) => {
    const t = templates.find((tmp) => String(tmp.id) === templateId);
    if (t) {
      const getRes = await electronBridge.getLabelTemplate(t.id);
      if (getRes.success && getRes.data) {
        const fresh = getRes.data as LabelTemplate;
        setSelectedTemplate(fresh);
        setCurrentElements(fresh.elements || []);
      } else {
        setSelectedTemplate(t);
        setCurrentElements(t.elements || []);
      }
      setIsDirty(false);
      setSaveMsg(null);
      setErrorMsg(null);
    }
  };

  const handleElementsChange = (newElements: LabelElement[]) => {
    setCurrentElements(newElements);
    setIsDirty(true);
  };

  const handleSaveLayout = async () => {
    console.log('[TRACE 1] handleSaveLayout() entered. Current template:', selectedTemplate?.id, 'Name:', selectedTemplate?.name, 'isSystem:', selectedTemplate?.isSystem, 'isSaving:', isSaving);
    if (isSaving || !selectedTemplate) {
      console.log('[TRACE 1.1] handleSaveLayout() stopped early because isSaving or !selectedTemplate');
      return;
    }
    setIsSaving(true);
    setSaveMsg(null);
    setErrorMsg(null);

    try {
      const updatedAt = new Date().toISOString();

      const payload = {
        id: selectedTemplate.id,
        template: {
          name: selectedTemplate.name,
          description: selectedTemplate.description || '',
          category: selectedTemplate.category,
          widthMm: selectedTemplate.widthMm,
          heightMm: selectedTemplate.heightMm,
          marginTopMm: selectedTemplate.marginTopMm || 0,
          marginBottomMm: selectedTemplate.marginBottomMm || 0,
          marginLeftMm: selectedTemplate.marginLeftMm || 0,
          marginRightMm: selectedTemplate.marginRightMm || 0,
          paddingMm: selectedTemplate.paddingMm || 0,
          gapMm: selectedTemplate.gapMm || 0,
          orientation: selectedTemplate.orientation,
          dpi: selectedTemplate.dpi,
          isDefault: selectedTemplate.isDefault,
          isActive: selectedTemplate.isActive,
          updatedAt,
        },
        elements: currentElements,
        updatedAt,
      };

      console.log('[TRACE 2] electronBridge.updateLabelTemplate() called with payload:', JSON.stringify(payload, null, 2));
      const response = await electronBridge.updateLabelTemplate(payload as any);
      console.log('[TRACE 8] Return value of updateLabelTemplate():', JSON.stringify(response, null, 2));

      if (response.success) {
        // Immediately reload saved template from repository to verify database values == designer values
        console.log('[TRACE 8.1] Reloading saved template for verification:', selectedTemplate.id);
        const getResponse = await electronBridge.getLabelTemplate(selectedTemplate.id);
        if (!getResponse.success || !getResponse.data) {
          console.log('[TRACE 8.2] Post-save verification failed - getResponse unsuccessful:', getResponse);
          throw new Error('Post-save verification failed: Unable to reload saved template from database.');
        }

        const reloaded = getResponse.data as LabelTemplate;
        if (!reloaded.elements || reloaded.elements.length !== currentElements.length) {
          console.log('[TRACE 8.3] Post-save verification failed - element count mismatch. Saved:', currentElements.length, 'Reloaded:', reloaded.elements?.length);
          throw new Error('Post-save verification failed: Reloaded element count mismatch.');
        }

        console.log('[TRACE 9] Clearing isDirty (setting isDirty=false).');
        setIsDirty(false);
        setSelectedTemplate(reloaded);
        setCurrentElements(reloaded.elements || []);
        setSaveMsg(`Template "${selectedTemplate.name}" layout saved successfully.`);

        if (onTemplateUpdate) {
          onTemplateUpdate(reloaded);
        }

        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        console.log('[TRACE 9] isDirty NOT cleared because response.success is false.');
        console.log('[TRACE 10] UI still displays "Unsaved" because isDirty remains true. Error response:', response.error);
        setIsDirty(true);
        setErrorMsg(response.error?.message || 'Failed to save template layout.');
      }
    } catch (err) {
      console.log('[TRACE 9] isDirty NOT cleared because exception caught in handleSaveLayout:', (err as Error).message);
      console.log('[TRACE 10] UI still displays "Unsaved" because isDirty remains true.');
      setIsDirty(true);
      setErrorMsg((err as Error).message || 'An error occurred while saving template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layout className="h-6 w-6 text-amber-500" /> Thermal Label Template Studio
            {isDirty && (
              <span className="ml-2">
                <Badge variant="amber">Unsaved</Badge>
              </span>
            )}
            {selectedTemplate?.isSystem && (
              <span className="ml-2">
                <Badge variant="gray">System (Read-Only)</Badge>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SVG Vector Label Canvas Foundation for high-precision thermal printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {templates.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Preset:</span>
              <select
                value={selectedTemplate?.id}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.widthMm}mm x {t.heightMm}mm)
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={handleSaveLayout} icon={Save} disabled={isSaving || selectedTemplate?.isSystem}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {saveMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Main Studio Grid: SVG Canvas Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Canvas Foundation (12 cols full-width workspace) */}
        <div className="lg:col-span-12 space-y-4">
          <LabelDesignerCanvas
            template={selectedTemplate}
            elements={currentElements}
            onElementsChange={handleElementsChange}
          />
        </div>
      </div>
    </div>
  );
};

