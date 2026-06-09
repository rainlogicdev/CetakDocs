import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  ArrowLeft, Plus, Trash2, Move, Save, Download, FileText, 
  Settings, Type, Heading as HeadingIcon, ListOrdered, 
  CheckSquare, HelpCircle, Columns, Eye
} from 'lucide-react';
import { db, type LocalTemplate } from '@/lib/db';
import { DocumentPreview } from '@/features/documents/DocumentPreview';

// Available layout block presets
const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading / Judul', icon: HeadingIcon, default: { text: 'Judul Baru', align: 'center', level: 1 } },
  { type: 'paragraph', label: 'Paragraph / Teks', icon: Type, default: { text: 'Tulis paragraf dokumen di sini...', align: 'justify' } },
  { type: 'fieldRow', label: 'Field Row (Label: Value)', icon: ListOrdered, default: { label: 'Label', value: '{{field_name}}' } },
  { type: 'table', label: 'Tabel Barang / Baris', icon: Columns, default: { name: 'items', columns: [{ name: 'nama', label: 'Nama Barang', type: 'text' }, { name: 'qty', label: 'Qty', type: 'number' }] } },
  { type: 'signature', label: 'Signature / Tanda Tangan', icon: FileText, default: { label: 'Bandung, {{date}}', value: 'Nama Terang', role: 'Jabatan / Posisi' } },
  { type: 'signatureRow', label: 'Tanda Tangan Ganda', icon: FileText, default: { signatures: [{ label: 'Pihak Pertama', value: 'Nama Pihak 1' }, { label: 'Pihak Kedua', value: 'Nama Pihak 2' }] } },
  { type: 'divider', label: 'Divider / Garis Pemisah', icon: HelpCircle, default: {} },
  { type: 'spacer', label: 'Spacer / Jarak Tinggi', icon: HelpCircle, default: { height: '20px' } },
  { type: 'checklist', label: 'Checklist / Daftar Centang', icon: CheckSquare, default: { field: 'daftar_periksa' } },
  { type: 'numberedList', label: 'Numbered List / Angka', icon: ListOrdered, default: { field: 'daftar_angka' } },
];

