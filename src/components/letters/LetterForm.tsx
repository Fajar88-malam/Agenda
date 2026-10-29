/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LetterRecord,
  LetterType,
  SchoolProfile,
  Student,
  Teacher,
  SuratTugasData,
  SuratPengantarData,
  SuratPanggilanOrtuData,
  SuratUndanganOrtuData,
  SuratMutasiKeluarData,
  SuratMutasiMasukData,
  SuratKeteranganSiswaData,
  LetterPayload,
  PaperSize
} from '../../types';
import {
  generateNomorSurat,
  getDefaultClassificationCode,
  getLetterTypeName,
  formatTanggalIndonesia,
  triggerPrintWithPaperSize
} from '../../utils/formatters';
import { LetterDocumentView } from './LetterDocumentView';
import { ExportToDocsModal } from '../drive/ExportToDocsModal';
import { saveDraftToFirestore, deleteDraftFromFirestore } from '../../services/firestoreService';
import {
  FileText,
  Printer,
  Save,
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  UserCheck,
  Building,
  RefreshCw,
  Cloud,
  CheckCircle2
} from 'lucide-react';

interface LetterFormProps {
  existingLetter?: LetterRecord | null;
  initialType?: LetterType;
  school: SchoolProfile;
  students: Student[];
  teachers: Teacher[];
  nextSequence: number;
  onSave: (letter: LetterRecord) => void;
  onCancel: () => void;
}

