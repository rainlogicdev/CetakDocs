import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db/client';
import {
  organizations,
  contacts,
  templates,
  templateVersions,
  documents,
  numberingSequences
} from './db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import {
  generateId,
  generateDocumentNumber,
  parsePaddingFromFormat
} from '@cetakdocs/core';
import { renderDocumentHtml } from '@cetakdocs/renderer';
import {
  ContactSchema,
  OrganizationSchema,
  DocumentSchema,
  createDynamicDocumentDataSchema
} from '@cetakdocs/validators';
import { BUILT_IN_TEMPLATES } from '@cetakdocs/templates';

export const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*', // Allow all in local/development mode
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Error Handling Middleware
app.onError((err, c) => {
  console.error(err);
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Terjadi kesalahan pada server.'
    }
  }, 500);
});

// 1. GET /health
app.get('/health', (c) => {
  return c.json({
    ok: true,
    version: '0.1.0',
    mode: 'local'
  });
});

// 2. GET /api/templates
app.get('/api/templates', async (c) => {
  const allTemplates = await db.select().from(templates).where(eq(templates.isEnabled, 1)).all();
  
  // Attach version and fields schema
  const result = [];
  for (const t of allTemplates) {
    const version = await db.select()
      .from(templateVersions)
      .where(eq(templateVersions.templateId, t.id))
      .get();
      
    result.push({
      ...t,
      isEnabled: t.isEnabled === 1,
      fields: version ? JSON.parse(version.schemaJson) : [],
      page: version ? JSON.parse(version.printSettingsJson) : {}
    });
  }
  return c.json(result);
});

// GET /api/templates/:slug
app.get('/api/templates/:slug', async (c) => {
  const slug = c.req.param('slug');
  const tpl = await db.select().from(templates).where(eq(templates.slug, slug)).get();
  
  if (!tpl) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Template tidak ditemukan' } }, 404);
  }

  const version = await db.select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, tpl.id))
    .get();

  return c.json({
    ...tpl,
    isEnabled: tpl.isEnabled === 1,
    fields: version ? JSON.parse(version.schemaJson) : [],
    page: version ? JSON.parse(version.printSettingsJson) : {}
  });
});

// 3. Organizations Routes
app.get('/api/organizations', async (c) => {
  const orgs = await db.select().from(organizations).all();
  return c.json(orgs);
});

app.patch('/api/organizations/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const parsed = OrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data organisasi tidak valid.',
        details: parsed.error.issues
      }
    }, 400);
  }

  const now = new Date().toISOString();
  await db.update(organizations)
    .set({
      name: parsed.data.name,
      legalName: parsed.data.legalName,
      address: parsed.data.address,
      phone: parsed.data.phone,
      email: parsed.data.email,
      taxId: parsed.data.taxId,
      logoAssetId: parsed.data.logoAssetId,
      settingsJson: parsed.data.settingsJson,
      updatedAt: now
    })
    .where(eq(organizations.id, id))
    .run();

  const updated = await db.select().from(organizations).where(eq(organizations.id, id)).get();
  return c.json(updated);
});

// 4. Contacts Routes
app.get('/api/contacts', async (c) => {
  const list = await db.select().from(contacts).orderBy(desc(contacts.createdAt)).all();
  return c.json(list);
});

app.post('/api/contacts', async (c) => {
  const body = await c.req.json();
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data kontak tidak valid.',
        details: parsed.error.issues
      }
    }, 400);
  }

  const id = generateId('contact');
  const now = new Date().toISOString();
  
  await db.insert(contacts).values({
    id,
    type: parsed.data.type,
    name: parsed.data.name,
    companyName: parsed.data.companyName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address,
    notes: parsed.data.notes,
    metadataJson: parsed.data.metadataJson || '{}',
    createdAt: now,
    updatedAt: now
  }).run();

  const created = await db.select().from(contacts).where(eq(contacts.id, id)).get();
  return c.json(created);
});

