import * as fs from 'fs';
import * as path from 'path';
import { sqliteClient } from './client';

/**
 * Jalankan migrasi SQL secara manual dari file .sql hasil drizzle-kit generate.
 * Ini menghindari bug pada drizzle-orm/libsql/migrator yang mencari fungsi `client.migrate`
 * yang tidak didukung oleh instance client libsql lokal.
 */
export async function runCustomMigrations(migrationsFolder: string) {
  console.log(`[Migrator] Memeriksa file migrasi di: ${migrationsFolder}`);
  
  // Buat tabel pelacak migrasi jika belum ada
  await sqliteClient.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER
    )
  `);

  if (!fs.existsSync(migrationsFolder)) {
    console.warn(`[Migrator] Peringatan: Folder migrasi tidak ditemukan di ${migrationsFolder}`);
    return;
  }

  const files = fs.readdirSync(migrationsFolder)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`[Migrator] Menemukan ${files.length} file migrasi.`);

  for (const file of files) {
    const filePath = path.join(migrationsFolder, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Cek apakah migrasi ini sudah pernah dijalankan
    const alreadyApplied = await sqliteClient.execute({
      sql: 'SELECT id FROM __drizzle_migrations WHERE hash = ?',
      args: [file]
    });

    if (alreadyApplied.rows.length === 0) {
      console.log(`[Migrator] Menjalankan migrasi: ${file}...`);
      
      // Pisahkan query berdasarkan statement-breakpoint bawaan drizzle
      const statements = content
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Jalankan setiap statement satu per satu
      for (const statement of statements) {
        try {
          await sqliteClient.execute(statement);
        } catch (stmtErr: any) {
          console.error(`[Migrator] Error saat mengeksekusi statement dalam file ${file}:`, stmtErr);
          console.error(`Statement bermasalah:`, statement);
          throw stmtErr;
        }
      }

      // Catat bahwa migrasi ini sudah berhasil diterapkan
      await sqliteClient.execute({
        sql: 'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
        args: [file, Date.now()]
      });
      console.log(`[Migrator] ✅ Migrasi ${file} berhasil diterapkan.`);
    } else {
      console.log(`[Migrator] Migrasi ${file} sudah pernah diterapkan (skip).`);
    }
  }
  
  console.log('[Migrator] ✅ Seluruh migrasi database selesai diperiksa/diterapkan.');
}
