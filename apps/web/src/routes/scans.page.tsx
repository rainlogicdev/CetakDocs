import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { extractStructuredDataFromImage } from '@/lib/ai-service';
import Tesseract from 'tesseract.js';
import { 
  Inbox, FileText, Search, Plus, Trash2, Image as ImageIcon, 
  Sparkles, CheckCircle, Clock, Link as LinkIcon, ArrowRight,
  RefreshCw, Copy, Check, ChevronRight, FileSearch
} from 'lucide-react';

export function ScansPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [scannedDocs, setScannedDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'raw'>('ai');
  const [isUploading, setIsUploading] = useState(false);
  
  // OCR & AI state
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [selectedLang, setSelectedLang] = useState('ind'); // ind | eng
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Edited form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<string>('other');
  const [editStatus, setEditStatus] = useState<string>('pending');
  const [editRawText, setEditRawText] = useState('');
  const [editMetadata, setEditMetadata] = useState<any>({});
  const [selectedContactId, setSelectedContactId] = useState('');

  // Fetch contacts and templates from Dexie & constants
  const contacts = useLiveQuery(() => db.contacts.orderBy('name').toArray()) || [];
  
  const BUILT_IN_TEMPLATES = [
    { id: 'berita-acara-serah-terima', name: 'BAST' },
    { id: 'nota-servis', name: 'Nota Servis' },
    { id: 'surat-jalan', name: 'Surat Jalan' },
    { id: 'kwitansi', name: 'Kwitansi' },
    { id: 'tanda-terima', name: 'Tanda Terima' },
    { id: 'surat-kuasa', name: 'Surat Kuasa' },
    { id: 'surat-pernyataan', name: 'Surat Pernyataan' },
  ];

  // 1. Detect API Mode (Electron vs browser)
  useEffect(() => {
    if (window.cetakdocs?.isElectron) {
      window.cetakdocs.getApiPort().then(port => {
        setApiUrl(`http://localhost:${port}`);
      }).catch(err => {
        console.error('Failed to get API URL:', err);
        setApiUrl('local');
      });
    } else {
      setApiUrl('local');
    }
  }, []);

  // 2. Fetch scanned documents list
  const fetchScannedDocs = async () => {
    if (!apiUrl) return;
    
    if (apiUrl === 'local') {
      // IndexedDB query
      let list = await db.scannedDocuments.reverse().sortBy('createdAt');
      
      // Perform JS filters
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        list = list.filter(d => 
          d.title.toLowerCase().includes(query) || 
          (d.rawText && d.rawText.toLowerCase().includes(query))
        );
      }
      if (filterCategory !== 'all') {
        list = list.filter(d => d.category === filterCategory);
      }
      if (filterStatus !== 'all') {
        list = list.filter(d => d.status === filterStatus);
      }
      setScannedDocs(list);
    } else {
      // Server API query
      try {
        let url = `${apiUrl}/api/scanned-documents`;
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (filterCategory !== 'all') params.append('category', filterCategory);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        
        const res = await fetch(`${url}?${params.toString()}`);
        if (res.ok) {
          const list = await res.json();
          setScannedDocs(list);
        }
      } catch (err) {
        console.error('Failed to fetch scans from Hono:', err);
      }
    }
  };

  useEffect(() => {
    fetchScannedDocs();
  }, [apiUrl, searchQuery, filterCategory, filterStatus]);

  // Load detailed information of active scanned document
  useEffect(() => {
    if (selectedDoc) {
      setEditTitle(selectedDoc.title);
      setEditCategory(selectedDoc.category || 'other');
      setEditStatus(selectedDoc.status || 'pending');
      setEditRawText(selectedDoc.rawText || '');
      setSelectedContactId(selectedDoc.contactId || '');
      
      try {
        setEditMetadata(typeof selectedDoc.metadataJson === 'string' 
          ? JSON.parse(selectedDoc.metadataJson || '{}') 
          : selectedDoc.metadataJson || {}
        );
      } catch {
        setEditMetadata({});
      }
    }
  }, [selectedDoc]);

  // 3. File Upload Handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const file = files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    const title = file.name.replace(fileExtension, '');
    const now = new Date().toISOString();
    
    try {
      if (apiUrl === 'local') {
        // Save to Dexie as Blob
        const docId = 'scandoc_' + (Date.now().toString(36) + Math.random().toString(36).substring(2));
        const newRecord = {
          id: docId,
          title: title,
          originalName: file.name,
          status: 'pending',
          category: 'other',
          rawText: '',
          metadataJson: '{}',
          imageBlob: file, // Store binary Blob
          createdAt: now,
          updatedAt: now
        };
        await db.scannedDocuments.add(newRecord);
        setSelectedDoc(newRecord);
      } else {
        // Save to Hono Backend API
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch(`${apiUrl}/api/scanned-documents`, {
          method: 'POST',
          body: formData
        });
        
        if (res.ok) {
          const created = await res.json();
          setSelectedDoc(created);
        } else {
          const errData = await res.json();
          alert('Upload gagal: ' + (errData.error?.message || 'Server error'));
        }
      }
      fetchScannedDocs();
    } catch (err: any) {
      console.error(err);
      alert('Error mengunggah berkas: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. Update Scanned Document fields on Server/Dexie
  const handleSaveFields = async (updates: any) => {
    if (!selectedDoc) return;
    const now = new Date().toISOString();
    
    try {
      if (apiUrl === 'local') {
        await db.scannedDocuments.update(selectedDoc.id, { ...updates, updatedAt: now });
        setSelectedDoc({ ...selectedDoc, ...updates, updatedAt: now });
      } else {
        const res = await fetch(`${apiUrl}/api/scanned-documents/${selectedDoc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const updated = await res.json();
          setSelectedDoc(updated);
        }
      }
      fetchScannedDocs();
    } catch (err) {
      console.error('Failed to update scanned doc:', err);
    }
  };

  // 5. Delete Scanned Document
  const handleDeleteDoc = async () => {
    if (!selectedDoc) return;
    if (!confirm(`Hapus dokumen "${selectedDoc.title}"?`)) return;
    
    try {
      if (apiUrl === 'local') {
        await db.scannedDocuments.delete(selectedDoc.id);
      } else {
        await fetch(`${apiUrl}/api/scanned-documents/${selectedDoc.id}`, {
          method: 'DELETE'
        });
      }
      setSelectedDoc(null);
      fetchScannedDocs();
    } catch (err) {
      console.error('Failed to delete scanned doc:', err);
    }
  };

  // Resolve active image source URL
  const getImageUrl = (doc: any) => {
    if (!doc) return '';
    if (doc.imageBlob) {
      // Local Object URL for Blob stored in Dexie
      return URL.createObjectURL(doc.imageBlob);
    }
    // Hono served asset URL
    return `${apiUrl}/api/assets/${doc.assetId}`;
  };

  // Convert Image to Base64 String
  const convertImageToBase64 = async (doc: any): Promise<string> => {
    let blob: Blob;
    if (doc.imageBlob) {
      blob = doc.imageBlob;
    } else {
      const res = await fetch(`${apiUrl}/api/assets/${doc.assetId}`);
      blob = await res.blob();
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 6. Run Local OCR (Tesseract.js)
  const runLocalOcr = async () => {
    if (!selectedDoc) return;
    setIsOcrRunning(true);
    setOcrProgress('Menginisialisasi engine...');
    
    const imageUrl = getImageUrl(selectedDoc);
    
    try {
      const { data } = await Tesseract.recognize(
        imageUrl,
        selectedLang,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(`Membaca teks: ${Math.round(m.progress * 100)}%`);
            } else if (m.status === 'loading tesseract core') {
              setOcrProgress('Memuat core OCR...');
            } else if (m.status === 'loading language traineddata') {
              setOcrProgress('Memuat bahasa...');
            } else {
              setOcrProgress(m.status);
            }
          }
        }
      );
      
      setEditRawText(data.text);
      await handleSaveFields({ rawText: data.text });
      setOcrProgress('Selesai!');
      setTimeout(() => setOcrProgress(''), 2000);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengekstrak teks (Local OCR): ' + err.message);
    } finally {
      setIsOcrRunning(false);
    }
  };

  // 7. Run AI Multimodal OCR (BYOK)
  const runAiOcr = async () => {
    if (!selectedDoc) return;
    setIsAiRunning(true);
    
    try {
      const base64 = await convertImageToBase64(selectedDoc);
      const mimeType = selectedDoc.imageBlob?.type || 'image/png';
      
      const structuredResult = await extractStructuredDataFromImage(base64, mimeType);
      
      setEditMetadata(structuredResult);
      
      // Auto assign fields
      const category = structuredResult.category || 'other';
      const title = structuredResult.title || selectedDoc.title;
      
      await handleSaveFields({
        title,
        category,
        metadataJson: JSON.stringify(structuredResult),
        status: 'processed'
      });
      
      // Auto link contact if vendorName is found
      if (structuredResult.senderName && contacts.length > 0) {
        const match = contacts.find((c: any) => 
          c.name.toLowerCase().includes(structuredResult.senderName.toLowerCase()) ||
          structuredResult.senderName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          await handleSaveFields({ contactId: match.id });
          setSelectedContactId(match.id);
        }
      }
      
      alert('Ekstraksi AI berhasil!');
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengekstrak data (AI OCR): ' + err.message);
    } finally {
      setIsAiRunning(false);
    }
  };

  // 8. Convert to standard Template Form values
  const handleConvertToTemplate = (templateId: string) => {
    if (!selectedDoc) return;
    
    // Convert extracted metadata fields to template-specific state payload
    const initialData: Record<string, any> = {};
    const meta = editMetadata;
    
    if (templateId === 'kwitansi' || templateId === 'tanda-terima') {
      initialData.payerName = meta.senderName || '';
      initialData.amount = meta.totalAmount || 0;
      initialData.description = `Pembayaran sesuai lampiran hasil pemindaian berkas ${selectedDoc.originalName}`;
      initialData.date = meta.documentDate || new Date().toISOString().split('T')[0];
    } else if (templateId === 'surat-jalan') {
      initialData.sender = meta.senderName || '';
      initialData.date = meta.documentDate || new Date().toISOString().split('T')[0];
      // Convert items
      if (meta.items && Array.isArray(meta.items)) {
        initialData.items = meta.items.map((item: any) => `${item.name} (${item.qty} unit)`);
      }
    } else if (templateId === 'nota-servis') {
      initialData.customerName = meta.senderName || '';
      initialData.date = meta.documentDate || new Date().toISOString().split('T')[0];
      initialData.totalPrice = meta.totalAmount || 0;
    } else {
      // General fallback
      initialData.recipientName = meta.senderName || '';
      initialData.date = meta.documentDate || new Date().toISOString().split('T')[0];
      initialData.notes = `Dibuat otomatis dari hasil OCR berkas: ${selectedDoc.originalName}`;
    }
    
    // Redirect with pre-filled state
    navigate(`/documents/new/${templateId}`, { state: { initialData } });
  };

  // Copy raw text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(editRawText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'invoice': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'receipt': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'letter': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'contract': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'invoice': return 'Faktur/Invoice';
      case 'receipt': return 'Kuitansi/Nota';
      case 'letter': return 'Surat Resmi';
      case 'contract': return 'Kontrak/MOU';
      default: return 'Lainnya';
    }
  };

  const getStatusBadge = (stat: string) => {
    switch (stat) {
      case 'processed': 
        return <span className="flex items-center gap-1 text-xs font-bold text-success"><CheckCircle className="w-3.5 h-3.5" /> Terproses</span>;
      case 'archived':
        return <span className="flex items-center gap-1 text-xs font-bold text-text-muted"><Clock className="w-3.5 h-3.5" /> Diarsipkan</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-bold text-amber-500"><Clock className="w-3.5 h-3.5 animate-pulse" /> Baru (Pending)</span>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Inbox className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">Dokumen Masuk (OCR)</h1>
            <p className="text-text-muted">Pindai, kelola, dan parsing kuitansi/nota belanja dengan asisten OCR pintar.</p>
          </div>
        </div>
        
        {/* Upload Trigger Button */}
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Unggah Berkas Scan
          </button>
        </div>
      </div>

      {/* Main UI Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-[500px]">
        
        {/* Left Side: Document List (4 columns) */}
        <div className="lg:col-span-4 flex flex-col bg-bg border border-border rounded-xl shadow-sm overflow-hidden h-full">
          
          {/* Filters & Search */}
          <div className="p-4 border-b border-border space-y-3 bg-bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Cari kata kunci atau judul..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="p-2 border border-border rounded-lg bg-bg text-text text-xs focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="invoice">Faktur/Invoice</option>
                <option value="receipt">Kuitansi/Nota</option>
                <option value="letter">Surat Resmi</option>
                <option value="contract">Kontrak/MOU</option>
                <option value="other">Lainnya</option>
              </select>
              
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="p-2 border border-border rounded-lg bg-bg text-text text-xs focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Baru (Pending)</option>
                <option value="processed">Terproses</option>
                <option value="archived">Diarsipkan</option>
              </select>
            </div>
          </div>

          {/* Scanned Document Items Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[500px] lg:max-h-none">
            {scannedDocs.length === 0 ? (
              <div className="text-center py-12 text-text-muted flex flex-col items-center justify-center">
                <FileSearch className="w-10 h-10 mb-2 text-text-muted opacity-40 animate-pulse" />
                <p className="text-sm">Tidak ada dokumen ditemukan</p>
                <p className="text-xs mt-1">Silakan unggah dokumen baru</p>
              </div>
            ) : (
              scannedDocs.map(doc => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'border-accent bg-accent/5 shadow-sm' 
                        : 'border-border bg-bg hover:bg-bg-muted/40'
                    }`}
                  >
                    <div className="p-2 bg-accent/10 rounded-lg text-accent mt-0.5 shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-text text-sm truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-xs text-text-muted truncate mt-0.5">{doc.originalName}</p>
                      
                      <div className="flex items-center justify-between mt-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(doc.category)}`}>
                          {getCategoryLabel(doc.category)}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Document Viewer & Editor (8 columns) */}
        <div className="lg:col-span-8 flex flex-col bg-bg border border-border rounded-xl shadow-sm overflow-hidden h-full">
          {selectedDoc ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Active Document Header */}
              <div className="p-4 border-b border-border bg-bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => {
                      setEditTitle(e.target.value);
                      handleSaveFields({ title: e.target.value });
                    }}
                    className="font-bold text-text text-lg bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none w-full pb-0.5"
                  />
                  <p className="text-xs text-text-muted mt-0.5 truncate">Nama file asli: {selectedDoc.originalName}</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={editCategory}
                    onChange={e => {
                      setEditCategory(e.target.value);
                      handleSaveFields({ category: e.target.value });
                    }}
                    className="p-1.5 border border-border rounded-lg bg-bg text-text text-xs focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="invoice">Faktur/Invoice</option>
                    <option value="receipt">Kuitansi/Nota</option>
                    <option value="letter">Surat Resmi</option>
                    <option value="contract">Kontrak/MOU</option>
                    <option value="other">Lainnya</option>
                  </select>
                  
                  <select
                    value={editStatus}
                    onChange={e => {
                      setEditStatus(e.target.value);
                      handleSaveFields({ status: e.target.value });
                    }}
                    className="p-1.5 border border-border rounded-lg bg-bg text-text text-xs focus:ring-2 focus:ring-accent outline-none font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="processed">Terproses</option>
                    <option value="archived">Diarsipkan</option>
                  </select>
                  
                  <button 
                    onClick={handleDeleteDoc}
                    className="p-2 border border-border hover:border-danger/30 text-text-muted hover:text-danger rounded-lg transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Split Screen Workspace Body */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Visual Image Viewer Column (Left) */}
                <div className="w-full md:w-1/2 border-r border-border bg-zinc-950 flex items-center justify-center p-4 relative h-64 md:h-full overflow-hidden">
                  <img
                    src={getImageUrl(selectedDoc)}
                    alt="Pratinjau scan dokumen"
                    className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-zinc-300 font-bold border border-zinc-700">
                    SISI VISUAL DOKUMEN
                  </div>
                </div>

                {/* Data Editor Tab Panel Column (Right) */}
                <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden">
                  
                  {/* Tabs Selector */}
                  <div className="flex border-b border-border bg-bg-muted/40 shrink-0">
                    <button
                      onClick={() => setActiveTab('ai')}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
                        activeTab === 'ai'
                          ? 'border-accent text-accent'
                          : 'border-transparent text-text-muted hover:text-text hover:bg-bg-muted/20'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" /> AI Smart Data
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
                        activeTab === 'raw'
                          ? 'border-accent text-accent'
                          : 'border-transparent text-text-muted hover:text-text hover:bg-bg-muted/20'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> Teks Mentah (OCR)
                    </button>
                  </div>

                  {/* Tabs View Content Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    
                    {/* TAB 1: AI SMART DATA */}
                    {activeTab === 'ai' && (
                      <div className="space-y-4">
                        
                        {/* AI Trigger Card */}
                        <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/15 border border-accent/20 rounded-xl space-y-3">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <h5 className="font-bold text-text text-sm">Ekstraksi Data Pintar AI</h5>
                              <p className="text-xs text-text-muted mt-0.5">Membaca gambar secara visual dan menyusun data pengirim, tanggal, total, dan tabel secara terstruktur.</p>
                            </div>
                          </div>
                          <button
                            onClick={runAiOcr}
                            disabled={isAiRunning}
                            className="w-full py-2 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {isAiRunning ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Mengekstrak Data Dokumen...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Analisis Gambar dengan AI
                              </>
                            )}
                          </button>
                        </div>

                        {/* Extracted Fields Form */}
                        {editMetadata && Object.keys(editMetadata).length > 0 ? (
                          <div className="space-y-3">
                            <h6 className="text-xs font-bold text-text-muted uppercase tracking-wider">Hasil Ekstraksi Dokumen</h6>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-text-muted block mb-1">Pengirim/Penerbit</label>
                                <input
                                  type="text"
                                  value={editMetadata.senderName || ''}
                                  onChange={e => {
                                    const updated = { ...editMetadata, senderName: e.target.value };
                                    setEditMetadata(updated);
                                    handleSaveFields({ metadataJson: JSON.stringify(updated) });
                                  }}
                                  className="w-full p-2 border border-border rounded-lg bg-bg text-text text-xs outline-none focus:ring-2 focus:ring-accent"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-muted block mb-1">Tanggal Dokumen</label>
                                <input
                                  type="text"
                                  value={editMetadata.documentDate || ''}
                                  onChange={e => {
                                    const updated = { ...editMetadata, documentDate: e.target.value };
                                    setEditMetadata(updated);
                                    handleSaveFields({ metadataJson: JSON.stringify(updated) });
                                  }}
                                  className="w-full p-2 border border-border rounded-lg bg-bg text-text text-xs outline-none focus:ring-2 focus:ring-accent"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-muted block mb-1">Total Nominal Uang</label>
                                <input
                                  type="number"
                                  value={editMetadata.totalAmount || ''}
                                  onChange={e => {
                                    const updated = { ...editMetadata, totalAmount: e.target.value ? Number(e.target.value) : null };
                                    setEditMetadata(updated);
                                    handleSaveFields({ metadataJson: JSON.stringify(updated) });
                                  }}
                                  className="w-full p-2 border border-border rounded-lg bg-bg text-text text-xs outline-none focus:ring-2 focus:ring-accent"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-muted block mb-1">Mata Uang</label>
                                <input
                                  type="text"
                                  value={editMetadata.currency || 'IDR'}
                                  onChange={e => {
                                    const updated = { ...editMetadata, currency: e.target.value };
                                    setEditMetadata(updated);
                                    handleSaveFields({ metadataJson: JSON.stringify(updated) });
                                  }}
                                  className="w-full p-2 border border-border rounded-lg bg-bg text-text text-xs outline-none focus:ring-2 focus:ring-accent"
                                />
                              </div>
                            </div>
                            
                            {/* Link Contact Dropdown */}
                            <div className="pt-2">
                              <label className="text-[10px] font-bold text-text-muted block mb-1 flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> Hubungkan ke database kontak
                              </label>
                              <select
                                value={selectedContactId}
                                onChange={e => {
                                  setSelectedContactId(e.target.value);
                                  handleSaveFields({ contactId: e.target.value });
                                }}
                                className="w-full p-2 border border-border rounded-lg bg-bg text-text text-xs outline-none focus:ring-2 focus:ring-accent"
                              >
                                <option value="">-- Pilih Kontak untuk Dihubungkan --</option>
                                {contacts.map((c: any) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Extracted Item List */}
                            {editMetadata.items && editMetadata.items.length > 0 && (
                              <div className="pt-2">
                                <label className="text-[10px] font-bold text-text-muted block mb-1">Daftar Barang Terdeteksi</label>
                                <div className="border border-border rounded-lg overflow-hidden text-xs">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-bg-muted text-text-muted border-b border-border font-bold">
                                        <th className="p-2">Item</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-right">Harga</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-bg">
                                      {editMetadata.items.map((item: any, i: number) => (
                                        <tr key={i}>
                                          <td className="p-2 font-medium text-text">{item.name}</td>
                                          <td className="p-2 text-center text-text-muted">{item.qty}</td>
                                          <td className="p-2 text-right text-text-muted">
                                            {item.price ? Number(item.price).toLocaleString('id-ID') : '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Convert to Template Actions list */}
                            <div className="pt-4 border-t border-border space-y-2">
                              <label className="text-xs font-bold text-text block">Gunakan Data untuk Membuat Dokumen Baru</label>
                              <p className="text-[11px] text-text-muted">Injeksi data terstruktur hasil scan di atas langsung ke formulir isian template CetakDocs:</p>
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                {BUILT_IN_TEMPLATES.map(tpl => (
                                  <button
                                    key={tpl.id}
                                    onClick={() => handleConvertToTemplate(tpl.id)}
                                    className="p-2 text-left border border-border hover:border-accent hover:bg-accent/5 rounded-lg text-xs font-medium flex items-center justify-between group transition-all"
                                  >
                                    <span className="truncate">{tpl.name}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-border rounded-xl bg-bg-muted/20">
                            <Clock className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-text-muted">Belum ada data AI terstruktur.</p>
                            <p className="text-[11px] text-text-muted/80 mt-1">Klik tombol di atas untuk menjalankan analisis AI.</p>
                          </div>
                        )}

                      </div>
                    )}

                    {/* TAB 2: RAW TEXT OCR */}
                    {activeTab === 'raw' && (
                      <div className="space-y-4">
                        
                        {/* Local OCR Config and Trigger */}
                        <div className="p-4 bg-bg-muted/50 border border-border rounded-xl space-y-3">
                          <h5 className="font-bold text-text text-sm">Local OCR Engine (Offline-First)</h5>
                          <p className="text-xs text-text-muted">Mengekstraksi teks tulisan/ketikan dari gambar secara lokal tanpa koneksi internet.</p>
                          
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <select
                                value={selectedLang}
                                onChange={e => setSelectedLang(e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-bg text-text text-xs focus:ring-2 focus:ring-accent outline-none"
                              >
                                <option value="ind">Bahasa Indonesia (ind)</option>
                                <option value="eng">Bahasa Inggris (eng)</option>
                              </select>
                            </div>
                            
                            <button
                              onClick={runLocalOcr}
                              disabled={isOcrRunning}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/40 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              {isOcrRunning ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              Mulai Scan OCR
                            </button>
                          </div>
                          
                          {ocrProgress && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-accent font-bold">
                                <span>Kemajuan Pembacaan:</span>
                                <span>{ocrProgress}</span>
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent transition-all duration-300"
                                  style={{
                                    width: ocrProgress.includes('%') 
                                      ? ocrProgress.split(':')[1]?.trim() 
                                      : ocrProgress === 'Selesai!' ? '100%' : '15%'
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Raw Text Box */}
                        <div className="space-y-1.5 flex-1 flex flex-col min-h-[250px]">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Hasil Ekstraksi Teks Mentah</label>
                            {editRawText && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleCopyText}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-text hover:text-accent border border-border hover:border-accent bg-bg rounded transition-colors"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-success" /> Menyalin!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" /> Salin Teks
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <textarea
                            value={editRawText}
                            onChange={e => {
                              setEditRawText(e.target.value);
                              handleSaveFields({ rawText: e.target.value });
                            }}
                            className="flex-1 w-full min-h-[200px] p-3 border border-border rounded-xl bg-bg text-text text-xs font-mono outline-none focus:ring-2 focus:ring-accent resize-y leading-relaxed"
                            placeholder="Teks mentah hasil OCR akan muncul di sini. Anda juga bisa mengetik atau menyunting teks ini secara manual..."
                          />
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <Inbox className="w-16 h-16 text-text-muted opacity-30 mb-4 animate-bounce" />
              <h3 className="font-bold text-text text-lg">Tidak Ada Dokumen Aktif</h3>
              <p className="text-sm text-text-muted mt-1 max-w-sm">Pilih dokumen di daftar sebelah kiri untuk memproses OCR, atau seret & jatuhkan berkas baru untuk memulai pemindaian.</p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 px-4 py-2 border border-accent text-accent hover:bg-accent/5 rounded-lg text-xs font-bold transition-all"
              >
                Pilih Berkas Komputer Anda
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
