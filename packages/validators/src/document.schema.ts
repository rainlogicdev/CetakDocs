import { z } from 'zod';
import { TemplateField } from '@cetakdocs/core';

export const DocumentStatusSchema = z.enum(['draft', 'final', 'void', 'archived']);

export const DocumentSchema = z.object({
  id: z.string().optional(),
  templateId: z.string().min(1, 'Template ID wajib diisi'),
  templateVersionId: z.string().min(1, 'Template Version ID wajib diisi'),
  organizationId: z.string().nullable().optional(),
  contactId: z.string().nullable().optional(),
  documentNumber: z.string().nullable().optional(),
  title: z.string().min(1, 'Judul dokumen wajib diisi'),
  status: DocumentStatusSchema.default('draft'),
  dataJson: z.string().default('{}'),
  renderedSnapshotHtml: z.string().nullable().optional(),
  finalizedAt: z.string().nullable().optional(),
  voidReason: z.string().nullable().optional(),
});

export type DocumentInput = z.infer<typeof DocumentSchema>;

// Helper to build a dynamic Zod schema for the form values based on template fields
export function createDynamicDocumentDataSchema(fields: TemplateField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny = z.any();

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'time':
      case 'address':
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} wajib diisi`);
        } else {
          fieldSchema = fieldSchema.optional().nullable().or(z.literal(''));
        }
        break;

      case 'date':
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} wajib diisi`);
        } else {
          fieldSchema = fieldSchema.optional().nullable().or(z.literal(''));
        }
        break;

      case 'number':
      case 'currency':
        fieldSchema = z.number({
          invalid_type_error: `${field.label} harus berupa angka`,
        });
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodNumber);
        } else {
          fieldSchema = fieldSchema.optional().nullable();
        }
        if (field.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(field.min, `${field.label} minimal ${field.min}`);
        }
        if (field.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(field.max, `${field.label} maksimal ${field.max}`);
        }
        break;

      case 'select':
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} wajib diisi`);
        } else {
          fieldSchema = fieldSchema.optional().nullable().or(z.literal(''));
        }
        break;

      case 'checkbox':
        fieldSchema = z.boolean().default(false);
        break;

      case 'contactPicker':
      case 'organizationPicker':
      case 'imageUpload':
      case 'signatureName':
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} wajib diisi`);
        } else {
          fieldSchema = fieldSchema.optional().nullable().or(z.literal(''));
        }
        break;

      case 'table':
        if (field.columns) {
          const colShape: Record<string, z.ZodTypeAny> = {};
          for (const col of field.columns) {
            let colSchema: z.ZodTypeAny = z.any();
            if (col.type === 'text') {
              colSchema = z.string();
              if (col.required) {
                colSchema = (colSchema as z.ZodString).min(1, `${col.label} wajib diisi`);
              } else {
                colSchema = colSchema.optional().nullable().or(z.literal(''));
              }
            } else if (col.type === 'number' || col.type === 'currency') {
              colSchema = z.number({
                invalid_type_error: `${col.label} harus berupa angka`,
              });
              if (col.required) {
                colSchema = (colSchema as z.ZodNumber);
              } else {
                colSchema = colSchema.optional().nullable();
              }
            }
            colShape[col.name] = colSchema;
          }
          fieldSchema = z.array(z.object(colShape));
        } else {
          fieldSchema = z.array(z.any());
        }
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodArray<any>).min(1, `${field.label} minimal harus memiliki 1 baris`);
        } else {
          fieldSchema = fieldSchema.optional().default([]);
        }
        break;

      default:
        fieldSchema = z.any();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}
export type DocumentDataInput = Record<string, any>;