export const LetterForm: React.FC<LetterFormProps> = ({
  existingLetter,
  initialType = 'SURAT_TUGAS',
  school,
  students,
  teachers,
  nextSequence,
  onSave,
  onCancel
}) => {
  const [selectedType, setSelectedType] = useState<LetterType>(
    existingLetter ? existingLetter.jenisSurat : initialType
  );
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [hideHeader, setHideHeader] = useState<boolean>(false);
  const [mutasiSheetView, setMutasiSheetView] = useState<'ALL' | 'LEMBAR_1' | 'LEMBAR_2'>('ALL');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Realtime Autosave State (Data tersimpan saat mengisinya)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Common Header State
  const [nomorUrut, setNomorUrut] = useState<number>(
    existingLetter ? existingLetter.nomorUrut : nextSequence
  );
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState<string>(
    existingLetter ? existingLetter.kodeKlasifikasi : getDefaultClassificationCode(selectedType)
  );
  const [tanggalSurat, setTanggalSurat] = useState<string>(
    existingLetter ? existingLetter.tanggalSurat : todayStr
  );
  const [tempatDibuat, setTempatDibuat] = useState<string>(
    existingLetter ? existingLetter.tempatDibuat : school.kotaKab.replace('Kota ', '').replace('Kabupaten ', '')
  );
  const [sifat, setSifat] = useState<LetterRecord['sifat']>(
    existingLetter ? existingLetter.sifat : selectedType === 'SURAT_PANGGILAN_ORTU' ? 'Rahasia' : 'Biasa'
  );
  const [lampiran, setLampiran] = useState<string>(
    existingLetter ? existingLetter.lampiran : selectedType === 'SURAT_MUTASI_KELUAR' ? '1 (satu) Berkas Raport' : '-'
  );
  const [perihal, setPerihal] = useState<string>(
    existingLetter ? existingLetter.perihal : getDefaultPerihal(selectedType)
  );
  const [nomorSurat, setNomorSurat] = useState<string>(
    existingLetter
      ? existingLetter.nomorSurat
      : generateNomorSurat(
          getDefaultClassificationCode(selectedType),
          nextSequence,
          school.namaSingkatanSekolah,
          todayStr
        )
  );

  // Signer State
  const [penandatanganNama, setPenandatanganNama] = useState<string>(
    existingLetter ? existingLetter.penandatanganNama : school.kepalaSekolahNama
  );
  const [penandatanganNip, setPenandatanganNip] = useState<string>(
    existingLetter ? existingLetter.penandatanganNip : school.kepalaSekolahNip
  );
  const [penandatanganPangkat, setPenandatanganPangkat] = useState<string>(
    existingLetter ? existingLetter.penandatanganPangkat : school.kepalaSekolahPangkat
  );
  const [penandatanganJabatan, setPenandatanganJabatan] = useState<string>(
    existingLetter ? existingLetter.penandatanganJabatan : 'Kepala Sekolah'
  );
  const [includeStempel, setIncludeStempel] = useState<boolean>(
    existingLetter ? existingLetter.includeStempel : school.stempelEnabled
  );
  const [includeTtd, setIncludeTtd] = useState<boolean>(
    existingLetter ? existingLetter.includeTtd : school.ttdEnabled
  );

  // Specific Payloads
  // 1. Surat Tugas State
  const [tugasDasar, setTugasDasar] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.dasarPenugasan
      : `Surat Edaran Kepala Dinas Pendidikan Provinsi ${school.provinsi} perihal Pelaksanaan Kegiatan Peningkatan Mutu Satuan Pendidikan Tahun 2026.`
  );
  const [tugasPetugas, setTugasPetugas] = useState<SuratTugasData['daftarPetugas']>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.daftarPetugas
      : [
          {
            nama: teachers[1]?.nama || 'Drs. Hendro Wibowo, M.Si.',
            nip: teachers[1]?.nip || '19780310 200312 1 002',
            pangkatGolongan: teachers[1]?.pangkatGolongan || 'Pembina / IV/a',
            jabatan: teachers[1]?.jabatan || 'Wakil Kepala Sekolah'
          }
        ]
  );
  const [tugasKeperluan, setTugasKeperluan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.keperluanTugas
      : 'Mengikuti Bimbingan Teknis Implementasi Program Pembelajaran Berdiferensiasi dan Pengelolaan Kinerja Guru Tahun 2026.'
  );
  const [tugasWaktuMulai, setTugasWaktuMulai] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.waktuMulai
      : todayStr
  );
  const [tugasWaktuSelesai, setTugasWaktuSelesai] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.waktuSelesai
      : todayStr
  );
  const [tugasJam, setTugasJam] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.jamKegiatan
      : 'Pukul 08.00 WIB s.d Selesai'
  );
  const [tugasTempat, setTugasTempat] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.tempatKegiatan
      : `Aula Balai Penjaminan Mutu Pendidikan (BPMP) Provinsi ${school.provinsi}`
  );
  const [tugasAnggaran, setTugasAnggaran] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.bebanAnggaran
      : `DIPA / Dana BOS ${school.namaSekolah} Tahun Anggaran 2026`
  );
  const [tugasTembusan, setTugasTembusan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_TUGAS'
      ? existingLetter.content.data.tembusan.join('\n')
      : `Kepala Cabang Dinas Pendidikan\nKetua Komite Sekolah\nArsip Persuratan`
  );

  // 2. Surat Pengantar State
  const [pengantarTujuan, setPengantarTujuan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PENGANTAR'
      ? existingLetter.content.data.tujuanInstansi
      : 'Kepala Cabang Dinas Pendidikan'
  );
  const [pengantarAlamat, setPengantarAlamat] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PENGANTAR'
      ? existingLetter.content.data.alamatInstansi
      : 'Di Tempat'
  );
  const [pengantarItems, setPengantarItems] = useState<SuratPengantarData['daftarBerkas']>(
    existingLetter && existingLetter.content.type === 'SURAT_PENGANTAR'
      ? existingLetter.content.data.daftarBerkas
      : [
          {
            id: '1',
            no: 1,
            naskahDinas: 'Berkas Laporan Pertanggungjawaban Kegiatan dan Kesiswaan Bulan Ini',
            banyaknya: '2 (dua) Eksemplar',
            keterangan: 'Dikirim dengan hormat untuk diverifikasi dan ditindaklanjuti.'
          }
        ]
  );
  const [pengantarPenutup, setPengantarPenutup] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PENGANTAR'
      ? existingLetter.content.data.catatanPenutup
      : 'Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerjasama Bapak/Ibu kami haturkan terima kasih.'
  );

  // 3. Surat Panggilan Ortu State
  const [panggilanSiswaId, setPanggilanSiswaId] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.studentId || ''
      : students[0]?.id || ''
  );
  const [panggilanNamaSiswa, setPanggilanNamaSiswa] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.namaSiswa
      : students[0]?.nama || 'Muhammad Arya Pratama'
  );
  const [panggilanNisn, setPanggilanNisn] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.nisn
      : students[0]?.nisn || '0078123456'
  );
  const [panggilanKelas, setPanggilanKelas] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.kelas
      : students[0]?.kelas || 'X-1'
  );
  const [panggilanOrtu, setPanggilanOrtu] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.namaOrtuWali
      : students[0]?.namaAyah || 'Bambang Pratama, S.E.'
  );
  const [panggilanTgl, setPanggilanTgl] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.hariTanggalPanggilan
      : todayStr
  );
  const [panggilanWaktu, setPanggilanWaktu] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.waktuPanggilan
      : 'Pukul 09.00 WIB s.d. 10.30 WIB'
  );
  const [panggilanTempat, setPanggilanTempat] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.tempatMenghadap
      : `Ruang Bimbingan & Konseling (BK) ${school.namaSekolah}`
  );
  const [panggilanMenemui, setPanggilanMenemui] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.menemuiPejabat
      : 'Guru Bimbingan Konseling (BK) & Wali Kelas'
  );
  const [panggilanAlasan, setPanggilanAlasan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_PANGGILAN_ORTU'
      ? existingLetter.content.data.alasanPanggilan
      : 'Konsultasi dan koordinasi bersama mengenai perkembangan kehadiran, kedisiplinan, dan pencapaian akademik siswa di sekolah.'
  );

  // 4. Surat Undangan Ortu State
  const [undanganPerihal, setUndanganPerihal] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_UNDANGAN_ORTU'
      ? existingLetter.content.data.perihalUndangan
      : 'Rapat Pleno Komite & Sosialisasi Program Sekolah Semester Genap Tahun 2026'
  );
  const [undanganDitujukan, setUndanganDitujukan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_UNDANGAN_ORTU'
      ? existingLetter.content.data.ditujukanKepada
      : 'Bapak / Ibu Orang Tua / Wali Siswa Seluruh Kelas'
  );
  const [undanganTgl, setUndanganTgl] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_UNDANGAN_ORTU'
      ? existingLetter.content.data.hariTanggalAcara
      : todayStr
  );
  const [undanganWaktu, setUndanganWaktu] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_UNDANGAN_ORTU'
      ? existingLetter.content.data.waktuAcara
      : '08.30 WIB s.d. 11.30 WIB'
  );
  const [undanganTempat, setUndanganTempat] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_UNDANGAN_ORTU'
      ? existingLetter.content.data.tempatAcara
      : `Aula Graha Utama ${school.namaSekolah}`
  );
  const [undanganAgenda, setUndanganAgenda] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_UNDANGAN_ORTU'
      ? existingLetter.content.data.agendaAcara
      : `1. Pemaparan Program Kerja Sekolah & Kurikulum Merdeka\n2. Sosialisasi Asesmen Standar Pendidikan & Kalender Akademik\n3. Pembahasan Dukungan Komite Sekolah\n4. Sesi Tanya Jawab Orang Tua Siswa`
  );

  // 5. Surat Mutasi Keluar State
  const [mutasiSiswaId, setMutasiSiswaId] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.studentId || ''
      : ''
  );
  const [mutasiNamaSiswa, setMutasiNamaSiswa] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.namaSiswa
      : students[0]?.nama || ''
  );
  const [mutasiNis, setMutasiNis] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.nis
      : students[0]?.nis || ''
  );
  const [mutasiNisn, setMutasiNisn] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.nisn
      : students[0]?.nisn || ''
  );
  const [mutasiTtl, setMutasiTtl] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.tempatTanggalLahir
      : `${students[0]?.tempatLahir || 'Bandung'}, ${formatTanggalIndonesia(students[0]?.tanggalLahir || '2008-01-01')}`
  );
  const [mutasiGender, setMutasiGender] = useState<'L' | 'P'>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.jenisKelamin
      : students[0]?.jenisKelamin || 'L'
  );
  const [mutasiKelas, setMutasiKelas] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.tingkatKelas
      : students[0]?.kelas || 'X-1'
  );
  const [mutasiJurusan, setMutasiJurusan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.jurusan
      : students[0]?.jurusan || 'Fase E'
  );
  const [mutasiOrtu, setMutasiOrtu] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.namaOrtuWali
      : students[0]?.namaAyah || 'Bambang Pratama'
  );
  const [mutasiPekerjaan, setMutasiPekerjaan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.pekerjaanOrtu
      : students[0]?.pekerjaanOrtu || 'Wiraswasta'
  );
  const [mutasiAlamatOrtu, setMutasiAlamatOrtu] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.alamatOrtu
      : students[0]?.alamat || 'Jl. Bandung Raya No. 12'
  );
  const [mutasiTujuanSekolah, setMutasiTujuanSekolah] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.namaSekolahTujuan
      : 'SMA NEGERI 3 SURABAYA'
  );
  const [mutasiTujuanKota, setMutasiTujuanKota] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.kabKotaSekolahTujuan
      : 'Kota Surabaya'
  );
  const [mutasiTujuanProv, setMutasiTujuanProv] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.provinsiSekolahTujuan
      : 'Jawa Timur'
  );
  const [mutasiAlasan, setMutasiAlasan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_KELUAR'
      ? existingLetter.content.data.alasanPindah
      : 'Mengikuti perpindahan tugas kedinasan dan domisili tempat tinggal orang tua.'
  );

  // 6. Surat Mutasi Masuk State
  const [masukNama, setMasukNama] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.namaSiswa
      : 'Farhan Rizki Ramadhan'
  );
  const [masukNisn, setMasukNisn] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.nisn
      : '0071239874'
  );
  const [masukTtl, setMasukTtl] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.tempatTanggalLahir
      : 'Jakarta, 14 Mei 2008'
  );
  const [masukGender, setMasukGender] = useState<'L' | 'P'>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.jenisKelamin
      : 'L'
  );
  const [masukSekolahAsal, setMasukSekolahAsal] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.sekolahAsal
      : 'SMA Negeri 8 Jakarta'
  );
  const [masukKotaAsal, setMasukKotaAsal] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.kabKotaSekolahAsal
      : 'Kota Administrasi Jakarta Selatan'
  );
  const [masukKelas, setMasukKelas] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.diterimaDiKelas
      : 'X-2'
  );
  const [masukJurusan, setMasukJurusan] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.jurusanDiterima
      : 'Kurikulum Merdeka (Fase E)'
  );
  const [masukTahunAjaran, setMasukTahunAjaran] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.tahunPelajaran
      : '2026/2027'
  );
  const [masukTgl, setMasukTgl] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.tanggalDiterima
      : todayStr
  );
  const [masukDasar, setMasukDasar] = useState<string>(
    existingLetter && existingLetter.content.type === 'SURAT_MUTASI_MASUK'
      ? existingLetter.content.data.dasarPenerimaan
      : `1. Surat Permohonan Orang Tua Siswa\n2. Surat Keterangan Pindah Sekolah dari sekolah asal\n3. Kuota rombongan belajar yang masih memenuhi daya tampung satuan pendidikan.`
  );

  // 7. Surat Keterangan Siswa (Aktif / Berkelakuan Baik) State
  const [ketSiswaId, setKetSiswaId] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.studentId || ''
      : students[0]?.id || ''
  );
  const [ketNamaSiswa, setKetNamaSiswa] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.namaSiswa
      : students[0]?.nama || ''
  );
  const [ketNis, setKetNis] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.nis
      : students[0]?.nis || ''
  );
  const [ketNisn, setKetNisn] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.nisn
      : students[0]?.nisn || ''
  );
  const [ketTtl, setKetTtl] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.tempatTanggalLahir
      : `${students[0]?.tempatLahir || 'Bandung'}, ${formatTanggalIndonesia(students[0]?.tanggalLahir || '2008-01-01')}`
  );
  const [ketGender, setKetGender] = useState<'L' | 'P'>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.jenisKelamin
      : students[0]?.jenisKelamin || 'L'
  );
  const [ketKelas, setKetKelas] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.kelas
      : students[0]?.kelas || 'X-1'
  );
  const [ketOrtu, setKetOrtu] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.namaOrtu
      : students[0]?.namaAyah || 'Bambang Pratama'
  );
  const [ketAlamat, setKetAlamat] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.alamat
      : students[0]?.alamat || 'Jl. Dago No. 12'
  );
  const [ketKeperluan, setKetKeperluan] = useState<string>(
    existingLetter && (existingLetter.content.type === 'SURAT_KETERANGAN_AKTIF' || existingLetter.content.type === 'SURAT_KETERANGAN_BAIK')
      ? existingLetter.content.data.tujuanPenggunaan
      : 'Syarat Pendaftaran Beasiswa Berprestasi / Pembuatan Paspor'
  );

  function handleTypeChange(newType: LetterType) {
    setSelectedType(newType);
    const code = getDefaultClassificationCode(newType);
    setKodeKlasifikasi(code);
    setPerihal(getDefaultPerihal(newType));
    setNomorSurat(generateNomorSurat(code, nomorUrut, school.namaSingkatanSekolah, tanggalSurat));
  }

  function handleGenerateNewNumber() {
    const generated = generateNomorSurat(kodeKlasifikasi, nomorUrut, school.namaSingkatanSekolah, tanggalSurat);
    setNomorSurat(generated);
  }

  // Handle student select for Autofill
  function handleSelectStudentForPanggilan(studentId: string) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    setPanggilanSiswaId(s.id);
    setPanggilanNamaSiswa(s.nama);
    setPanggilanNisn(s.nisn);
    setPanggilanKelas(s.kelas);
    setPanggilanOrtu(s.namaAyah || s.namaIbu || s.namaWali || 'Orang Tua Siswa');
  }

  function handleSelectStudentForMutasi(studentId: string) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    setMutasiSiswaId(s.id);
    setMutasiNamaSiswa(s.nama);
    setMutasiNis(s.nis);
    setMutasiNisn(s.nisn);
    setMutasiTtl(`${s.tempatLahir}, ${formatTanggalIndonesia(s.tanggalLahir)}`);
    setMutasiGender(s.jenisKelamin);
    setMutasiKelas(s.kelas);
    setMutasiJurusan(s.jurusan);
    setMutasiOrtu(s.namaAyah || s.namaIbu || s.namaWali || '');
    setMutasiPekerjaan(s.pekerjaanOrtu || '-');
    setMutasiAlamatOrtu(s.alamat);
  }

  function handleSelectStudentForKet(studentId: string) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    setKetSiswaId(s.id);
    setKetNamaSiswa(s.nama);
    setKetNis(s.nis);
    setKetNisn(s.nisn);
    setKetTtl(`${s.tempatLahir}, ${formatTanggalIndonesia(s.tanggalLahir)}`);
    setKetGender(s.jenisKelamin);
    setKetKelas(s.kelas);
    setKetOrtu(s.namaAyah || s.namaIbu || s.namaWali || '');
    setKetAlamat(s.alamat);
  }

  function constructLetterPayload(): LetterPayload {
    switch (selectedType) {
      case 'SURAT_TUGAS':
        return {
          type: 'SURAT_TUGAS',
          data: {
            dasarPenugasan: tugasDasar,
            daftarPetugas: tugasPetugas,
            keperluanTugas: tugasKeperluan,
            waktuMulai: tugasWaktuMulai,
            waktuSelesai: tugasWaktuSelesai,
            jamKegiatan: tugasJam,
            tempatKegiatan: tugasTempat,
            bebanAnggaran: tugasAnggaran,
            tembusan: tugasTembusan.split('\n').filter(Boolean)
          }
        };
      case 'SURAT_PENGANTAR':
        return {
          type: 'SURAT_PENGANTAR',
          data: {
            tujuanInstansi: pengantarTujuan,
            alamatInstansi: pengantarAlamat,
            daftarBerkas: pengantarItems,
            catatanPenutup: pengantarPenutup,
            tembusan: ['Arsip Tata Usaha']
          }
        };
      case 'SURAT_PANGGILAN_ORTU':
        return {
          type: 'SURAT_PANGGILAN_ORTU',
          data: {
            studentId: panggilanSiswaId,
            namaSiswa: panggilanNamaSiswa,
            nisn: panggilanNisn,
            kelas: panggilanKelas,
            namaOrtuWali: panggilanOrtu,
            hariTanggalPanggilan: panggilanTgl,
            waktuPanggilan: panggilanWaktu,
            tempatMenghadap: panggilanTempat,
            menemuiPejabat: panggilanMenemui,
            alasanPanggilan: panggilanAlasan,
            catatanKhusus: 'Mengingat pentingnya koordinasi demi masa depan dan keberhasilan belajar siswa, kami sangat mengharapkan kehadiran Bapak/Ibu tepat waktu dan tidak diwakilkan.',
            tembusan: ['Wali Kelas', 'Guru BK', 'Arsip Kesiswaan']
          }
        };
      case 'SURAT_UNDANGAN_ORTU':
        return {
          type: 'SURAT_UNDANGAN_ORTU',
          data: {
            perihalUndangan: undanganPerihal,
            ditujukanKepada: undanganDitujukan,
            hariTanggalAcara: undanganTgl,
            waktuAcara: undanganWaktu,
            tempatAcara: undanganTempat,
            agendaAcara: undanganAgenda,
            catatanKhusus: 'Dimohon hadir 15 menit sebelum acara dimulai.',
            tembusan: ['Komite Sekolah', 'Arsip']
          }
        };
      case 'SURAT_MUTASI_KELUAR':
        return {
          type: 'SURAT_MUTASI_KELUAR',
          data: {
            studentId: mutasiSiswaId,
            namaSiswa: mutasiNamaSiswa,
            nis: mutasiNis,
            nisn: mutasiNisn,
            jenisKelamin: mutasiGender,
            tempatTanggalLahir: mutasiTtl,
            tingkatKelas: mutasiKelas,
            jurusan: mutasiJurusan,
            namaOrtuWali: mutasiOrtu,
            pekerjaanOrtu: mutasiPekerjaan,
            alamatOrtu: mutasiAlamatOrtu,
            namaSekolahTujuan: mutasiTujuanSekolah,
            kabKotaSekolahTujuan: mutasiTujuanKota,
            provinsiSekolahTujuan: mutasiTujuanProv,
            alasanPindah: mutasiAlasan,
            bukuRaportDiserahkan: true,
            suratValidasiNisn: true,
            fotokopiAkreditasi: true,
            keteranganLainnya: 'Berkas Dapodik dan Surat Rekomendasi Dinas terlampir.',
            tembusan: ['Dinas Pendidikan Asal', 'Dinas Pendidikan Tujuan', 'Orang Tua Siswa', 'Arsip']
          }
        };
      case 'SURAT_MUTASI_MASUK':
        return {
          type: 'SURAT_MUTASI_MASUK',
          data: {
            namaSiswa: masukNama,
            nisn: masukNisn,
            jenisKelamin: masukGender,
            tempatTanggalLahir: masukTtl,
            sekolahAsal: masukSekolahAsal,
            kabKotaSekolahAsal: masukKotaAsal,
            diterimaDiKelas: masukKelas,
            jurusanDiterima: masukJurusan,
            tahunPelajaran: masukTahunAjaran,
            tanggalDiterima: masukTgl,
            dasarPenerimaan: masukDasar,
            persyaratanTersisa: 'Menyerahkan buku raport asli dan surat keterangan mutasi Dapodik dari sekolah asal.',
            tembusan: ['Sekolah Asal', 'Orang Tua Siswa', 'Arsip Kesiswaan']
          }
        };
      case 'SURAT_KETERANGAN_AKTIF':
      case 'SURAT_KETERANGAN_BAIK':
        return {
          type: selectedType,
          data: {
            studentId: ketSiswaId,
            namaSiswa: ketNamaSiswa,
            nis: ketNis,
            nisn: ketNisn,
            jenisKelamin: ketGender,
            tempatTanggalLahir: ketTtl,
            kelas: ketKelas,
            namaOrtu: ketOrtu,
            alamat: ketAlamat,
            tujuanPenggunaan: ketKeperluan,
            keteranganTambahan: ''
          }
        };
    }
  }

  function handleSave(status: LetterRecord['status'] = 'Diterbitkan') {
    const payload = constructLetterPayload();
    const newRecord: LetterRecord = {
      id: existingLetter ? existingLetter.id : `ltr_${Date.now()}`,
      nomorSurat,
      nomorUrut,
      kodeKlasifikasi,
      jenisSurat: selectedType,
      perihal,
      sifat,
      lampiran,
      tanggalSurat,
      tempatDibuat,
      kepadaYth: getTargetRecipient(selectedType),
      content: payload,
      penandatanganNama,
      penandatanganNip,
      penandatanganPangkat,
      penandatanganJabatan,
      includeStempel,
      includeTtd,
      status,
      createdAt: existingLetter ? existingLetter.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Clean up draft from Firestore and localStorage upon official save
    const draftId = existingLetter ? `draft_${existingLetter.id}` : 'active_draft';
    deleteDraftFromFirestore(draftId).catch(() => {});
    try {
      localStorage.removeItem(`esurat_draft_${draftId}`);
    } catch (e) {
      // ignore
    }

    onSave(newRecord);
  }

  function getTargetRecipient(type: LetterType): string {
    switch (type) {
      case 'SURAT_TUGAS':
        return 'Nama-nama Terlampir';
      case 'SURAT_PENGANTAR':
        return pengantarTujuan;
      case 'SURAT_PANGGILAN_ORTU':
        return `Bapak/Ibu Orang Tua dari: ${panggilanNamaSiswa}`;
      case 'SURAT_UNDANGAN_ORTU':
        return undanganDitujukan;
      case 'SURAT_MUTASI_KELUAR':
        return `Kepala ${mutasiTujuanSekolah}`;
      case 'SURAT_MUTASI_MASUK':
        return `Kepala ${masukSekolahAsal}`;
      case 'SURAT_KETERANGAN_AKTIF':
      case 'SURAT_KETERANGAN_BAIK':
        return `Siswa Yang Bersangkutan: ${ketNamaSiswa}`;
    }
  }

  // Temporary Letter Object for live preview
  const liveLetterRecord: LetterRecord = {
    id: existingLetter?.id || 'live_preview',
    nomorSurat,
    nomorUrut,
    kodeKlasifikasi,
    jenisSurat: selectedType,
    perihal,
    sifat,
    lampiran,
    tanggalSurat,
    tempatDibuat,
    kepadaYth: getTargetRecipient(selectedType),
    content: constructLetterPayload(),
    penandatanganNama,
    penandatanganNip,
    penandatanganPangkat,
    penandatanganJabatan,
    includeStempel,
    includeTtd,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Realtime Autosave effect: saves automatically while user is filling in data
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAutosaveStatus('saving');
        const draftId = existingLetter ? `draft_${existingLetter.id}` : 'active_draft';
        const draftPayload = {
          id: draftId,
          letterType: selectedType,
          formData: liveLetterRecord,
          updatedAt: new Date().toISOString()
        };
        // Save to browser cache immediately
        try {
          localStorage.setItem(`esurat_draft_${draftId}`, JSON.stringify(draftPayload));
        } catch (e) {
          // ignore
        }
        // Save to Firestore cloud database in realtime
        await saveDraftToFirestore(draftId, draftPayload);
        setAutosaveStatus('saved');
        setLastSavedTime(
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch (err) {
        console.warn('Realtime autosave notice:', err);
        setAutosaveStatus('saved');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    selectedType,
    nomorSurat,
    nomorUrut,
    kodeKlasifikasi,
    tanggalSurat,
    tempatDibuat,
    sifat,
    lampiran,
    perihal,
    penandatanganNama,
    penandatanganNip,
    penandatanganPangkat,
    penandatanganJabatan,
    includeStempel,
    includeTtd,
    tugasDasar,
    tugasPetugas,
    tugasKeperluan,
    tugasWaktuMulai,
    tugasWaktuSelesai,
    tugasJam,
    tugasTempat,
    tugasAnggaran,
    tugasTembusan,
    pengantarTujuan,
    pengantarAlamat,
    pengantarItems,
    pengantarPenutup,
    panggilanSiswaId,
    panggilanNamaSiswa,
    panggilanNisn,
    panggilanKelas,
    panggilanOrtu,
    panggilanTgl,
    panggilanWaktu,
    panggilanTempat,
    panggilanMenemui,
    panggilanAlasan,
    undanganPerihal,
    undanganDitujukan,
    undanganTgl,
    undanganWaktu,
    undanganTempat,
    undanganAgenda,
    mutasiSiswaId,
    mutasiNamaSiswa,
    mutasiNis,
    mutasiNisn,
    mutasiGender,
    mutasiTtl,
    mutasiKelas,
    mutasiJurusan,
    mutasiOrtu,
    mutasiPekerjaan,
    mutasiAlamatOrtu,
    mutasiTujuanSekolah,
    mutasiTujuanKota,
    mutasiTujuanProv,
    mutasiAlasan,
    masukNama,
    masukNisn,
    masukGender,
    masukTtl,
    masukSekolahAsal,
    masukKotaAsal,
    masukKelas,
    masukJurusan,
    masukTahunAjaran,
    masukTgl,
    masukDasar,
    ketSiswaId,
    ketNamaSiswa,
    ketNis,
    ketNisn,
    ketGender,
    ketTtl,
    ketKelas,
    ketOrtu,
    ketAlamat,
    ketKeperluan
  ]);

  return (
    <div className="space-y-6">
      {/* Top Action Header (Sembunyi total saat pencetakan) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 no-print print:hidden kotak-buat-surat" data-no-print="true">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kembali ke Daftar Surat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                {existingLetter ? 'Edit Surat Keluar' : 'Buat Surat Baru'}
              </h2>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  autosaveStatus === 'saving'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
                title="Data formulir tersimpan otomatis secara realtime ke Firestore cloud saat Anda mengisi"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    autosaveStatus === 'saving' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                  }`}
                ></span>
                <span>
                  {autosaveStatus === 'saving'
                    ? 'Menyimpan draft realtime...'
                    : lastSavedTime
                    ? `Tersimpan realtime (${lastSavedTime})`
                    : 'Tersimpan otomatis saat mengisi'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{getLetterTypeName(selectedType)}</span>
              <span>·</span>
              <span className="font-mono">{nomorSurat}</span>
            </div>
          </div>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Segmented Tab */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formulir Data
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau Surat
            </button>
          </div>

          {/* Opsi Cetak & Kertas saat Mode Pratinjau */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Pilihan Jenis Kertas: A4 vs F4 */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    paperSize === 'A4'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kertas A4
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('F4')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    paperSize === 'F4'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kertas F4
                </button>
              </div>

              {/* Opsi Hilangkan Header Kop Surat */}
              <button
                type="button"
                onClick={() => setHideHeader(p => !p)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                  hideHeader
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title="Hilangkan Kop Surat jika mencetak pada kertas yang sudah tercetak kop surat percetakan"
              >
                <span>{hideHeader ? 'Header: Sembunyi' : 'Header: Aktif'}</span>
              </button>

              {/* Khusus Mutasi Keluar: Selector Lembar */}
              {selectedType === 'SURAT_MUTASI_KELUAR' && (
                <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setMutasiSheetView('ALL')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      mutasiSheetView === 'ALL'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    Semua Lembar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMutasiSheetView('LEMBAR_1')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      mutasiSheetView === 'LEMBAR_1'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    Lembar 1 (Sekolah)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMutasiSheetView('LEMBAR_2')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      mutasiSheetView === 'LEMBAR_2'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    Lembar 2 (Ortu)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tombol Ekspor ke Google Docs */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
            title="Ekspor surat ini ke Google Docs"
          >
            <Cloud className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Google Docs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('preview');
              setTimeout(() => triggerPrintWithPaperSize(paperSize), 150);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak ({paperSize})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('Diterbitkan')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            Simpan Surat
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'preview' ? (
        <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 p-3 rounded-lg no-print print:hidden" data-no-print="true">
            <span>
              Standar Ukuran Kertas: <strong className="text-slate-800">{paperSize === 'F4' ? 'F4 / Folio (215 x 330 mm)' : 'A4 (210 x 297 mm)'}</strong> · Format Resmi Tata Naskah Dinas
            </span>
            <span className="font-semibold text-slate-700">
              {hideHeader ? 'Kop Surat Disembunyikan untuk Blanko Percetakan' : 'Kop Surat Resmi Lengkap'}
            </span>
          </div>
          <LetterDocumentView
            letter={liveLetterRecord}
            school={school}
            previewMode={true}
            paperSize={paperSize}
            hideHeader={hideHeader}
            activeSheetMutasi={mutasiSheetView}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print print:hidden kolom-buat-surat" data-no-print="true">
          {/* Left Column: Form Fields (2 cols) - Kolom Buat Surat Baru */}
          <div className="lg:col-span-2 space-y-6 no-print print:hidden kolom-buat-surat" data-no-print="true">
            {/* Step 1: Pilih Jenis Surat */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                1. Pilih Kategori & Jenis Surat
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'SURAT_TUGAS' as LetterType, label: 'Surat Tugas', desc: 'Perintah tugas guru/pegawai' },
                  { type: 'SURAT_PENGANTAR' as LetterType, label: 'Surat Pengantar', desc: 'Kirim berkas ke dinas' },
                  { type: 'SURAT_PANGGILAN_ORTU' as LetterType, label: 'Panggilan Ortu', desc: 'Konseling BK & disiplin' },
                  { type: 'SURAT_UNDANGAN_ORTU' as LetterType, label: 'Undangan Ortu', desc: 'Rapat pleno & raport' },
                  { type: 'SURAT_MUTASI_KELUAR' as LetterType, label: 'Mutasi Keluar', desc: 'Pindah ke sekolah lain' },
                  { type: 'SURAT_MUTASI_MASUK' as LetterType, label: 'Mutasi Masuk', desc: 'Penerimaan siswa baru' },
                  { type: 'SURAT_KETERANGAN_AKTIF' as LetterType, label: 'Suket Aktif', desc: 'Keterangan siswa aktif' },
                  { type: 'SURAT_KETERANGAN_BAIK' as LetterType, label: 'Suket Baik', desc: 'Berkelakuan baik' }
                ].map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleTypeChange(item.type)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      selectedType === item.type
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Nomor Surat & Administrasi Arsip */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  2. Tata Kelola Nomor & Tanggal Surat
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateNewNumber}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Format Ulang Nomor
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Kode Klasifikasi</label>
                  <input
                    type="text"
                    value={kodeKlasifikasi}
                    onChange={e => {
                      setKodeKlasifikasi(e.target.value);
                      setNomorSurat(generateNomorSurat(e.target.value, nomorUrut, school.namaSingkatanSekolah, tanggalSurat));
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Contoh: 421.7"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nomor Urut Buku Agenda</label>
                  <input
                    type="number"
                    value={nomorUrut}
                    onChange={e => {
                      const num = parseInt(e.target.value, 10) || 1;
                      setNomorUrut(num);
                      setNomorSurat(generateNomorSurat(kodeKlasifikasi, num, school.namaSingkatanSekolah, tanggalSurat));
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Surat</label>
                  <input
                    type="date"
                    value={tanggalSurat}
                    onChange={e => {
                      setTanggalSurat(e.target.value);
                      setNomorSurat(generateNomorSurat(kodeKlasifikasi, nomorUrut, school.namaSingkatanSekolah, e.target.value));
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nomor Surat Resmi (Tercetak di Dokumen)
                </label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={e => setNomorSurat(e.target.value)}
                  className="w-full text-xs font-mono font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sifat</label>
                  <select
                    value={sifat}
                    onChange={e => setSifat(e.target.value as LetterRecord['sifat'])}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Rahasia">Rahasia</option>
                    <option value="Segera">Segera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Lampiran</label>
                  <input
                    type="text"
                    value={lampiran}
                    onChange={e => setLampiran(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Contoh: 1 Berkas / -"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tempat Dibuat</label>
                  <input
                    type="text"
                    value={tempatDibuat}
                    onChange={e => setTempatDibuat(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Perihal / Hal</label>
                <input
                  type="text"
                  value={perihal}
                  onChange={e => setPerihal(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* Step 3: Isi Spesifik Berdasarkan Jenis Surat */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                3. Rincian Muatan Surat ({getLetterTypeName(selectedType)})
              </h3>

              {/* SURAT TUGAS FIELDS */}
              {selectedType === 'SURAT_TUGAS' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Dasar Penugasan</label>
                    <textarea
                      rows={2}
                      value={tugasDasar}
                      onChange={e => setTugasDasar(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="Surat Keputusan / Edaran yang mendasari tugas"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-800">
                        Daftar Pegawai / Guru yang Ditugaskan
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const t = teachers[tugasPetugas.length % teachers.length] || teachers[0];
                          setTugasPetugas([
                            ...tugasPetugas,
                            {
                              nama: t.nama,
                              nip: t.nip,
                              pangkatGolongan: t.pangkatGolongan,
                              jabatan: t.jabatan
                            }
                          ]);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Petugas
                      </button>
                    </div>

                    <div className="space-y-3">
                      {tugasPetugas.map((petugas, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Petugas #{idx + 1}</span>
                            <div className="flex items-center gap-2">
                              {/* Pilih dari guru master */}
                              <select
                                onChange={e => {
                                  const t = teachers.find(tch => tch.id === e.target.value);
                                  if (t) {
                                    const nextList = [...tugasPetugas];
                                    nextList[idx] = {
                                      nama: t.nama,
                                      nip: t.nip,
                                      pangkatGolongan: t.pangkatGolongan,
                                      jabatan: t.jabatan
                                    };
                                    setTugasPetugas(nextList);
                                  }
                                }}
                                className="text-[11px] px-2 py-1 bg-white border border-slate-300 rounded"
                              >
                                <option value="">-- Pilih dari Master Guru --</option>
                                {teachers.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.nama}
                                  </option>
                                ))}
                              </select>
                              {tugasPetugas.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setTugasPetugas(tugasPetugas.filter((_, i) => i !== idx))}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              value={petugas.nama}
                              onChange={e => {
                                const next = [...tugasPetugas];
                                next[idx].nama = e.target.value;
                                setTugasPetugas(next);
                              }}
                              placeholder="Nama Petugas"
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                            />
                            <input
                              type="text"
                              value={petugas.nip}
                              onChange={e => {
                                const next = [...tugasPetugas];
                                next[idx].nip = e.target.value;
                                setTugasPetugas(next);
                              }}
                              placeholder="NIP Petugas"
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                            />
                            <input
                              type="text"
                              value={petugas.pangkatGolongan}
                              onChange={e => {
                                const next = [...tugasPetugas];
                                next[idx].pangkatGolongan = e.target.value;
                                setTugasPetugas(next);
                              }}
                              placeholder="Pangkat / Golongan"
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                            />
                            <input
                              type="text"
                              value={petugas.jabatan}
                              onChange={e => {
                                const next = [...tugasPetugas];
                                next[idx].jabatan = e.target.value;
                                setTugasPetugas(next);
                              }}
                              placeholder="Jabatan"
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Keperluan Tugas</label>
                    <textarea
                      rows={2}
                      value={tugasKeperluan}
                      onChange={e => setTugasKeperluan(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mulai Tanggal</label>
                      <input
                        type="date"
                        value={tugasWaktuMulai}
                        onChange={e => setTugasWaktuMulai(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
                      <input
                        type="date"
                        value={tugasWaktuSelesai}
                        onChange={e => setTugasWaktuSelesai(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Waktu / Pukul</label>
                      <input
                        type="text"
                        value={tugasJam}
                        onChange={e => setTugasJam(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tempat Pelaksanaan</label>
                      <input
                        type="text"
                        value={tugasTempat}
                        onChange={e => setTugasTempat(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Beban Anggaran</label>
                      <input
                        type="text"
                        value={tugasAnggaran}
                        onChange={e => setTugasAnggaran(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tembusan (Satu baris per tembusan)</label>
                    <textarea
                      rows={2}
                      value={tugasTembusan}
                      onChange={e => setTugasTembusan(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* SURAT PENGANTAR FIELDS */}
              {selectedType === 'SURAT_PENGANTAR' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Instansi / Pejabat Tujuan</label>
                      <input
                        type="text"
                        value={pengantarTujuan}
                        onChange={e => setPengantarTujuan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                        placeholder="Contoh: Kepala Cabang Dinas Pendidikan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Instansi</label>
                      <input
                        type="text"
                        value={pengantarAlamat}
                        onChange={e => setPengantarAlamat(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="Contoh: Jl. Dr. Rajiman No. 6, Bandung"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-800">
                        Tabel Naskah Dinas yang Dikirimkan
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPengantarItems([
                            ...pengantarItems,
                            {
                              id: String(Date.now()),
                              no: pengantarItems.length + 1,
                              naskahDinas: '',
                              banyaknya: '1 (satu) Berkas',
                              keterangan: 'Untuk diketahui dan ditindaklanjuti.'
                            }
                          ]);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Berkas
                      </button>
                    </div>

                    <div className="space-y-2">
                      {pengantarItems.map((item, idx) => (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                          <span className="text-xs font-bold w-6 text-center tabular-nums">{idx + 1}.</span>
                          <input
                            type="text"
                            value={item.naskahDinas}
                            onChange={e => {
                              const next = [...pengantarItems];
                              next[idx].naskahDinas = e.target.value;
                              setPengantarItems(next);
                            }}
                            placeholder="Nama Naskah Dinas / Berkas yang dikirim"
                            className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                          />
                          <input
                            type="text"
                            value={item.banyaknya}
                            onChange={e => {
                              const next = [...pengantarItems];
                              next[idx].banyaknya = e.target.value;
                              setPengantarItems(next);
                            }}
                            placeholder="Banyaknya (e.g. 2 Berkas)"
                            className="w-32 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                          />
                          <input
                            type="text"
                            value={item.keterangan}
                            onChange={e => {
                              const next = [...pengantarItems];
                              next[idx].keterangan = e.target.value;
                              setPengantarItems(next);
                            }}
                            placeholder="Keterangan"
                            className="w-48 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                          />
                          {pengantarItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setPengantarItems(pengantarItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Catatan Penutup Surat</label>
                    <textarea
                      rows={2}
                      value={pengantarPenutup}
                      onChange={e => setPengantarPenutup(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* SURAT PANGGILAN ORANG TUA FIELDS */}
              {selectedType === 'SURAT_PANGGILAN_ORTU' && (
                <div className="space-y-4">
                  {/* Quick Select Student */}
                  <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-700" />
                      <span className="text-xs font-bold text-indigo-950">
                        Pilih Cepat Siswa dari Database Master:
                      </span>
                    </div>
                    <select
                      value={panggilanSiswaId}
                      onChange={e => handleSelectStudentForPanggilan(e.target.value)}
                      className="text-xs px-2.5 py-1.5 bg-white border border-indigo-200 rounded-md font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({s.kelas} - NISN: {s.nisn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama Siswa</label>
                      <input
                        type="text"
                        value={panggilanNamaSiswa}
                        onChange={e => setPanggilanNamaSiswa(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">NISN</label>
                      <input
                        type="text"
                        value={panggilanNisn}
                        onChange={e => setPanggilanNisn(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Kelas</label>
                      <input
                        type="text"
                        value={panggilanKelas}
                        onChange={e => setPanggilanKelas(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama Orang Tua / Wali</label>
                      <input
                        type="text"
                        value={panggilanOrtu}
                        onChange={e => setPanggilanOrtu(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Hari & Tanggal Menghadap</label>
                      <input
                        type="date"
                        value={panggilanTgl}
                        onChange={e => setPanggilanTgl(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Waktu / Jam Pertemuan</label>
                      <input
                        type="text"
                        value={panggilanWaktu}
                        onChange={e => setPanggilanWaktu(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tempat Menghadap</label>
                      <input
                        type="text"
                        value={panggilanTempat}
                        onChange={e => setPanggilanTempat(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Menemui Pejabat / Guru</label>
                      <input
                        type="text"
                        value={panggilanMenemui}
                        onChange={e => setPanggilanMenemui(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Keperluan Pemanggilan</label>
                      <input
                        type="text"
                        value={panggilanAlasan}
                        onChange={e => setPanggilanAlasan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SURAT UNDANGAN ORANG TUA FIELDS */}
              {selectedType === 'SURAT_UNDANGAN_ORTU' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Perihal Acara Undangan</label>
                    <input
                      type="text"
                      value={undanganPerihal}
                      onChange={e => setUndanganPerihal(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ditujukan Kepada</label>
                      <input
                        type="text"
                        value={undanganDitujukan}
                        onChange={e => setUndanganDitujukan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Hari & Tanggal Acara</label>
                      <input
                        type="date"
                        value={undanganTgl}
                        onChange={e => setUndanganTgl(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Waktu Pelaksanaan</label>
                      <input
                        type="text"
                        value={undanganWaktu}
                        onChange={e => setUndanganWaktu(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tempat Acara</label>
                      <input
                        type="text"
                        value={undanganTempat}
                        onChange={e => setUndanganTempat(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Agenda Acara (Format Berbaris)</label>
                    <textarea
                      rows={4}
                      value={undanganAgenda}
                      onChange={e => setUndanganAgenda(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* SURAT MUTASI KELUAR FIELDS */}
              {selectedType === 'SURAT_MUTASI_KELUAR' && (
                <div className="space-y-4">
                  {/* Select Student */}
                  <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-700" />
                      <span className="text-xs font-bold text-indigo-950">
                        Autofill dari Master Siswa:
                      </span>
                    </div>
                    <select
                      value={mutasiSiswaId}
                      onChange={e => handleSelectStudentForMutasi(e.target.value)}
                      className="text-xs px-2.5 py-1.5 bg-white border border-indigo-200 rounded-md font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Siswa yang Pindah --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({s.kelas} - NIS: {s.nis})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama Siswa</label>
                      <input
                        type="text"
                        value={mutasiNamaSiswa}
                        onChange={e => setMutasiNamaSiswa(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">NIS / NISN</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={mutasiNis}
                          onChange={e => setMutasiNis(e.target.value)}
                          placeholder="NIS"
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                        <input
                          type="text"
                          value={mutasiNisn}
                          onChange={e => setMutasiNisn(e.target.value)}
                          placeholder="NISN"
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tempat, Tanggal Lahir</label>
                      <input
                        type="text"
                        value={mutasiTtl}
                        onChange={e => setMutasiTtl(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Kelas Saat Ini</label>
                      <input
                        type="text"
                        value={mutasiKelas}
                        onChange={e => setMutasiKelas(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Program / Jurusan</label>
                      <input
                        type="text"
                        value={mutasiJurusan}
                        onChange={e => setMutasiJurusan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama Orang Tua</label>
                      <input
                        type="text"
                        value={mutasiOrtu}
                        onChange={e => setMutasiOrtu(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 space-y-3">
                    <span className="text-xs font-bold text-amber-950 block">Sekolah Tujuan Mutasi:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">Nama Sekolah Tujuan</label>
                        <input
                          type="text"
                          value={mutasiTujuanSekolah}
                          onChange={e => setMutasiTujuanSekolah(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-amber-200 rounded-lg font-bold"
                          placeholder="e.g. SMAN 3 SURABAYA"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">Kota / Kabupaten</label>
                        <input
                          type="text"
                          value={mutasiTujuanKota}
                          onChange={e => setMutasiTujuanKota(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-amber-200 rounded-lg"
                          placeholder="e.g. Kota Surabaya"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">Provinsi</label>
                        <input
                          type="text"
                          value={mutasiTujuanProv}
                          onChange={e => setMutasiTujuanProv(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-amber-200 rounded-lg"
                          placeholder="e.g. Jawa Timur"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Alasan Pindah</label>
                      <input
                        type="text"
                        value={mutasiAlasan}
                        onChange={e => setMutasiAlasan(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-amber-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SURAT MUTASI MASUK FIELDS */}
              {selectedType === 'SURAT_MUTASI_MASUK' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama Siswa Pindahan</label>
                      <input
                        type="text"
                        value={masukNama}
                        onChange={e => setMasukNama(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">NISN</label>
                      <input
                        type="text"
                        value={masukNisn}
                        onChange={e => setMasukNisn(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tempat, Tanggal Lahir</label>
                      <input
                        type="text"
                        value={masukTtl}
                        onChange={e => setMasukTtl(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Sekolah Asal</label>
                      <input
                        type="text"
                        value={masukSekolahAsal}
                        onChange={e => setMasukSekolahAsal(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                        placeholder="Contoh: SMA Negeri 8 Jakarta"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Kota / Kabupaten Asal</label>
                      <input
                        type="text"
                        value={masukKotaAsal}
                        onChange={e => setMasukKotaAsal(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Diterima di Kelas</label>
                      <input
                        type="text"
                        value={masukKelas}
                        onChange={e => setMasukKelas(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Jurusan / Konsentrasi</label>
                      <input
                        type="text"
                        value={masukJurusan}
                        onChange={e => setMasukJurusan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tahun Pelajaran</label>
                      <input
                        type="text"
                        value={masukTahunAjaran}
                        onChange={e => setMasukTahunAjaran(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Dasar Pertimbangan Penerimaan</label>
                    <textarea
                      rows={3}
                      value={masukDasar}
                      onChange={e => setMasukDasar(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* SURAT KETERANGAN SISWA (AKTIF / BAIK) FIELDS */}
              {(selectedType === 'SURAT_KETERANGAN_AKTIF' || selectedType === 'SURAT_KETERANGAN_BAIK') && (
                <div className="space-y-4">
                  {/* Select Student */}
                  <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-700" />
                      <span className="text-xs font-bold text-indigo-950">
                        Autofill dari Master Siswa:
                      </span>
                    </div>
                    <select
                      value={ketSiswaId}
                      onChange={e => handleSelectStudentForKet(e.target.value)}
                      className="text-xs px-2.5 py-1.5 bg-white border border-indigo-200 rounded-md font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({s.kelas} - NIS: {s.nis})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama Siswa</label>
                      <input
                        type="text"
                        value={ketNamaSiswa}
                        onChange={e => setKetNamaSiswa(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">NIS / NISN</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={ketNis}
                          onChange={e => setKetNis(e.target.value)}
                          placeholder="NIS"
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                        <input
                          type="text"
                          value={ketNisn}
                          onChange={e => setKetNisn(e.target.value)}
                          placeholder="NISN"
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Kelas</label>
                      <input
                        type="text"
                        value={ketKelas}
                        onChange={e => setKetKelas(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tempat, Tanggal Lahir</label>
                      <input
                        type="text"
                        value={ketTtl}
                        onChange={e => setKetTtl(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Keperluan Penggunaan Surat</label>
                      <input
                        type="text"
                        value={ketKeperluan}
                        onChange={e => setKetKeperluan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pejabat Penandatangan & Stempel (1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                4. Pejabat Penandatangan
              </h3>

              {/* Quick Preset: Kepala Sekolah */}
              <button
                type="button"
                onClick={() => {
                  setPenandatanganNama(school.kepalaSekolahNama);
                  setPenandatanganNip(school.kepalaSekolahNip);
                  setPenandatanganPangkat(school.kepalaSekolahPangkat);
                  setPenandatanganJabatan('Kepala Sekolah');
                }}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Pakai Default Kepala Sekolah</span>
                <Building className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={penandatanganNama}
                  onChange={e => setPenandatanganNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">NIP</label>
                <input
                  type="text"
                  value={penandatanganNip}
                  onChange={e => setPenandatanganNip(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pangkat / Golongan</label>
                <input
                  type="text"
                  value={penandatanganPangkat}
                  onChange={e => setPenandatanganPangkat(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Jabatan Penandatangan</label>
                <input
                  type="text"
                  value={penandatanganJabatan}
                  onChange={e => setPenandatanganJabatan(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="e.g. Kepala Sekolah / Plt. Kepala Sekolah"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeStempel}
                    onChange={e => setIncludeStempel(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Sertakan Stempel Cap Dinas Resmi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeTtd}
                    onChange={e => setIncludeTtd(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Sertakan Tanda Tangan Digital</span>
                </label>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ringkasan Dokumen</span>
              </div>
              <p className="text-xs text-slate-300">
                Surat yang diterbitkan akan otomatis tercatat dalam Buku Agenda Surat Keluar dengan nomor register berurutan.
              </p>
              <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                <div>Instansi: <span className="text-white font-medium">{school.namaSekolah}</span></div>
                <div>Tujuan: <span className="text-white font-medium">{getTargetRecipient(selectedType)}</span></div>
                <div>Nomor: <span className="text-white font-mono">{nomorSurat}</span></div>
              </div>
            </div>
          </div>
        </div>
        {/* Printable Document Fallback if user triggers print directly from form view */}
        <div className="hidden print:block">
            <LetterDocumentView
              letter={liveLetterRecord}
              school={school}
              previewMode={true}
              paperSize={paperSize}
              hideHeader={hideHeader}
              activeSheetMutasi={mutasiSheetView}
            />
          </div>
        </>
      )}

      {/* Export to Google Docs Modal */}
      <ExportToDocsModal
        letter={liveLetterRecord}
        school={school}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

function getDefaultPerihal(type: LetterType): string {
  switch (type) {
    case 'SURAT_TUGAS':
      return 'Surat Perintah Tugas';
    case 'SURAT_PENGANTAR':
      return 'Pengantar Berkas Laporan';
    case 'SURAT_PANGGILAN_ORTU':
      return 'Panggilan Orang Tua / Wali Siswa';
    case 'SURAT_UNDANGAN_ORTU':
      return 'Undangan Rapat Pertemuan Orang Tua';
    case 'SURAT_MUTASI_KELUAR':
      return 'Surat Keterangan Pindah Sekolah (Mutasi Keluar)';
    case 'SURAT_MUTASI_MASUK':
      return 'Surat Keterangan Penerimaan Mutasi Masuk';
    case 'SURAT_KETERANGAN_AKTIF':
      return 'Surat Keterangan Siswa Aktif';
    case 'SURAT_KETERANGAN_BAIK':
      return 'Surat Keterangan Berkelakuan Baik';
    default:
      return 'Surat Dinas';
  }
}
