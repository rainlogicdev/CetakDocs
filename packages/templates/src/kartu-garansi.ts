import { TemplateDefinition } from '@cetakdocs/core';

export const KartuGaransiBasic: TemplateDefinition = {
  id: 'tpl_kartu_garansi_basic',
  slug: 'kartu-garansi',
  name: 'Kartu Garansi',
  category: 'servis',
  description: 'Template kartu garansi servis atau pembelian produk.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'custom',
    orientation: 'landscape',
    margin: '10mm',
  },
  defaultNumberingFormat: 'GAR/{YYYY}/{MM}/{####}',
  fields: [
    { name: 'customerName', label: 'Nama Pelanggan', type: 'text', required: true },
    { name: 'productName', label: 'Nama Produk / Jasa', type: 'text', required: true },
    { name: 'serialNumber', label: 'S/N atau IMEI', type: 'text', required: false },
    { name: 'purchaseDate', label: 'Tanggal Pembelian / Servis', type: 'date', required: true },
    { name: 'warrantyPeriod', label: 'Masa Garansi', type: 'text', required: true, placeholder: 'Misal: 1 Bulan, 1 Tahun' },
    { name: 'terms', label: 'Syarat & Ketentuan Garansi', type: 'textarea', required: false, defaultValue: '1. Garansi berlaku sejak tanggal pembelian/servis.\n2. Garansi batal jika segel rusak atau human error.\n3. Harap bawa kartu ini saat klaim.' },
    { name: 'shopName', label: 'Nama Toko / Teknisi', type: 'text', required: true }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'KARTU GARANSI', align: 'center' },
      { type: 'paragraph', text: 'No: {{documentNumber}}', align: 'center' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Pelanggan', value: '{{customerName}}' },
      { type: 'fieldRow', label: 'Produk/Jasa', value: '{{productName}}' },
      { type: 'fieldRow', label: 'S/N / IMEI', value: '{{serialNumber}}' },
      { type: 'fieldRow', label: 'Tgl Transaksi', value: '{{purchaseDate}}' },
      { type: 'fieldRow', label: 'Masa Garansi', value: '{{warrantyPeriod}}' },
      { type: 'spacer', height: '5px' },
      { type: 'paragraph', text: 'Syarat & Ketentuan:' },
      { type: 'paragraph', text: '{{terms}}' },
      { type: 'spacer', height: '10px' },
      {
        type: 'signature',
        label: 'Dikeluarkan Oleh',
        value: '{{shopName}}',
        role: 'Toko / Teknisi'
      }
    ]
  }
};
