import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import type { TemplateDefinition } from '@cetakdocs/core';
import { db } from '@/lib/db';
import { TemplateCard } from './TemplateCard';
import { Search, Plus, Upload } from 'lucide-react';

export function TemplateGallery() {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customTemplates = useLiveQuery(() => db.customTemplates.toArray()) || [];
  const allTemplates = [...customTemplates, ...BUILT_IN_TEMPLATES];

  const filteredTemplates = allTemplates.filter((template: TemplateDefinition) => 
    template.name.toLowerCase().includes(search.toLowerCase()) || 
    (template.description?.toLowerCase().includes(search.toLowerCase())) ||
    (template.category && template.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const tpl = JSON.parse(ev.target?.result as string);
        
        if (!tpl.name || !tpl.fields || !tpl.layout || !tpl.page) {
          throw new Error('Format berkas template tidak valid.');
        }

        const id = tpl.id || 'tpl_' + Date.now().toString(36);
        const slug = tpl.slug || 'custom-' + Date.now().toString(36);

        await db.customTemplates.add({
          ...tpl,
          id,
          slug,
          source: 'imported',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        alert('Template berhasil diimpor!');
      } catch (err: any) {
        console.error(err);
        alert('Gagal mengimpor template: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Pilih Template Dokumen</h2>
          <p className="text-text-muted mt-1">Pilih dari dokumen yang sudah disiapkan untuk kebutuhan Anda.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 border border-border hover:bg-bg-muted text-text rounded-md text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Impor JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
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
