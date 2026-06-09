import { TemplateDefinition } from '@cetakdocs/core';

export const LabelAlamatBasic: TemplateDefinition = {
  id: 'tpl_label_alamat_basic',
  slug: 'label-alamat',
  name: 'Label Alamat Paket',
  category: 'label',
  description: 'Template label alamat pengiriman paket untuk toko online.',
  locale: 'id-ID',
  source: 'built_in',
  page: {
    size: 'custom',
    orientation: 'landscape',
    margin: '10mm',
  },
  defaultNumberingFormat: '',
  fields: [
    { name: 'senderName', label: 'Nama Pengirim', type: 'text', required: true },
    { name: 'senderPhone', label: 'No. HP Pengirim', type: 'text', required: true },
    { name: 'receiverName', label: 'Nama Penerima', type: 'text', required: true },
    { name: 'receiverPhone', label: 'No. HP Penerima', type: 'text', required: true },
    { name: 'receiverAddress', label: 'Alamat Penerima Lengkap', type: 'textarea', required: true },
    { name: 'courier', label: 'Kurir / Ekspedisi', type: 'text', required: false, placeholder: 'Misal: JNE, J&T, GoSend' },
    { name: 'notes', label: 'Catatan Pengiriman', type: 'text', required: false, placeholder: 'Misal: FRAGILE / Jangan Dibanting' }
  ],
  layout: {
    blocks: [
      { type: 'heading', text: 'LABEL PENGIRIMAN', align: 'center' },
      { type: 'divider' },
      { type: 'heading', text: 'PENGIRIM:', align: 'left', level: 4 },
      { type: 'paragraph', text: '{{senderName}}' },
      { type: 'paragraph', text: 'HP: {{senderPhone}}' },
      { type: 'spacer', height: '10px' },
      { type: 'heading', text: 'PENERIMA:', align: 'left', level: 4 },
      { type: 'paragraph', text: '{{receiverName}}' },
      { type: 'paragraph', text: 'HP: {{receiverPhone}}' },
      { type: 'paragraph', text: '{{receiverAddress}}' },
      { type: 'divider' },
      { type: 'fieldRow', label: 'Kurir', value: '{{courier}}' },
      { type: 'fieldRow', label: 'Catatan', value: '{{notes}}' }
    ]
  }
};