app.patch('/api/contacts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data kontak tidak valid.',
        details: parsed.error.issues
      }
    }, 400);
  }

  const now = new Date().toISOString();
  await db.update(contacts)
    .set({
      type: parsed.data.type,
      name: parsed.data.name,
      companyName: parsed.data.companyName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      address: parsed.data.address,
      notes: parsed.data.notes,
      metadataJson: parsed.data.metadataJson,
      updatedAt: now
    })
    .where(eq(contacts.id, id))
    .run();

  const updated = await db.select().from(contacts).where(eq(contacts.id, id)).get();
  return c.json(updated);
});

app.delete('/api/contacts/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(contacts).where(eq(contacts.id, id)).run();
  return c.json({ success: true });
});

// 5. Documents Routes
app.get('/api/documents', async (c) => {
  const q = c.req.query('q');
  let queryBuilder = db.select().from(documents);
  
  if (q) {
    queryBuilder = db.select()
      .from(documents)
      .where(or(
        like(documents.title, `%${q}%`),
        like(documents.documentNumber, `%${q}%`)
      )) as any;
  }
  
  const list = await queryBuilder.orderBy(desc(documents.createdAt)).all();
  return c.json(list);
});

app.get('/api/documents/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Dokumen tidak ditemukan' } }, 404);
  }
  return c.json(doc);
});

app.post('/api/documents', async (c) => {
  const body = await c.req.json();
  const parsedDoc = DocumentSchema.safeParse(body);
  if (!parsedDoc.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data dokumen tidak valid.',
        details: parsedDoc.error.issues
      }
    }, 400);
  }

  // Load template fields to validate dynamic document data
  const tpl = await db.select().from(templates).where(eq(templates.id, parsedDoc.data.templateId)).get();
  if (!tpl) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Template tidak ditemukan' } }, 400);
  }

  const ver = await db.select().from(templateVersions).where(eq(templateVersions.id, parsedDoc.data.templateVersionId)).get();
  if (!ver) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Versi template tidak ditemukan' } }, 400);
  }

  const fields = JSON.parse(ver.schemaJson);
  const data = JSON.parse(parsedDoc.data.dataJson);

  // Validate dynamic data
  const dynamicSchema = createDynamicDocumentDataSchema(fields);
  const parsedData = dynamicSchema.safeParse(data);
  if (!parsedData.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Isian formulir dokumen tidak lengkap atau tidak valid.',
        details: parsedData.error.issues
      }
    }, 400);
  }

  const id = generateId('doc');
  const now = new Date().toISOString();

  await db.insert(documents).values({
    id,
    templateId: parsedDoc.data.templateId,
    templateVersionId: parsedDoc.data.templateVersionId,
    organizationId: parsedDoc.data.organizationId,
    contactId: parsedDoc.data.contactId,
    documentNumber: null, // Draft belum ber-nomor resmi
    title: parsedDoc.data.title,
    status: 'draft',
    dataJson: JSON.stringify(parsedData.data),
    createdAt: now,
    updatedAt: now
  }).run();

  const created = await db.select().from(documents).where(eq(documents.id, id)).get();
  return c.json(created);
});

app.patch('/api/documents/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Dokumen tidak ditemukan' } }, 404);
  }

  if (doc.status !== 'draft') {
    return c.json({ error: { code: 'DOCUMENT_FINALIZED', message: 'Hanya dokumen Draft yang bisa diperbarui' } }, 400);
  }

  const body = await c.req.json();
  const parsedDoc = DocumentSchema.safeParse(body);
  if (!parsedDoc.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data dokumen tidak valid.',
        details: parsedDoc.error.issues
      }
    }, 400);
  }

  // Load template fields to validate dynamic document data
  const ver = await db.select().from(templateVersions).where(eq(templateVersions.id, doc.templateVersionId)).get();
  if (!ver) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Versi template tidak ditemukan' } }, 404);
  }
  const fields = JSON.parse(ver.schemaJson);
  const data = JSON.parse(parsedDoc.data.dataJson);

  // Validate dynamic data
  const dynamicSchema = createDynamicDocumentDataSchema(fields);
  const parsedData = dynamicSchema.safeParse(data);
  if (!parsedData.success) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Isian formulir dokumen tidak lengkap atau tidak valid.',
        details: parsedData.error.issues
      }
    }, 400);
  }

  const now = new Date().toISOString();
  await db.update(documents)
    .set({
      title: parsedDoc.data.title,
      contactId: parsedDoc.data.contactId,
      organizationId: parsedDoc.data.organizationId,
      dataJson: JSON.stringify(parsedData.data),
      updatedAt: now
    })
    .where(eq(documents.id, id))
    .run();

  const updated = await db.select().from(documents).where(eq(documents.id, id)).get();
  return c.json(updated);
});

