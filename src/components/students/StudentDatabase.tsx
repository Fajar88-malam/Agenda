/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student, LetterType } from '../../types';
import { exportToExcelFile, readSpreadsheetFile, ColumnDefinition } from '../../utils/excelHelper';
import { formatTanggalIndonesia } from '../../utils/formatters';

const STUDENT_EXCEL_COLUMNS: ColumnDefinition[] = [
  { header: 'NIS', key: 'nis', width: 14 },
  { header: 'NISN', key: 'nisn', width: 15 },
  { header: 'Nama Lengkap Siswa', key: 'nama', width: 28 },
  { header: 'Jenis Kelamin (L/P)', key: 'jenisKelamin', width: 16 },
  { header: 'Kelas', key: 'kelas', width: 12 },
  { header: 'Jurusan / Peminatan', key: 'jurusan', width: 24 },
  { header: 'Tempat Lahir', key: 'tempatLahir', width: 18 },
  { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 16 },
  { header: 'Nama Ayah', key: 'namaAyah', width: 22 },
  { header: 'Nama Ibu', key: 'namaIbu', width: 22 },
  { header: 'Pekerjaan Orang Tua', key: 'pekerjaanOrtu', width: 20 },
  { header: 'Alamat Lengkap', key: 'alamat', width: 35 },
  { header: 'No. HP / WhatsApp', key: 'noHpOrtu', width: 18 },
  { header: 'Status Keaktifan', key: 'status', width: 16 }
];
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  X,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StudentDatabaseProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onQuickCreateLetter: (type: LetterType, student: Student) => void;
  onBatchImportStudents: (imported: Student[], replace: boolean) => void;
}

