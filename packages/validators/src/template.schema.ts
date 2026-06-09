import { z } from 'zod';

export const PageSizeSchema = z.enum(['A4', 'A5', 'thermal-80mm', 'thermal-58mm', 'custom']);
export const PageOrientationSchema = z.enum(['portrait', 'landscape']);

export const PageSettingsSchema = z.object({
  size: PageSizeSchema.default('A4'),
  orientation: PageOrientationSchema.default('portrait'),
  margin: z.string().default('12mm'),
});

export const SelectOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const TableColumnSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'number', 'currency']),
  required: z.boolean().optional(),
});

export const TemplateFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum([
    'text',
    'textarea',
    'number',
    'currency',
    'date',
    'time',
    'select',
    'checkbox',
    'table',
    'contactPicker',
    'organizationPicker',
    'imageUpload',
    'signatureName',
    'address',
  ]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  defaultValue: z.any().optional(),
  options: z.array(SelectOptionSchema).optional(),
  columns: z.array(TableColumnSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const LayoutBlockSchema = z.object({
  type: z.enum([
    'heading',
    'paragraph',
    'fieldRow',
    'table',
    'signature',
    'divider',
    'image',
    'currencyBox',
    'qrCode',
    'barcode',
    'spacer',
  ]),
  align: z.enum(['left', 'center', 'right', 'justify']).optional(),
  text: z.string().optional(),
  value: z.string().optional(), // template expressions e.g. "{{recipientName}}"
  label: z.string().optional(),
  height: z.string().optional(),
  columns: z.array(TableColumnSchema).optional(),
});

export const TemplateDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  locale: z.string().default('id-ID'),
  source: z.enum(['built_in', 'custom', 'imported']).default('built_in'),
  page: PageSettingsSchema,
  fields: z.array(TemplateFieldSchema),
  defaultNumberingFormat: z.string().optional(),
  layout: z.object({
    blocks: z.array(LayoutBlockSchema),
  }).optional(),
});

export type TemplateDefinitionInput = z.infer<typeof TemplateDefinitionSchema>;
