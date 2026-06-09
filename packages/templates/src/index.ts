import { TemplateDefinition } from '@cetakdocs/core';
import { KwitansiBasic } from './kwitansi';
import { SuratJalanBasic } from './surat-jalan';
import { NotaServisBasic } from './nota-servis';
import { TandaTerimaBasic } from './tanda-terima';
import { BeritaAcaraSerahTerimaBasic } from './berita-acara-serah-terima';
import { KartuGaransiBasic } from './kartu-garansi';
import { LabelHargaBasic } from './label-harga';
import { LabelAlamatBasic } from './label-alamat';
import { DaftarHadirBasic } from './daftar-hadir';
import { SuratPernyataanBasic } from './surat-pernyataan';
import { SuratKuasaBasic } from './surat-kuasa';
import { ChecklistBerkasBasic } from './checklist-berkas';

export * from './kwitansi';
export * from './surat-jalan';
export * from './nota-servis';
export * from './tanda-terima';
export * from './berita-acara-serah-terima';
export * from './kartu-garansi';
export * from './label-harga';
export * from './label-alamat';
export * from './daftar-hadir';
export * from './surat-pernyataan';
export * from './surat-kuasa';
export * from './checklist-berkas';

export const BUILT_IN_TEMPLATES: TemplateDefinition[] = [
  KwitansiBasic,
  TandaTerimaBasic,
  SuratJalanBasic,
  BeritaAcaraSerahTerimaBasic,
  NotaServisBasic,
  KartuGaransiBasic,
  LabelHargaBasic,
  LabelAlamatBasic,
  DaftarHadirBasic,
  SuratPernyataanBasic,
  SuratKuasaBasic,
  ChecklistBerkasBasic
];
