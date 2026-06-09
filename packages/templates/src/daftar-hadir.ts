import { TemplateDefinition } from '@cetakdocs/core';

export const DaftarHadirBasic: TemplateDefinition = {
  id: 'tpl_daftar_hadir_basic',
  slug: 'daftar-hadir',
  name: 'Daftar Hadir',
  category: 'kegiatan',
  description: 'Template daftar hadir peserta untuk rapat, seminar, atau kegiatan komunitas.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: '15mm',
  },
  defaultNumberingFormat: '',
  fields: [
    { name: 'eventName', label: 'Nama Kegiatan / Rapat', type: 'text', required: true },
    { name: 'date', label: 'Tanggal', type: 'date', required: true },
    { name: 'location', label: 'Tempat / Lokasi', type: 'text', required: true },
    { name: 'organizer', label: 'Penyelenggara', type: 'text', required: false },
    {
      name: 'attendees',
      label: 'Daftar Peserta',
      type: 'stringList',
      required: true,
      itemPlaceholder: 'Nama peserta',
      helpText: 'Tambahkan nama peserta satu per satu. Kolom tanda tangan akan dicetak otomatis di samping nama.'
    }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'DAFTAR HADIR PESERTA', align: 'center' },
      { type: 'heading', text: '{{eventName}}', align: 'center', level: 3 },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Tanggal', value: '{{date}}' },
      { type: 'fieldRow', label: 'Tempat', value: '{{location}}' },
      { type: 'fieldRow', label: 'Penyelenggara', value: '{{organizer}}' },
      { type: 'spacer', height: '15px' },
      { type: 'numberedList', field: 'attendees' },
      { type: 'spacer', height: '20px' },
      { type: 'paragraph', text: 'Demikian daftar hadir ini dibuat dengan sebenarnya.', align: 'left' }
    ]
  }
};
