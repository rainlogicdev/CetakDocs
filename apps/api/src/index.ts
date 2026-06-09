import { serve } from '@hono/node-server';
import { app } from './app';
import { seedTemplates } from './db/seed';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load dotenv
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Start the CetakDocs API server.
 * Exported so Electron main process can call it directly.
 */
export async function startServer(port = 8787): Promise<{ port: number }> {
  console.log('Memulai CetakDocs API Server...');
  
  // Seed built-in templates dan organisasi awal
  try {
    await seedTemplates();
    console.log('✅ Inisialisasi database & template berhasil.');
  } catch (error) {
    console.error('❌ Gagal melakukan inisialisasi database:', error);
  }

  // Start Server
  return new Promise((resolve) => {
    serve({
      fetch: app.fetch,
      port
    }, (info) => {
      console.log(`🚀 API Server berjalan di http://localhost:${info.port}`);
      resolve({ port: info.port });
    });
  });
}

// Run directly if this file is the entry point (not imported by Electron)
const isDirectRun = process.argv[1]?.includes('index') || !process.argv[1];
if (isDirectRun) {
  const port = process.env.API_PORT ? parseInt(process.env.API_PORT) : 8787;
  startServer(port).catch(err => {
    console.error('Server error:', err);
  });
}
