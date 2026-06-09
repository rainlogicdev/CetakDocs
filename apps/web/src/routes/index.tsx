import { TemplateGallery } from '@/features/templates/TemplateGallery';

export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 p-6 bg-accent/10 rounded-xl border border-accent/20 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Cetak dokumen usaha dan komunitas.</h1>
          <p className="text-text-muted">
            Kwitansi, tanda terima, surat jalan, nota servis, label harga, dan dokumen harian lain. Gratis, berjalan offline, dan tanpa login.
          </p>
        </div>
        <div className="text-6xl hidden md:block opacity-80">🖨️</div>
      </div>
      
      <TemplateGallery />
    </div>
  );
}
