import { useMemo, useState } from 'react';
import type { TemplateDefinition } from '@cetakdocs/core';
import { renderDocumentHtml } from '@cetakdocs/renderer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BatchPreviewProps {
  template: TemplateDefinition;
  documents: Record<string, any>[];
}

export function BatchPreview({ template, documents }: BatchPreviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const maxPreview = Math.min(documents.length, 50);
  const current = documents[currentIdx];

  const renderedHtml = useMemo(() => {
    if (!current) return '';
    return renderDocumentHtml(template, current, '', `BATCH-${currentIdx + 1}`);
  }, [template, current, currentIdx]);

  const { styles, bodyContent } = useMemo(() => {
    const styleMatch = renderedHtml.match(/<style>([\s\S]*?)<\/style>/);
    const bodyMatch = renderedHtml.match(/<body>([\s\S]*?)<\/body>/);
    return {
      styles: styleMatch ? styleMatch[1] : '',
      bodyContent: bodyMatch ? bodyMatch[1] : ''
    };
  }, [renderedHtml]);

  const pageSizeClass = template.page.size === 'A4' ? 'w-[210mm] min-h-[297mm]' :
                        template.page.size === 'A5'
                          ? (template.page.orientation === 'landscape' ? 'w-[210mm] min-h-[148mm]' : 'w-[148mm] min-h-[210mm]')
                        : 'w-[210mm] min-h-[297mm]';

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        Tidak ada data untuk di-preview.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigator */}
      <div className="flex items-center justify-between bg-bg-muted rounded-lg p-3">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="p-1.5 rounded-md hover:bg-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-medium text-text">
          Dokumen <span className="text-accent">{currentIdx + 1}</span> dari <span className="text-accent">{maxPreview}</span>
          {documents.length > maxPreview && (
            <span className="text-text-muted ml-1">(total: {documents.length})</span>
          )}
        </div>
        <button
          onClick={() => setCurrentIdx(Math.min(maxPreview - 1, currentIdx + 1))}
          disabled={currentIdx >= maxPreview - 1}
          className="p-1.5 rounded-md hover:bg-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Document Preview */}
      <div className="flex justify-center overflow-auto bg-bg-muted rounded-lg p-4">
        <div
          className={`bg-white shadow-xl ${pageSizeClass} relative origin-top scale-[0.55] sm:scale-[0.65] md:scale-75 lg:scale-90 transition-transform`}
          style={{ padding: template.page.margin }}
        >
          <style dangerouslySetInnerHTML={{ __html: styles }} />
          <div
            className="font-doc-sans text-black print-page w-full h-full"
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />
        </div>
      </div>
    </div>
  );
}
