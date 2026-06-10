import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TemplateGallery } from '@/features/templates/TemplateGallery';
import { documentsApi, contactsApi } from '@/lib/api-client';
import { FileText, Users, Scan, Plus, ChevronRight, Sparkles, Printer, FileArchive } from 'lucide-react';

export function HomePage() {
  const [stats, setStats] = useState({
    documentsCount: 0,
    contactsCount: 0,
    scansCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const docs = await documentsApi.list().catch(() => []);
        const conts = await contactsApi.list().catch(() => []);
        
        // Fetch scans count
        let scansCount = 0;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        const scansRes = await fetch(`${apiUrl}/api/scanned-documents`).catch(() => null);
        if (scansRes && scansRes.ok) {
          const scansList = await scansRes.json();
          scansCount = scansList.length;
        }

        setStats({
          documentsCount: docs.length,
          contactsCount: conts.length,
          scansCount,
          loading: false
        });
      } catch (e) {
        console.error('Gagal memuat statistik dashboard:', e);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Banner Utama Premium */}
      <div className="relative bg-gradient-to-br from-[#0c142c] via-[#0d1c44] to-[#040817] border border-slate-800/80 rounded-2xl p-8 md:p-10 text-white overflow-hidden shadow-lg shadow-indigo-950/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              Local-first & Privacy-First
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
              Cetak Dokumen Usaha & Komunitas Praktis
            </h1>
            <p className="text-sm md:text-base text-slate-350 max-w-xl font-medium leading-relaxed text-slate-300">
              Buat kwitansi, surat jalan, nota servis, label alamat, dan berita acara secara instan.
              Data aman tersimpan di komputer Anda tanpa login.
            </p>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl md:text-6xl shadow-inner backdrop-blur-sm shrink-0 select-none">
            🖨️
          </div>
        </div>
      </div>

      {/* Dashboard Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center justify-between shadow-sm premium-shadow hover:scale-[1.01] transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Dokumen Tersimpan</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {stats.loading ? '...' : stats.documentsCount}
            </h3>
          </div>
          <div className="p-4 bg-indigo-550/5 text-indigo-600 bg-indigo-50 rounded-xl">
            <FileArchive className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center justify-between shadow-sm premium-shadow hover:scale-[1.01] transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Kontak Relasi</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {stats.loading ? '...' : stats.contactsCount}
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center justify-between shadow-sm premium-shadow hover:scale-[1.01] transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Inbox OCR Masuk</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {stats.loading ? '...' : stats.scansCount}
            </h3>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <Scan className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tindakan Cepat (Quick Actions) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tindakan Cepat</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/documents/new/tpl_kwitansi_basic"
            className="group flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-left hover:border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-250">
              Rp
            </div>
            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center justify-between">
              Kwitansi Baru <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-500">Tanda bukti transaksi pembayaran tunai.</p>
          </Link>

          <Link
            to="/documents/new/tpl_surat_jalan_basic"
            className="group flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-left hover:border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-255">
              📦
            </div>
            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center justify-between">
              Surat Jalan Baru <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-500">Dokumen pengiriman barang ke pelanggan.</p>
          </Link>

          <Link
            to="/documents/new/tpl_nota_servis_basic"
            className="group flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-left hover:border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-260">
              🔧
            </div>
            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center justify-between">
              Nota Servis Baru <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-500">Tanda terima servis barang & antrean.</p>
          </Link>

          <Link
            to="/scans"
            className="group flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-left hover:border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-265">
              📷
            </div>
            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center justify-between">
              Scan Dokumen <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-500">Ekstrak teks gambar dengan Offline OCR.</p>
          </Link>
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* Galeri Template */}
      <TemplateGallery />
    </div>
  );
}
