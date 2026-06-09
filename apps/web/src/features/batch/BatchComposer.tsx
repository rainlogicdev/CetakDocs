import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { TemplateDefinition } from '@cetakdocs/core';
import { renderDocumentHtml } from '@cetakdocs/renderer';
import { ArrowLeft, Printer, FileDown, ChevronRight } from 'lucide-react';
import { BatchDataInput } from './BatchDataInput';
import { BatchColumnMapper } from './BatchColumnMapper';
import { BatchPreview } from './BatchPreview';
import type { ParsedCSV } from '@/lib/csv-parser';

type BatchStep = 'input' | 'map' | 'preview';

interface BatchComposerProps {
  template: TemplateDefinition;
}

export function BatchComposer({ template }: BatchComposerProps) {
  const [step, setStep] = useState<BatchStep>('input');
  const [rawData, setRawData] = useState<ParsedCSV | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Field names for manual mode
  const fieldNames = useMemo(() =>
    template.fields
      .filter(f => f.type !== 'table' && f.type !== 'stringList' && f.type !== 'imageUpload')
      .map(f => f.label),
    [template]
  );

  const handleDataLoaded = useCallback((data: ParsedCSV) => {
    setRawData(data);
    setStep('map');
  }, []);

  // Apply mapping to generate document data objects
  const mappedDocuments = useMemo(() => {
    if (!rawData || !mapping) return [];
    return rawData.rows.map(row => {
      const docData: Record<string, any> = {};
      for (const [fieldName, sourceCol] of Object.entries(mapping)) {
        const field = template.fields.find(f => f.name === fieldName);
        let val: any = row[sourceCol] || '';

        // Type conversion
        if (field) {
          if (field.type === 'currency' || field.type === 'number') {
            const num = parseFloat(val.replace(/[^\d.-]/g, ''));
            val = isNaN(num) ? 0 : num;
          }
        }
        docData[fieldName] = val;
      }
      return docData;
    });
  }, [rawData, mapping, template]);

  // Print all documents
  const handlePrintAll = useCallback(() => {
    const pages = mappedDocuments.map((data, idx) =>
      renderDocumentHtml(template, data, '', `BATCH-${idx + 1}`)
    );

    // Combine into a single multi-page HTML document
    const allStyles = pages[0]?.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
    const bodies = pages.map(html => {
      const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
      return bodyMatch ? bodyMatch[1] : '';
    });

    const combinedHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Batch - ${template.name}</title>
  <style>
    ${allStyles}
    .page-break { page-break-after: always; }
    .page-break:last-child { page-break-after: auto; }
    @media print {
      body { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>
  ${bodies.map((body, i) => `<div class="document-container page-break">${body}</div>`).join('\n')}
</body>
</html>`;

    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(combinedHtml);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [mappedDocuments, template]);

  // Download as individual HTML files (ZIP would require additional library)
  const handleDownloadAll = useCallback(() => {
    const pages = mappedDocuments.map((data, idx) =>
      renderDocumentHtml(template, data, '', `BATCH-${idx + 1}`)
    );

    // Create multi-page HTML for download
    const allStyles = pages[0]?.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
    const bodies = pages.map(html => {
      const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
      return bodyMatch ? bodyMatch[1] : '';
    });

    const combinedHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Batch - ${template.name}</title>
  <style>
    ${allStyles}
    .page-break { page-break-after: always; }
    .page-break:last-child { page-break-after: auto; }
    @media print { body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  ${bodies.map(body => `<div class="document-container page-break">${body}</div>`).join('\n')}
</body>
</html>`;

    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${template.slug}-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mappedDocuments, template]);

  const stepLabels: Record<BatchStep, string> = {
    input: '1. Input Data',
    map: '2. Petakan Kolom',
    preview: '3. Preview & Cetak'
  };

  const requiredFieldsMapped = useMemo(() => {
    const requiredFields = template.fields.filter(f => f.required && f.type !== 'table' && f.type !== 'stringList');
    return requiredFields.every(f => mapping[f.name]);
  }, [template, mapping]);

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Toolbar */}
      <div className="h-16 border-b border-border bg-bg px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="font-bold text-text">Batch: {template.name}</div>
            <div className="text-xs text-text-muted flex items-center gap-1">
              {rawData && <span>{rawData.rows.length} baris data</span>}
              {!rawData && <span>Cetak massal dari data</span>}
            </div>
          </div>
        </div>

        {step === 'preview' && mappedDocuments.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-bg-muted text-text transition-colors text-sm font-medium"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden md:inline">Unduh HTML</span>
            </button>
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Cetak Semua ({mappedDocuments.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="border-b border-border bg-bg-muted px-6 py-3">
        <div className="flex items-center gap-2 text-sm max-w-3xl mx-auto">
          {(['input', 'map', 'preview'] as BatchStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s === 'input') setStep('input');
                  if (s === 'map' && rawData) setStep('map');
                  if (s === 'preview' && rawData && requiredFieldsMapped) setStep('preview');
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  step === s
                    ? 'bg-accent text-white'
                    : s === 'input' || (s === 'map' && rawData) || (s === 'preview' && rawData && requiredFieldsMapped)
                      ? 'bg-border/50 text-text-muted hover:bg-border'
                      : 'bg-border/20 text-text-muted/50 cursor-not-allowed'
                }`}
              >
                {stepLabels[s]}
              </button>
              {i < 2 && <ChevronRight className="w-3 h-3 text-text-muted" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {step === 'input' && (
            <BatchDataInput
              onDataLoaded={handleDataLoaded}
              fieldNames={fieldNames}
            />
          )}

          {step === 'map' && rawData && (
            <div className="space-y-6">
              <BatchColumnMapper
                sourceHeaders={rawData.headers}
                templateFields={template.fields}
                mapping={mapping}
                onMappingChange={setMapping}
                sampleRow={rawData.rows[0]}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!requiredFieldsMapped}
                  className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Lanjut ke Preview →
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <div className="text-sm font-medium text-accent">
                  ✅ {mappedDocuments.length} dokumen siap dicetak
                </div>
                <div className="text-xs text-text-muted mt-1">
                  Gunakan navigator di bawah untuk memeriksa dokumen satu per satu, lalu klik "Cetak Semua" di atas.
                </div>
              </div>

              <BatchPreview
                template={template}
                documents={mappedDocuments}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('map')}
                  className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
                >
                  ← Ubah Mapping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
