import { Link } from 'react-router-dom';
import { FileText, Layers } from 'lucide-react';
import type { TemplateDefinition } from '@cetakdocs/core';

interface TemplateCardProps {
  template: TemplateDefinition;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="bg-bg border border-border rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg text-text">{template.name}</h3>
        <span className="bg-bg-muted text-text-muted text-xs px-2 py-1 rounded-full border border-border">
          {template.category || 'Umum'}
        </span>
      </div>
      
      <p className="text-text-muted text-sm mb-6 flex-1 line-clamp-2">
        {template.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-text-muted mb-4">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{template.page.size === 'custom' ? 'Ukuran Khusus' : template.page.size}</span>
        </div>
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
