export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'select'
  | 'checkbox'
  | 'table'
  | 'contactPicker'
  | 'organizationPicker'
  | 'imageUpload'
  | 'signatureName'
  | 'address'
  | 'stringList'; // Dynamic list of strings (for checklist, attendees, etc.)

export interface SelectOption {
  label: string;
  value: string;
}

export interface TableColumn {
  name: string;
  label: string;
  type: 'text' | 'number' | 'currency';
  required?: boolean;
}

export interface TemplateField {
  name: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: SelectOption[]; // Used for select type
  columns?: TableColumn[]; // Used for table type
  min?: number;
  max?: number;
  itemPlaceholder?: string; // Placeholder for each item in stringList
}

export type PageSize = 'A4' | 'A5' | 'thermal-80mm' | 'thermal-58mm' | 'custom';
export type PageOrientation = 'portrait' | 'landscape';

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margin: string; // e.g., '12mm', '0mm'
}

// Supporting types for new layout blocks
export interface SignatureEntry {
  label: string;   // e.g., "Pihak Pertama", "{{date}}"
  value: string;   // e.g., "{{party1Name}}"
  role?: string;   // e.g., "{{party1Role}}", "Materai 10000"
}

export interface ColumnDef {
  width?: string;  // e.g., "50%", "auto"
  blocks: LayoutBlock[];
}

export interface LayoutBlock {
  type:
    | 'heading'
    | 'paragraph'
    | 'fieldRow'
    | 'table'
    | 'signature'
    | 'divider'
    | 'image'
    | 'currencyBox'
    | 'qrCode'
    | 'barcode'
    | 'spacer'
    | 'checklist'       // Dynamic checkbox list from stringList field data
    | 'numberedList'    // Dynamic numbered list from stringList field data
    | 'signatureRow'    // Multiple signatures displayed horizontally
    | 'columnLayout';   // Multi-column layout with nested blocks
  align?: 'left' | 'center' | 'right' | 'justify';
  text?: string;
  value?: string; // templated variable like "{{recipientName}}"
  label?: string;
  height?: string;
  columns?: TableColumn[];
  // New properties for extended block types
  field?: string;              // Field name reference for checklist/numberedList data
  signatures?: SignatureEntry[]; // For signatureRow: array of signature entries
  columnsLayout?: ColumnDef[];   // For columnLayout: array of column definitions
  [key: string]: any; // Allow custom layout options per block type
}

export interface TemplateDefinition {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  locale: string; // e.g., 'id-ID'
  source: 'built_in' | 'custom' | 'imported';
  page: PageSettings;
  fields: TemplateField[];
  defaultNumberingFormat?: string; // e.g., 'KW/{YYYY}/{MM}/{####}'
  layout?: {
    blocks: LayoutBlock[];
  };
}
