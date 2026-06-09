import { Link } from 'react-router-dom';
import { FileText, Layers, Edit2, Trash2 } from 'lucide-react';
import type { TemplateDefinition } from '@cetakdocs/core';
import { db } from '@/lib/db';

interface TemplateCardProps {
  template: TemplateDefinition;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const isCustom = template.source === 'custom' || template.source === 'imported';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Apakah Anda yakin ingin menghapus template "${template.name}"?`)) {
      try {
        await db.customTemplates.delete(template.id);
      } catch (err) {
        console.error('Failed to delete template:', err);
        alert('Gagal menghapus template.');
      }
    }
  };

  return (
    <div className="bg-bg border border-border rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-bold text-lg text-text line-clamp-1" title={template.name}>{template.name}</h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="bg-bg-muted text-text-muted text-xs px-2 py-0.5 rounded-full border border-border capitalize">
            {template.category || 'Umum'}
          </span>
          {isCustom && (
            <span className="bg-accent/10 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded border border-accent/20">
              Kustom
            </span>
          )}
        </div>
      </div>
      
      <p className="text-text-muted text-sm mb-4 flex-1 line-clamp-2">
        {template.description || 'Tidak ada deskripsi.'}
      </p>
      
      <div className="flex items-center justify-between text-xs text-text-muted mb-4">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{template.page.size === 'custom' ? 'Ukuran Khusus' : template.page.size} ({template.page.orientation})</span>
        </div>
        {isCustom && (
          <div className="flex gap-2">
            <Link
              to={`/templates/designer/${template.id}`}
              className="p-1 hover:text-accent rounded transition-colors"
              title="Edit Desain"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-1 hover:text-danger rounded transition-colors"
              title="Hapus Template"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Link 
          to={`/documents/new/${template.id}`}
          className="flex-1 bg-accent text-white text-center py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Pakai Template
        </Link>
        <Link
          to={`/batch/${template.id}`}
          className="px-3 py-2 border border-accent/30 text-accent rounded-md hover:bg-accent/5 transition-colors flex items-center gap-1 text-sm font-medium"
          title="Cetak Massal"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden xl:inline">Batch</span>
        </Link>
      </div>
    </div>
  );
}