app.delete('/api/documents/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Dokumen tidak ditemukan' } }, 404);
  }

  if (doc.status === 'final') {
    return c.json({ error: { code: 'DOCUMENT_FINALIZED', message: 'Dokumen yang sudah Final tidak boleh dihapus' } }, 400);
  }

  await db.delete(documents).where(eq(documents.id, id)).run();
  return c.json({ success: true });
});

// Finalize Document Route
app.post('/api/documents/:id/finalize', async (c) => {
  const id = c.req.param('id');
  const doc = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Dokumen tidak ditemukan' } }, 404);
  }

  if (doc.status !== 'draft') {
    return c.json({ error: { code: 'DOCUMENT_FINALIZED', message: 'Dokumen ini sudah difinalisasi sebelumnya.' } }, 400);
  }

  // Load template & version
  const tpl = await db.select().from(templates).where(eq(templates.id, doc.templateId)).get();
  if (!tpl) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Template tidak ditemukan' } }, 404);
  }
  const ver = await db.select().from(templateVersions).where(eq(templateVersions.id, doc.templateVersionId)).get();
  if (!ver) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Versi template tidak ditemukan' } }, 404);
  }
  
  // Load organization
  const org = doc.organizationId 
    ? await db.select().from(organizations).where(eq(organizations.id, doc.organizationId)).get()
    : await db.select().from(organizations).limit(1).get();

  const orgName = org ? org.name : '';
  const now = new Date();
  const nowStr = now.toISOString();

  // Get numbering Sequence
  const format = tpl.defaultNumberingFormat || 'DOC/{YYYY}/{####}';
  let seq = await db.select()
    .from(numberingSequences)
    .where(eq(numberingSequences.scope, tpl.slug))
    .get();

  if (!seq) {
    const seqId = generateId('seq');
    await db.insert(numberingSequences).values({
      id: seqId,
      scope: tpl.slug,
      prefix: tpl.slug.substring(0, 3).toUpperCase(),
      currentNumber: 0,
      padding: parsePaddingFromFormat(format),
      resetRule: 'yearly',
      updatedAt: nowStr
    }).run();
    seq = await db.select().from(numberingSequences).where(eq(numberingSequences.id, seqId)).get();
  }

  if (!seq) {
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Gagal menginisialisasi sequence penomoran' } }, 500);
  }

  // Increment sequence
  const nextNum = seq.currentNumber + 1;
  await db.update(numberingSequences)
    .set({ currentNumber: nextNum, updatedAt: nowStr })
    .where(eq(numberingSequences.id, seq.id))
    .run();

  // Generate final number
  const finalDocNumber = generateDocumentNumber(format, nextNum, now, org ? org.taxId || '' : '', tpl.slug.toUpperCase());

  // Render static HTML snapshot
  const data = JSON.parse(doc.dataJson);
  const tplDef = {
    id: tpl.id,
    slug: tpl.slug,
    name: tpl.name,
    category: tpl.category,
    locale: 'id-ID',
    source: tpl.source as any,
    page: JSON.parse(ver.printSettingsJson),
    fields: JSON.parse(ver.schemaJson),
    layout: ver.printSettingsJson ? { blocks: JSON.parse(ver.printSettingsJson).blocks || [] } : undefined
  };
  
  // Built-in templates layout parsing
  const builtInTpl = BUILT_IN_TEMPLATES.find(x => x.id === tpl.id);
  const finalTpl = builtInTpl || tplDef;

  const htmlSnapshot = renderDocumentHtml(finalTpl, data, orgName, finalDocNumber);

  // Update document state
  await db.update(documents)
    .set({
      documentNumber: finalDocNumber,
      status: 'final',
      renderedSnapshotHtml: htmlSnapshot,
      finalizedAt: nowStr,
      updatedAt: nowStr
    })
    .where(eq(documents.id, id))
    .run();

  const finalizedDoc = await db.select().from(documents).where(eq(documents.id, id)).get();
  return c.json(finalizedDoc);
});

