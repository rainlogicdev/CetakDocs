export type DocumentStatus = 'draft' | 'final' | 'void' | 'archived';

export interface Organization {
  id: string;
  name: string;
  legalName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  logoAssetId?: string | null;
  settingsJson: string; // Serialized settings
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  type: 'person' | 'company';
  name: string;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  metadataJson: string; // Serialized metadata
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  checksum?: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  templateId: string;
  templateVersionId: string;
  organizationId?: string | null;
  contactId?: string | null;
  documentNumber?: string | null;
  title: string;
  status: DocumentStatus;
  dataJson: string; // Serialized form values matching template schema
  renderedSnapshotHtml?: string | null;
  finalizedAt?: string | null;
  voidReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NumberingSequence {
  id: string;
  scope: string; // templateId or category or global
  prefix: string;
  currentNumber: number;
  padding: number;
  resetRule: 'yearly' | 'monthly' | 'never';
  updatedAt: string;
}

export interface Settings {
  key: string;
  valueJson: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actor?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: string | null;
  afterJson?: string | null;
  createdAt: string;
}
