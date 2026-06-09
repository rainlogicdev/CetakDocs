import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 mb-6">
        <Construction className="w-8 h-8 text-warning" />
      </div>
      <h1 className="text-2xl font-bold text-text mb-2">{title}</h1>
      <p className="text-text-muted mb-8">{description}</p>
      <Link 
        to="/" 
        className="inline-flex px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm font-medium"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
