import { useRef } from 'react';
import { db } from '@/lib/db';
import { Download, Upload, AlertTriangle, Database, CheckCircle } from 'lucide-react';

export function BackupPage() {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const [documents, contacts, organizations] = await Promise.all([
      db.documents.toArray(),
      db.contacts.toArray(),
      db.organizations.toArray(),
    ]);

    const backup = {
      format: 'cetakdocs-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '0.1.0',
      data: { documents, contacts, organizations },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cetakdocs-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed.format !== 'cetakdocs-backup') {
        alert('Format file tidak valid. Pastikan file ini berasal dari ekspor CetakDocs.');
        return;
      }

      if (!confirm(`File backup tertanggal ${parsed.exportedAt?.substring(0, 10) || '?'}.\n\nData saat ini akan DIGANTI SELURUHNYA dengan data dari backup.\n\nLanjutkan?`)) return;

      const { documents, contacts, organizations } = parsed.data;

      await db.transaction('rw', [db.documents, db.contacts, db.organizations], async () => {
        await db.documents.clear();
        await db.contacts.clear();
        await db.organizations.clear();
        if (documents?.length) await db.documents.bulkAdd(documents);
        if (contacts?.length) await db.contacts.bulkAdd(contacts);
        if (organizations?.length) await db.organizations.bulkAdd(organizations);
      });

      alert(`Backup berhasil dipulihkan!\n\n• ${documents?.length || 0} dokumen\n• ${contacts?.length || 0} kontak\n• ${organizations?.length || 0} profil usaha`);
    } catch (err) {
      console.error(err);
      alert('Gagal membaca file backup. Pastikan file JSON valid.');
    }

    if (fileInput.current) fileInput.current.value = '';
  };

  const handleClearAll = async () => {
    if (!confirm('PERINGATAN: Semua data (dokumen, kontak, profil) akan DIHAPUS PERMANEN.\n\nApakah Anda yakin?')) return;
    if (!confirm('Konfirmasi terakhir: Data yang dihapus TIDAK BISA dikembalikan.\n\nHapus semua?')) return;

    await db.transaction('rw', [db.documents, db.contacts, db.organizations], async () => {
      await db.documents.clear();
      await db.contacts.clear();
      await db.organizations.clear();
    });
    alert('Semua data berhasil dihapus.');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Database className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text">Backup & Restore</h1>
          <p className="text-text-muted">Ekspor atau impor seluruh data CetakDocs Anda.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Export */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-success/10 rounded-lg shrink-0">
              <Download className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-text mb-1">Ekspor Data</h2>
              <p className="text-sm text-text-muted mb-4">Unduh semua dokumen, kontak, dan profil usaha Anda dalam satu file JSON.</p>
              <button onClick={handleExport} className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 transition-colors text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" /> Unduh Backup (.json)
              </button>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-accent/10 rounded-lg shrink-0">
              <Upload className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-text mb-1">Pulihkan dari Backup</h2>
              <p className="text-sm text-text-muted mb-4">Muat ulang data dari file backup yang pernah Anda ekspor sebelumnya. Data saat ini akan digantikan.</p>
              <input ref={fileInput} type="file" accept=".json" onChange={handleImport} className="hidden" />
              <button onClick={() => fileInput.current?.click()} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" /> Pilih File Backup
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-bg border border-danger/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-danger/10 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-danger mb-1">Zona Berbahaya</h2>
              <p className="text-sm text-text-muted mb-4">Menghapus seluruh data dari browser ini. Tindakan ini tidak dapat dibatalkan.</p>
              <button onClick={handleClearAll} className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors text-sm font-medium">
                Hapus Semua Data
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center">Semua data disimpan secara lokal di browser Anda (IndexedDB). Tidak ada data yang dikirim ke server.</p>
      </div>
    </div>
  );
}
