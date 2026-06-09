import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalContact } from '@/lib/db';
import { Users, Plus, Trash2, Search, Phone, MapPin, Mail } from 'lucide-react';

export function ContactsPage() {
  const contacts = useLiveQuery<LocalContact[]>(() => db.contacts.orderBy('name').toArray());
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '', notes: '' });

  const filtered = contacts?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '', email: '', notes: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Nama wajib diisi.');
    const now = new Date().toISOString();
    if (editId) {
      await db.contacts.update(editId, { ...form, updatedAt: now });
    } else {
      await db.contacts.add({
        id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substring(2),
        ...form,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const handleEdit = (c: LocalContact) => {
    setForm({ name: c.name, phone: c.phone, address: c.address, email: c.email, notes: c.notes });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus kontak ini?')) await db.contacts.delete(id);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Kontak</h1>
          <p className="text-text-muted">Simpan data pelanggan, supplier, dan rekanan Anda.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Tambah Kontak
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-8 bg-bg border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4">{editId ? 'Edit Kontak' : 'Kontak Baru'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Nama <span className="text-danger">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm" placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Telepon</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm" placeholder="email@contoh.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Alamat</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm" placeholder="Alamat lengkap" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-text mb-1 block">Catatan</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm min-h-[60px]" placeholder="Catatan tambahan (opsional)" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 text-sm font-medium">{editId ? 'Simpan Perubahan' : 'Simpan Kontak'}</button>
            <button onClick={resetForm} className="px-4 py-2 border border-border text-text rounded-md hover:bg-bg-muted text-sm">Batal</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-bg text-text text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Cari kontak..." />
      </div>

      {/* List */}
      {!contacts ? (
        <div className="text-center py-12 text-text-muted">Memuat kontak...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-bg-muted">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">{search ? 'Tidak ada kontak yang cocok.' : 'Belum ada kontak tersimpan.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-bg border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-text">{c.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-md transition-colors text-xs">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-text-muted">
                {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{c.phone}</div>}
                {c.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{c.email}</div>}
                {c.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{c.address}</div>}
              </div>
              {c.notes && <p className="mt-2 text-xs text-text-muted italic border-t border-border pt-2">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
