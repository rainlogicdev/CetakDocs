import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { formatDateIndonesian } from '@cetakdocs/core';
import { documentsApi, type ApiDocument } from '@/lib/api-client';

export function DocumentList() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ApiDocument[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const docs = await documentsApi.list(searchQuery || undefined);
      setDocuments(docs);
      setError(null);
    } catch (err: any) {
      console.error('Gagal memuat dokumen:', err);
      setError(err.message || 'Gagal memuat dokumen dari server.');
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      try {
        await documentsApi.delete(id);
        await loadDocuments();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus dokumen.');
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 border border-dashed border-danger/30 rounded-lg bg-danger/5">
        <p className="text-danger font-medium mb-2">Gagal memuat dokumen</p>
        <p className="text-text-muted text-sm">{error}</p>
        <button onClick={loadDocuments} className="mt-4 px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent/90">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!documents) {
    return (
      <div className="text-center py-12 text-text-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat dokumen...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-bg text-text text-sm focus:ring-2 focus:ring-accent outline-none"
          placeholder="Cari judul atau nomor dokumen..."
        />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-bg-muted">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text mb-1">Belum ada dokumen</h3>
          <p className="text-text-muted mb-4">Anda belum menyimpan draf atau mencetak dokumen apa pun.</p>
          <Link to="/" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
            Buat Dokumen Baru
          </Link>
        </div>
      ) : (
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
                        {doc.status === 'draft' ? (
                          <button
                            onClick={() => navigate(`/documents/new/${doc.templateId}`, {
                              state: {
                                editingDocId: doc.id,
                                initialData: JSON.parse(doc.dataJson),
                                title: doc.title
                              }
                            })}
                            className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                            title="Edit Draf"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            className="p-2 text-text-muted/40 cursor-not-allowed rounded-md"
                            title="Hanya draf yang dapat diedit"
                            disabled
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
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
      )}
    </div>
  );
}
