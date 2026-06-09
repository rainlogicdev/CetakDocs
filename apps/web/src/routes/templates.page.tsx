import { TemplateGallery } from '@/features/templates/TemplateGallery';
import { Grid } from 'lucide-react';

export function TemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Grid className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text">Galeri Template</h1>
          <p className="text-text-muted">Jelajahi semua template dokumen yang tersedia.</p>
        </div>
      </div>
      <TemplateGallery />
    </div>
  );
}
