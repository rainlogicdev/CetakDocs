import { TemplateDefinition } from '@cetakdocs/core';

export const SuratKuasaBasic: TemplateDefinition = {
  id: 'tpl_surat_kuasa_basic',
  slug: 'surat-kuasa',
  name: 'Surat Kuasa',
  category: 'administrasi',
  description: 'Template surat kuasa umum untuk pelimpahan wewenang/pengambilan dokumen.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: '25mm',
  },
  defaultNumberingFormat: '',
  fields: [
    { name: 'giverName', label: 'Nama Pemberi Kuasa', type: 'text', required: true },
    { name: 'giverId', label: 'NIK Pemberi Kuasa', type: 'text', required: true },
    { name: 'giverAddress', label: 'Alamat Pemberi Kuasa', type: 'textarea', required: true },
    { name: 'receiverName', label: 'Nama Penerima Kuasa', type: 'text', required: true },
    { name: 'receiverId', label: 'NIK Penerima Kuasa', type: 'text', required: true },
    { name: 'receiverAddress', label: 'Alamat Penerima Kuasa', type: 'textarea', required: true },
    { name: 'purpose', label: 'Tujuan/Maksud Kuasa', type: 'textarea', required: true, placeholder: 'Untuk mewakili dan bertindak atas nama Pemberi Kuasa dalam hal pengambilan BPKB...' },
    { name: 'date', label: 'Tanggal Surat', type: 'date', required: true },
    { name: 'location', label: 'Tempat / Kota', type: 'text', required: true }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'SURAT KUASA', align: 'center' },
      { type: 'divider' },
      { type: 'paragraph', text: 'Yang bertanda tangan di bawah ini (PEMBERI KUASA):' },
      { type: 'fieldRow', label: 'Nama', value: '{{giverName}}' },
      { type: 'fieldRow', label: 'NIK', value: '{{giverId}}' },
      { type: 'fieldRow', label: 'Alamat', value: '{{giverAddress}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Dengan ini memberikan KUASA PENUH kepada (PENERIMA KUASA):' },
      { type: 'fieldRow', label: 'Nama', value: '{{receiverName}}' },
      { type: 'fieldRow', label: 'NIK', value: '{{receiverId}}' },
      { type: 'fieldRow', label: 'Alamat', value: '{{receiverAddress}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'KHUSUS' },
      { type: 'paragraph', text: '{{purpose}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Demikian surat kuasa ini dibuat untuk dipergunakan sebagaimana mestinya.' },
      { type: 'spacer', height: '5px' },
      { type: 'paragraph', text: '{{location}}, {{date}}', align: 'right' },
      { type: 'spacer', height: '10px' },
      {
        type: 'signatureRow',
        signatures: [
          { label: 'Penerima Kuasa', value: '{{receiverName}}', role: '' },
          { label: 'Pemberi Kuasa', value: '{{giverName}}', role: '(Materai Rp 10.000)' }
        ]
      }
    ]
  }
};
