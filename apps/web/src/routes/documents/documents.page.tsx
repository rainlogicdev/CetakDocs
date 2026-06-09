import { DocumentList } from '@/features/documents/DocumentList';

export function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Dokumen Tersimpan</h1>
        <p className="text-text-muted">Daftar semua draf dan dokumen yang pernah Anda buat.</p>
      </div>
      
      <DocumentList />
    </div>
  );
}
