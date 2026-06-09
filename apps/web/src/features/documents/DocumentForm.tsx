import type { TemplateDefinition, TemplateField } from '@cetakdocs/core';

interface DocumentFormProps {
  template: TemplateDefinition;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function DocumentForm({ template, data, onChange }: DocumentFormProps) {
  
  const handleChange = (name: string, value: any) => {
    onChange({ ...data, [name]: value });
  };

  const renderField = (field: TemplateField) => {
    const value = data[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none min-h-[100px] text-sm"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-2 text-text-muted text-sm">Rp</span>
            <input
              type="number"
              className="w-full pl-9 p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm"
              placeholder={field.placeholder || '0'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value ? Number(e.target.value) : '')}
            />
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
      case 'table':
        const tableData = Array.isArray(value) ? value : [];
        return (
          <div className="border border-border rounded-md overflow-hidden bg-bg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg-muted border-b border-border">
                  <tr>
                    {field.columns?.map(col => (
                      <th key={col.name} className="p-2 font-medium text-text-muted">{col.label}</th>
                    ))}
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {field.columns?.map(col => (
                        <td key={col.name} className="p-2">
                          <input
                            type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                            className="w-full p-1.5 border border-border rounded bg-bg text-text text-xs focus:ring-1 focus:ring-accent outline-none"
                            value={row[col.name] || ''}
                            onChange={(e) => {
                              const newData = [...tableData];
                              newData[rowIdx] = { 
                                ...newData[rowIdx], 
                                [col.name]: col.type === 'number' || col.type === 'currency' 
                                  ? (e.target.value === '' ? '' : Number(e.target.value)) 
                                  : e.target.value 
                              };
                              handleChange(field.name, newData);
                            }}
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center">
                        <button 
                          type="button"
                          onClick={() => {
                            const newData = tableData.filter((_, i) => i !== rowIdx);
                            handleChange(field.name, newData);
                          }}
                          className="text-danger hover:bg-danger/10 px-2 py-1 rounded"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => {
                const newRow: Record<string, any> = {};
                field.columns?.forEach(c => newRow[c.name] = '');
                handleChange(field.name, [...tableData, newRow]);
              }}
              className="w-full p-2 text-xs text-accent font-medium hover:bg-accent/5 flex items-center justify-center gap-1 border-t border-border"
            >
              + Tambah Baris
            </button>
          </div>
        );
      case 'stringList': {
        const listData: string[] = Array.isArray(value) ? value : [];
        return (
          <div className="border border-border rounded-md overflow-hidden bg-bg">
            <div className="divide-y divide-border">
              {listData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2">
                  <span className="text-xs text-text-muted font-mono w-6 text-right shrink-0">{idx + 1}.</span>
                  <input
                    type="text"
                    className="flex-1 p-1.5 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                    placeholder={field.itemPlaceholder || `Item ${idx + 1}`}
                    value={item}
                    onChange={(e) => {
                      const newList = [...listData];
                      newList[idx] = e.target.value;
                      handleChange(field.name, newList);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newList = listData.filter((_, i) => i !== idx);
                      handleChange(field.name, newList);
                    }}
                    className="text-danger hover:bg-danger/10 px-2 py-1 rounded text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleChange(field.name, [...listData, ''])}
              className="w-full p-2 text-xs text-accent font-medium hover:bg-accent/5 flex items-center justify-center gap-1 border-t border-border"
            >
              + Tambah Item
            </button>
          </div>
        );
      }
      default: // text
        return (
          <input
            type="text"
            className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {template.fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">
            {field.label} {field.required && <span className="text-danger">*</span>}
          </label>
          {renderField(field)}
          {field.helpText && (
            <p className="text-xs text-text-muted">{field.helpText}</p>
          )}
        </div>
      ))}
    </div>
  );
}
