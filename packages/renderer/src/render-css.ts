export function getBaseDocumentStyles(): string {
  return `
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background: white;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .document-container {
      width: 100%;
      box-sizing: border-box;
    }

    /* Typography */
    h1.document-title, h2.document-title, h3.document-title, h4.document-title {
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #111827;
      letter-spacing: 0.5px;
    }
    
    h1.document-title.level-1 {
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    h2.document-title.level-2 {
      font-size: 16px;
      margin-top: 15px;
      text-transform: uppercase;
    }
    
    h3.document-title.level-3 {
      font-size: 14px;
      margin-top: 12px;
    }
    
    h4.document-title.level-4 {
      font-size: 12px;
      margin-top: 10px;
      font-style: italic;
    }
    
    .divider {
      border: 0;
      border-top: 2px solid #374151;
      margin: 15px 0;
    }

    /* Info and field rows */
    .field-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .field-label {
      width: 160px;
      font-weight: 600;
      color: #4b5563;
    }

    .field-separator {
      width: 15px;
      color: #9ca3af;
    }

    .field-value {
      flex: 1;
      color: #1f2937;
    }

    .field-value-currency {
      font-weight: bold;
      font-size: 15px;
    }

    .terbilang-text {
      font-style: italic;
      color: #6b7280;
      font-size: 13px;
      margin-top: 2px;
    }

    /* Tables */
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 14px;
    }

    table.items-table th {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      font-weight: 600;
      text-align: left;
      color: #374151;
    }

    table.items-table td {
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      color: #4b5563;
    }

    table.items-table tr:nth-child(even) {
      background-color: #f9fafb;
    }

    /* Signature Section */
    .signature-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      page-break-inside: avoid;
    }

    .signature-block {
      text-align: center;
      width: 220px;
      font-size: 14px;
    }

    .signature-date {
      color: #4b5563;
      margin-bottom: 50px;
    }

    .signature-line {
      border-bottom: 1px solid #1f2937;
      margin: 0 auto 5px auto;
      width: 180px;
    }

    .signature-name {
      font-weight: bold;
      color: #111827;
    }

    .signature-role {
      font-size: 12px;
      color: #6b7280;
    }

    /* Highlight box (like currency box) */
    .currency-highlight-box {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
      margin-top: 10px;
      color: #111827;
    }

    .spacer {
      width: 100%;
    }

    /* Paragraph — standard document text */
    p.doc-paragraph {
      font-size: 14px;
      line-height: 1.7;
      margin: 0 0 8px 0;
      color: #1f2937;
    }

    /* Checklist — dynamic checkbox items */
    .checklist-container {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }

    .checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    .checklist-box {
      width: 15px;
      height: 15px;
      min-width: 15px;
      border: 1.5px solid #374151;
      display: inline-block;
      margin-top: 2px;
    }

    .checklist-box.checked {
      background-color: #374151;
      position: relative;
    }

    .checklist-box.checked::after {
      content: '✓';
      color: white;
      font-size: 11px;
      position: absolute;
      top: -1px;
      left: 2px;
    }

    /* Numbered List — dynamic ordered items */
    ol.numbered-list {
      padding-left: 24px;
      margin: 10px 0;
    }

    ol.numbered-list li {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    /* Signature Row — multiple signatures displayed horizontally */
    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      page-break-inside: avoid;
    }

    .signature-row .signature-block {
      width: auto;
      min-width: 160px;
      flex: 1;
      max-width: 240px;
    }

    /* Column Layout — multi-column content */
    .column-layout {
      display: flex;
      gap: 20px;
      margin: 10px 0;
    }

    .column-layout > .column {
      flex: 1;
    }
  `;
}
