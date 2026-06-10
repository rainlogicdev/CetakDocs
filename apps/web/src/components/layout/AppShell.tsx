import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FileText, Grid, FileArchive, Users, Settings, Briefcase, Database, Sparkles, Scan } from 'lucide-react';
import { ChatPanel } from '../../features/chat/ChatPanel';

const navItems = [
  { name: 'Buat Dokumen', path: '/', icon: FileText },
  { name: 'Template', path: '/templates', icon: Grid },
  { name: 'Dokumen Tersimpan', path: '/documents', icon: FileArchive },
  { name: 'Dokumen Masuk (OCR)', path: '/scans', icon: Scan },
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
      <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/60 flex flex-col hidden md:flex print:hidden shadow-lg shadow-black/25">
        <div className="p-5 border-b border-slate-800/60 bg-[#0d1527]/40">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <span className="text-2xl drop-shadow-md">🖨️</span> CetakDocs
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">Toolkit Dokumen Harian</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/'
              : location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-indigo-600/15 text-white font-semibold shadow-inner shadow-indigo-500/5 border-l-4 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="text-sm font-medium tracking-wide">{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800/60 bg-[#0d1527]/20 space-y-3.5">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-bold shadow-md shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
            <span className="tracking-wide">Asisten AI (BYOK)</span>
          </button>
          <div className="bg-[#060b13]/60 p-3 rounded-lg text-[10px] text-slate-500 space-y-1.5 border border-slate-800/30">
            <div className="font-semibold tracking-wide">Design by <span className="text-indigo-400 hover:text-indigo-300 transition-colors">RainLogic</span></div>
            <div className="opacity-75">Open Source — GPL-3.0 License</div>
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
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-bg-muted/30">
          <Outlet />
        </div>
      </main>

      {/* Chat Assistant side panel */}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating AI Button (Mobile / overall shortcut) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 print:hidden flex items-center justify-center group"
          title="Tanya Asisten AI"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm font-bold whitespace-nowrap">
            Tanya AI
          </span>
        </button>
      )}
    </div>
  );
}