export const StudentDatabase: React.FC<StudentDatabaseProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onQuickCreateLetter,
  onBatchImportStudents
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importParsedStudents, setImportParsedStudents] = useState<Student[]>([]);
  const [importReplaceExisting, setImportReplaceExisting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Form State for Add / Edit
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('Bandung');
  const [tanggalLahir, setTanggalLahir] = useState('2008-01-01');
  const [kelas, setKelas] = useState('X-1');
  const [jurusan, setJurusan] = useState('Kurikulum Merdeka (Fase E)');
  const [namaAyah, setNamaAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [pekerjaanOrtu, setPekerjaanOrtu] = useState('Wiraswasta');
  const [alamat, setAlamat] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [status, setStatus] = useState<Student['status']>('Aktif');

  // Unique classes for filter
  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.kelas));
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedClassFilter !== 'ALL' && s.kelas !== selectedClassFilter) return false;
      if (selectedStatusFilter !== 'ALL' && s.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.namaAyah.toLowerCase().includes(q) ||
          s.alamat.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedClassFilter, selectedStatusFilter, searchQuery]);

  function openCreateModal() {
    setEditingStudent(null);
    setNis(String(24251000 + students.length + 1));
    setNisn(`008${Math.floor(1000000 + Math.random() * 9000000)}`);
    setNama('');
    setJenisKelamin('L');
    setTempatLahir('Bandung');
    setTanggalLahir('2008-05-15');
    setKelas('X-1');
    setJurusan('Kurikulum Merdeka (Fase E)');
    setNamaAyah('');
    setNamaIbu('');
    setPekerjaanOrtu('Wiraswasta');
    setAlamat('');
    setNoHpOrtu('0812');
    setStatus('Aktif');
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setNis(student.nis);
    setNisn(student.nisn);
    setNama(student.nama);
    setJenisKelamin(student.jenisKelamin);
    setTempatLahir(student.tempatLahir);
    setTanggalLahir(student.tanggalLahir);
    setKelas(student.kelas);
    setJurusan(student.jurusan);
    setNamaAyah(student.namaAyah);
    setNamaIbu(student.namaIbu);
    setPekerjaanOrtu(student.pekerjaanOrtu);
    setAlamat(student.alamat);
    setNoHpOrtu(student.noHpOrtu);
    setStatus(student.status);
    setIsModalOpen(true);
  }

  function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !nis.trim() || !nisn.trim()) {
      alert('Nama, NIS, dan NISN wajib diisi.');
      return;
    }

    const payload: Student = {
      id: editingStudent ? editingStudent.id : `std_${Date.now()}`,
      nis,
      nisn,
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      kelas,
      jurusan,
      namaAyah,
      namaIbu,
      pekerjaanOrtu,
      alamat,
      noHpOrtu,
      status,
      tahunMasuk: editingStudent ? editingStudent.tahunMasuk : '2024'
    };

    if (editingStudent) {
      onUpdateStudent(payload);
    } else {
      onAddStudent(payload);
    }
    setIsModalOpen(false);
  }

  // --- EXPORT TO EXCEL (.XLSX) WITH SEPARATE COLUMNS ---
  function handleExportExcel() {
    const today = new Date().toISOString().split('T')[0];
    const exportData = filteredStudents.map(s => ({
      nis: s.nis,
      nisn: s.nisn,
      nama: s.nama,
      jenisKelamin: s.jenisKelamin,
      kelas: s.kelas,
      jurusan: s.jurusan,
      tempatLahir: s.tempatLahir,
      tanggalLahir: s.tanggalLahir,
      namaAyah: s.namaAyah,
      namaIbu: s.namaIbu,
      pekerjaanOrtu: s.pekerjaanOrtu,
      alamat: s.alamat,
      noHpOrtu: s.noHpOrtu,
      status: s.status
    }));

    exportToExcelFile(
      `data_peserta_didik_${today}.xlsx`,
      'Data Siswa',
      STUDENT_EXCEL_COLUMNS,
      exportData as Record<string, unknown>[]
    );
  }

  // --- DOWNLOAD SAMPLE EXCEL (.XLSX) TEMPLATE WITH SEPARATE COLUMNS ---
  function handleDownloadTemplate() {
    const sampleRows = [
      {
        nis: '24251001',
        nisn: '0081234567',
        nama: 'Muhammad Arya Pratama',
        jenisKelamin: 'L',
        kelas: 'X-1',
        jurusan: 'Kurikulum Merdeka (Fase E)',
        tempatLahir: 'Bandung',
        tanggalLahir: '2008-04-12',
        namaAyah: 'Bambang Pratama, S.E.',
        namaIbu: 'Dewi Sartika',
        pekerjaanOrtu: 'Wiraswasta',
        alamat: 'Jl. Tubagus Ismail Raya No. 45',
        noHpOrtu: '081223456789',
        status: 'Aktif'
      },
      {
        nis: '24251002',
        nisn: '0089456123',
        nama: 'Anindya Putri Kirana',
        jenisKelamin: 'P',
        kelas: 'X-2',
        jurusan: 'Kurikulum Merdeka (Fase E)',
        tempatLahir: 'Jakarta',
        tanggalLahir: '2008-09-25',
        namaAyah: 'H. Suryadi Wardhana',
        namaIbu: 'Hj. Ratna Wulan',
        pekerjaanOrtu: 'PNS',
        alamat: 'Komp. Dago Asri Blok C-12',
        noHpOrtu: '081398765432',
        status: 'Aktif'
      }
    ];

    exportToExcelFile(
      'template_import_siswa.xlsx',
      'Format Siswa',
      STUDENT_EXCEL_COLUMNS,
      sampleRows as Record<string, unknown>[]
    );
  }

  // --- IMPORT SPREADSHEET (.XLSX / .XLS / .CSV) ---
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    try {
      const rawRows = await readSpreadsheetFile(file);
      if (rawRows.length === 0) {
        setImportError('File kosong atau tidak memiliki baris data yang terbaca.');
        return;
      }

      const parsedStudents = mapRawRowsToStudents(rawRows);
      if (parsedStudents.length === 0) {
        setImportError('Tidak dapat menemukan data siswa yang valid. Pastikan terdapat kolom NIS/Nama.');
        return;
      }

      setImportParsedStudents(parsedStudents);
    } catch (err) {
      setImportError('Gagal memproses berkas Excel: ' + (err as Error).message);
    }
    e.target.value = '';
  }

  function handleCommitImport() {
    if (importParsedStudents.length === 0) return;
    onBatchImportStudents(importParsedStudents, importReplaceExisting);
    setIsImportModalOpen(false);
    setImportParsedStudents([]);
    alert(`Berhasil mengimpor ${importParsedStudents.length} data siswa dari tabel Excel!`);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Database Master Peserta Didik (Siswa)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data pokok siswa untuk autofill surat dinas, ekspor dan impor massal dari berkas CSV/Excel.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => {
              setImportParsedStudents([]);
              setImportError(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Impor data siswa dari berkas Excel (.xlsx / .xls) atau CSV"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Impor Excel / CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Unduh seluruh data siswa dalam tabel Excel (.xlsx) kolom terpisah"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama siswa, NIS, NISN, atau orang tua..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="w-full md:w-40 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="ALL">Semua Kelas</option>
              {classList.map(c => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="w-full md:w-36 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Mutasi Keluar">Mutasi Keluar</option>
              <option value="Lulus">Lulus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-36">NIS / NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 w-28">Kelas</th>
                <th className="py-3 px-4">Orang Tua & No HP</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-44 text-right">Tindakan Surat & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ditemukan data siswa yang cocok.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-900 tabular-nums">
                        {student.nis}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {student.nisn}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.nama}</div>
                      <div className="text-[11px] text-slate-500">
                        {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · {student.tempatLahir}, {formatTanggalIndonesia(student.tanggalLahir)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900">{student.kelas}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {student.jurusan}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {student.namaAyah || student.namaIbu || 'Wali Siswa'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.noHpOrtu || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          student.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.status === 'Mutasi Keluar'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onQuickCreateLetter('SURAT_PANGGILAN_ORTU', student)}
                          className="px-2 py-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                          title="Buat Surat Panggilan Orang Tua untuk siswa ini"
                        >
                          Panggilan
                        </button>
                        <button
                          onClick={() => onQuickCreateLetter('SURAT_MUTASI_KELUAR', student)}
                          className="px-2 py-1 text-[10px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                          title="Buat Surat Mutasi Keluar untuk siswa ini"
                        >
                          Mutasi
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus siswa ${student.nama} dari database?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Data Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL IMPORT CSV SISWA                                    */}
      {/* ========================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Impor Data Siswa dari Tabel Excel (.xlsx / .xls / .csv)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Setiap data peserta didik berada di kolom terpisah sesuai format tabel Excel resmi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-950">
                    Format Tabel Excel (Kolom Terpisah):
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Format Template Excel (.xlsx)
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Format tabel Excel yang disiapkan memiliki kolom terpisah: <code className="font-mono bg-white px-1 py-0.5 rounded text-[11px] border border-emerald-200 text-emerald-900">Kolom A: NIS | B: NISN | C: Nama Siswa | D: L/P | E: Kelas | F: Jurusan | G: Tempat Lahir | H: Tanggal Lahir | I: Nama Ayah | J: Nama Ibu | K: Pekerjaan | L: Alamat | M: No HP | N: Status</code>.
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/40">
                <label className="cursor-pointer space-y-2 block">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    Pilih Berkas Excel (.xlsx / .xls) atau CSV
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Klik untuk memilih berkas spreadsheet dari komputer Anda
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {importParsedStudents.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Pratinjau Hasil Pembacaan ({importParsedStudents.length} siswa ditemukan):
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={importReplaceExisting}
                        onChange={e => setImportReplaceExisting(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-rose-700">Gantikan semua data yang ada</span>
                    </label>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 sticky top-0">
                        <tr>
                          <th className="p-2 border-b">NIS</th>
                          <th className="p-2 border-b">NISN</th>
                          <th className="p-2 border-b">Nama Siswa</th>
                          <th className="p-2 border-b">L/P</th>
                          <th className="p-2 border-b">Kelas</th>
                          <th className="p-2 border-b">Orang Tua</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importParsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{s.nis}</td>
                            <td className="p-2 font-mono">{s.nisn}</td>
                            <td className="p-2 font-medium">{s.nama}</td>
                            <td className="p-2 text-center">{s.jenisKelamin}</td>
                            <td className="p-2">{s.kelas}</td>
                            <td className="p-2">{s.namaAyah || s.namaIbu || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setImportParsedStudents([]);
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitImport}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                    >
                      Simpan {importParsedStudents.length} Siswa ke Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TAMBAH / EDIT SISWA MANUAL                          */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nomor Induk Siswa (NIS)</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NISN (10 Digit Nasional)</label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={e => setNisn(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={e => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={tempatLahir}
                    onChange={e => setTempatLahir(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={e => setTanggalLahir(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={e => setKelas(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-medium"
                    placeholder="Contoh: X-1, XI MIPA 2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jurusan / Program</label>
                  <input
                    type="text"
                    value={jurusan}
                    onChange={e => setJurusan(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status Keaktifan</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as Student['status'])}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Mutasi Keluar">Mutasi Keluar</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={namaAyah}
                    onChange={e => setNamaAyah(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={namaIbu}
                    onChange={e => setNamaIbu(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Pekerjaan Orang Tua</label>
                  <input
                    type="text"
                    value={pekerjaanOrtu}
                    onChange={e => setPekerjaanOrtu(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">No. HP / WhatsApp Orang Tua</label>
                  <input
                    type="text"
                    value={noHpOrtu}
                    onChange={e => setNoHpOrtu(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER UNTUK MEMETAKAN BARIS TABEL EXCEL KE DATA SISWA ---
function mapRawRowsToStudents(rawRows: Record<string, string>[]): Student[] {
  const results: Student[] = [];

  const findVal = (row: Record<string, string>, possibleKeys: string[]): string => {
    const rowKeys = Object.keys(row);
    for (const p of possibleKeys) {
      const match = rowKeys.find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    // Partial substring fallback
    for (const p of possibleKeys) {
      const match = rowKeys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  rawRows.forEach((row, i) => {
    const nama = findVal(row, ['Nama Lengkap Siswa', 'Nama Siswa', 'Nama', 'Nama Peserta Didik']);
    if (!nama) return;

    const nis = findVal(row, ['NIS', 'No. Induk', 'Nomor Induk Siswa', 'No Induk']) || String(Date.now()).slice(-6);
    const nisn = findVal(row, ['NISN', 'Nomor Induk Siswa Nasional', 'No NISN']) || `008${Math.floor(1000000 + Math.random() * 9000000)}`;

    const jkRaw = findVal(row, ['Jenis Kelamin (L/P)', 'Jenis Kelamin', 'L/P', 'JK']).toUpperCase();
    const jk: 'L' | 'P' = jkRaw === 'P' || jkRaw === 'PEREMPUAN' ? 'P' : 'L';

    const kelas = findVal(row, ['Kelas', 'Rombel', 'Tingkat']) || 'X-1';
    const jurusan = findVal(row, ['Jurusan / Peminatan', 'Jurusan', 'Program', 'Peminatan']) || 'Kurikulum Merdeka';
    const tempatLahir = findVal(row, ['Tempat Lahir', 'Tempat']) || 'Bandung';
    const tanggalLahir = findVal(row, ['Tanggal Lahir', 'Tgl Lahir', 'Tanggal Lahir (YYYY-MM-DD)']) || '2008-01-01';

    const namaAyah = findVal(row, ['Nama Ayah', 'Ayah', 'Orang Tua / Wali']);
    const namaIbu = findVal(row, ['Nama Ibu', 'Ibu']);
    const pekerjaanOrtu = findVal(row, ['Pekerjaan Orang Tua', 'Pekerjaan Ortu', 'Pekerjaan']) || 'Wiraswasta';
    const alamat = findVal(row, ['Alamat Lengkap', 'Alamat', 'Domisili']);
    const noHpOrtu = findVal(row, ['No. HP / WhatsApp', 'No HP', 'No. HP', 'HP', 'Telepon', 'WhatsApp']);
    const statusRaw = findVal(row, ['Status Keaktifan', 'Status']);
    const status: Student['status'] =
      statusRaw === 'Mutasi Keluar' || statusRaw === 'Lulus' ? statusRaw : 'Aktif';

    results.push({
      id: `std_${Date.now()}_${i}`,
      nis,
      nisn,
      nama,
      jenisKelamin: jk,
      tempatLahir,
      tanggalLahir,
      kelas,
      jurusan,
      namaAyah,
      namaIbu,
      pekerjaanOrtu,
      alamat,
      noHpOrtu,
      status,
      tahunMasuk: '2024'
    });
  });

  return results;
}
