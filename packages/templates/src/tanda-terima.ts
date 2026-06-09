import { TemplateDefinition } from '@cetakdocs/core';

export const TandaTerimaBasic: TemplateDefinition = {
  id: 'tpl_tanda_terima_basic',
  slug: 'tanda-terima-basic',
  name: 'Tanda Terima',
  category: 'pembayaran',
  description: 'Template tanda terima pembayaran sederhana (non-kwitansi) untuk UMKM atau kegiatan.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A5',
    orientation: 'landscape',
    margin: '12mm',
  },
  defaultNumberingFormat: 'TT/{YYYY}/{MM}/{####}',
  fields: [
    { name: 'payerName', label: 'Diterima Dari', type: 'text', required: true, placeholder: 'Nama pembayar/pengirim uang' },
    { name: 'amount', label: 'Sejumlah Uang', type: 'currency', required: true, placeholder: 'Nominal uang' },
    { name: 'purpose', label: 'Keperluan', type: 'textarea', required: true, placeholder: 'Keterangan keperluan pembayaran' },
    { name: 'date', label: 'Tanggal', type: 'date', required: true },
    { name: 'receiverName', label: 'Penerima', type: 'text', required: true, placeholder: 'Nama penerima uang' }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'TANDA TERIMA', align: 'center' },
      { type: 'paragraph', text: 'No: {{documentNumber}}', align: 'center' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Diterima Dari', value: '{{payerName}}' },
      { type: 'fieldRow', label: 'Uang Sejumlah', value: '{{amount}}' },
      { type: 'fieldRow', label: 'Untuk Keperluan', value: '{{purpose}}' },
      { type: 'spacer', height: '15px' },
      {
        type: 'signature',
        label: '{{date}}',
        value: '{{receiverName}}',
        role: 'Penerima'
      }
    ]
  }
};
