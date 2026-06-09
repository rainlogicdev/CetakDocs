import { TemplateDefinition } from '@cetakdocs/core';

export const SuratPernyataanBasic: TemplateDefinition = {
  id: 'tpl_surat_pernyataan_basic',
  slug: 'surat-pernyataan',
  name: 'Surat Pernyataan',
  category: 'administrasi',
  description: 'Template surat pernyataan umum dengan area materai opsional.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: '25mm',
  },
  defaultNumberingFormat: '',
  fields: [
    { name: 'name', label: 'Nama Lengkap', type: 'text', required: true },
    { name: 'idNumber', label: 'NIK / No. Identitas', type: 'text', required: false },
    { name: 'address', label: 'Alamat', type: 'textarea', required: true },
    { name: 'job', label: 'Pekerjaan', type: 'text', required: false },
    { name: 'statement', label: 'Isi Pernyataan', type: 'textarea', required: true, placeholder: 'Saya menyatakan dengan sebenar-benarnya bahwa...' },
    { name: 'date', label: 'Tanggal Surat', type: 'date', required: true },
    { name: 'location', label: 'Tempat / Kota', type: 'text', required: true }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'SURAT PERNYATAAN', align: 'center' },
      { type: 'divider' },
      { type: 'paragraph', text: 'Yang bertanda tangan di bawah ini:' },
      { type: 'spacer', height: '5px' },
      { type: 'fieldRow', label: 'Nama', value: '{{name}}' },
      { type: 'fieldRow', label: 'NIK/No.Identitas', value: '{{idNumber}}' },
      { type: 'fieldRow', label: 'Pekerjaan', value: '{{job}}' },
      { type: 'fieldRow', label: 'Alamat', value: '{{address}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Dengan ini menyatakan dengan sesungguhnya bahwa:' },
      { type: 'paragraph', text: '{{statement}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Demikian surat pernyataan ini saya buat dalam keadaan sadar, tanpa paksaan dari pihak mana pun, dan untuk dipergunakan sebagaimana mestinya.' },
      { type: 'spacer', height: '5px' },
      { type: 'paragraph', text: '{{location}}, {{date}}', align: 'right' },
      { type: 'spacer', height: '10px' },
      {
        type: 'signature',
        label: 'Yang Menyatakan,',
        value: '{{name}}',
        role: '(Tanda tangan di atas materai Rp 10.000)',
      }
    ]
  }
};
