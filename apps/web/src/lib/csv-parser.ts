/**
 * Simple CSV parser for batch document processing.
 * Handles quoted fields, newlines in quotes, and common edge cases.
 */

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

export function parseCSV(text: string): ParsedCSV {
  const lines = splitCSVLines(text.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  const rawRows = lines.map(line => parseCSVLine(line));
  const headers = rawRows[0].map(h => h.trim());
  const dataRows = rawRows.slice(1).filter(row => row.some(cell => cell.trim() !== ''));

  const rows = dataRows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx]?.trim() || '';
    });
    return obj;
  });

  return { headers, rows, rawRows: dataRows };
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++; // skip \r\n
      if (current.trim()) lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

/**
 * Convert tab-separated clipboard data (from Excel/Sheets) to parsed format.
 */
export function parseClipboardTable(text: string): ParsedCSV {
  // Clipboard from Excel/Sheets typically uses tabs
  const normalized = text.replace(/\t/g, ',');
  return parseCSV(normalized);
}

/**
 * Generate CSV string from rows (for export).
 */
export function generateCSV(headers: string[], rows: Record<string, string>[]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h] || '')).join(','))
  ];
  return lines.join('\n');
}