// Void Document Route
app.post('/api/documents/:id/void', async (c) => {
  const id = c.req.param('id');
  const doc = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Dokumen tidak ditemukan' } }, 404);
  }

  const body = await c.req.json();
  const reason = body.reason || 'Dibatalkan oleh operator';

  const now = new Date().toISOString();
  await db.update(documents)
    .set({
      status: 'void',
      voidReason: reason,
      updatedAt: now
    })
    .where(eq(documents.id, id))
    .run();

  const voidedDoc = await db.select().from(documents).where(eq(documents.id, id)).get();
  return c.json(voidedDoc);
});

// 6. Preview rendering route (preview without saving)
app.post('/api/render/preview', async (c) => {
  const body = await c.req.json();
  const { templateId, data } = body;
  
  const tpl = await db.select().from(templates).where(eq(templates.id, templateId)).get();
  const ver = await db.select().from(templateVersions).where(eq(templateVersions.templateId, templateId)).get();
  
  if (!tpl || !ver) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Template tidak ditemukan' } }, 400);
  }

  const org = await db.select().from(organizations).limit(1).get();
  const orgName = org ? org.name : '';

  const tplDef = {
    id: tpl.id,
    slug: tpl.slug,
    name: tpl.name,
    category: tpl.category,
    locale: 'id-ID',
    source: tpl.source as any,
    page: JSON.parse(ver.printSettingsJson),
    fields: JSON.parse(ver.schemaJson)
  };

  const builtInTpl = BUILT_IN_TEMPLATES.find(x => x.id === tpl.id);
  const finalTpl = builtInTpl || tplDef;

  const html = renderDocumentHtml(finalTpl, data || {}, orgName, 'PREVIEW-DRAFT');
  return c.json({ html });
});

// GET /api/documents/:id/render/html
app.get('/api/documents/:id/render/html', async (c) => {
  const id = c.req.param('id');
  const doc = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return c.html('<h1>Dokumen tidak ditemukan</h1>', 404);
  }

  if (doc.status === 'final' && doc.renderedSnapshotHtml) {
    return c.html(doc.renderedSnapshotHtml);
  }

  // If draft or doesn't have snapshot, render live
  const tpl = await db.select().from(templates).where(eq(templates.id, doc.templateId)).get();
  if (!tpl) {
    return c.html('<h1>Template tidak ditemukan</h1>', 404);
  }
  const ver = await db.select().from(templateVersions).where(eq(templateVersions.id, doc.templateVersionId)).get();
  if (!ver) {
    return c.html('<h1>Versi template tidak ditemukan</h1>', 404);
  }
  const org = await db.select().from(organizations).limit(1).get();
  const orgName = org ? org.name : '';

  const tplDef = {
    id: tpl.id,
    slug: tpl.slug,
    name: tpl.name,
    category: tpl.category,
    locale: 'id-ID',
    source: tpl.source as any,
    page: JSON.parse(ver.printSettingsJson),
    fields: JSON.parse(ver.schemaJson)
  };

  const builtInTpl = BUILT_IN_TEMPLATES.find(x => x.id === tpl.id);
  const finalTpl = builtInTpl || tplDef;

  const html = renderDocumentHtml(finalTpl, JSON.parse(doc.dataJson), orgName, doc.documentNumber || 'DRAFT');
  return c.html(html);
});

