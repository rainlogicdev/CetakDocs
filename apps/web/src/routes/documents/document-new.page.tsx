import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { DocumentComposer } from '@/features/documents/DocumentComposer';
import { templatesApi, type ApiTemplate } from '@/lib/api-client';

export function DocumentNewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const [apiTemplate, setApiTemplate] = useState<ApiTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Find in built-in templates first
  const builtInTemplate = BUILT_IN_TEMPLATES.find((t: TemplateDefinition) => t.id === templateId);

  useEffect(() => {
    if (builtInTemplate) {
      setLoading(false);
      return;
    }

    // Try to load from API
    templatesApi.list()
      .then(templates => {
        const found = templates.find(t => t.id === templateId);
        if (found) setApiTemplate(found);
      })
      .catch(err => console.error('Gagal memuat template dari API:', err))
      .finally(() => setLoading(false));
  }, [templateId, builtInTemplate]);

  if (loading) {
    return <div className="text-center py-12 text-text-muted">Memuat template...</div>;
  }

  // Build template definition
  let template: TemplateDefinition | null = null;

  if (builtInTemplate) {
    template = builtInTemplate;
  } else if (apiTemplate) {
    template = {
      id: apiTemplate.id,
      slug: apiTemplate.slug,
      name: apiTemplate.name,
      category: apiTemplate.category,
      description: apiTemplate.description || '',
      locale: 'id-ID',
      source: apiTemplate.source as any,
      page: {
        size: (apiTemplate.page?.size || 'A4') as any,
        orientation: (apiTemplate.page?.orientation || 'portrait') as any,
        margin: apiTemplate.page?.margin || '12mm',
      },
      fields: apiTemplate.fields || [],
    };
  }
  
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
