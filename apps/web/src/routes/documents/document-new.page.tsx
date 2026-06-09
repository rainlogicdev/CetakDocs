import { useParams, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { DocumentComposer } from '@/features/documents/DocumentComposer';
import { db } from '@/lib/db';

export function DocumentNewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  
  // Find in built-in templates first
  const builtInTemplate = BUILT_IN_TEMPLATES.find((t: TemplateDefinition) => t.id === templateId);

  // If not built-in, query customTemplates from Dexie
  const customTemplate = useLiveQuery(
    async () => {
      if (builtInTemplate) return null;
      const t = await db.customTemplates.get(templateId || '');
      return t || null;
    },
    [builtInTemplate, templateId]
  );

  const loading = !builtInTemplate && customTemplate === undefined;

  if (loading) {
    return <div className="text-center py-12 text-text-muted">Memuat template...</div>;
  }

  const template = (builtInTemplate || customTemplate) as TemplateDefinition | null | undefined;
  
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
