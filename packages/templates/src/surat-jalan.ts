import { TemplateDefinition } from '@cetakdocs/core';

export const SuratJalanBasic: TemplateDefinition = {
  id: 'tpl_surat_jalan_basic',
  slug: 'surat-jalan-basic',
  name: 'Surat Jalan Basic',
  category: 'pengiriman',
  description: 'Template surat jalan pengiriman barang untuk kurir atau sopir ekspedisi.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: '15mm',
  },
  defaultNumberingFormat: 'SJ/{YYYY}/{MM}/{####}',
  fields: [
    { name: 'recipientName', label: 'Nama Penerima', type: 'text', required: true, placeholder: 'Nama toko / pembeli' },
    { name: 'recipientPhone', label: 'No. Telp Penerima', type: 'text', required: false, placeholder: 'Nomor telepon penerima' },
    { name: 'recipientAddress', label: 'Alamat Pengiriman', type: 'address', required: true, placeholder: 'Alamat lengkap pengiriman barang' },
    { name: 'date', label: 'Tanggal Pengiriman', type: 'date', required: true },
    { name: 'driverName', label: 'Nama Sopir / Kurir', type: 'text', required: false, placeholder: 'Nama kurir yang membawa barang' },
    { name: 'policeNumber', label: 'Nomor Kendaraan', type: 'text', required: false, placeholder: 'Pelat nomor kendaraan (misal: B 1234 CD)' },
    {
      name: 'items',
      label: 'Daftar Barang',
      type: 'table',
      required: true,
      columns: [
        { name: 'itemName', label: 'Nama Barang', type: 'text', required: true },
        { name: 'qty', label: 'Jumlah', type: 'number', required: true },
        { name: 'unit', label: 'Satuan', type: 'text', required: true }
      ]
    },
    { name: 'signerSender', label: 'Pengirim (Nama)', type: 'text', required: true, placeholder: 'Nama penanggung jawab gudang/pengirim' },
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'SURAT JALAN / PENGIRIMAN BARANG', align: 'center' },
      { type: 'paragraph', text: 'No: {{documentNumber}}', align: 'center' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Kepada Yth.', value: '{{recipientName}} ({{recipientPhone}})' },
      { type: 'fieldRow', label: 'Alamat Tujuan', value: '{{recipientAddress}}' },
      { type: 'fieldRow', label: 'Tanggal Kirim', value: '{{date}}' },
      { type: 'fieldRow', label: 'Kurir / Plat', value: '{{driverName}} / {{policeNumber}}' },
      { type: 'spacer', height: '10px' },
      {
        type: 'table',
        name: 'items',
        columns: [
          { name: 'itemName', label: 'Nama Barang', type: 'text' },
          { name: 'qty', label: 'Qty', type: 'number' },
          { name: 'unit', label: 'Satuan', type: 'text' }
        ]
      },
      { type: 'spacer', height: '20px' },
      {
        type: 'signatureRow',
        signatures: [
          { label: 'Pengirim', value: '{{signerSender}}', role: '' },
          { label: 'Penerima', value: '{{recipientName}}', role: '' }
        ]
      }
    ]
  }
};
