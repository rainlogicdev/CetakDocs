import { useState, useEffect } from 'react';
import { db, getOrCreateOrg, type LocalOrganization } from '@/lib/db';
import { Briefcase, Save, CheckCircle } from 'lucide-react';

export function ProfilePage() {
  const [org, setOrg] = useState<LocalOrganization | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getOrCreateOrg().then(setOrg);
  }, []);

  const handleSave = async () => {
    if (!org) return;
    await db.organizations.put({ ...org, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!org) return <div className="text-center py-12 text-text-muted">Memuat profil...</div>;

  const field = (label: string, key: keyof LocalOrganization, placeholder: string, type = 'text') => (
    <div>
      <label className="text-sm font-medium text-text mb-1 block">{label}</label>
      <input
        type={type}
        value={org[key] as string}
        onChange={e => setOrg({ ...org, [key]: e.target.value })}
        className="w-full p-2 border border-border rounded-md bg-bg text-text focus:ring-2 focus:ring-accent outline-none text-sm"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Briefcase className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text">Profil Usaha</h1>
          <p className="text-text-muted">Data ini akan ditampilkan pada dokumen yang Anda cetak.</p>
        </div>
      </div>

      <div className="bg-bg border border-border rounded-xl p-6 shadow-sm space-y-5">
        {field('Nama Usaha / Toko', 'name', 'Contoh: Toko Makmur Jaya')}
        {field('Nama Badan Hukum', 'legalName', 'Contoh: CV Makmur Jaya Sentosa (opsional)')}
        
        <hr className="border-border" />
        
        {field('Alamat Lengkap', 'address', 'Jl. Raya No. 123, Jakarta')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Nomor Telepon', 'phone', '081234567890')}
          {field('Email', 'email', 'kontak@tokosaya.com', 'email')}
        </div>
        
        {field('NPWP / Nomor Pajak', 'taxId', '12.345.678.9-012.000 (opsional)')}

        <hr className="border-border" />

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm font-medium">
            <Save className="w-4 h-4" /> Simpan Profil
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-success text-sm font-medium animate-pulse">
              <CheckCircle className="w-4 h-4" /> Tersimpan!
            </span>
          )}
        </div>
        
        <p className="text-xs text-text-muted">Data disimpan di browser Anda. Tidak dikirim ke server mana pun.</p>
      </div>
    </div>
  );
}
