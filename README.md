# CetakDocs 🖨️

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![PNPM Monorepo](https://img.shields.io/badge/package--manager-pnpm-orange.svg)](https://pnpm.io/)
[![Electron Desktop](https://img.shields.io/badge/platform-Electron-brightgreen.svg)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

**CetakDocs** adalah toolkit pembuatan, pemrosesan, dan pencetakan dokumen harian pintar yang dirancang khusus untuk memenuhi kebutuhan operasional UMKM, koperasi, komunitas, dan usaha lokal di Indonesia. Tersedia sebagai aplikasi web modern dan aplikasi desktop Windows yang mandiri tanpa perlu instalasi rumit.

Aplikasi ini menggabungkan fleksibilitas template dokumen standar Indonesia, pemrosesan data massal (*Batch Processing*), asisten AI pintar dengan sistem bawa-kunci-sendiri (*Bring Your Own Key* - BYOK), dan pemaket desktop *wrapper* bertenaga Electron.

## 📥 Download Aplikasi (Alpha Release)

Anda dapat mengunduh berkas biner/installer untuk Windows secara langsung:
* **[Download CetakDocs v0.5.1 (Windows Installer)](https://github.com/rainlogicdev/CetakDocs/releases/download/v0.5.1/CetakDocs-0.5.1-Setup.exe)**

---

## 🚀 Fitur Utama

### 1. **Engine Tata Letak & Renderer Mandiri**
* **Zero-Drift Preview:** Apa yang Anda lihat di layar editor (*WYSIWYG*) adalah apa yang dicetak secara presisi pada kertas fisik.
* **Komponen Fleksibel:** Mendukung blok tata letak tingkat lanjut seperti *Checklist*, daftar berurutan (*Numbered List*), baris tanda tangan sejajar (*Signature Row*), tabel, dan layout multi-kolom (*Grid/Column Layout*).
* **Format Kertas Lokal:** Siap cetak untuk ukuran A4, A5, serta format kertas struk kasir (*Thermal 80mm* & *58mm*).

### 2. **12+ Template Standar Indonesia (Built-in)**
Aplikasi ini langsung menyertakan template dokumen harian usaha siap pakai yang telah disesuaikan dengan format hukum dan umum di Indonesia:
* **BAST (Berita Acara Serah Terima)** dengan kolom tanda tangan sejajar.
* **Nota Servis** & **Surat Jalan** yang rapi.
* **Surat Kuasa** & **Surat Pernyataan** lengkap dengan slot penempatan Materai Rp 10.000.
* **Kwitansi** & **Tanda Terima** bernomor urut otomatis.
* **Kartu Garansi**, **Daftar Hadir**, dan **Label Alamat**.

### 3. **Batch Processor (Pemrosesan Massal)**
Cetak ratusan dokumen sekaligus dengan alur 3 langkah mudah:
* **Multi-Input Data:** Unggah file CSV, salin langsung (*copy-paste*) dari tabel Excel/Google Sheets, atau isi langsung secara manual pada editor grid terintegrasi.
* **Smart Column Mapper:** Sistem pencocokan otomatis (*Fuzzy Match Auto-Map*) untuk memetakan kolom sumber data ke kolom isian formulir template.
* **Multi-Page Printing:** Cetak sekaligus dalam satu halaman print dialog browser/OS atau unduh berkas HTML kompilasi halaman massal secara instan.

### 4. **Asisten AI Pintar (BYOK - Bring Your Own Key)**
* **Kompatibilitas Luas:** Hubungkan asisten obrolan dengan API Key Anda sendiri (*OpenAI*, *Google Gemini*, *Groq*, *DeepSeek*, *OpenRouter*, atau server lokal *Ollama*).
* **Streaming SSE (Server-Sent Events):** Obrolan asisten yang responsif dengan output ketik kata demi kata secara *real-time*.
* **Otomatisasi Isi Formulir (Autofill):** Asisten AI dapat membaca kolom-kolom isian formulir aktif, merancang contoh data simulasi, dan secara langsung menginjeksi isian formulir berdasarkan instruksi teks pengguna (contoh: *"Tolong buatkan draf surat jalan ini untuk pengemudi Budi"*).
* **Penyimpanan Kunci Aman:** Kunci API Anda disimpan menggunakan enkripsi tingkat sistem operasi bawaan laptop Anda (`safeStorage` di versi Desktop Windows) untuk menjamin kerahasiaan penuh.

### 5. **Wrapper Desktop Installer (.exe)**
* **Aplikasi Mandiri:** Dapat dibundel menjadi file installer tunggal (`CetakDocs-x.x.x-Setup.exe`) yang portabel.
* **Auto-Start Server API:** Menjalankan database SQLite lokal dan server API Hono secara programatis di dalam Electron tanpa perlu menyalakan terminal.
* **Deteksi Port Dinamis:** Menghindari tabrakan port dengan memindai port lokal kosong secara otomatis saat aplikasi dijalankan.

---

## 🛠️ Arsitektur Proyek (PNPM Monorepo)

Aplikasi ini dirancang menggunakan arsitektur monorepo modular untuk menjaga kerapian kode dan batas dependensi yang bersih:

```
cetakdocs/
├── apps/
│   ├── web/          # Frontend Web App (React + Vite)
│   ├── api/          # Backend Server API (Hono + SQLite + Drizzle ORM)
│   └── desktop/      # Wrapper Desktop Application (Electron)
├── packages/
│   ├── core/         # Tipe dasar data, skema template, dan utilities ID
│   ├── renderer/     # Engine render dokumen HTML & sintaksis CSS cetak
│   ├── templates/    # Daftar metadata dan struktur 12+ template bawaan
│   └── validators/   # Skema validasi formulir (Zod)
├── package.json      # Orkestrasi skrip monorepo
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## 💻 Panduan Pengembangan Lokal

### Prasyarat
* Node.js versi 18 ke atas.
* [pnpm](https://pnpm.io/) sebagai pengelola paket (disarankan pnpm v8/v9/v10).

### Langkah Instalasi

1. **Klon Repositori:**
   ```bash
   git clone https://github.com/username/cetakdocs.git
   cd cetakdocs
   ```

2. **Pasang Dependensi:**
   ```bash
   pnpm install
   ```

3. **Inisialisasi Database (SQLite):**
   Masuk ke paket API dan siapkan skema database lokal:
   ```bash
   cd apps/api
   pnpm db:push
   cd ../..
   ```

4. **Jalankan Mode Pengembangan:**
   * **Mode Web Browser (Dev):**
     Menjalankan server web frontend dan server API secara bersamaan.
     ```bash
     pnpm dev
     ```
     Buka [http://localhost:5173](http://localhost:5173) di peramban Anda.
     
   * **Mode Desktop Electron (Dev):**
     Menjalankan Vite server dan membuka jendela Electron terhubung.
     ```bash
     pnpm desktop:dev
     ```

---

## 📦 Pemaketan & Produksi

1. **Kompilasi Seluruh Workspace:**
   ```bash
   pnpm build
   ```

2. **Membuat Installer Windows (.exe):**
   ```bash
   pnpm desktop:build
   ```
   Installer hasil kompilasi mandiri akan dibuat di folder `apps/desktop/release/CetakDocs-${version}-Setup.exe`.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **GNU General Public License v3.0 (GPL-3.0)**. Semua kode sumber bersifat terbuka dan gratis untuk didistribusikan kembali serta dimodifikasi dengan tetap mempertahankan lisensi sumber terbuka yang sama. 

Copyright © 2024-2026 **RainLogic** & CetakDocs Contributors.
