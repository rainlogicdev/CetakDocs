import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  legalName: text('legal_name'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  taxId: text('tax_id'),
  logoAssetId: text('logo_asset_id'),
  settingsJson: text('settings_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  type: text('type').notNull().default('person'), // person | company
  name: text('name').notNull(),
  companyName: text('company_name'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  notes: text('notes'),
  metadataJson: text('metadata_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  source: text('source').notNull(), // built_in | custom | imported
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  latestVersionId: text('latest_version_id'),
  defaultNumberingFormat: text('default_numbering_format'),
  isEnabled: integer('is_enabled').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const templateVersions = sqliteTable('template_versions', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull(),
  version: text('version').notNull(),
  schemaJson: text('schema_json').notNull(),
  rendererKey: text('renderer_key').notNull(),
  sampleDataJson: text('sample_data_json').notNull().default('{}'),
  printSettingsJson: text('print_settings_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull(),
  templateVersionId: text('template_version_id').notNull(),
  organizationId: text('organization_id'),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  documentNumber: text('document_number'),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'), // draft | final | void | archived
  dataJson: text('data_json').notNull(), // form values
  renderedSnapshotHtml: text('rendered_snapshot_html'),
  finalizedAt: text('finalized_at'),
  voidReason: text('void_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const numberingSequences = sqliteTable('numbering_sequences', {
  id: text('id').primaryKey(),
  scope: text('scope').notNull(), // template slug, category, or global
  prefix: text('prefix').notNull(),
  currentNumber: integer('current_number').notNull().default(0),
  padding: integer('padding').notNull().default(4),
  resetRule: text('reset_rule').notNull().default('yearly'), // yearly | monthly | never
  updatedAt: text('updated_at').notNull(),
});

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  checksum: text('checksum'),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  actor: text('actor'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  beforeJson: text('before_json'),
  afterJson: text('after_json'),
  createdAt: text('created_at').notNull(),
});

export const scannedDocuments = sqliteTable('scanned_documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  originalName: text('original_name').notNull(),
  status: text('status').notNull().default('pending'), // pending | processed | archived
  category: text('category').notNull().default('other'), // invoice | receipt | letter | contract | other
  rawText: text('raw_text'),
  metadataJson: text('metadata_json').notNull().default('{}'),
  assetId: text('asset_id').notNull(),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

