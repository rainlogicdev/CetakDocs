/**
 * CetakDocs API Client
 * 
 * Semua operasi data frontend melewati modul ini.
 * Backend: Hono + SQLite di http://localhost:8787
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// ------- Generic Helpers -------

async function parseApiError(res: Response): Promise<Error> {
  try {
    const body = await res.json();
    return new Error(body?.error?.message || `HTTP ${res.status}`);
  } catch {
    return new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw await parseApiError(res);
}

// ------- Type Definitions (matching backend response shapes) -------

export interface ApiTemplate {
  id: string;
  source: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  latestVersionId: string | null;
  defaultNumberingFormat: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  fields: any[];
  page: {
    size: string;
    orientation: string;
    margin: string;
  };
}

export interface ApiContact {
  id: string;
  type: string;
  name: string;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  metadataJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrganization {
  id: string;
  name: string;
  legalName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  logoAssetId: string | null;
  settingsJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDocument {
  id: string;
  templateId: string;
  templateVersionId: string;
  organizationId: string | null;
  contactId: string | null;
  documentNumber: string | null;
  title: string;
  status: 'draft' | 'final' | 'void' | 'archived';
  dataJson: string;
  renderedSnapshotHtml: string | null;
  finalizedAt: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ------- Templates API -------

export const templatesApi = {
  list: () => apiGet<ApiTemplate[]>('/api/templates'),
  getBySlug: (slug: string) => apiGet<ApiTemplate>(`/api/templates/${slug}`),
};

// ------- Documents API -------

export const documentsApi = {
  list: (q?: string) => apiGet<ApiDocument[]>(`/api/documents${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  get: (id: string) => apiGet<ApiDocument>(`/api/documents/${id}`),
  create: (data: {
    templateId: string;
    templateVersionId: string;
    organizationId?: string;
    contactId?: string;
    title: string;
    dataJson: string;
  }) => apiPost<ApiDocument>('/api/documents', data),
  update: (id: string, data: {
    templateId: string;
    templateVersionId: string;
    organizationId?: string;
    contactId?: string;
    title: string;
    dataJson: string;
  }) => apiPatch<ApiDocument>(`/api/documents/${id}`, data),
  delete: (id: string) => apiDelete(`/api/documents/${id}`),
  finalize: (id: string) => apiPost<ApiDocument>(`/api/documents/${id}/finalize`, {}),
  void: (id: string, reason?: string) => apiPost<ApiDocument>(`/api/documents/${id}/void`, { reason }),
  renderHtml: (id: string) => `${API_BASE}/api/documents/${id}/render/html`,
};

// ------- Contacts API -------

export const contactsApi = {
  list: () => apiGet<ApiContact[]>('/api/contacts'),
  create: (data: {
    type?: string;
    name: string;
    companyName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => apiPost<ApiContact>('/api/contacts', data),
  update: (id: string, data: {
    type?: string;
    name: string;
    companyName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => apiPatch<ApiContact>(`/api/contacts/${id}`, data),
  delete: (id: string) => apiDelete(`/api/contacts/${id}`),
};

// ------- Organizations API -------

export const organizationsApi = {
  list: () => apiGet<ApiOrganization[]>('/api/organizations'),
  update: (id: string, data: {
    name: string;
    legalName?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    logoAssetId?: string;
    settingsJson?: string;
  }) => apiPatch<ApiOrganization>(`/api/organizations/${id}`, data),
};

// ------- Render API -------

export const renderApi = {
  preview: (templateId: string, data: Record<string, any>) =>
    apiPost<{ html: string }>('/api/render/preview', { templateId, data }),
};

// ------- Backup API -------

export const backupApi = {
  export: () => apiGet<any>('/api/backup/export'),
  restore: (data: any) => apiPost<{ success: boolean }>('/api/backup/restore', data),
};