export function TemplateDesignerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  // State Template
  const [name, setName] = useState('Template Kustom Baru');
  const [category, setCategory] = useState('umum');
  const [description, setDescription] = useState('Template buatan sendiri');
  const [pageSize, setPageSize] = useState<'A4' | 'A5' | 'thermal-80mm' | 'thermal-58mm'>('A4');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageMargin, setPageMargin] = useState('12mm');
  const [fields, setFields] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);

  // Editor states
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Load template if in Edit mode
  useEffect(() => {
    if (isEdit && id) {
      db.customTemplates.get(id).then((tpl) => {
        if (tpl) {
          setName(tpl.name);
          setCategory(tpl.category);
          setDescription(tpl.description || '');
          setPageSize(tpl.page.size);
          setPageOrientation(tpl.page.orientation);
          setPageMargin(tpl.page.margin);
          setFields(tpl.fields || []);
          setBlocks(tpl.layout.blocks || []);
        }
      });
    }
  }, [isEdit, id]);

  // Generate mock preview data dynamically based on active fields schema
  useEffect(() => {
    const mock: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === 'currency' || f.type === 'number') {
        mock[f.name] = f.defaultValue !== undefined && f.defaultValue !== '' ? Number(f.defaultValue) : 500000;
      } else if (f.type === 'date') {
        mock[f.name] = f.defaultValue || new Date().toISOString().split('T')[0];
      } else if (f.type === 'table') {
        mock[f.name] = [
          { nama: 'Barang A', qty: 2, harga: 150000, total: 300000 },
          { nama: 'Jasa B', qty: 1, harga: 200000, total: 200000 }
        ];
      } else if (f.type === 'stringList') {
        mock[f.name] = ['Item Contoh Pertama', 'Item Contoh Kedua', 'Item Contoh Ketiga'];
      } else {
        mock[f.name] = f.defaultValue || `[Isian ${f.label}]`;
      }
    });
    setPreviewData(mock);
  }, [fields]);

  // Save template
  const handleSave = async () => {
    if (!name.trim()) return alert('Nama template wajib diisi.');
    
    const slug = isEdit ? id : 'custom_' + Date.now().toString(36);
    const templateData: LocalTemplate = {
      id: slug,
      slug,
      name,
      category,
      description,
      locale: 'id-ID',
      source: 'custom',
      page: {
        size: pageSize,
        orientation: pageOrientation,
        margin: pageMargin,
      },
      fields,
      layout: {
        blocks,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await db.customTemplates.put(templateData);
      } else {
        await db.customTemplates.add(templateData);
      }
      alert('Template kustom berhasil disimpan!');
      navigate('/templates');
    } catch (e: any) {
      console.error(e);
      alert('Gagal menyimpan template: ' + e.message);
    }
  };

  // Export template as JSON file
  const handleExport = () => {
    const slug = isEdit ? id : 'custom_template';
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      name,
      category,
      description,
      page: { size: pageSize, orientation: pageOrientation, margin: pageMargin },
      fields,
      layout: { blocks }
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cetakdocs-${slug}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Field manipulation helpers
  const addField = () => {
    const fId = 'field_' + Math.random().toString(36).substring(2, 6);
    setFields([...fields, { name: fId, label: 'Kolom Baru', type: 'text', required: false }]);
  };

  const updateField = (idx: number, key: string, val: any) => {
    const newFields = [...fields];
    newFields[idx] = { ...newFields[idx], [key]: val };
    setFields(newFields);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  // Layout block manipulation helpers
  const addBlock = (type: string) => {
    const preset = BLOCK_TYPES.find(b => b.type === type);
    if (!preset) return;
    const newBlock = { type, ...JSON.parse(JSON.stringify(preset.default)) };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockIdx(blocks.length);
  };

  const updateBlock = (idx: number, key: string, val: any) => {
    const newBlocks = [...blocks];
    newBlocks[idx] = { ...newBlocks[idx], [key]: val };
    setBlocks(newBlocks);
  };

  const removeBlock = (idx: number) => {
    setBlocks(blocks.filter((_, i) => i !== idx));
    if (selectedBlockIdx === idx) setSelectedBlockIdx(null);
  };

  // HTML5 Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBlockIdx === null || draggedBlockIdx === targetIndex) return;

    const list = [...blocks];
    const draggedItem = list[draggedBlockIdx];
    list.splice(draggedBlockIdx, 1);
    list.splice(targetIndex, 0, draggedItem);

    setBlocks(list);
    setDraggedBlockIdx(null);
    setDragOverIdx(null);
    setSelectedBlockIdx(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedBlockIdx(null);
    setDragOverIdx(null);
  };

  // Construct Template Definition for Preview rendering
  const tplDefinition = {
    id: id || 'custom_preview',
    slug: 'custom_preview',
    name,
    category,
    locale: 'id-ID',
    source: 'custom' as const,
    page: { size: pageSize, orientation: pageOrientation, margin: pageMargin },
    fields,
    layout: { blocks }
  };

  return (
    <div className="h-screen flex flex-col bg-bg -m-6 overflow-hidden">
      {/* Top Header */}
      <div className="h-16 border-b border-border bg-bg px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-4">
          <Link to="/templates" className="text-text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Template"
              className="font-bold text-text bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-accent rounded px-1 -ml-1 text-base w-64"
            />
            <span className="text-xs text-text-muted">Desainer Template Kustom</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-semibold transition-all ${showPreview ? 'bg-accent/15 border-accent text-accent' : 'text-text hover:bg-bg-muted'}`}
          >
            <Eye className="w-4 h-4" />
            <span>Pratinjau</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-border hover:bg-bg-muted text-text rounded-lg text-sm font-semibold transition-all"
            title="Ekspor sebagai File JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Ekspor</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white hover:bg-accent/90 rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Main Designer Grid Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Fields Manager */}
        <div className="w-80 border-r border-border bg-bg flex flex-col shrink-0 overflow-y-auto p-4 select-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text">Daftar Variabel Isian</h3>
            <button 
              onClick={addField}
              className="p-1 bg-accent/10 hover:bg-accent/15 text-accent rounded transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <p className="text-xs text-text-muted mb-4 leading-normal">
            Definisikan kolom variabel di bawah ini agar bisa diisi saat cetak. Gunakan penulisan tag `{"{{nama_variabel}}"}` di dalam blok teks.
          </p>

          <div className="space-y-3 flex-1 pb-10">
            {fields.map((f, idx) => (
              <div key={f.name} className="border border-border rounded-lg p-3 bg-bg-muted/40 hover:bg-bg-muted/60 relative">
                <button 
                  onClick={() => removeField(idx)}
                  className="absolute top-2 right-2 text-text-muted hover:text-danger p-0.5 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Key Variabel</label>
                    <input 
                      type="text" 
                      value={f.name}
                      onChange={(e) => updateField(idx, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      className="w-full p-1.5 border border-border rounded bg-bg text-text text-xs font-mono focus:ring-1 focus:ring-accent outline-none"
                      placeholder="nama_variabel"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Label Input</label>
                    <input 
                      type="text" 
                      value={f.label}
                      onChange={(e) => updateField(idx, 'label', e.target.value)}
                      className="w-full p-1.5 border border-border rounded bg-bg text-text text-xs focus:ring-1 focus:ring-accent outline-none"
                      placeholder="Nama Lengkap"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Tipe Field</label>
                    <select 
                      value={f.type}
                      onChange={(e) => updateField(idx, 'type', e.target.value)}
                      className="w-full p-1.5 border border-border rounded bg-bg text-text text-xs focus:ring-1 focus:ring-accent outline-none"
                    >
                      <option value="text">Teks Singkat</option>
                      <option value="textarea">Teks Panjang</option>
                      <option value="number">Angka Biasa</option>
                      <option value="currency">Mata Uang (Rupiah)</option>
                      <option value="date">Tanggal</option>
                      <option value="table">Tabel Produk</option>
                      <option value="stringList">Daftar String Dinamis</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Interactive Canvas */}
        <div className={`flex-1 bg-bg-muted/30 overflow-y-auto p-6 flex flex-col items-center ${showPreview ? 'hidden lg:flex' : ''}`}>
          <div className="w-full max-w-xl bg-bg border border-border rounded-xl shadow-sm p-6 space-y-4 min-h-[400px] flex flex-col">
            <h3 className="text-center font-bold text-xs uppercase tracking-widest text-text-muted pb-2 border-b border-dashed border-border select-none">
              Urutan Tata Letak (Canvas)
            </h3>
            
            <div className="flex-1 space-y-2 select-none">
              {blocks.map((block, idx) => {
                const isSelected = selectedBlockIdx === idx;
                const isDragOver = dragOverIdx === idx;
                return (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedBlockIdx(idx)}
                    className={`flex items-center gap-3 p-3.5 border rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                        : isDragOver
                        ? 'border-accent border-dashed bg-accent/5 scale-102'
                        : 'border-border bg-bg hover:bg-bg-muted/40'
                    }`}
                  >
                    <div className="text-text-muted cursor-grab active:cursor-grabbing">
                      <Move className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-xs font-bold text-text flex items-center gap-1.5 capitalize">
                        <span className="px-1.5 py-0.5 rounded bg-bg-muted border border-border text-[9px] font-mono text-text-muted">{block.type}</span>
                        {block.type === 'heading' && `H${block.level || 1}: ${block.text || ''}`}
                        {block.type === 'paragraph' && block.text}
                        {block.type === 'fieldRow' && `${block.label || 'Field'}: ${block.value || ''}`}
                        {block.type === 'table' && `Tabel '${block.name || 'items'}'`}
                        {block.type === 'signature' && `TTD: ${block.value || ''}`}
                        {block.type === 'signatureRow' && `TTD Ganda`}
                        {block.type === 'divider' && `---`}
                        {block.type === 'spacer' && `Spacer (${block.height || '10px'})`}
                        {block.type === 'checklist' && `Checklist: ${block.field}`}
                        {block.type === 'numberedList' && `List Angka: ${block.field}`}
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(idx);
                      }}
                      className="text-text-muted hover:text-danger p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {blocks.length === 0 && (
                <div className="py-20 text-center text-text-muted border border-dashed border-border rounded-lg text-sm bg-bg-muted/30">
                  Kanvas kosong. Gunakan panel bawah untuk menambahkan elemen tata letak.
                </div>
              )}
            </div>

            {/* Visual widget blocks adding menu */}
            <div className="border-t border-border pt-4 select-none">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Tambah Blok Layout</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {BLOCK_TYPES.map(b => (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="flex items-center gap-1.5 p-2 border border-border rounded-lg bg-bg-muted/40 hover:bg-bg-muted/80 text-text-muted hover:text-text text-left transition-colors text-xs font-semibold"
                  >
                    <b.icon className="w-3.5 h-3.5 text-accent" />
                    <span className="truncate">{b.label.split(' / ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Block Configurator OR Split Preview */}
        <div className={`w-96 border-l border-border bg-bg flex flex-col shrink-0 overflow-y-auto ${showPreview ? 'w-full lg:w-96' : ''}`}>
          {showPreview ? (
            // Layout Preview Panel
            <div className="flex-1 flex flex-col h-full">
              <div className="h-12 border-b border-border bg-bg-muted/50 px-4 flex items-center justify-between shrink-0 select-none">
                <span className="font-bold text-xs text-text uppercase">Pratinjau Cetak Real-Time</span>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="text-xs text-accent hover:underline font-semibold lg:hidden"
                >
                  Kembali
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-bg-muted/20 flex justify-center p-4">
                <div className="w-full max-w-lg scale-90 origin-top">
                  <DocumentPreview 
                    template={tplDefinition as any} 
                    data={previewData} 
                  />
                </div>
              </div>
            </div>
          ) : (
            // Inspector Config Panel
            <div className="p-4 space-y-6 select-none pb-12">
              {/* Page settings section */}
              <div>
                <h3 className="font-bold text-sm text-text mb-3 flex items-center gap-1.5"><Settings className="w-4 h-4 text-accent" /> Konfigurasi Halaman</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Ukuran Kertas</label>
                    <select 
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as any)}
                      className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                      <option value="thermal-80mm">Thermal 80mm</option>
                      <option value="thermal-58mm">Thermal 58mm</option>
                    </select>
                  </div>

                  {!pageSize.startsWith('thermal') && (
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Orientasi</label>
                      <select 
                        value={pageOrientation}
                        onChange={(e) => setPageOrientation(e.target.value as any)}
                        className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                      >
                        <option value="portrait">Portrait (Tegak)</option>
                        <option value="landscape">Landscape (Mendatar)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-text-muted block mb-1">Margin Kertas (mm)</label>
                    <input 
                      type="text" 
                      value={pageMargin}
                      onChange={(e) => setPageMargin(e.target.value)}
                      className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                      placeholder="12mm"
                    />
                  </div>
                </div>
              </div>

              {/* Selected block settings inspector section */}
              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-sm text-text mb-3 flex items-center gap-1.5"><Type className="w-4 h-4 text-accent" /> Detail Blok terpilih</h3>
                
                {selectedBlockIdx !== null && blocks[selectedBlockIdx] ? (
                  <div className="space-y-4">
                    {/* Render inputs based on block type properties */}
                    {blocks[selectedBlockIdx].type === 'heading' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Teks Heading</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].text || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'text', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="Judul Dokumen"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Level Heading</label>
                          <select 
                            value={blocks[selectedBlockIdx].level || 1}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'level', Number(e.target.value))}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                          >
                            <option value={1}>H1 (Utama)</option>
                            <option value={2}>H2 (Subjudul)</option>
                            <option value={3}>H3 (Detail)</option>
                            <option value={4}>H4 (Kecil)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Perataan</label>
                          <select 
                            value={blocks[selectedBlockIdx].align || 'center'}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'align', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                          >
                            <option value="left">Kiri</option>
                            <option value="center">Tengah</option>
                            <option value="right">Kanan</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIdx].type === 'paragraph' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Teks Paragraf</label>
                          <textarea 
                            value={blocks[selectedBlockIdx].text || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'text', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none min-h-[80px]"
                            placeholder="Gunakan {{variabel}} untuk isian dinamis."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Perataan</label>
                          <select 
                            value={blocks[selectedBlockIdx].align || 'justify'}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'align', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                          >
                            <option value="left">Kiri</option>
                            <option value="center">Tengah</option>
                            <option value="right">Kanan</option>
                            <option value="justify">Rata Kiri Kanan</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIdx].type === 'fieldRow' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Label</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].label || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'label', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="Tanggal Nota"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Value (Nilai)</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].value || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'value', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="{{tanggal}}"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIdx].type === 'table' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Nama Key Table (dari Schema)</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].name || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'name', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="items"
                          />
                        </div>
                        <p className="text-[10px] text-text-muted leading-normal">
                          Gunakan tipe data *Tabel Produk* pada bagian Daftar Variabel Isian untuk mengisi baris tabel ini secara dinamis.
                        </p>
                      </div>
                    )}

                    {blocks[selectedBlockIdx].type === 'signature' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Tempat/Tanggal</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].label || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'label', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="Bandung, {{tanggal}}"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Nama Terang</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].value || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'value', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="Nama Lengkap"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">Jabatan / Posisi</label>
                          <input 
                            type="text" 
                            value={blocks[selectedBlockIdx].role || ''}
                            onChange={(e) => updateBlock(selectedBlockIdx, 'role', e.target.value)}
                            className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                            placeholder="Kepala Toko"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIdx].type === 'spacer' && (
                      <div>
                        <label className="text-xs text-text-muted block mb-1">Tinggi Spacer (tinggi kosong)</label>
                        <select 
                          value={blocks[selectedBlockIdx].height || '10px'}
                          onChange={(e) => updateBlock(selectedBlockIdx, 'height', e.target.value)}
                          className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                        >
                          <option value="5px">5px (Tipis)</option>
                          <option value="10px">10px (Kecil)</option>
                          <option value="20px">20px (Sedang)</option>
                          <option value="40px">40px (Besar)</option>
                          <option value="60px">60px (Sangat Besar)</option>
                        </select>
                      </div>
                    )}

                    {(blocks[selectedBlockIdx].type === 'checklist' || blocks[selectedBlockIdx].type === 'numberedList') && (
                      <div>
                        <label className="text-xs text-text-muted block mb-1">Key Variabel List (dari Schema)</label>
                        <input 
                          type="text" 
                          value={blocks[selectedBlockIdx].field || ''}
                          onChange={(e) => updateBlock(selectedBlockIdx, 'field', e.target.value)}
                          className="w-full p-2 border border-border rounded bg-bg text-text text-sm focus:ring-1 focus:ring-accent outline-none"
                          placeholder="nama_variabel_list"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">
                    Pilih salah satu blok layout di kanvas tengah untuk mengonfigurasi detail isiannya.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
