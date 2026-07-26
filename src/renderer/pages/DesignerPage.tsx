import React, { useState, useMemo } from 'react';
import { TemplateManagerPage } from './TemplateManagerPage';
import { LabelDesignerView } from '../../views/LabelDesignerView';
import { LabelTemplate } from '../../shared/types';
import { ArrowLeft } from 'lucide-react';

export const DesignerPage: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<LabelTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'manager' | 'designer'>('manager');

  const handleOpenDesigner = (template: LabelTemplate) => {
    setActiveTemplate(template);
    setViewMode('designer');
  };

  const handleBackToManager = () => {
    setViewMode('manager');
  };

  const handleTemplateUpdate = (updatedTemplate: LabelTemplate) => {
    setActiveTemplate(updatedTemplate);
  };

  // Prevent array recreation on every render by memoizing against template ID
  const templatesList = useMemo(
    () => (activeTemplate ? [activeTemplate] : []),
    [activeTemplate?.id]
  );

  if (viewMode === 'designer' && activeTemplate) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToManager}
          className="px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Template Manager
        </button>
        <LabelDesignerView
          templates={templatesList}
          onTemplateUpdate={handleTemplateUpdate}
        />
      </div>
    );
  }

  return <TemplateManagerPage onOpenDesigner={handleOpenDesigner} />;
};


