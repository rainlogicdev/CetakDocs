import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, HelpCircle, RefreshCw, Clipboard, FileText, Check } from 'lucide-react';
import { streamChatCompletion, getApiKey, getAiSettings, type ChatMessage } from '@/lib/ai-service';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeContext, setActiveContext] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API Key and Active Form Context
  useEffect(() => {
    if (isOpen) {
      getApiKey().then(key => {
        const settings = getAiSettings();
        const needsKey = settings.baseUrl !== 'http://localhost:11434/v1';
        setHasApiKey(!needsKey || !!key);
      });
      
      // Check if there is an active document context on window
      const ctx = (window as any).__activeDocumentContext;
      if (ctx) {
        setActiveContext(ctx);
        // Add greeting system prompt if history is empty
        if (messages.length === 0) {
          setMessages([
            {
              role: 'assistant',
              content: `Halo! Saya Asisten AI CetakDocs. Saya melihat Anda sedang membuka formulir **${ctx.template.name}**.\n\nAnda bisa meminta saya untuk mengisi data formulir secara otomatis. Contoh: *"Isi formulir ini untuk PT Maju Jaya, direktur Ahmad, alamat Jl. Sudirman Jakarta, tanggal hari ini."*`
            }
          ]);
        }
      } else if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: `Halo! Saya Asisten AI CetakDocs. Saya bisa membantu Anda mengoreksi tata bahasa dokumen, merancang draf, atau menjelaskan cara pengisian template.\n\nSilakan atur API Key Anda di **Pengaturan** terlebih dahulu untuk mulai menggunakan.`
          }
        ]);
      }
    }
  }, [isOpen]);

  // Sync active context updates
  useEffect(() => {
    const interval = setInterval(() => {
      const ctx = (window as any).__activeDocumentContext;
      if (ctx !== activeContext) {
        setActiveContext(ctx);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeContext]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    if (!textToSend) setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', content: promptText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Prepare system instruction context
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `Anda adalah Asisten AI CetakDocs, pendamping pengisian dokumen untuk UMKM dan komunitas Indonesia.
Tugas Anda adalah membantu pengguna memahami template dokumen, membuat isi draf, atau mengisi data form secara otomatis.
Jawab dengan bahasa Indonesia yang ramah, sopan, dan profesional.

${activeContext ? `Konteks Form Aktif:
- Template: "${activeContext.template.name}"
- Deskripsi: "${activeContext.template.description || ''}"
- Fields yang tersedia di form ini:
${JSON.stringify(activeContext.template.fields, null, 2)}

Jika pengguna meminta Anda mengisi form atau mengusulkan data, Anda HARUS memberikan response penjelasan singkat di luar blok kode, DAN sertakan sebuah blok kode JSON di akhir jawaban Anda dengan format:
\`\`\`json
{
  "__cetakdocs_autofill": true,
  "data": {
    "nama_field_1": "nilai_baru_1",
    "nama_field_2": "nilai_baru_2"
  }
}
\`\`\`
Pastikan key di dalam object "data" cocok persis dengan field id/name yang ada di atas. Jangan buat field tambahan yang tidak ada di daftar fields. Untuk field bertipe list/array (seperti stringList), sediakan array string, contoh: ["item 1", "item 2"].` : 'Tidak ada dokumen yang aktif saat ini.'}`
    };

    // Prepare message history to send to API
    const apiMessages = [systemPrompt, ...updatedMessages];
    
    // Add temporary assistant placeholder
    setMessages([...updatedMessages, { role: 'assistant', content: '' }]);

    let accumulatedResponse = '';

    try {
      await streamChatCompletion(
        apiMessages,
        (chunk) => {
          accumulatedResponse += chunk;
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              last.content = accumulatedResponse;
            }
            return next;
          });
        },
        () => {
          setIsLoading(false);
          // Auto-parse JSON response if autofill is detected
          processAutoFill(accumulatedResponse);
        }
      );
    } catch (err: any) {
      setIsLoading(false);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          last.content = `❌ Gagal mendapatkan respon: ${err.message || err}`;
        } else {
          next.push({ role: 'assistant', content: `❌ Error: ${err.message || err}` });
        }
        return next;
      });
    }
  };

  const processAutoFill = (responseText: string) => {
    // Look for json code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/({[\s\S]*?"__cetakdocs_autofill"[\s\S]*?})/);
    if (!jsonMatch) return;

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.__cetakdocs_autofill && parsed.data && activeContext?.setFormData) {
        // Direct inject to react hook state on window context
        activeContext.setFormData((prev: any) => ({
          ...prev,
          ...parsed.data
        }));
        
        // Push a notifications system message to chat history
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `✨ **Formulir Terisi Otomatis!** Saya telah memasukkan data ke dalam formulir Anda:\n${Object.entries(parsed.data)
              .map(([k, v]) => `- **${k}**: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join('\n')}`
          }
        ]);
      }
    } catch (e) {
      console.warn('Failed to auto-parse autofill payload:', e);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleQuickAction = (actionType: string) => {
    if (!activeContext) {
      handleSend("Beri tahu saya apa saja yang bisa Anda bantu di CetakDocs.");
      return;
    }

    if (actionType === 'fill') {
      handleSend(`Isi data formulir ${activeContext.template.name} ini dengan contoh data simulasi UMKM Indonesia yang lengkap.`);
    } else if (actionType === 'guide') {
      handleSend(`Jelaskan cara pengisian dan poin penting dalam dokumen ${activeContext.template.name}.`);
    } else if (actionType === 'correct') {
      const currentValues = JSON.stringify(activeContext.formData || {});
      handleSend(`Tolong periksa dan koreksi data dokumen berikut apakah ada kesalahan penulisan atau tata bahasa: ${currentValues}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-bg/95 backdrop-blur-md border-l border-border shadow-2xl z-50 flex flex-col transition-all duration-300 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-text text-sm">Asisten AI</h3>
            <span className="text-[10px] text-text-muted font-mono">
              {activeContext ? `Konteks: ${activeContext.template.name}` : 'Siap membantu'}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-border/30 rounded-lg text-text-muted hover:text-text transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasApiKey && (
          <div className="p-4 bg-error/5 border border-error/20 rounded-xl text-xs text-error space-y-2">
            <p className="font-bold">🔑 API Key Belum Dikonfigurasi</p>
            <p>Silakan buka halaman <strong>Pengaturan</strong> terlebih dahulu untuk memasukkan API Key atau memilih provider gratis seperti Ollama lokal.</p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            const isSystem = msg.role === 'system';
            if (isSystem) return null;

            return (
              <div
                key={index}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-sm relative group ${
                    isBot
                      ? 'bg-bg-muted border border-border text-text rounded-tl-none'
                      : 'bg-accent text-white rounded-tr-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed font-sans prose prose-sm max-w-none prose-headings:text-text">
                    {msg.content}
                  </div>
                  {isBot && msg.content && (
                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-all p-1 bg-bg border border-border rounded text-text-muted hover:text-text"
                      title="Salin pesan"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-success" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-text" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="p-3 bg-bg-muted border border-border rounded-2xl rounded-tl-none max-w-[80%] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions Panel */}
      {activeContext && !isLoading && (
        <div className="p-3 border-t border-border bg-bg-muted/20 flex flex-wrap gap-1.5">
          <button
            onClick={() => handleQuickAction('fill')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-bg text-[11px] font-semibold text-text hover:bg-border/30 transition-all"
          >
            <Sparkles className="w-3 h-3 text-accent" />
            Isi Form Otomatis
          </button>
          <button
            onClick={() => handleQuickAction('guide')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-bg text-[11px] font-semibold text-text hover:bg-border/30 transition-all"
          >
            <HelpCircle className="w-3 h-3 text-text-muted" />
            Panduan Pengisian
          </button>
          <button
            onClick={() => handleQuickAction('correct')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-bg text-[11px] font-semibold text-text hover:bg-border/30 transition-all"
          >
            <FileText className="w-3 h-3 text-text-muted" />
            Koreksi Data
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-border bg-bg-muted/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!hasApiKey || isLoading}
            placeholder={
              !hasApiKey
                ? 'Harap atur API Key dulu...'
                : activeContext
                ? 'Tanyakan sesuatu tentang form ini...'
                : 'Ketik pesan Anda di sini...'
            }
            className="flex-1 px-3 py-2 border border-border rounded-xl bg-bg text-sm text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!hasApiKey || isLoading || !input.trim()}
            className="p-2 bg-accent hover:bg-accent-hover text-white rounded-xl disabled:opacity-50 disabled:hover:bg-accent transition-all shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
