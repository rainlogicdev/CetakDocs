import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : `file:${path.resolve(process.cwd(), 'data/app.db')}`;

// Pastikan direktori folder data sudah dibuat
const localPath = dbPath.replace('file:', '');
const dbDir = path.dirname(localPath);
if (!fs.existsSync(dbDir) && !dbPath.startsWith('http')) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqliteClient = createClient({ url: dbPath });

// Enable foreign key constraints and set busy timeout in SQLite
sqliteClient.execute('PRAGMA foreign_keys = ON;').catch(err => {
  console.error('Failed to enable PRAGMA foreign_keys:', err);
});
sqliteClient.execute('PRAGMA busy_timeout = 5000;').catch(err => {
  console.error('Failed to set PRAGMA busy_timeout:', err);
});

export const db = drizzle(sqliteClient, { schema });
