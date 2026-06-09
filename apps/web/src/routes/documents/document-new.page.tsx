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

  // Load defaults from localStorage
  const defaultSize = localStorage.getItem('cetakdocs:default_page_size');
  const defaultOrientation = localStorage.getItem('cetakdocs:default_orientation');

  const modifiedTemplate = {
    ...template,
    page: {
      ...template.page,
      size: (defaultSize as any) || template.page.size,
      orientation: (defaultOrientation as any) || template.page.orientation,
    }
  };

  return (
    <div className="h-full -m-6 flex flex-col">
      <DocumentComposer template={modifiedTemplate} />
    </div>
  );
}
