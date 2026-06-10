import { ArrowLeft, Save, Printer, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TemplateDefinition } from '@cetakdocs/core';

interface DocumentToolbarProps {
  template: TemplateDefinition;
  onSaveDraft: () => void;
  onDownloadPdf?: () => void;
  title: string;
  setTitle: (t: string) => void;
}

export function DocumentToolbar({ template, onSaveDraft, onDownloadPdf, title, setTitle }: DocumentToolbarProps) {
  return (
    <div className="h-16 border-b border-border bg-bg px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-text-muted hover:text-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="hidden md:block">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="font-bold text-text bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-accent rounded px-1 -ml-1"
          />
          <div className="text-xs text-text-muted flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            Belum disimpan
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onSaveDraft}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-muted text-text-muted transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          <span className="hidden md:inline">Simpan Draft</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden md:inline">Cetak</span>
        </button>
        <button 
          onClick={onDownloadPdf}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-bg-muted text-text transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Unduh PDF</span>
        </button>
      </div>
    </div>
  );
}
