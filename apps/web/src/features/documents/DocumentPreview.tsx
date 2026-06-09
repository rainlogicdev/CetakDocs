import { useMemo, useState, useEffect, useRef } from 'react';
import type { TemplateDefinition } from '@cetakdocs/core';
import { renderDocumentHtml } from '@cetakdocs/renderer';

interface DocumentPreviewProps {
  template: TemplateDefinition;
  data: Record<string, any>;
  orgName?: string;
  docNumber?: string;
}

export function DocumentPreview({ template, data, orgName = '', docNumber = 'PREVIEW' }: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Determine page dimensions in pixels
  const pageWidthPx = useMemo(() => {
    const size = template.page.size;
    const isLandscape = template.page.orientation === 'landscape';
    if (size === 'A4') return isLandscape ? 1123 : 794;
    if (size === 'A5') return isLandscape ? 794 : 559;
    if (size === 'thermal-80mm') return 302;
    if (size === 'thermal-58mm') return 219;
    return 794;
  }, [template.page.size, template.page.orientation]);

  const pageHeightPx = useMemo(() => {
    const size = template.page.size;
    const isLandscape = template.page.orientation === 'landscape';
    if (size === 'A4') return isLandscape ? 794 : 1123;
    if (size === 'A5') return isLandscape ? 559 : 794;
    if (size === 'thermal-80mm') return null; // Dynamic height
    if (size === 'thermal-58mm') return null; // Dynamic height
    return 1123;
  }, [template.page.size, template.page.orientation]);

  // Handle dynamic responsive scale recalculation
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      if (!parentWidth) return;
      
      const padding = 32; // Total padding on left/right
      const availableWidth = parentWidth - padding;
      
      if (availableWidth < pageWidthPx) {
        setScale(availableWidth / pageWidthPx);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Tiny timeout to let CSS layouts resolve their widths
    const timer = setTimeout(handleResize, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [pageWidthPx]);

  // Generate the full HTML document using the shared renderer
  const renderedHtml = useMemo(() => {
    return renderDocumentHtml(template, data, orgName, docNumber);
  }, [template, data, orgName, docNumber]);

  // Extract only the body content and styles from the full HTML
  const { styles, bodyContent } = useMemo(() => {
    const styleMatch = renderedHtml.match(/<style>([\s\S]*?)<\/style>/);
    const bodyMatch = renderedHtml.match(/<body>([\s\S]*?)<\/body>/);
    return {
      styles: styleMatch ? styleMatch[1] : '',
      bodyContent: bodyMatch ? bodyMatch[1] : ''
    };
  }, [renderedHtml]);

  return (
    <div ref={containerRef} className="w-full flex justify-center p-4 print:p-0 print:block overflow-hidden">
      <div
        className="flex justify-center items-start print:block"
        style={{
          width: `${pageWidthPx * scale}px`,
          height: pageHeightPx ? `${pageHeightPx * scale}px` : 'auto',
          overflow: 'hidden'
        }}
      >
        <div 
          className="bg-white shadow-xl relative transition-transform print:scale-100 print:shadow-none print:w-full print:h-auto print:min-h-0"
          style={{ 
            width: template.page.size === 'A4' ? '210mm' :
                   template.page.size === 'A5' 
                     ? (template.page.orientation === 'landscape' ? '210mm' : '148mm')
                   : '210mm',
            minHeight: template.page.size === 'A4' ? '297mm' :
                       template.page.size === 'A5'
                         ? (template.page.orientation === 'landscape' ? '148mm' : '210mm')
                       : '297mm',
            padding: template.page.margin,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
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
    </div>
  );
}
