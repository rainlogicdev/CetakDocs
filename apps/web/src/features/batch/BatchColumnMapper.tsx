import { useMemo } from 'react';
import type { TemplateField } from '@cetakdocs/core';
import { ArrowRight } from 'lucide-react';

interface BatchColumnMapperProps {
  sourceHeaders: string[];
  templateFields: TemplateField[];
  mapping: Record<string, string>; // templateFieldName -> sourceHeader
  onMappingChange: (mapping: Record<string, string>) => void;
  sampleRow?: Record<string, string>;
}

export function BatchColumnMapper({
  sourceHeaders,
  templateFields,
  mapping,
  onMappingChange,
  sampleRow
}: BatchColumnMapperProps) {
  // Only map simple fields (not table, not stringList for now)
  const mappableFields = useMemo(() =>
    templateFields.filter(f => 
      f.type !== 'table' && f.type !== 'stringList' && f.type !== 'imageUpload'
    ),
    [templateFields]
  );

  const handleChange = (fieldName: string, sourceCol: string) => {
    const newMapping = { ...mapping };
    if (sourceCol === '') {
      delete newMapping[fieldName];
    } else {
      newMapping[fieldName] = sourceCol;
    }
    onMappingChange(newMapping);
  };

  // Auto-map: try to match by similar names
  const autoMap = () => {
    const newMapping: Record<string, string> = {};
    for (const field of mappableFields) {
      const fieldLower = field.name.toLowerCase();
      const labelLower = field.label.toLowerCase();
      
      const match = sourceHeaders.find(h => {
        const hLower = h.toLowerCase();
        return hLower === fieldLower || 
               hLower === labelLower ||
               hLower.includes(fieldLower) || 
               fieldLower.includes(hLower) ||
               hLower.includes(labelLower) ||
               labelLower.includes(hLower);
      });
      
      if (match) {
        newMapping[field.name] = match;
      }
    }
    onMappingChange(newMapping);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Petakan Kolom Data</h3>
          <p className="text-xs text-text-muted mt-0.5">Hubungkan kolom data Anda dengan field template.</p>
        </div>
        <button
          onClick={autoMap}
          className="px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-md hover:bg-accent/5 transition-colors"
        >
          ✨ Auto-Map
        </button>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
        {mappableFields.map(field => {
          const selectedSource = mapping[field.name] || '';
          const previewValue = selectedSource && sampleRow ? sampleRow[selectedSource] : '';

          return (
            <div key={field.name} className="flex items-center gap-3 p-3 hover:bg-bg-muted/50 transition-colors">
              {/* Template field */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text truncate">
                  {field.label}
                  {field.required && <span className="text-danger ml-1">*</span>}
                </div>
                <div className="text-xs text-text-muted">{field.type}</div>
              </div>

              <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />

              {/* Source column selector */}
              <div className="flex-1 min-w-0">
                <select
                  value={selectedSource}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full p-2 text-sm border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value="">— Tidak dipetakan —</option>
                  {sourceHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                {previewValue && (
                  <div className="text-xs text-accent mt-1 truncate" title={previewValue}>
                    Contoh: {previewValue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
