import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

let dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : `file:${path.resolve(process.cwd(), 'data/app.db')}`;

// Append _busy_timeout=5000 for local file database URL if not already present
if (dbPath.startsWith('file:') && !dbPath.includes('_busy_timeout')) {
  dbPath += dbPath.includes('?') ? '&_busy_timeout=5000' : '?_busy_timeout=5000';
}

// Pastikan direktori folder data sudah dibuat
const localPath = dbPath.replace('file:', '').split('?')[0]; // Remove query params for checking directory
const dbDir = path.dirname(localPath);
if (!fs.existsSync(dbDir) && !dbPath.startsWith('http')) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqliteClient = createClient({ url: dbPath });

// Enable foreign key constraints in SQLite
sqliteClient.execute('PRAGMA foreign_keys = ON;').catch(err => {
  console.error('Failed to enable PRAGMA foreign_keys:', err);
});

export const db = drizzle(sqliteClient, { schema });
