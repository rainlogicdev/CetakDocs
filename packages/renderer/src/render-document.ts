import { TemplateDefinition, LayoutBlock, formatRupiah, terbilangRupiah, formatDateIndonesian } from '@cetakdocs/core';
import { getBaseDocumentStyles } from './render-css';
import { getPageSizeCss } from './page-sizes';
import { escapeHtml } from './escape-html';

export function substituteVariables(
  text: string,
  data: Record<string, any>,
  template: TemplateDefinition,
  orgName = '',
  docNumber = ''
): string {
  if (!text) return '';

  return text.replace(/\{\{([a-zA-Z0-9_\.]+)\}\}/g, (match, path) => {
    if (path === 'documentNumber' || path === 'docNumber') {
      return escapeHtml(docNumber || 'DRAFT');
    }
    if (path === 'org.name') {
      return escapeHtml(orgName || '');
    }
    
    // Check if path exists in form data
    const val = data[path];
    if (val === undefined || val === null) {
      return '';
    }

    // Find if there is a corresponding field definition for special formatting
    const field = template.fields.find((f) => f.name === path);

    if (field) {
      if (field.type === 'currency' && typeof val === 'number') {
        const rupiah = formatRupiah(val);
        const terbilangStr = terbilangRupiah(val);
        return `${rupiah} <div class="terbilang-text"># ${terbilangStr} #</div>`;
      }
      if (field.type === 'date') {
        return formatDateIndonesian(val);
      }
    }

    return escapeHtml(String(val));
  });
}

/**
 * Renders a single layout block to HTML.
 * Extracted as a separate function to support recursive rendering (e.g., columnLayout).
 */
function renderBlock(
  block: LayoutBlock,
  data: Record<string, any>,
  template: TemplateDefinition,
  orgName: string,
  docNumber: string
): string {
  const sub = (text: string) => substituteVariables(text, data, template, orgName, docNumber);

  if (block.type === 'heading') {
    const headingText = sub(block.text || '');
    return `<h1 class="document-title" style="text-align: ${block.align || 'center'}">${headingText}</h1>`;

  } else if (block.type === 'divider') {
    return `<hr class="divider" />`;

  } else if (block.type === 'spacer') {
    return `<div class="spacer" style="height: ${block.height || '10px'}"></div>`;

  } else if (block.type === 'paragraph') {
    const paraText = sub(block.text || block.value || '');
    const alignStyle = block.align ? ` style="text-align: ${block.align}"` : '';
    return `<p class="doc-paragraph"${alignStyle}>${paraText}</p>`;

  } else if (block.type === 'fieldRow') {
    const label = block.label || '';
    const valText = sub(block.value || '');
    return `
      <div class="field-row">
        <div class="field-label">${label}</div>
        <div class="field-separator">:</div>
        <div class="field-value">${valText}</div>
      </div>
    `;

  } else if (block.type === 'signature') {
    const dateStr = sub(block.label || '');
    const nameStr = sub(block.value || '');
    const roleStr = sub(block.role || '');
    return `
      <div class="signature-container">
        <div class="signature-block">
          <div class="signature-date">${dateStr}</div>
          <div class="signature-line"></div>
          <div class="signature-name">${nameStr}</div>
          <div class="signature-role">${roleStr}</div>
        </div>
      </div>
    `;

  } else if (block.type === 'signatureRow') {
    const sigs = block.signatures || [];
    if (sigs.length === 0) return '';
    let inner = '';
    for (const sig of sigs) {
      const dateStr = sub(sig.label || '');
      const nameStr = sub(sig.value || '');
      const roleStr = sub(sig.role || '');
      inner += `
        <div class="signature-block">
          <div class="signature-date">${dateStr}</div>
          <div class="signature-line"></div>
          <div class="signature-name">${nameStr}</div>
          <div class="signature-role">${roleStr}</div>
        </div>
      `;
    }
    return `<div class="signature-row">${inner}</div>`;

  } else if (block.type === 'table') {
    const tableName = block.name || '';
    const rows = data[tableName] || [];
    const columns = block.columns || [];
    
    let html = `<table class="items-table"><thead><tr>`;
    for (const col of columns) {
      html += `<th>${col.label}</th>`;
    }
    html += `</tr></thead><tbody>`;
    
    if (!rows || rows.length === 0) {
      html += `<tr><td colspan="${columns.length}" style="text-align: center;">Belum ada data barang</td></tr>`;
    } else {
      for (const row of rows) {
        html += `<tr>`;
        for (const col of columns) {
          let val = row[col.name];
          if (val === undefined || val === null) val = '';
          if (col.type === 'currency' && typeof val === 'number') {
            val = formatRupiah(val);
          } else {
            val = escapeHtml(String(val));
          }
          html += `<td>${val}</td>`;
        }
        html += `</tr>`;
      }
    }
    html += `</tbody></table>`;
    return html;

  } else if (block.type === 'checklist') {
    const fieldName = block.field || '';
    const items: string[] = Array.isArray(data[fieldName]) ? data[fieldName] : [];
    if (items.length === 0) {
      return `<ul class="checklist-container"><li class="checklist-item"><span class="checklist-box"></span><span>Belum ada item</span></li></ul>`;
    }
    let html = `<ul class="checklist-container">`;
    for (const item of items) {
      html += `<li class="checklist-item"><span class="checklist-box"></span><span>${escapeHtml(item)}</span></li>`;
    }
    html += `</ul>`;
    return html;

  } else if (block.type === 'numberedList') {
    const fieldName = block.field || '';
    const items: string[] = Array.isArray(data[fieldName]) ? data[fieldName] : [];
    if (items.length === 0) {
      return `<ol class="numbered-list"><li>Belum ada item</li></ol>`;
    }
    let html = `<ol class="numbered-list">`;
    for (const item of items) {
      html += `<li>${escapeHtml(item)}</li>`;
    }
    html += `</ol>`;
    return html;

  } else if (block.type === 'columnLayout') {
    const cols = block.columnsLayout || [];
    if (cols.length === 0) return '';
    let html = `<div class="column-layout">`;
    for (const col of cols) {
      const widthStyle = col.width ? ` style="flex: 0 0 ${col.width}"` : '';
      html += `<div class="column"${widthStyle}>`;
      for (const innerBlock of col.blocks) {
        html += renderBlock(innerBlock, data, template, orgName, docNumber);
      }
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  return '';
}

export function renderDocumentHtml(
  template: TemplateDefinition,
  data: Record<string, any>,
  orgName = '',
  docNumber = ''
): string {
  const cssStyles = getBaseDocumentStyles();
  const pageCss = getPageSizeCss(template.page);

  let blocksHtml = '';
  if (template.layout && template.layout.blocks) {
    for (const block of template.layout.blocks) {
      blocksHtml += renderBlock(block, data, template, orgName, docNumber);
    }
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(template.name)}</title>
  <style>
    ${cssStyles}
    ${pageCss}
  </style>
</head>
<body>
  <div class="document-container">
    ${blocksHtml}
  </div>
</body>
</html>`;
}
