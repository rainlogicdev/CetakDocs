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
export const db = drizzle(sqliteClient, { schema });
