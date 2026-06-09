import { useMemo } from 'react';
import type { TemplateDefinition } from '@cetakdocs/core';
import { renderDocumentHtml } from '@cetakdocs/renderer';

interface DocumentPreviewProps {
  template: TemplateDefinition;
  data: Record<string, any>;
  orgName?: string;
  docNumber?: string;
}

export function DocumentPreview({ template, data, orgName = '', docNumber = 'PREVIEW' }: DocumentPreviewProps) {
  // Generate the full HTML document using the shared renderer
  // This guarantees preview matches print/PDF output exactly
  const renderedHtml = useMemo(() => {
    return renderDocumentHtml(template, data, orgName, docNumber);
  }, [template, data, orgName, docNumber]);

  // Extract only the body content and styles from the full HTML
  // We need styles for proper rendering but don't want nested <html>/<body>
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

  return (
    <div className="flex flex-col items-center w-full print:block print:w-auto">
      <div 
        className={`bg-white shadow-xl ${pageSizeClass} relative origin-top scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 transition-transform print:scale-100 print:shadow-none print:w-full print:h-auto print:min-h-0`}
        style={{ padding: template.page.margin }}
      >
        {/* Scoped styles from the renderer */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        
        {/* Render the document body content from the shared renderer */}
        <div 
          className="font-doc-sans text-black print-page w-full h-full"
          dangerouslySetInnerHTML={{ __html: bodyContent }} 
        />

        {(!template.layout || !template.layout.blocks) && (
          <div className="text-center text-gray-400 py-20 flex items-center justify-center h-full">
            Template ini belum memiliki definisi layout cetak.
          </div>
        )}
      </div>
    </div>
  );
}
