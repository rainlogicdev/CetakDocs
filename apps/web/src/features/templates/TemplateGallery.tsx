import { useState } from 'react';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { TemplateCard } from './TemplateCard';
import { Search } from 'lucide-react';

export function TemplateGallery() {
  const [search, setSearch] = useState('');
  
  const filteredTemplates = BUILT_IN_TEMPLATES.filter((template: TemplateDefinition) => 
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
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-border rounded-md bg-bg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            placeholder="Cari template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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
    </div>
  );
}
