import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { templatesApi, type ApiTemplate } from '@/lib/api-client';
import { TemplateCard } from './TemplateCard';
import { Search, Plus, Upload } from 'lucide-react';

export function TemplateGallery() {
  const [search, setSearch] = useState('');
  const [apiTemplates, setApiTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templatesApi.list()
      .then(setApiTemplates)
      .catch(err => {
        console.warn('API tidak tersedia, menggunakan template bawaan saja:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge: API templates take priority, fallback to built-in
  const apiIds = new Set(apiTemplates.map(t => t.id));
  const builtInOnly = BUILT_IN_TEMPLATES.filter((t: TemplateDefinition) => !apiIds.has(t.id));
  
  // Convert API templates to TemplateDefinition shape
  const normalizedApiTemplates: TemplateDefinition[] = apiTemplates.map(t => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    category: t.category,
    description: t.description || '',
    locale: 'id-ID',
    source: t.source as any,
    page: {
      size: (t.page?.size || 'A4') as any,
      orientation: (t.page?.orientation || 'portrait') as any,
      margin: t.page?.margin || '12mm',
    },
    fields: t.fields || [],
  }));

  const allTemplates = [...normalizedApiTemplates, ...builtInOnly];

  const filteredTemplates = allTemplates.filter((template: TemplateDefinition) => 
    template.name.toLowerCase().includes(search.toLowerCase()) || 
    (template.description?.toLowerCase().includes(search.toLowerCase())) ||
    (template.category && template.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Pilih Template Dokumen</h2>
          <p className="text-text-muted mt-1">Pilih dari dokumen yang sudah disiapkan untuk kebutuhan Anda.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/templates/designer/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Template Kustom</span>
          </Link>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-bg w-full focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              placeholder="Cari template..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Memuat template...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template: TemplateDefinition) => (
            <TemplateCard key={template.id} template={template} />
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted border border-dashed border-border rounded-lg">
              Tidak ada template yang cocok dengan pencarian "{search}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
