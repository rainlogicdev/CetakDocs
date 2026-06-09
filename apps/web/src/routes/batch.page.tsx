import { useParams, Navigate } from 'react-router-dom';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { BatchComposer } from '@/features/batch/BatchComposer';

export function BatchPage() {
  const { templateId } = useParams<{ templateId: string }>();

  const template = BUILT_IN_TEMPLATES.find((t: TemplateDefinition) => t.id === templateId);

  if (!template) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-full -m-6 flex flex-col">
      <BatchComposer template={template} />
    </div>
  );
}
