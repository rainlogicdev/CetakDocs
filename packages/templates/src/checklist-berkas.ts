import { TemplateDefinition } from '@cetakdocs/core';

export const ChecklistBerkasBasic: TemplateDefinition = {
  id: 'tpl_checklist_berkas_basic',
  slug: 'checklist-berkas',
  name: 'Checklist Berkas',
  category: 'administrasi',
  description: 'Template checklist kelengkapan berkas untuk pendaftaran, pengajuan, atau verifikasi dokumen.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A5',
    orientation: 'portrait',
    margin: '15mm',
  },
  defaultNumberingFormat: '',
  fields: [
    { name: 'purposeName', label: 'Keperluan', type: 'text', required: true, placeholder: 'Misal: Pembuatan NIB, Pendaftaran Sekolah, Pengajuan KPR' },
    { name: 'applicantName', label: 'Nama Pemohon', type: 'text', required: true },
    { name: 'date', label: 'Tanggal Pengecekan', type: 'date', required: true },
    {
      name: 'documentItems',
      label: 'Daftar Berkas yang Diperlukan',
      type: 'stringList',
      required: true,
      itemPlaceholder: 'Nama berkas (misal: Fotokopi KTP)',
      helpText: 'Tambahkan nama berkas satu per satu. Checkbox akan dicetak otomatis.',
      defaultValue: [
        'Fotokopi KTP',
        'Fotokopi Kartu Keluarga (KK)',
        'Pas Foto 3x4',
        'Formulir Pendaftaran',
        'Dokumen Pendukung Lainnya'
      ]
    },
    { name: 'checkerName', label: 'Nama Pemeriksa', type: 'text', required: false }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'CHECKLIST KELENGKAPAN BERKAS', align: 'center' },
      { type: 'heading', text: '{{purposeName}}', align: 'center', level: 3 },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Pemohon', value: '{{applicantName}}' },
      { type: 'fieldRow', label: 'Tanggal', value: '{{date}}' },
      { type: 'spacer', height: '10px' },
      { type: 'paragraph', text: 'Daftar Berkas (Centang yang sudah ada):' },
      { type: 'checklist', field: 'documentItems' },
      { type: 'spacer', height: '20px' },
      {
        type: 'signature',
        label: 'Petugas / Pemeriksa',
        value: '{{checkerName}}',
        role: ''
      }
    ]
  }
};
