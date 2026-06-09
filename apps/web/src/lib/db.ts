import Dexie, { type Table } from 'dexie';

export interface LocalDocument {
  id: string;
  templateId: string;
  title: string;
  status: 'draft' | 'final' | 'void';
  dataJson: string;
  documentNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalOrganization {
  id: string;
  name: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  key: string;
  value: string;
}

export interface LocalTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  locale: string;
  source: 'custom' | 'imported';
  page: {
    size: 'A4' | 'A5' | 'thermal-80mm' | 'thermal-58mm';
    orientation: 'portrait' | 'landscape';
    margin: string;
  };
  fields: any[]; // TemplateField[]
  layout: {
    blocks: any[]; // LayoutBlock[]
  };
  createdAt: string;
  updatedAt: string;
}

export class CetakDocsDB extends Dexie {
  documents!: Table<LocalDocument, string>;
  contacts!: Table<LocalContact, string>;
  organizations!: Table<LocalOrganization, string>;
  settings!: Table<AppSettings, string>;
  scannedDocuments!: Table<any, string>;
  customTemplates!: Table<LocalTemplate, string>;

  constructor() {
    super('CetakDocsDatabase');
    this.version(4).stores({
      documents: 'id, templateId, status, createdAt, updatedAt',
      contacts: 'id, name, phone, createdAt',
      organizations: 'id',
      settings: 'id, key',
      scannedDocuments: 'id, title, status, category, createdAt, updatedAt',
      customTemplates: 'id, slug, name, category, createdAt, updatedAt',
    });
  }
}

export const db = new CetakDocsDB();

// Helper: get or create default organization
export async function getOrCreateOrg(): Promise<LocalOrganization> {
  let org = await db.organizations.get('org_default');
  if (!org) {
    org = {
      id: 'org_default',
      name: 'Nama Usaha Anda',
      legalName: '',
      address: '',
      phone: '',
      email: '',
      taxId: '',
      logoUrl: '',
      updatedAt: new Date().toISOString(),
    };
    await db.organizations.add(org);
  }
  return org;
}
