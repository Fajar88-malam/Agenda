/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LetterType = 
  | 'SURAT_TUGAS'
  | 'SURAT_PENGANTAR'
  | 'SURAT_PANGGILAN_ORTU'
  | 'SURAT_UNDANGAN_ORTU'
  | 'SURAT_MUTASI_KELUAR'
  | 'SURAT_MUTASI_MASUK'
  | 'SURAT_KETERANGAN_AKTIF'
  | 'SURAT_KETERANGAN_BAIK';

export interface SchoolProfile {
  id: string;
  namaPemerintah: string; // e.g. "PEMERINTAH PROVINSI JAWA BARAT"
  namaDinas: string; // e.g. "DINAS PENDIDIKAN"
  namaCabangDinas?: string; // e.g. "CABANG DINAS PENDIDIKAN WILAYAH VII"
  namaSekolah: string; // e.g. "SMA NEGERI 1 KOTA BANDUNG"
  npsn: string;
  nss?: string;
  akreditasi: string;
  alamatJalan: string;
  kelurahan: string;
  kecamatan: string;
  kotaKab: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  logoLeftUrl: string; // Logo Daerah/Kemdikbud
  logoRightUrl?: string; // Logo Sekolah/Yayasan
  showDualLogo: boolean;
  
  // Kepala Sekolah
  kepalaSekolahNama: string;
  kepalaSekolahGelar: string;
  kepalaSekolahNip: string;
  kepalaSekolahPangkat: string;
  kepalaSekolahJabatan: string; // e.g. "Kepala Sekolah"
  
  // Stempel & TTD default
  stempelEnabled: boolean;
  ttdEnabled: boolean;
  stempelCustomUrl?: string; // Uploaded cap stempel base64 / URL
  ttdCustomUrl?: string; // Uploaded scan tanda tangan base64 / URL
  namaSingkatanSekolah: string; // e.g. "SMAN1-BDG"
  kodeKlasifikasiPrefix: string; // e.g. "421"
  allowedEmails?: string[]; // Daftar email yang diizinkan untuk login dan mengakses sistem
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  kelas: string; // e.g. "X MIPA 1", "XI IPS 2", "XII TKJ 1"
  jurusan: string; // e.g. "MIPA", "Teknik Komputer & Jaringan"
  namaAyah: string;
  namaIbu: string;
  namaWali?: string;
  pekerjaanOrtu: string;
  alamat: string;
  noHpOrtu: string;
  status: 'Aktif' | 'Mutasi Keluar' | 'Lulus';
  sekolahAsal?: string;
  tahunMasuk: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nuptk?: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  pangkatGolongan: string; // e.g. "Pembina / IV/a", "Penata Muda / III/a"
  jabatan: string; // e.g. "Guru Mata Pelajaran", "Wakil Kepala Sekolah", "Guru Bimbingan Konseling (BK)", "Wali Kelas"
  mataPelajaran?: string;
  noHp: string;
  email?: string;
  isActive: boolean;
}

// Data payload per letter type
export interface SuratTugasData {
  dasarPenugasan: string;
  daftarPetugas: Array<{
    id?: string;
    nama: string;
    nip: string;
    pangkatGolongan: string;
    jabatan: string;
  }>;
  keperluanTugas: string;
  waktuMulai: string; // YYYY-MM-DD
  waktuSelesai: string; // YYYY-MM-DD
  jamKegiatan: string; // e.g. "08.00 WIB s.d Selesai"
  tempatKegiatan: string;
  bebanAnggaran: string;
  tembusan: string[];
}

export interface SuratPengantarItem {
  id: string;
  no: number;
  naskahDinas: string;
  banyaknya: string;
  keterangan: string;
}

export interface SuratPengantarData {
  tujuanInstansi: string;
  alamatInstansi: string;
  daftarBerkas: SuratPengantarItem[];
  catatanPenutup: string;
  tembusan: string[];
}

export interface SuratPanggilanOrtuData {
  studentId?: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  namaOrtuWali: string;
  hariTanggalPanggilan: string;
  waktuPanggilan: string;
  tempatMenghadap: string;
  menemuiPejabat: string; // e.g. "Ibu Siti Rahmawati, S.Pd. (Guru BK) / Wali Kelas"
  alasanPanggilan: string; // e.g. "Pembinaan kehadiran belajar dan konsultasi perkembangan akademik"
  catatanKhusus: string;
  tembusan: string[];
}

export interface SuratUndanganOrtuData {
  perihalUndangan: string; // e.g. "Rapat Pleno Sosialisasi Asesmen Nasional & Pembagian Raport Semester Ganjil"
  ditujukanKepada: string; // e.g. "Bapak/Ibu Orang Tua / Wali Siswa Kelas X dan XI"
  hariTanggalAcara: string;
  waktuAcara: string;
  tempatAcara: string;
  agendaAcara: string; // textarea multi-baris
  catatanKhusus?: string;
  tembusan: string[];
}

