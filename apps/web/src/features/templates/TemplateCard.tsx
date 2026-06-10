import { Link } from 'react-router-dom';
import { FileText, Layers, Edit2, Trash2 } from 'lucide-react';
import type { TemplateDefinition } from '@cetakdocs/core';

interface TemplateCardProps {
  template: TemplateDefinition;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const isCustom = template.source === 'custom' || template.source === 'imported';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col premium-shadow premium-shadow-hover relative overflow-hidden group">
      {/* Decorative colored glow bar at the top */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-bold text-base text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={template.name}>
          {template.name}
        </h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="bg-slate-50 text-slate-500 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border border-slate-100/60">
            {template.category || 'Umum'}
          </span>
          {isCustom && (
            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100/50">
              Kustom
            </span>
          )}
        </div>
      </div>
      
      <p className="text-slate-500 text-xs leading-relaxed mb-5 flex-1 line-clamp-2">
        {template.description || 'Tidak ada deskripsi.'}
      </p>
      
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-5 border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{template.page.size === 'custom' ? 'Ukuran Khusus' : template.page.size} ({template.page.orientation})</span>
        </div>
        {isCustom && (
          <div className="flex gap-2">
            <Link
              to={`/templates/designer/${template.id}`}
              className="p-1 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors"
              title="Edit Desain"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Link 
          to={`/documents/new/${template.id}`}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 rounded-xl font-bold text-xs shadow-sm shadow-indigo-100 group-hover:shadow-md transition-all duration-200"
        >
          Pakai Template
        </Link>
        <Link
          to={`/batch/${template.id}`}
          className="px-3 py-2 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-indigo-50/20 transition-all duration-200 flex items-center justify-center gap-1 text-xs font-semibold"
          title="Cetak Massal"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Batch</span>
        </Link>
      </div>
    </div>
  );
}
