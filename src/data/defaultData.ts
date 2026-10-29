/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppDatabase, SchoolProfile, Student, Teacher, LetterRecord, ClassificationCode } from '../types';

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  id: 'school_default',
  namaPemerintah: 'PEMERINTAH KABUPATEN CIANJUR',
  namaDinas: 'DINAS PENDIDIKAN PEMUDA DAN OLAHRAGA',
  namaCabangDinas: '',
  namaSekolah: 'SMP NEGERI 1 PACET',
  npsn: '20203834',
  nss: '201020708066',
  akreditasi: 'A (Unggul)',
  alamatJalan: 'Jln. Cibodas Parigi No.99 Desa Cibodas Kec. Pacet',
  kelurahan: 'Cibodas',
  kecamatan: 'Pacet',
  kotaKab: 'Cianjur',
  provinsi: 'Jawa Barat',
  kodePos: '43253',
  telepon: '-',
  email: 'smpnegeripacet@gmail.com',
  website: '',
  logoLeftUrl: '', // Will use official vector/SVG Kemdikbud / Jawa Barat if blank
  logoRightUrl: '',
  showDualLogo: false,
  
  kepalaSekolahNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
  kepalaSekolahGelar: 'Dr., M.Pd.',
  kepalaSekolahNip: '19720815 199802 1 004',
  kepalaSekolahPangkat: 'Pembina Utama Muda, IV/c',
  kepalaSekolahJabatan: 'Kepala Sekolah',
  
  stempelEnabled: true,
  ttdEnabled: true,
  namaSingkatanSekolah: 'SMAN1-BDG',
  kodeKlasifikasiPrefix: '421',
  allowedEmails: [
    'sangpujangga.malam88@gmail.com',
    'smpnegeripacet@gmail.com'
  ]
};

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std_01',
    nis: '23241001',
    nisn: '0078123456',
    nama: 'Muhammad Arya Pratama',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '2008-04-12',
    kelas: 'X-1',
    jurusan: 'Kurikulum Merdeka (Fase E)',
    namaAyah: 'Bambang Pratama, S.E.',
    namaIbu: 'Dewi Sartika',
    pekerjaanOrtu: 'Wiraswasta / Pengusaha',
    alamat: 'Jl. Tubagus Ismail Raya No. 45 RT 02/RW 07, Coblong, Kota Bandung',
    noHpOrtu: '081223456789',
    status: 'Aktif',
    tahunMasuk: '2024'
  },
  {
    id: 'std_02',
    nis: '23241002',
    nisn: '0079456123',
    nama: 'Anindya Putri Kirana',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2008-09-25',
    kelas: 'X-2',
    jurusan: 'Kurikulum Merdeka (Fase E)',
    namaAyah: 'H. Suryadi Wardhana',
    namaIbu: 'Hj. Ratna Wulan',
    pekerjaanOrtu: 'Pegawai Negeri Sipil (PNS)',
    alamat: 'Komp. Dago Asri Blok C-12, Dago, Coblong, Kota Bandung',
    noHpOrtu: '081398765432',
    status: 'Aktif',
    tahunMasuk: '2024'
  },
  {
    id: 'std_03',
    nis: '22231045',
    nisn: '0067891234',
    nama: 'Rizky Alamsyah Maulana',
    jenisKelamin: 'L',
    tempatLahir: 'Cimahi',
    tanggalLahir: '2007-06-18',
    kelas: 'XI MIPA 2',
    jurusan: 'Matematika dan Ilmu Pengetahuan Alam',
    namaAyah: 'Iwan Maulana',
    namaIbu: 'Siti Aminah',
    pekerjaanOrtu: 'Karyawan Swasta',
    alamat: 'Jl. Ciumbuleuit Atas No. 88 RT 01/RW 04, Cidadap, Kota Bandung',
    noHpOrtu: '085712348899',
    status: 'Aktif',
    tahunMasuk: '2023'
  },
  {
    id: 'std_04',
    nis: '22231078',
    nisn: '0065432198',
    nama: 'Zahra Aulia Rahmadani',
    jenisKelamin: 'P',
    tempatLahir: 'Bandung',
    tanggalLahir: '2007-11-03',
    kelas: 'XI IPS 1',
    jurusan: 'Ilmu Pengetahuan Sosial',
    namaAyah: 'Dedi Rahmadi',
    namaIbu: 'Endang Sulastri',
    pekerjaanOrtu: 'TNI-AD',
    alamat: 'Jl. Dipati Ukur No. 102, Lebak Gede, Coblong, Kota Bandung',
    noHpOrtu: '082133445566',
    status: 'Aktif',
    tahunMasuk: '2023'
  },
  {
    id: 'std_05',
    nis: '21221090',
    nisn: '0056789123',
    nama: 'Fathur Rahman Hakim',
    jenisKelamin: 'L',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2006-02-14',
    kelas: 'XII MIPA 1',
    jurusan: 'Matematika dan Ilmu Pengetahuan Alam',
    namaAyah: 'Dr. Hendra Hakim, Sp.A',
    namaIbu: 'Drg. Linda Permata',
    pekerjaanOrtu: 'Dokter Spesialis',
    alamat: 'Jl. Setiabudi Permai No. 14, Sukasari, Kota Bandung',
    noHpOrtu: '081122334455',
    status: 'Aktif',
    tahunMasuk: '2022'
  },
  {
    id: 'std_06',
    nis: '22231099',
    nisn: '0069871122',
    nama: 'Dimas Bagus Saputra',
    jenisKelamin: 'L',
    tempatLahir: 'Semarang',
    tanggalLahir: '2007-08-30',
    kelas: 'XI MIPA 3',
    jurusan: 'Matematika dan Ilmu Pengetahuan Alam',
    namaAyah: 'Agus Saputra, M.T.',
    namaIbu: 'Tri Wahyuni',
    pekerjaanOrtu: 'Dosen Perguruan Tinggi',
    alamat: 'Jl. Cisitu Indah No. 27, Coblong, Kota Bandung',
    noHpOrtu: '081299887766',
    status: 'Mutasi Keluar',
    sekolahAsal: 'SMA Negeri 3 Semarang',
    tahunMasuk: '2023'
  }
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'tch_01',
    nip: '19720815 199802 1 004',
    nuptk: '4563750652200002',
    nama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    jenisKelamin: 'L',
    pangkatGolongan: 'Pembina Utama Muda / IV/c',
    jabatan: 'Kepala Sekolah',
    mataPelajaran: 'Manajemen Pendidikan',
    noHp: '081220011223',
    email: 'ahmad.sudrajat@sman1bandung.sch.id',
    isActive: true
  },
  {
    id: 'tch_02',
    nip: '19780310 200312 1 002',
    nuptk: '1245756658200013',
    nama: 'Drs. Hendro Wibowo, M.Si.',
    jenisKelamin: 'L',
    pangkatGolongan: 'Pembina / IV/a',
    jabatan: 'Wakil Kepala Sekolah Bidang Kurikulum',
    mataPelajaran: 'Fisika',
    noHp: '081321456780',
    email: 'hendro.wibowo@sman1bandung.sch.id',
    isActive: true
  },
  {
    id: 'tch_03',
    nip: '19820514 200801 2 009',
    nuptk: '8754760662300022',
    nama: 'Siti Rahmawati, S.Pd., M.Pd.',
    jenisKelamin: 'P',
    pangkatGolongan: 'Penata Tk.I / III/d',
    jabatan: 'Koordinator Bimbingan Konseling (BK)',
    mataPelajaran: 'Bimbingan & Konseling',
    noHp: '081298761234',
    email: 'siti.rahmawati@sman1bandung.sch.id',
    isActive: true
  },
  {
    id: 'tch_04',
    nip: '19851120 201001 1 015',
    nuptk: '6453763665200011',
    nama: 'Asep Ridwan Maulana, S.Kom., M.T.',
    jenisKelamin: 'L',
    pangkatGolongan: 'Penata / III/c',
    jabatan: 'Wakil Kepala Sekolah Bidang Kesiswaan',
    mataPelajaran: 'Informatika',
    noHp: '085721113344',
    email: 'asep.ridwan@sman1bandung.sch.id',
    isActive: true
  },
  {
    id: 'tch_05',
    nip: '19900218 201403 2 004',
    nuptk: '9345768669210033',
    nama: 'Nurul Hidayati, S.Pd.',
    jenisKelamin: 'P',
    pangkatGolongan: 'Penata Muda Tk.I / III/b',
    jabatan: 'Wali Kelas X-1',
    mataPelajaran: 'Bahasa Indonesia',
    noHp: '081399884422',
    email: 'nurul.hidayati@sman1bandung.sch.id',
    isActive: true
  },
  {
    id: 'tch_06',
    nip: '19880709 201101 1 008',
    nuptk: '5142766667200041',
    nama: 'Rian Kurniawan, S.Pd.',
    jenisKelamin: 'L',
    pangkatGolongan: 'Penata / III/c',
    jabatan: 'Pembina OSIS & Ekstrakurikuler',
    mataPelajaran: 'Pendidikan Jasmani & Olahraga',
    noHp: '082115566778',
    email: 'rian.kurniawan@sman1bandung.sch.id',
    isActive: true
  }
];

