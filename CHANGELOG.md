# Changelog — CetakDocs

Format dokumen ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mematuhi aturan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.1] - 2026-06-09
### Added
- Dukungan nilai absolut dan prefiks `"Minus "` untuk nominal negatif pada utilitas `terbilangRupiah`.
- Skala nominal besar hingga tingkat **kuadriliun** (9 kuadriliun batas `Number.MAX_SAFE_INTEGER`).
- Pembedaan ukuran heading level `H1` s/d `H4` dengan penambahan visual styling terpisah pada engine rendering.
- Konfigurasi parameter `_busy_timeout=5000` pada database client SQLite untuk menghindari crash `SQLITE_BUSY`.
- Aksi cascade/set null otomatis pada `contactId` dokumen lewat pengaktifan runtime `PRAGMA foreign_keys = ON;` di SQLite.

### Changed
- Tombol **Edit Draft** pada daftar dokumen diaktifkan sepenuhnya untuk dapat menyunting draf secara dinamis.
- Modul `csv-parser` membatasi pemisahan kolom pada Excel paste eksklusif hanya untuk pemisah tab (`\t`), menghentikan malfungsi sel berisi karakter koma (`,`).
- Event input numeric tabel pada form diubah agar tidak otomatis mereset nilai kolom menjadi `0` saat isian dihapus sepenuhnya.
- Alur increment penomoran dokumen diubah menggunakan SQL atomik Drizzle `sql` + `returning().get()` untuk mengeliminasi race conditions pada proses konkruen.

### Fixed
- Pergeseran tanggal dokumen akibat UTC timezone shift pada input string ISO format `'YYYY-MM-DD'` (tanggal kini dipaksa di-parse pada timezone lokal klien).
- Inkonsistensi rendering preview dokumen A4 Landscape yang sebelumnya memotong visual kertas (ukuran visual menyesuaikan rasio secara dinamis).

---

## [0.5.0] - 2026-06-09
### Added
- Fitur **Inbox Dokumen Masuk (Scans Inbox)** untuk mengarsipkan nota, kuitansi, atau surat fisik.
- Mesin **Local OCR Engine (Offline-First)** terintegrasi menggunakan `tesseract.js` yang berjalan 100% di browser tanpa koneksi internet.
- **Multimodal AI OCR (BYOK)** yang memanfaatkan model visual AI (seperti Gemini 1.5/2.5 Flash, GPT-4o) untuk memindai dokumen dan mengekstrak metadata transaksi terstruktur (Vendor, Tanggal, Nominal Total, Item List) secara otomatis.
- Alur kerja **Konversi ke Template** untuk membuat dokumen CetakDocs baru dengan autofill data dari hasil ekstraksi AI.

---

## [0.4.0] - 2026-06-08
### Added
- Panel **Asisten AI Chat** yang dapat dibuka di sidebar kiri bawah atau floating button mobile.
- Sistem **BYOK (Bring Your Own Key)** yang mendukung API Key dan custom endpoint untuk OpenAI, Google Gemini, Groq, DeepSeek, OpenRouter, dan Ollama (Lokal).
- Fitur **Form Autofill via AI**: AI menganalisis skema form secara dinamis dan mengisi kolom input berdasarkan instruksi natural bahasa pengguna.
- Enkripsi aman token API Key memanfaatkan API `safeStorage` bawaan Windows (Electron) dengan fallback `localStorage` terenkripsi.

---

## [0.3.0] - 2026-06-05
### Added
- Pengemasan aplikasi web menjadi aplikasi desktop Windows menggunakan **Electron** & `electron-builder`.
- Deteksi port dinamis dan otomatisasi startup Node API Hono di dalam proses Electron main.
- Preload Bridge aman menggunakan `contextBridge` untuk mengakses fungsi hardware (printer) dan OS secure store.
- Installer setup mandiri Windows (`.exe`) siap pakai.

---

## [0.2.0] - 2026-06-02
### Added
- Fitur **Batch Document Processor Wizard**:
  - Upload file CSV lokal.
  - Clipboard TSV data copy-paste dari Excel / Google Sheets.
  - Pengisian manual multi-baris tabel interaktif.
- Fitur **Column Mapper**: Auto-Map nama kolom data dengan nama field variabel template (menggunakan algoritma fuzzy match).
- Fitur **Cetak Semua** (Multi-page printing) dan **Unduh HTML Massal** untuk dokumen hasil pemrosesan batch.

---

## [0.1.0] - 2026-05-28
### Added
- Rilis awal MVP CetakDocs (Offline-First & Local Storage).
- **Layout & Rendering Engine**: Konversi skema JSON blok layout dinamis ke dokumen siap cetak standar industri.
- Dukungan **12 Template Dokumen Standar Indonesia**:
  - *Kwitansi, Tanda Terima, Nota Penjualan, Surat Jalan, Nota Servis, Invoice, BAST, Surat Kuasa, Surat Pernyataan, Daftar Hadir, Checklist Berkas, Label Alamat & Harga*.
- Manajemen Kontak & Profil Organisasi.
- Penyimpanan lokal berbasis IndexedDB memanfaatkan Dexie.js wrapper.
