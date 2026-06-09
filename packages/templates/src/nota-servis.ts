import { TemplateDefinition } from '@cetakdocs/core';

export const NotaServisBasic: TemplateDefinition = {
  id: 'tpl_nota_servis_basic',
  slug: 'nota-servis-basic',
  name: 'Nota Servis',
  category: 'servis',
  description: 'Template nota tanda terima servis barang (HP, laptop, alat elektronik, dll) untuk toko/bengkel.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A5',
    orientation: 'portrait',
    margin: '10mm',
  },
  defaultNumberingFormat: 'SRV/{YYYY}{MM}/{####}',
  fields: [
    { name: 'customerName', label: 'Nama Pelanggan', type: 'text', required: true, placeholder: 'Nama pemilik barang' },
    { name: 'customerPhone', label: 'No. Telepon', type: 'text', required: true, placeholder: 'No. WhatsApp/Telepon yang bisa dihubungi' },
    { name: 'deviceModel', label: 'Perangkat / Barang', type: 'text', required: true, placeholder: 'Merk/Tipe barang (misal: Asus ROG Strix, iPhone 13)' },
    { name: 'serialNumber', label: 'Serial Number / IMEI', type: 'text', required: false, placeholder: 'Nomor seri barang / IMEI' },
    { name: 'issueDescription', label: 'Keluhan / Masalah', type: 'textarea', required: true, placeholder: 'Keluhan kerusakan barang' },
    { name: 'estimatedCost', label: 'Estimasi Biaya', type: 'currency', required: false, placeholder: 'Estimasi biaya perbaikan (opsional)' },
    {
      name: 'accessories',
      label: 'Kelengkapan yang Ditinggal',
      type: 'stringList',
      required: false,
      itemPlaceholder: 'Misal: Charger, Dus, Stylus',
      helpText: 'Daftar kelengkapan yang dibawa bersama unit servis.',
      defaultValue: ['Unit saja']
    },
    { name: 'date', label: 'Tanggal Masuk', type: 'date', required: true },
    { name: 'technicianName', label: 'Teknisi / Penerima', type: 'text', required: true, placeholder: 'Nama penerima barang' }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'TANDA TERIMA SERVIS BARANG', align: 'center' },
      { type: 'paragraph', text: 'No: {{documentNumber}}', align: 'center' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Nama Pelanggan', value: '{{customerName}}' },
      { type: 'fieldRow', label: 'No. Telepon', value: '{{customerPhone}}' },
      { type: 'fieldRow', label: 'Tgl Masuk', value: '{{date}}' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Barang / Perangkat', value: '{{deviceModel}} (S/N: {{serialNumber}})' },
      { type: 'fieldRow', label: 'Kerusakan/Keluhan', value: '{{issueDescription}}' },
      { type: 'fieldRow', label: 'Estimasi Biaya', value: '{{estimatedCost}}' },
      { type: 'spacer', height: '5px' },
      { type: 'paragraph', text: 'Kelengkapan yang ditinggal:' },
      { type: 'checklist', field: 'accessories' },
      { type: 'spacer', height: '10px' },
      {
        type: 'signatureRow',
        signatures: [
          { label: 'Pelanggan', value: '{{customerName}}', role: '' },
          { label: 'Teknisi / CS', value: '{{technicianName}}', role: '' }
        ]
      }
    ]
  }
};