export const CLASSIFICATION_CODES: ClassificationCode[] = [
  { kode: '800', keterangan: 'Kepegawaian / Penugasan Pegawai & Guru', kategori: 'Kepegawaian', defaultType: 'SURAT_TUGAS' },
  { kode: '045.2', keterangan: 'Kearsipan / Pengantar Dokumen Resmi', kategori: 'Kearsipan', defaultType: 'SURAT_PENGANTAR' },
  { kode: '421.7', keterangan: 'Kesiswaan / Bimbingan Konseling & Kedisiplinan', kategori: 'Kesiswaan', defaultType: 'SURAT_PANGGILAN_ORTU' },
  { kode: '005', keterangan: 'Undangan Kedinasan / Rapat Pertemuan', kategori: 'Umum', defaultType: 'SURAT_UNDANGAN_ORTU' },
  { kode: '422.1', keterangan: 'Mutasi Siswa Keluar / Perpindahan Siswa', kategori: 'Kesiswaan', defaultType: 'SURAT_MUTASI_KELUAR' },
  { kode: '422.2', keterangan: 'Penerimaan Mutasi Siswa Masuk', kategori: 'Kesiswaan', defaultType: 'SURAT_MUTASI_MASUK' },
  { kode: '421.3', keterangan: 'Surat Keterangan Siswa Aktif / Prestasi', kategori: 'Kesiswaan', defaultType: 'SURAT_KETERANGAN_AKTIF' }
];

