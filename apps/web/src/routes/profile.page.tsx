import { useState, useEffect } from 'react';
import { organizationsApi, type ApiOrganization } from '@/lib/api-client';
import { Briefcase, Save, CheckCircle, Loader2 } from 'lucide-react';

export function ProfilePage() {
  const [org, setOrg] = useState<ApiOrganization | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    organizationsApi.list()
      .then(orgs => {
        if (orgs.length > 0) setOrg(orgs[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!org) return;
    try {
      await organizationsApi.update(org.id, {
        name: org.name,
        legalName: org.legalName || undefined,
        address: org.address || undefined,
        phone: org.phone || undefined,
        email: org.email || undefined,
        taxId: org.taxId || undefined,
        settingsJson: org.settingsJson,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert('Gagal menyimpan profil: ' + (err.message || ''));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-text-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat profil...
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="text-center py-12 border border-dashed border-danger/30 rounded-lg bg-danger/5">
        <p className="text-danger font-medium mb-2">Gagal memuat profil usaha</p>
        <p className="text-text-muted text-sm">{error || 'Tidak ada profil usaha ditemukan.'}</p>
      </div>
    );
  }

  const field = (label: string, key: keyof ApiOrganization, placeholder: string, type = 'text') => (
    <div>
      <label className="text-sm font-medium text-text mb-1 block">{label}</label>
      <input
        type={type}
        value={(org[key] as string) || ''}
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
        
        <p className="text-xs text-text-muted">Data disimpan di server lokal (SQLite). Tidak dikirim ke cloud.</p>
      </div>
    </div>
  );
}
