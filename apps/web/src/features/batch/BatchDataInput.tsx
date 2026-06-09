import { useState, useRef } from 'react';
import { Upload, ClipboardPaste, Table2 } from 'lucide-react';
import { parseCSV, parseClipboardTable, type ParsedCSV } from '@/lib/csv-parser';

type InputMode = 'csv' | 'clipboard' | 'manual';

interface BatchDataInputProps {
  onDataLoaded: (data: ParsedCSV) => void;
  fieldNames: string[]; // template field names for manual mode headers
}

export function BatchDataInput({ onDataLoaded, fieldNames }: BatchDataInputProps) {
  const [mode, setMode] = useState<InputMode>('csv');
  const [clipboardText, setClipboardText] = useState('');
  const [manualHeaders] = useState<string[]>(fieldNames.slice(0, 6)); // limit to first 6 fields
  const [manualRows, setManualRows] = useState<string[][]>([manualHeaders.map(() => '')]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.headers.length > 0 && parsed.rows.length > 0) {
        onDataLoaded(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleClipboardParse = () => {
    if (!clipboardText.trim()) return;
    const parsed = parseClipboardTable(clipboardText);
    if (parsed.headers.length > 0 && parsed.rows.length > 0) {
      onDataLoaded(parsed);
    }
  };

  const handleManualSubmit = () => {
    const filledRows = manualRows.filter(row => row.some(cell => cell.trim() !== ''));
    if (filledRows.length === 0) return;

    const rows = filledRows.map(row => {
      const obj: Record<string, string> = {};
      manualHeaders.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });

    onDataLoaded({
      headers: manualHeaders,
      rows,
      rawRows: filledRows
    });
  };

  const addManualRow = () => {
    setManualRows([...manualRows, manualHeaders.map(() => '')]);
  };

  const updateManualCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = [...manualRows];
    newRows[rowIdx] = [...newRows[rowIdx]];
    newRows[rowIdx][colIdx] = value;
    setManualRows(newRows);
  };

  const removeManualRow = (rowIdx: number) => {
    if (manualRows.length <= 1) return;
    setManualRows(manualRows.filter((_, i) => i !== rowIdx));
  };

  const modes: { key: InputMode; label: string; icon: typeof Upload; desc: string }[] = [
    { key: 'csv', label: 'Upload CSV', icon: Upload, desc: 'Upload file .csv dari komputer' },
    { key: 'clipboard', label: 'Paste Data', icon: ClipboardPaste, desc: 'Paste dari Excel / Google Sheets' },
    { key: 'manual', label: 'Input Manual', icon: Table2, desc: 'Isi tabel langsung di browser' },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              mode === m.key
                ? 'border-accent bg-accent/5 shadow-sm'
                : 'border-border hover:border-accent/40 hover:bg-bg-muted'
            }`}
          >
            <m.icon className={`w-5 h-5 mb-2 ${mode === m.key ? 'text-accent' : 'text-text-muted'}`} />
            <div className={`text-sm font-semibold ${mode === m.key ? 'text-accent' : 'text-text'}`}>{m.label}</div>
            <div className="text-xs text-text-muted mt-1">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* CSV Upload */}
      {mode === 'csv' && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <Upload className="w-10 h-10 mx-auto text-text-muted mb-3" />
            <p className="text-sm font-medium text-text">Klik untuk pilih file CSV</p>
            <p className="text-xs text-text-muted mt-1">Format: .csv dengan header di baris pertama. Separator: koma, titik-koma, atau tab.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleCSVUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Clipboard Paste */}
      {mode === 'clipboard' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text block mb-2">
              Paste data dari Excel / Google Sheets
            </label>
            <textarea
              className="w-full h-48 p-3 border border-border rounded-lg bg-bg text-text text-sm font-mono focus:ring-2 focus:ring-accent outline-none resize-none"
              placeholder={"Nama\tAlamat\tTelepon\nJoko\tJl. Merdeka 1\t08123456789\nSiti\tJl. Sudirman 2\t08198765432"}
              value={clipboardText}
              onChange={(e) => setClipboardText(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">
              Tip: Blok data di Excel → Ctrl+C → Paste di sini. Baris pertama = header kolom.
            </p>
          </div>
          <button
            onClick={handleClipboardParse}
            disabled={!clipboardText.trim()}
            className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Proses Data
          </button>
        </div>
      )}

      {/* Manual Table Input */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-muted border-b border-border">
                  <tr>
                    <th className="p-2 w-10 text-center text-text-muted">#</th>
                    {manualHeaders.map((h, i) => (
                      <th key={i} className="p-2 text-left font-medium text-text-muted text-xs">{h}</th>
                    ))}
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {manualRows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="p-2 text-center text-xs text-text-muted">{rowIdx + 1}</td>
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="p-1">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateManualCell(rowIdx, colIdx, e.target.value)}
                            className="w-full p-1.5 border border-border rounded text-xs bg-bg text-text focus:ring-1 focus:ring-accent outline-none"
                            placeholder="..."
                          />
                        </td>
                      ))}
                      <td className="p-1 text-center">
                        <button
                          onClick={() => removeManualRow(rowIdx)}
                          className="text-danger hover:bg-danger/10 px-1.5 py-0.5 rounded text-xs"
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addManualRow}
              className="w-full p-2 text-xs text-accent font-medium hover:bg-accent/5 border-t border-border"
            >
              + Tambah Baris
            </button>
          </div>
          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Proses Data
          </button>
        </div>
      )}
    </div>
  );
}
