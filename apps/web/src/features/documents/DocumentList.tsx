import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalDocument } from '@/lib/db';
import { Link } from 'react-router-dom';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { formatDateIndonesian } from '@cetakdocs/core';

export function DocumentList() {
  const documents = useLiveQuery<LocalDocument[]>(() => db.documents.orderBy('updatedAt').reverse().toArray());

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      await db.documents.delete(id);
    }
  };

  if (!documents) {
    return <div className="text-center py-12 text-text-muted">Memuat dokumen...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-lg bg-bg-muted">
        <FileText className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-text mb-1">Belum ada dokumen</h3>
        <p className="text-text-muted mb-4">Anda belum menyimpan draf atau mencetak dokumen apa pun.</p>
        <Link to="/" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
          Buat Dokumen Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-muted/50 border-b border-border">
              <th className="p-4 font-semibold text-text text-sm w-1/3">Judul Dokumen</th>
              <th className="p-4 font-semibold text-text text-sm">Template</th>
              <th className="p-4 font-semibold text-text text-sm">Status</th>
              <th className="p-4 font-semibold text-text text-sm">Tgl Perbarui</th>
              <th className="p-4 font-semibold text-text text-sm text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-text">{doc.title}</div>
                  {doc.documentNumber && <div className="text-xs text-text-muted mt-1">{doc.documentNumber}</div>}
                </td>
                <td className="p-4 text-sm text-text-muted">
                  <span className="px-2 py-1 bg-border/50 rounded-md text-xs capitalize">{doc.templateId.replace(/^tpl_/, '').replace(/_/g, ' ')}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'final' ? 'bg-emerald-500/10 text-emerald-600' : 
                    doc.status === 'draft' ? 'bg-warning/10 text-warning' : 
                    'bg-danger/10 text-danger'
                  }`}>
                    {doc.status === 'draft' ? 'Draf' : doc.status === 'final' ? 'Final' : 'Batal'}
                  </span>
                </td>
                <td className="p-4 text-sm text-text-muted">
                  {formatDateIndonesian(doc.updatedAt.split('T')[0])}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-2 text-text-muted/40 cursor-not-allowed rounded-md"
                      title="Edit — segera hadir"
                      disabled
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
