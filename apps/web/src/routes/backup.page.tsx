import { useRef } from 'react';
import { backupApi } from '@/lib/api-client';
import { Download, Upload, AlertTriangle, Database } from 'lucide-react';

export function BackupPage() {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const backup = await backupApi.export();

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cetakdocs-backup-${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Gagal mengekspor data: ' + (err.message || ''));
    }
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

      await backupApi.restore(parsed);
      alert('Backup berhasil dipulihkan!');
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert('Gagal membaca file backup: ' + (err.message || 'Pastikan file JSON valid.'));
    }

    if (fileInput.current) fileInput.current.value = '';
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
              <p className="text-sm text-text-muted mb-4">Unduh semua dokumen, kontak, template, dan profil usaha Anda dalam satu file JSON.</p>
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

        {/* Info */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-warning/10 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-text mb-1">Catatan Penting</h2>
              <p className="text-sm text-text-muted">Data disimpan di server lokal (SQLite). Restore akan mengganti seluruh data yang ada. Pastikan Anda mengekspor cadangan terlebih dahulu sebelum melakukan restore.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center">Semua data disimpan secara lokal di server (SQLite). Tidak ada data yang dikirim ke cloud.</p>
      </div>
    </div>
  );
}