export const DEFAULT_LETTERS: LetterRecord[] = [
  // 1. Surat Tugas
  {
    id: 'ltr_001',
    nomorSurat: '800/018/SMAN1-BDG/X/2026',
    nomorUrut: 18,
    kodeKlasifikasi: '800',
    jenisSurat: 'SURAT_TUGAS',
    perihal: 'Surat Perintah Tugas Workshop Guru Penggerak',
    sifat: 'Penting',
    lampiran: '1 (satu) Berkas',
    tanggalSurat: '2026-10-18',
    tempatDibuat: 'Bandung',
    kepadaYth: 'Nama-nama terlampir di bawah ini',
    content: {
      type: 'SURAT_TUGAS',
      data: {
        dasarPenugasan: 'Surat Kepala Dinas Pendidikan Provinsi Jawa Barat Nomor: 421/7821-Set.Disdik tanggal 10 Oktober 2026 perihal Undangan Bimbingan Teknis Peningkatan Kompetensi Guru & Implementasi Kurikulum Merdeka.',
        daftarPetugas: [
          {
            nama: 'Drs. Hendro Wibowo, M.Si.',
            nip: '19780310 200312 1 002',
            pangkatGolongan: 'Pembina / IV/a',
            jabatan: 'Wakil Kepala Sekolah Bidang Kurikulum'
          },
          {
            nama: 'Asep Ridwan Maulana, S.Kom., M.T.',
            nip: '19851120 201001 1 015',
            pangkatGolongan: 'Penata / III/c',
            jabatan: 'Guru Informatika'
          }
        ],
        keperluanTugas: 'Menjadi Peserta Aktif dalam kegiatan "Workshop Penguatan Pembelajaran Berdiferensiasi dan Digitalisasi Sekolah Tahun 2026" se-Wilayah Bandung Raya.',
        waktuMulai: '2026-10-24',
        waktuSelesai: '2026-10-25',
        jamKegiatan: '08.00 WIB s.d. 16.30 WIB',
        tempatKegiatan: 'Hotel Grand Asrilia, Jl. Pelajar Pejuang 45 No. 123, Lengkong, Kota Bandung',
        bebanAnggaran: 'DIPA / BOS SMAN 1 Kota Bandung Tahun Anggaran 2026',
        tembusan: [
          'Kepala Cabang Dinas Pendidikan Wilayah VII',
          'Ketua Komite SMAN 1 Kota Bandung',
          'Arsip Persuratan'
        ]
      }
    },
    penandatanganNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    penandatanganNip: '19720815 199802 1 004',
    penandatanganPangkat: 'Pembina Utama Muda, IV/c',
    penandatanganJabatan: 'Kepala Sekolah',
    includeStempel: true,
    includeTtd: true,
    status: 'Diterbitkan',
    createdAt: '2026-10-18T08:30:00Z',
    updatedAt: '2026-10-18T08:30:00Z'
  },

  // 2. Surat Pengantar
  {
    id: 'ltr_002',
    nomorSurat: '045.2/019/SMAN1-BDG/X/2026',
    nomorUrut: 19,
    kodeKlasifikasi: '045.2',
    jenisSurat: 'SURAT_PENGANTAR',
    perihal: 'Pengantar Laporan Pertanggungjawaban BOS Triwulan III',
    sifat: 'Penting',
    lampiran: '1 (satu) Berkas',
    tanggalSurat: '2026-10-19',
    tempatDibuat: 'Bandung',
    kepadaYth: 'Kepala Cabang Dinas Pendidikan Wilayah VII Provinsi Jawa Barat',
    alamatPenerima: 'Jl. Dr. Rajiman No. 6, Pasir Kaliki, Kota Bandung',
    content: {
      type: 'SURAT_PENGANTAR',
      data: {
        tujuanInstansi: 'Kepala Cabang Dinas Pendidikan Wilayah VII',
        alamatInstansi: 'Jl. Dr. Rajiman No. 6, Pasir Kaliki, Kota Bandung',
        daftarBerkas: [
          {
            id: 'item_1',
            no: 1,
            naskahDinas: 'Laporan Realisasi Penggunaan Dana BOS Reguler Triwulan III Tahun Anggaran 2026',
            banyaknya: '3 (tiga) Rangkap Buku',
            keterangan: 'Dikirim dengan hormat untuk diverifikasi dan mendapatkan pengesahan.'
          },
          {
            id: 'item_2',
            no: 2,
            naskahDinas: 'Rekapitulasi SPTJM Mutlak Dana Bantuan Operasional Sekolah',
            banyaknya: '1 (satu) Berkas Asli',
            keterangan: 'Sebagai arsip kelengkapan administrasi Cabang Dinas.'
          }
        ],
        catatanPenutup: 'Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerjasama Bapak, kami ucapkan terima kasih.',
        tembusan: [
          'Kepala Dinas Pendidikan Provinsi Jawa Barat',
          'Arsip Tata Usaha'
        ]
      }
    },
    penandatanganNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    penandatanganNip: '19720815 199802 1 004',
    penandatanganPangkat: 'Pembina Utama Muda, IV/c',
    penandatanganJabatan: 'Kepala Sekolah',
    includeStempel: true,
    includeTtd: true,
    status: 'Diterbitkan',
    createdAt: '2026-10-19T09:15:00Z',
    updatedAt: '2026-10-19T09:15:00Z'
  },

  // 3. Surat Panggilan Orang Tua
  {
    id: 'ltr_003',
    nomorSurat: '421.7/020/SMAN1-BDG/X/2026',
    nomorUrut: 20,
    kodeKlasifikasi: '421.7',
    jenisSurat: 'SURAT_PANGGILAN_ORTU',
    perihal: 'Panggilan Orang Tua / Wali Siswa',
    sifat: 'Rahasia',
    lampiran: '-',
    tanggalSurat: '2026-10-20',
    tempatDibuat: 'Bandung',
    kepadaYth: 'Bapak / Ibu Orang Tua / Wali dari Siswa: Muhammad Arya Pratama',
    alamatPenerima: 'Di Tempat',
    content: {
      type: 'SURAT_PANGGILAN_ORTU',
      data: {
        studentId: 'std_01',
        namaSiswa: 'Muhammad Arya Pratama',
        nisn: '0078123456',
        kelas: 'X-1',
        namaOrtuWali: 'Bambang Pratama, S.E.',
        hariTanggalPanggilan: '2026-10-23',
        waktuPanggilan: '09.00 WIB s.d. 10.30 WIB',
        tempatMenghadap: 'Ruang Bimbingan dan Konseling (BK) SMAN 1 Kota Bandung',
        menemuiPejabat: 'Ibu Siti Rahmawati, S.Pd., M.Pd. (Guru BK) & Wali Kelas X-1',
        alasanPanggilan: 'Konsultasi dan pendampingan mengenai tingkat kehadiran siswa serta evaluasi capaian asesmen tengah semester ganjil.',
        catatanKhusus: 'Mengingat pentingnya koordinasi demi keberhasilan putra Bapak/Ibu, dimohon hadir tepat pada waktunya dan tidak diwakilkan.',
        tembusan: [
          'Wakil Kepala Sekolah Bidang Kesiswaan',
          'Wali Kelas X-1',
          'Arsip Konseling BK'
        ]
      }
    },
    penandatanganNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    penandatanganNip: '19720815 199802 1 004',
    penandatanganPangkat: 'Pembina Utama Muda, IV/c',
    penandatanganJabatan: 'Kepala Sekolah',
    includeStempel: true,
    includeTtd: true,
    status: 'Diterbitkan',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },

  // 4. Surat Undangan Orang Tua
  {
    id: 'ltr_004',
    nomorSurat: '005/021/SMAN1-BDG/X/2026',
    nomorUrut: 21,
    kodeKlasifikasi: '005',
    jenisSurat: 'SURAT_UNDANGAN_ORTU',
    perihal: 'Undangan Rapat Pleno Komite & Sosialisasi Program Sekolah',
    sifat: 'Penting',
    lampiran: '-',
    tanggalSurat: '2026-10-20',
    tempatDibuat: 'Bandung',
    kepadaYth: 'Bapak / Ibu Orang Tua / Wali Siswa Kelas X dan XI',
    alamatPenerima: 'Di Tempat',
    content: {
      type: 'SURAT_UNDANGAN_ORTU',
      data: {
        perihalUndangan: 'Rapat Pleno Komite Sekolah & Sosialisasi Program Unggulan Akademik Tahun Pelajaran 2026/2027',
        ditujukanKepada: 'Bapak/Ibu Orang Tua / Wali Siswa Kelas X dan XI SMAN 1 Kota Bandung',
        hariTanggalAcara: '2026-10-28',
        waktuAcara: '08.30 WIB s.d. 11.45 WIB',
        tempatAcara: 'Aula Utama Graha Wiyata SMAN 1 Kota Bandung, Jl. Ir. H. Juanda No. 93',
        agendaAcara: `1. Pemaparan Program Pengembangan Mutu Sekolah & Kurikulum Merdeka
2. Pembahasan Rencana Kerja & Anggaran Komite Sekolah (RKAS)
3. Sosialisasi Persiapan Asesmen Nasional Berbasis Komputer (ANBK)
4. Sesi Dialog dan Tanya Jawab Orang Tua Siswa`,
        catatanKhusus: 'Untuk ketertiban acara, dimohon hadir 15 menit sebelum acara dimulai dan membawa undangan ini.',
        tembusan: [
          'Kepala Cabang Dinas Pendidikan Wilayah VII',
          'Ketua Komite SMAN 1 Kota Bandung',
          'Arsip Sekolah'
        ]
      }
    },
    penandatanganNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    penandatanganNip: '19720815 199802 1 004',
    penandatanganPangkat: 'Pembina Utama Muda, IV/c',
    penandatanganJabatan: 'Kepala Sekolah',
    includeStempel: true,
    includeTtd: true,
    status: 'Diterbitkan',
    createdAt: '2026-10-20T11:20:00Z',
    updatedAt: '2026-10-20T11:20:00Z'
  },

  // 5. Surat Mutasi Keluar Siswa
  {
    id: 'ltr_005',
    nomorSurat: '422.1/022/SMAN1-BDG/X/2026',
    nomorUrut: 22,
    kodeKlasifikasi: '422.1',
    jenisSurat: 'SURAT_MUTASI_KELUAR',
    perihal: 'Surat Keterangan Pindah Sekolah (Mutasi Keluar)',
    sifat: 'Biasa',
    lampiran: '1 (satu) Berkas Raport & Berkas Pendukung',
    tanggalSurat: '2026-10-20',
    tempatDibuat: 'Bandung',
    kepadaYth: 'Kepala SMA Negeri 3 Surabaya',
    alamatPenerima: 'Jl. Praban No. 3, Genteng, Kota Surabaya, Jawa Timur',
    content: {
      type: 'SURAT_MUTASI_KELUAR',
      data: {
        studentId: 'std_06',
        namaSiswa: 'Dimas Bagus Saputra',
        nis: '22231099',
        nisn: '0069871122',
        jenisKelamin: 'L',
        tempatTanggalLahir: 'Semarang, 30 Agustus 2007',
        tingkatKelas: 'XI (Sebelas)',
        jurusan: 'MIPA (Matematika dan Ilmu Pengetahuan Alam)',
        namaOrtuWali: 'Agus Saputra, M.T.',
        pekerjaanOrtu: 'Dosen Perguruan Tinggi',
        alamatOrtu: 'Jl. Cisitu Indah No. 27, Coblong, Kota Bandung',
        
        namaSekolahTujuan: 'SMA NEGERI 3 SURABAYA',
        kabKotaSekolahTujuan: 'Kota Surabaya',
        provinsiSekolahTujuan: 'Jawa Timur',
        alasanPindah: 'Mengikuti kepindahan tugas dinas kedudukan orang tua ke Institut Teknologi Sepuluh Nopember (ITS) Surabaya.',
        
        bukuRaportDiserahkan: true,
        suratValidasiNisn: true,
        fotokopiAkreditasi: true,
        keteranganLainnya: 'Surat rekomendasi Dinas Pendidikan Provinsi Jawa Barat dan salinan Dapodik telah disertakan.',
        
        tembusan: [
          'Kepala Cabang Dinas Pendidikan Wilayah VII',
          'Kepala Dinas Pendidikan Provinsi Jawa Timur',
          'Orang Tua Siswa Yang Bersangkutan',
          'Arsip Mutasi Kesiswaan'
        ]
      }
    },
    penandatanganNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    penandatanganNip: '19720815 199802 1 004',
    penandatanganPangkat: 'Pembina Utama Muda, IV/c',
    penandatanganJabatan: 'Kepala Sekolah',
    includeStempel: true,
    includeTtd: true,
    status: 'Diterbitkan',
    createdAt: '2026-10-20T13:40:00Z',
    updatedAt: '2026-10-20T13:40:00Z'
  },

  // 6. Surat Penerimaan Mutasi Masuk
  {
    id: 'ltr_006',
    nomorSurat: '422.2/023/SMAN1-BDG/X/2026',
    nomorUrut: 23,
    kodeKlasifikasi: '422.2',
    jenisSurat: 'SURAT_MUTASI_MASUK',
    perihal: 'Surat Keterangan Penerimaan Mutasi Masuk Siswa',
    sifat: 'Biasa',
    lampiran: '-',
    tanggalSurat: '2026-10-20',
    tempatDibuat: 'Bandung',
    kepadaYth: 'Kepala SMA Negeri 8 Jakarta',
    alamatPenerima: 'Jl. Taman Bukit Duri, Tebet, Jakarta Selatan',
    content: {
      type: 'SURAT_MUTASI_MASUK',
      data: {
        namaSiswa: 'Farhan Rizki Ramadhan',
        nisn: '0071239874',
        jenisKelamin: 'L',
        tempatTanggalLahir: 'Jakarta, 14 Mei 2008',
        sekolahAsal: 'SMA Negeri 8 Jakarta',
        kabKotaSekolahAsal: 'Kota Administrasi Jakarta Selatan',
        diterimaDiKelas: 'X-2',
        jurusanDiterima: 'Kurikulum Merdeka (Fase E)',
        tahunPelajaran: '2026/2027',
        tanggalDiterima: '2026-10-21',
        dasarPenerimaan: '1. Surat Permohonan Orang Tua tertanggal 15 Oktober 2026\n2. Surat Keterangan Pindah dari Kepala SMA Negeri 8 Jakarta No: 422/312/SMAN8/X/2026\n3. Daya tampung rombongan belajar Fase E yang masih memenuhi kriteria (kuota tersedia).',
        persyaratanTersisa: 'Menyerahkan berkas mutasi Dapodik resmi dan Buku Rapor Asli ke Bagian Tata Usaha Kesiswaan.',
        tembusan: [
          'Kepala Cabang Dinas Pendidikan Wilayah VII',
          'Kepala SMA Negeri 8 Jakarta (Sekolah Asal)',
          'Orang Tua Siswa Yang Bersangkutan',
          'Arsip Kesiswaan'
        ]
      }
    },
    penandatanganNama: 'Dr. H. Ahmad Sudrajat, M.Pd.',
    penandatanganNip: '19720815 199802 1 004',
    penandatanganPangkat: 'Pembina Utama Muda, IV/c',
    penandatanganJabatan: 'Kepala Sekolah',
    includeStempel: true,
    includeTtd: true,
    status: 'Diterbitkan',
    createdAt: '2026-10-20T14:15:00Z',
    updatedAt: '2026-10-20T14:15:00Z'
  }
];

export const INITIAL_DATABASE: AppDatabase = {
  schoolProfile: DEFAULT_SCHOOL_PROFILE,
  students: DEFAULT_STUDENTS,
  teachers: DEFAULT_TEACHERS,
  letters: DEFAULT_LETTERS,
  lastLetterNumber: 23
};
