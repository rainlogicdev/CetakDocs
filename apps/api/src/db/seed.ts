import { db } from './client';
import { templates, templateVersions, organizations } from './schema';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';
import { eq } from 'drizzle-orm';
import { generateId } from '@cetakdocs/core';

export async function seedTemplates() {
  const now = new Date().toISOString();
  
  // Seed default organization if none exists
  const existingOrg = await db.select().from(organizations).limit(1).get();
  if (!existingOrg) {
    const orgId = generateId('org');
    await db.insert(organizations).values({
      id: orgId,
      name: 'Toko CetakDocs Utama',
      legalName: 'CV CetakDocs Jaya Mandiri',
      address: 'Jl. Pemuda No. 45, Jakarta',
      phone: '081234567890',
      email: 'kontak@cetakdocs.local',
      taxId: '12.345.678.9-012.000',
      settingsJson: JSON.stringify({
        defaultSignatureName: 'Adit',
        defaultSignatureRole: 'Pemilik Toko',
        currencySymbol: 'Rp',
        dateFormat: 'dd MMMM yyyy'
      }),
      createdAt: now,
      updatedAt: now
    });
  }

  // Seed built-in templates
  for (const tpl of BUILT_IN_TEMPLATES) {
    const existing = await db.select().from(templates).where(eq(templates.slug, tpl.slug)).get();
    
    const tplId = tpl.id;
    const versionId = `${tplId}_v1`;

    if (!existing) {
      // Simpan template utama
      await db.insert(templates).values({
        id: tplId,
        source: 'built_in',
        slug: tpl.slug,
        name: tpl.name,
        category: tpl.category,
        description: tpl.description || '',
        latestVersionId: versionId,
        defaultNumberingFormat: tpl.defaultNumberingFormat || null,
        isEnabled: 1,
        createdAt: now,
        updatedAt: now,
      });

      // Simpan versi pertama dari template
      await db.insert(templateVersions).values({
        id: versionId,
        templateId: tplId,
        version: '1.0.0',
        schemaJson: JSON.stringify(tpl.fields),
        rendererKey: 'default',
        sampleDataJson: '{}',
        printSettingsJson: JSON.stringify(tpl.page),
        createdAt: now,
      });
    }
  }
}
