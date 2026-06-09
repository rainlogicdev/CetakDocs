import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FileText, Grid, FileArchive, Users, Settings, Briefcase, Database, Sparkles } from 'lucide-react';
import { ChatPanel } from '../../features/chat/ChatPanel';

const navItems = [
  { name: 'Buat Dokumen', path: '/', icon: FileText },
  { name: 'Template', path: '/templates', icon: Grid },
  { name: 'Dokumen Tersimpan', path: '/documents', icon: FileArchive },
  { name: 'Kontak', path: '/contacts', icon: Users },
  { name: 'Profil Usaha', path: '/profile', icon: Briefcase },
  { name: 'Backup & Restore', path: '/backup', icon: Database },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
];

export function AppShell() {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('cetakdocs:open-chat', handleOpenChat);
    return () => window.removeEventListener('cetakdocs:open-chat', handleOpenChat);
  }, []);

  return (
    <div className="flex h-screen bg-bg-muted overflow-hidden relative">
      <aside className="w-64 bg-bg-muted border-r border-border flex flex-col hidden md:flex print:hidden">
        <div className="p-5 border-b border-border">
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <span className="text-2xl">🖨️</span> CetakDocs
          </h1>
          <p className="text-xs text-text-muted mt-1 font-medium">Toolkit Dokumen Harian</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/'
              : location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent font-medium' 
                    : 'text-text-muted hover:bg-border/50 hover:text-text'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border space-y-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-accent to-accent/90 hover:opacity-95 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Asisten AI (BYOK)
          </button>
          <div className="bg-bg-muted p-3 rounded-md text-xs text-text-muted space-y-1">
            <div className="font-medium">Design by <span className="text-accent">RainLogic</span></div>
            <div>Open Source — GPL-3.0 License</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-bg overflow-hidden relative">
        <header className="h-14 border-b border-border bg-bg flex items-center px-4 md:hidden">
          <h1 className="text-lg font-bold text-text flex items-center gap-2">
            <span>🖨️</span> CetakDocs
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Chat Assistant side panel */}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating AI Button (Mobile / overall shortcut) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 p-4 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 print:hidden flex items-center justify-center group"
          title="Tanya Asisten AI"
        >
          <Sparkles className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm font-bold whitespace-nowrap">
            Tanya AI
          </span>
        </button>
      )}
    </div>
  );
}
