// AI Service for CetakDocs - OpenAI compatible client with SSE streaming support

export interface AiSettings {
  baseUrl: string;
  model: string;
}

export const AI_PRESETS = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-5.5-instant',
    models: ['gpt-5.5-instant', 'gpt-5.5', 'gpt-5.5-pro', 'gpt-5.4-mini'],
  },
  {
    name: 'Gemini (Google AI Studio)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.5-flash',
    models: ['gemini-3.5-flash', 'gemini-3.1-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it', 'mixtral-8x7b-32768'],
  },
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-3.5-flash',
    models: ['google/gemini-3.5-flash', 'openai/gpt-5.5-instant', 'deepseek/deepseek-chat', 'deepseek/deepseek-r1'],
  },
  {
    name: 'Ollama (Lokal)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'deepseek-r1',
    models: ['deepseek-r1', 'llama3.3', 'qwen2.5-coder', 'gemma2'],
  },
];

// Read API Key securely
export async function getApiKey(): Promise<string> {
  if (window.cetakdocs?.isElectron) {
    try {
      const key = await window.cetakdocs.secureStore.get('ai_api_key');
      return key || '';
    } catch (err) {
      console.error('Failed to read secure store:', err);
    }
  }
  return localStorage.getItem('ai_api_key') || '';
}

// Write API Key securely
export async function saveApiKey(key: string): Promise<boolean> {
  if (window.cetakdocs?.isElectron) {
    try {
      return await window.cetakdocs.secureStore.set('ai_api_key', key);
    } catch (err) {
      console.error('Failed to write secure store:', err);
    }
  }
  localStorage.setItem('ai_api_key', key);
  return true;
}

// Delete API Key securely
export async function deleteApiKey(): Promise<boolean> {
  if (window.cetakdocs?.isElectron) {
    try {
      return await window.cetakdocs.secureStore.delete('ai_api_key');
    } catch (err) {
      console.error('Failed to delete secure store:', err);
    }
  }
  localStorage.removeItem('ai_api_key');
  return true;
}

// Read settings
export function getAiSettings(): AiSettings {
  return {
    baseUrl: localStorage.getItem('ai_base_url') || 'https://api.openai.com/v1',
    model: localStorage.getItem('ai_model') || 'gpt-4o-mini',
  };
}

// Save settings
export function saveAiSettings(settings: AiSettings) {
  localStorage.setItem('ai_base_url', settings.baseUrl);
  localStorage.setItem('ai_model', settings.model);
}

// Test connection
export async function testAiConnection(
  apiKey: string,
  settings: AiSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: 'user', content: 'test connection, answer "ok" and nothing else.' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content?.trim() || '';
      return { success: true, message: `Berhasil tersambung! Respon AI: "${answer}"` };
    } else {
      const errorText = await response.text();
      let parsedErr = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedErr = json.error?.message || json.message || errorText;
      } catch {}
      return { success: false, message: `Gagal (${response.status}): ${parsedErr}` };
    }
  } catch (err: any) {
    return { success: false, message: `Error koneksi: ${err.message || err}` };
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Streaming completion
export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone?: () => void
): Promise<void> {
  const apiKey = await getApiKey();
  const settings = getAiSettings();

  if (!apiKey && settings.baseUrl !== 'http://localhost:11434/v1') {
    throw new Error('API Key belum diatur. Silakan atur di Halaman Pengaturan.');
  }

  const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = errorText;
    try {
      const json = JSON.parse(errorText);
      errorMsg = json.error?.message || json.message || errorText;
    } catch {}
    throw new Error(`AI Request failed (${response.status}): ${errorMsg}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable (no reader available).');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        if (cleanLine === 'data: [DONE]') continue;

        if (cleanLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(cleanLine.slice(6));
            const chunk = data.choices?.[0]?.delta?.content || '';
            if (chunk) {
              onChunk(chunk);
            }
          } catch (e) {
            // Partial JSON or other parsing exception, skip and keep reading
          }
        }
      }
    }
    
    // Process remaining buffer
    if (buffer && buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6));
        const chunk = data.choices?.[0]?.delta?.content || '';
        if (chunk) {
          onChunk(chunk);
        }
      } catch {}
    }
  } finally {
    if (onDone) onDone();
  }
}

// AI Multimodal OCR parsing
export async function extractStructuredDataFromImage(
  base64Image: string,
  mimeType: string
): Promise<any> {
  const apiKey = await getApiKey();
  const settings = getAiSettings();

  if (!apiKey && settings.baseUrl !== 'http://localhost:11434/v1') {
    throw new Error('API Key belum diatur. Silakan atur di Halaman Pengaturan.');
  }

  const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;

  const systemPrompt = `Anda adalah asisten AI OCR khusus yang ahli mengekstrak informasi penting dari dokumen fisik atau gambar (seperti kuitansi, struk belanja, nota, faktur, surat menyurat, atau kontrak) di Indonesia.
Ekstrak data secara tepat dan kembalikan hasilnya HANYA dalam format JSON valid dengan struktur berikut (jangan tambahkan teks pengantar, markdown block, atau penutup apapun, langsung berupa objek JSON):
{
  "title": "Judul dokumen singkat (misal: 'Kuitansi Toko Berkah', 'Surat Jalan PT Maju')",
  "category": "invoice" | "receipt" | "letter" | "contract" | "other",
  "senderName": "Nama pengirim / penerbit / perusahaan",
  "documentDate": "Tanggal dokumen (YYYY-MM-DD jika terdeteksi, atau teks tanggal asli)",
  "totalAmount": "Total nominal angka uang jika kuitansi/nota (angka saja tanpa Rp atau titik/koma, contoh: 150000. Jika tidak ada, isi null)",
  "currency": "Mata uang (IDR, USD, dll. Default: IDR)",
  "taxId": "NPWP / Tax ID yang tertera jika ada",
  "items": [
    {
      "name": "Nama item barang / jasa",
      "qty": 1,
      "price": 10000,
      "total": 10000
    }
  ]
}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: systemPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.1
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = errorText;
    try {
      const json = JSON.parse(errorText);
      errorMsg = json.error?.message || json.message || errorText;
    } catch {}
    throw new Error(`AI Request failed (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const textResponse = data.choices?.[0]?.message?.content?.trim() || '';
  
  let cleanJson = textResponse;
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  }
  
  try {
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse AI OCR response as JSON:', cleanJson);
    throw new Error('AI tidak mengembalikan JSON terstruktur yang valid. Coba ulangi kembali.');
  }
}