// 7. Backup Routes
app.get('/api/backup/export', async (c) => {
  const orgs = await db.select().from(organizations).all();
  const conts = await db.select().from(contacts).all();
  const tpls = await db.select().from(templates).all();
  const vers = await db.select().from(templateVersions).all();
  const docs = await db.select().from(documents).all();
  const seqs = await db.select().from(numberingSequences).all();

  const backupData = {
    format: 'cetakdocs-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.1.0',
    data: {
      organizations: orgs,
      contacts: conts,
      templates: tpls,
      templateVersions: vers,
      documents: docs,
      numberingSequences: seqs
    }
  };

  return c.json(backupData);
});

app.post('/api/backup/restore', async (c) => {
  const body = await c.req.json();
  
  if (body.format !== 'cetakdocs-backup') {
    return c.json({ error: { code: 'BACKUP_INVALID', message: 'Format backup tidak dikenali.' } }, 400);
  }

  const data = body.data;

  // Transaction-like restore using drizzle transaction
  try {
    await db.transaction(async (tx) => {
      // Clear current tables
      await tx.delete(organizations);
      await tx.delete(contacts);
      await tx.delete(templates);
      await tx.delete(templateVersions);
      await tx.delete(documents);
      await tx.delete(numberingSequences);

      // Restore Organizations
      if (data.organizations) {
        for (const row of data.organizations) {
          await tx.insert(organizations).values({
            id: row.id,
            name: row.name,
            legalName: row.legalName,
            address: row.address,
            phone: row.phone,
            email: row.email,
            taxId: row.taxId,
            logoAssetId: row.logoAssetId,
            settingsJson: row.settingsJson,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          });
        }
      }

      // Restore Contacts
      if (data.contacts) {
        for (const row of data.contacts) {
          await tx.insert(contacts).values({
            id: row.id,
            type: row.type,
            name: row.name,
            companyName: row.companyName,
            phone: row.phone,
            email: row.email,
            address: row.address,
            notes: row.notes,
            metadataJson: row.metadataJson,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          });
        }
      }

      // Restore Templates
      if (data.templates) {
        for (const row of data.templates) {
          await tx.insert(templates).values({
            id: row.id,
            source: row.source,
            slug: row.slug,
            name: row.name,
            category: row.category,
            description: row.description,
            latestVersionId: row.latestVersionId,
            isEnabled: row.isEnabled ? 1 : 0,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          });
        }
      }

      // Restore Versions
      if (data.templateVersions) {
        for (const row of data.templateVersions) {
          await tx.insert(templateVersions).values({
            id: row.id,
            templateId: row.templateId,
            version: row.version,
            schemaJson: row.schemaJson,
            rendererKey: row.rendererKey,
            sampleDataJson: row.sampleDataJson,
            printSettingsJson: row.printSettingsJson,
            createdAt: row.createdAt
          });
        }
      }

      // Restore Documents
      if (data.documents) {
        for (const row of data.documents) {
          await tx.insert(documents).values({
            id: row.id,
            templateId: row.templateId,
            templateVersionId: row.templateVersionId,
            organizationId: row.organizationId,
            contactId: row.contactId,
            documentNumber: row.documentNumber,
            title: row.title,
            status: row.status,
            dataJson: row.dataJson,
            renderedSnapshotHtml: row.renderedSnapshotHtml,
            finalizedAt: row.finalizedAt,
            voidReason: row.voidReason,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          });
        }
      }

      // Restore Numberings
      if (data.numberingSequences) {
        for (const row of data.numberingSequences) {
          await tx.insert(numberingSequences).values({
            id: row.id,
            scope: row.scope,
            prefix: row.prefix,
            currentNumber: row.currentNumber,
            padding: row.padding,
            resetRule: row.resetRule,
            updatedAt: row.updatedAt
          });
        }
      }
    });

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: { code: 'INTERNAL_ERROR', message: `Gagal memulihkan cadangan: ${err.message}` } }, 500);
  }
});
