import { useState, useEffect } from 'react';
import { Settings, Info, Sparkles, Eye, EyeOff, RefreshCw, Key, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AI_PRESETS, getApiKey, saveApiKey, getAiSettings, saveAiSettings, testAiConnection } from '@/lib/ai-service';

export function SettingsPage() {
  const [provider, setProvider] = useState('OpenAI');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [showKey, setShowKey] = useState(false);
  
  const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ 
    type: 'idle', 
    message: '' 
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [defaultPageSize, setDefaultPageSize] = useState('A4');
  const [defaultOrientation, setDefaultOrientation] = useState('portrait');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = getAiSettings();
      setBaseUrl(settings.baseUrl);
      setModel(settings.model);
      
      const key = await getApiKey();
      setApiKey(key);
      
      // Auto-detect provider preset based on baseUrl
      const matched = AI_PRESETS.find(p => settings.baseUrl.replace(/\/$/, '') === p.baseUrl.replace(/\/$/, ''));
      if (matched) {
        setProvider(matched.name);
      } else {
        setProvider('Custom');
      }

      const size = localStorage.getItem('cetakdocs:default_page_size') || 'A4';
      const orientation = localStorage.getItem('cetakdocs:default_orientation') || 'portrait';
      setDefaultPageSize(size);
      setDefaultOrientation(orientation);
    };
    loadSettings();
  }, []);

  const handleProviderChange = (providerName: string) => {
    setProvider(providerName);
    if (providerName === 'Custom') {
      return;
    }
    const preset = AI_PRESETS.find(p => p.name === providerName);
    if (preset) {
      setBaseUrl(preset.baseUrl);
      setModel(preset.defaultModel);
    }
  };

  const handleSaveSettings = async () => {
    try {
      saveAiSettings({ baseUrl, model });
      await saveApiKey(apiKey);
      setSaveStatus('Pengaturan AI berhasil disimpan!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e: any) {
      alert('Gagal menyimpan: ' + e.message);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus({ type: 'loading', message: 'Menguji koneksi ke AI provider...' });
    const result = await testAiConnection(apiKey, { baseUrl, model });
    if (result.success) {
      setTestStatus({ type: 'success', message: result.message });
    } else {
      setTestStatus({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Settings className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text">Pengaturan</h1>
          <p className="text-text-muted">Konfigurasi aplikasi CetakDocs.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Asisten AI (BYOK) */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
          
          <h2 className="font-bold text-lg text-text mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" /> Asisten AI (BYOK)
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Bawa API Key Anda sendiri (*Bring Your Own Key*) untuk mengaktifkan asisten AI yang dapat membantu Anda mengisi template dokumen, generate data batch, dan mengoreksi tulisan secara otomatis.
          </p>

          <div className="space-y-4">
            {/* Provider Preset */}
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Penyedia AI (Preset)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {AI_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleProviderChange(p.name)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      provider === p.name
                        ? 'bg-accent/15 border-accent text-accent shadow-sm'
                        : 'bg-bg border-border text-text hover:bg-border/30'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleProviderChange('Custom')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    provider === 'Custom'
                      ? 'bg-accent/15 border-accent text-accent shadow-sm'
                      : 'bg-bg border-border text-text hover:bg-border/30'
                  }`}
                >
                  Custom Endpoint
                </button>
              </div>
            </div>

            {/* Base URL */}
            <div>
              <label className="text-sm font-medium text-text mb-1 block flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-text-muted" /> Base URL Endpoint
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  setProvider('Custom');
                }}
                placeholder="https://api.openai.com/v1"
                className="w-full p-2.5 border border-border rounded-lg bg-bg text-text text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none font-mono"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="text-sm font-medium text-text mb-1 block flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-text-muted" /> API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'Ollama (Lokal)' 
                      ? 'Tidak memerlukan API Key untuk Ollama lokal' 
                      : 'sk-...'
                  }
                  disabled={provider === 'Ollama (Lokal)'}
                  className="w-full p-2.5 pr-10 border border-border rounded-lg bg-bg text-text text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none font-mono disabled:opacity-50"
                />
                {provider !== 'Ollama (Lokal)' && (
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {window.cetakdocs?.isElectron && (
                <p className="text-xs text-success mt-1.5 flex items-center gap-1 font-medium">
                  🔒 API Key akan disimpan dengan enkripsi sistem operasi (secureStore) bawaan laptop Anda.
                </p>
              )}
            </div>

            {/* Model Name */}
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Nama Model AI</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full p-2.5 border border-border rounded-lg bg-bg text-text text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none font-mono"
              />
              {provider !== 'Custom' && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-text-muted font-medium mr-1">Rekomendasi:</span>
                  {AI_PRESETS.find(p => p.name === provider)?.models.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModel(m)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                        model === m
                          ? 'bg-accent/10 border-accent/30 text-accent font-semibold'
                          : 'bg-bg-muted border-border text-text-muted hover:text-text'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test Connection Result */}
            {testStatus.type !== 'idle' && (
              <div className={`p-3 rounded-lg border text-sm flex gap-2.5 items-start transition-all ${
                testStatus.type === 'loading'
                  ? 'bg-bg-muted border-border text-text-muted animate-pulse'
                  : testStatus.type === 'success'
                  ? 'bg-success/5 border-success/20 text-success'
                  : 'bg-error/5 border-error/20 text-error'
              }`}>
                {testStatus.type === 'loading' && <RefreshCw className="w-4 h-4 mt-0.5 animate-spin" />}
                {testStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                {testStatus.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span className="leading-normal">{testStatus.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus.type === 'loading'}
                className="py-2.5 px-4 rounded-lg border border-border text-text hover:bg-border/30 text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testStatus.type === 'loading' ? 'animate-spin' : ''}`} />
                Uji Koneksi
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="py-2.5 px-6 rounded-lg bg-accent text-white hover:bg-accent-hover text-sm font-bold shadow-sm transition-all ml-auto"
              >
                Simpan Konfigurasi AI
              </button>
            </div>

            {saveStatus && (
              <p className="text-sm text-success text-right font-semibold animate-bounce mt-2">
                {saveStatus}
              </p>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-text mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Tentang Aplikasi</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-muted">Nama Aplikasi</span>
              <span className="font-medium text-text">CetakDocs</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-muted">Versi</span>
              <span className="font-medium text-text">0.1.0 (MVP)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-muted">Penyimpanan</span>
              <span className="font-medium text-text">Server Lokal (SQLite)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-muted">Lisensi</span>
              <span className="font-medium text-text">Open Source</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Bahasa</span>
              <span className="font-medium text-text">Bahasa Indonesia</span>
            </div>
          </div>
        </div>

        {/* Printing */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-text mb-4">Pengaturan Cetak</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Ukuran Kertas Default</label>
              <select 
                value={defaultPageSize}
                onChange={(e) => {
                  const size = e.target.value;
                  setDefaultPageSize(size);
                  localStorage.setItem('cetakdocs:default_page_size', size);
                }}
                className="w-full p-2 border border-border rounded-md bg-bg text-text text-sm focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
                <option value="thermal-80mm">Thermal 80mm</option>
                <option value="thermal-58mm">Thermal 58mm</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Orientasi Default</label>
              <select 
                value={defaultOrientation}
                onChange={(e) => {
                  const orientation = e.target.value;
                  setDefaultOrientation(orientation);
                  localStorage.setItem('cetakdocs:default_orientation', orientation);
                }}
                className="w-full p-2 border border-border rounded-md bg-bg text-text text-sm focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="portrait">Potret (Tegak)</option>
                <option value="landscape">Lanskap (Mendatar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-bg border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-text mb-2">Privasi & Keamanan</h2>
          <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-sm text-text-muted">
            <p className="font-medium text-success mb-1">✅ Data Anda aman</p>
            <p>CetakDocs menyimpan semua data di server lokal (SQLite) di komputer Anda. Tidak ada data yang dikirim ke cloud. Anda memiliki kendali penuh atas data Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
