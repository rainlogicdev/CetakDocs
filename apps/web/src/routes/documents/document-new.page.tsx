import { useParams, Navigate } from 'react-router-dom';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { DocumentComposer } from '@/features/documents/DocumentComposer';

export function DocumentNewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  
  const template = BUILT_IN_TEMPLATES.find((t: TemplateDefinition) => t.id === templateId);
  
  if (!template) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-full -m-6 flex flex-col">
      <DocumentComposer template={template} />
    </div>
  );
}
