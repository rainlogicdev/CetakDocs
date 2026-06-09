import { TemplateDefinition } from '@cetakdocs/core';

export const KwitansiBasic: TemplateDefinition = {
  id: 'tpl_kwitansi_basic',
  slug: 'kwitansi-basic',
  name: 'Kwitansi Basic',
  category: 'pembayaran',
  description: 'Template kwitansi standar dengan nominal uang dan ejaan terbilang otomatis.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A5',
    orientation: 'landscape',
    margin: '12mm',
  },
  defaultNumberingFormat: 'KW/{YYYY}/{MM}/{####}',
  fields: [
    { name: 'recipientName', label: 'Telah Diterima Dari', type: 'text', required: true, placeholder: 'Nama pembayar / penyetor' },
    { name: 'amount', label: 'Uang Sejumlah', type: 'currency', required: true, placeholder: 'Jumlah nominal uang (misal: 150000)' },
    { name: 'purpose', label: 'Untuk Pembayaran', type: 'textarea', required: true, placeholder: 'Keterangan transaksi pembayaran' },
    { name: 'date', label: 'Tanggal', type: 'date', required: true },
    { name: 'signerName', label: 'Nama Penerima', type: 'text', required: true, placeholder: 'Nama penerima uang' },
    { name: 'signerRole', label: 'Jabatan / Peran', type: 'text', required: false, defaultValue: 'Penerima' }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'KWITANSI PEMBAYARAN', align: 'center' },
      { type: 'paragraph', text: 'No: {{documentNumber}}', align: 'center' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Telah Diterima Dari', value: '{{recipientName}}' },
      { type: 'fieldRow', label: 'Uang Sejumlah', value: '{{amount}}' }, // Akan diformat ke Rp dan Terbilang di renderer
      { type: 'fieldRow', label: 'Untuk Pembayaran', value: '{{purpose}}' },
      { type: 'spacer', height: '15px' },
      {
        type: 'signature',
        label: '{{date}}',
        value: '{{signerName}}',
        role: '{{signerRole}}'
      }
    ]
  }
};