export type PaperSize = 'A4' | 'F4';

export interface SuratMutasiKeluarData {
  studentId?: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  jenisKelamin: 'L' | 'P';
  tempatTanggalLahir: string;
  tingkatKelas: string;
  jurusan: string;
  namaOrtuWali: string;
  pekerjaanOrtu: string;
  alamatOrtu: string;
  
  // Data Surat Permohonan dari Orang Tua / Wali Siswa
  tanggalPermohonanOrtu?: string;
  hubunganDenganSiswa?: string; // e.g. "Ayah Kandung", "Ibu Kandung", "Wali Murid"
  noHpOrtu?: string;
  tandaTanganOrtuNama?: string;
  materaiPermohonan?: boolean;
  tandaTanganOrtuUrl?: string;
  
  // Data Sekolah Tujuan
  namaSekolahTujuan: string;
  kabKotaSekolahTujuan: string;
  provinsiSekolahTujuan: string;
  alasanPindah: string; // e.g. "Mengikuti perpindahan tugas/domisili tempat tinggal orang tua"
  
  // Berkas yang disertakan
  bukuRaportDiserahkan: boolean;
  suratValidasiNisn: boolean;
  fotokopiAkreditasi: boolean;
  keteranganLainnya: string;
  
  tembusan: string[];
}

export interface SuratMutasiMasukData {
  namaSiswa: string;
  nisn: string;
  jenisKelamin: 'L' | 'P';
  tempatTanggalLahir: string;
  sekolahAsal: string;
  kabKotaSekolahAsal: string;
  diterimaDiKelas: string;
  jurusanDiterima: string;
  tahunPelajaran: string; // e.g. "2026/2027"
  tanggalDiterima: string;
  dasarPenerimaan: string; // e.g. "1. Surat Permohonan Orang Tua tertanggal ..., 2. Surat Keterangan Pindah Sekolah asal No ..., 3. Daya tampung rombongan belajar yang masih memenuhi syarat."
  persyaratanTersisa?: string;
  tembusan: string[];
}

export interface SuratKeteranganSiswaData {
  studentId?: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  jenisKelamin: 'L' | 'P';
  tempatTanggalLahir: string;
  kelas: string;
  namaOrtu: string;
  alamat: string;
  tujuanPenggunaan: string; // e.g. "Persyaratan pengajuan Beasiswa PIP / KIP Kuliah / Pembuatan Paspor"
  keteranganTambahan: string; // e.g. "Siswa tersebut di atas adalah benar-benar siswa aktif terdaftar pada Tahun Pelajaran 2026/2027 dan berkelakuan baik."
}

export type LetterPayload = 
  | { type: 'SURAT_TUGAS'; data: SuratTugasData }
  | { type: 'SURAT_PENGANTAR'; data: SuratPengantarData }
  | { type: 'SURAT_PANGGILAN_ORTU'; data: SuratPanggilanOrtuData }
  | { type: 'SURAT_UNDANGAN_ORTU'; data: SuratUndanganOrtuData }
  | { type: 'SURAT_MUTASI_KELUAR'; data: SuratMutasiKeluarData }
  | { type: 'SURAT_MUTASI_MASUK'; data: SuratMutasiMasukData }
  | { type: 'SURAT_KETERANGAN_AKTIF'; data: SuratKeteranganSiswaData }
  | { type: 'SURAT_KETERANGAN_BAIK'; data: SuratKeteranganSiswaData };

export interface LetterRecord {
  id: string;
  nomorSurat: string;
  nomorUrut: number;
  kodeKlasifikasi: string;
  jenisSurat: LetterType;
  perihal: string;
  sifat: 'Biasa' | 'Penting' | 'Rahasia' | 'Segera';
  lampiran: string;
  tanggalSurat: string; // YYYY-MM-DD
  tempatDibuat: string;
  
  // Penerima umum
  kepadaYth: string;
  alamatPenerima?: string;
  
  // Konten data spesifik
  content: LetterPayload;
  
  // Penandatangan
  penandatanganNama: string;
  penandatanganNip: string;
  penandatanganPangkat: string;
  penandatanganJabatan: string;
  includeStempel: boolean;
  includeTtd: boolean;
  
  // Status
  status: 'Draft' | 'Diterbitkan' | 'Dicetak' | 'Diarsipkan';
  catatanArsip?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ClassificationCode {
  kode: string;
  keterangan: string;
  kategori: string;
  defaultType: LetterType;
}

export interface AppDatabase {
  schoolProfile: SchoolProfile;
  students: Student[];
  teachers: Teacher[];
  letters: LetterRecord[];
  lastLetterNumber: number;
}
