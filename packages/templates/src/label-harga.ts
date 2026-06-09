import { TemplateDefinition } from '@cetakdocs/core';

export const LabelHargaBasic: TemplateDefinition = {
  id: 'tpl_label_harga_basic',
  slug: 'label-harga',
  name: 'Label Harga',
  category: 'label',
  description: 'Template label harga produk sederhana untuk ditempel pada rak atau barang.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'custom',
    orientation: 'landscape',
    margin: '5mm',
  },
  defaultNumberingFormat: '',
  fields: [
    { name: 'productName', label: 'Nama Produk', type: 'text', required: true },
    { name: 'sku', label: 'SKU / Kode Barang', type: 'text', required: false },
    { name: 'price', label: 'Harga', type: 'currency', required: true },
    { name: 'unit', label: 'Satuan', type: 'text', required: false, placeholder: 'Misal: /pcs, /kg' }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: '{{productName}}', align: 'center', level: 2 },
      { type: 'paragraph', text: 'SKU: {{sku}}', align: 'center' },
      { type: 'spacer', height: '10px' },
      { type: 'heading', text: '{{price}} {{unit}}', align: 'center', level: 1 }
    ]
  }
};
