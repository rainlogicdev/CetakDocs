import { TemplateDefinition } from '@cetakdocs/core';

export const BeritaAcaraSerahTerimaBasic: TemplateDefinition = {
  id: 'tpl_bast_basic',
  slug: 'berita-acara-serah-terima',
  name: 'Berita Acara Serah Terima',
  category: 'logistik',
  description: 'Template berita acara serah terima (BAST) barang atau dokumen.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: '20mm',
  },
  defaultNumberingFormat: 'BAST/{YYYY}/{MM}/{####}',
  fields: [
    { name: 'date', label: 'Tanggal Serah Terima', type: 'date', required: true },
    { name: 'party1Name', label: 'Nama Pihak Pertama (Menyerahkan)', type: 'text', required: true },
    { name: 'party1Role', label: 'Jabatan Pihak Pertama', type: 'text', required: false },
    { name: 'party2Name', label: 'Nama Pihak Kedua (Menerima)', type: 'text', required: true },
    { name: 'party2Role', label: 'Jabatan Pihak Kedua', type: 'text', required: false },
    { name: 'itemsDescription', label: 'Deskripsi Barang/Dokumen', type: 'textarea', required: true, placeholder: 'Rincian barang atau dokumen yang diserahterimakan' },
    { name: 'notes', label: 'Keterangan Tambahan', type: 'textarea', required: false }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'BERITA ACARA SERAH TERIMA', align: 'center' },
      { type: 'paragraph', text: 'No: {{documentNumber}}', align: 'center' },
      { type: 'divider' },
      { type: 'paragraph', text: 'Pada hari ini {{date}}, telah dilakukan serah terima barang/dokumen oleh dan di antara pihak-pihak berikut:' },
      { type: 'spacer', height: '10px' },
      { type: 'heading', text: 'PIHAK PERTAMA (Yang Menyerahkan)', align: 'left', level: 3 },
      { type: 'fieldRow', label: 'Nama', value: '{{party1Name}}' },
      { type: 'fieldRow', label: 'Jabatan/Peran', value: '{{party1Role}}' },
      { type: 'spacer', height: '10px' },
      { type: 'heading', text: 'PIHAK KEDUA (Yang Menerima)', align: 'left', level: 3 },
      { type: 'fieldRow', label: 'Nama', value: '{{party2Name}}' },
      { type: 'fieldRow', label: 'Jabatan/Peran', value: '{{party2Role}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Pihak Pertama menyerahkan kepada Pihak Kedua, dan Pihak Kedua telah menerima dari Pihak Pertama berupa:' },
      { type: 'fieldRow', label: 'Rincian', value: '{{itemsDescription}}' },
      { type: 'fieldRow', label: 'Keterangan', value: '{{notes}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.' },
      { type: 'spacer', height: '20px' },
      {
        type: 'signatureRow',
        signatures: [
          { label: 'PIHAK PERTAMA', value: '{{party1Name}}', role: '{{party1Role}}' },
          { label: 'PIHAK KEDUA', value: '{{party2Name}}', role: '{{party2Role}}' }
        ]
      }
    ]
  }
};
