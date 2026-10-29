/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Teacher } from '../../types';
import { exportToExcelFile, readSpreadsheetFile, ColumnDefinition } from '../../utils/excelHelper';
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
  AlertCircle,
  FileText,
  Mail,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

const TEACHER_EXCEL_COLUMNS: ColumnDefinition[] = [
  { header: 'NIP', key: 'nip', width: 22 },
  { header: 'NUPTK', key: 'nuptk', width: 20 },
  { header: 'Nama Lengkap & Gelar', key: 'nama', width: 30 },
  { header: 'Jenis Kelamin (L/P)', key: 'jenisKelamin', width: 16 },
  { header: 'Pangkat / Golongan Ruang', key: 'pangkatGolongan', width: 24 },
  { header: 'Jabatan Kedinasan', key: 'jabatan', width: 32 },
  { header: 'Mata Pelajaran yang Diampu', key: 'mataPelajaran', width: 26 },
  { header: 'No. HP / WhatsApp', key: 'noHp', width: 18 },
  { header: 'Email Dinas / Pribadi', key: 'email', width: 28 },
  { header: 'Status Keaktifan', key: 'status', width: 16 }
];

interface TeacherDatabaseProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onQuickCreateTugas: (teacher: Teacher) => void;
  onBatchImportTeachers: (imported: Teacher[], replace: boolean) => void;
}

export const TeacherDatabase: React.FC<TeacherDatabaseProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onQuickCreateTugas,
  onBatchImportTeachers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJabatanFilter, setSelectedJabatanFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importParsedTeachers, setImportParsedTeachers] = useState<Teacher[]>([]);
  const [importReplaceExisting, setImportReplaceExisting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Form State
  const [nip, setNip] = useState('');
  const [nuptk, setNuptk] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [pangkatGolongan, setPangkatGolongan] = useState('Penata / III/c');
  const [jabatan, setJabatan] = useState('Guru Mata Pelajaran');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');

  // Unique jabatans for filter
  const jabatanList = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => {
      if (t.jabatan) set.add(t.jabatan);
    });
    return Array.from(set).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (selectedJabatanFilter !== 'ALL' && t.jabatan !== selectedJabatanFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.nama.toLowerCase().includes(q) ||
          t.nip.toLowerCase().includes(q) ||
          (t.nuptk && t.nuptk.toLowerCase().includes(q)) ||
          t.jabatan.toLowerCase().includes(q) ||
          (t.mataPelajaran && t.mataPelajaran.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [teachers, selectedJabatanFilter, searchQuery]);

  function openCreateModal() {
    setEditingTeacher(null);
    setNip('198' + Math.floor(100000000000000 + Math.random() * 900000000000000));
    setNuptk(String(Math.floor(1000000000000000 + Math.random() * 9000000000000000)));
    setNama('');
    setJenisKelamin('L');
    setPangkatGolongan('Penata Muda / III/a');
    setJabatan('Guru Mata Pelajaran');
    setMataPelajaran('');
    setNoHp('0812');
    setEmail('');
    setIsModalOpen(true);
  }

  function openEditModal(t: Teacher) {
    setEditingTeacher(t);
    setNip(t.nip);
    setNuptk(t.nuptk || '');
    setNama(t.nama);
    setJenisKelamin(t.jenisKelamin);
    setPangkatGolongan(t.pangkatGolongan);
    setJabatan(t.jabatan);
    setMataPelajaran(t.mataPelajaran || '');
    setNoHp(t.noHp);
    setEmail(t.email || '');
    setIsModalOpen(true);
  }

  function handleSaveTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Nama guru / pegawai wajib diisi.');
      return;
    }

    const payload: Teacher = {
      id: editingTeacher ? editingTeacher.id : `tch_${Date.now()}`,
      nip,
      nuptk,
      nama,
      jenisKelamin,
      pangkatGolongan,
      jabatan,
      mataPelajaran,
      noHp,
      email,
      isActive: true
    };

    if (editingTeacher) {
      onUpdateTeacher(payload);
    } else {
      onAddTeacher(payload);
    }
    setIsModalOpen(false);
  }

  // --- EXPORT TO EXCEL (.XLSX) WITH SEPARATE COLUMNS ---
  function handleExportExcel() {
    const today = new Date().toISOString().split('T')[0];
    const exportData = filteredTeachers.map(t => ({
      nip: t.nip,
      nuptk: t.nuptk || '',
      nama: t.nama,
      jenisKelamin: t.jenisKelamin,
      pangkatGolongan: t.pangkatGolongan,
      jabatan: t.jabatan,
      mataPelajaran: t.mataPelajaran || '',
      noHp: t.noHp,
      email: t.email || '',
      status: t.isActive ? 'Aktif' : 'Non-Aktif'
    }));

    exportToExcelFile(
      `data_pegawai_ptk_${today}.xlsx`,
      'Data GTK & Pegawai',
      TEACHER_EXCEL_COLUMNS,
      exportData as Record<string, unknown>[]
    );
  }

  // --- DOWNLOAD SAMPLE EXCEL (.XLSX) TEMPLATE WITH SEPARATE COLUMNS ---
  function handleDownloadTemplate() {
    const sampleRows = [
      {
        nip: '19780310 200312 1 002',
        nuptk: '1245756658200013',
        nama: 'Drs. Hendro Wibowo, M.Si.',
        jenisKelamin: 'L',
        pangkatGolongan: 'Pembina / IV/a',
        jabatan: 'Wakil Kepala Sekolah Bidang Kurikulum',
        mataPelajaran: 'Fisika',
        noHp: '081321456780',
        email: 'hendro@sekolah.sch.id',
        status: 'Aktif'
      },
      {
        nip: '19851120 201001 2 015',
        nuptk: '6453763665200011',
        nama: 'Dra. Hj. Nurul Hidayati, M.Pd.',
        jenisKelamin: 'P',
        pangkatGolongan: 'Penata Tk. I / III/d',
        jabatan: 'Guru Bimbingan Konseling (BK)',
        mataPelajaran: 'Bimbingan Konseling',
        noHp: '081298765432',
        email: 'nurul@sekolah.sch.id',
        status: 'Aktif'
      },
      {
        nip: '19920415 201903 1 008',
        nuptk: '8839770671130092',
        nama: 'Rian Hidayat, S.Pd., Gr.',
        jenisKelamin: 'L',
        pangkatGolongan: 'Penata Muda Tk. I / III/b',
        jabatan: 'Wali Kelas & Guru Mata Pelajaran',
        mataPelajaran: 'Bahasa Indonesia',
        noHp: '085712345678',
        email: 'rian@sekolah.sch.id',
        status: 'Aktif'
      }
    ];

    exportToExcelFile(
      'template_import_pegawai_ptk.xlsx',
      'Format Data PTK',
      TEACHER_EXCEL_COLUMNS,
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
        setImportError('Berkas kosong atau tidak memiliki baris data yang terbaca.');
        return;
      }

      const parsedTeachers = mapRawRowsToTeachers(rawRows);
      if (parsedTeachers.length === 0) {
        setImportError(
          'Tidak dapat menemukan baris data pegawai yang valid. Pastikan berkas tabel Excel memuat kolom Nama atau NIP.'
        );
        return;
      }

      setImportParsedTeachers(parsedTeachers);
    } catch (err) {
      setImportError('Gagal memproses berkas Excel: ' + (err as Error).message);
    }
    e.target.value = '';
  }

  function handleCommitImport() {
    if (importParsedTeachers.length === 0) return;
    onBatchImportTeachers(importParsedTeachers, importReplaceExisting);
    setIsImportModalOpen(false);
    setImportParsedTeachers([]);
    alert(`Berhasil mengimpor ${importParsedTeachers.length} data guru & tenaga kependidikan dari tabel Excel!`);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Database Master Guru & Tenaga Kependidikan (GTK / Pegawai)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar resmi pendidik dan staf untuk penugasan surat dinas, ekspor dan impor tabel Excel (.xlsx) dengan kolom terpisah.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => {
              setImportParsedTeachers([]);
              setImportError(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Impor data guru/pegawai dari tabel Excel (.xlsx / .xls / .csv)"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Impor Excel / CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Unduh seluruh data pegawai dalam format tabel Excel (.xlsx) kolom terpisah"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah PTK Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama guru/pegawai, NIP, NUPTK, jabatan, atau mata pelajaran..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedJabatanFilter}
              onChange={e => setSelectedJabatanFilter(e.target.value)}
              className="w-full sm:w-48 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="ALL">Semua Jabatan</option>
              {jabatanList.map(j => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredTeachers.length}</strong> dari{' '}
            {teachers.length} total PTK / Pegawai
          </span>
          <span className="text-[11px] text-slate-400">
            Mendukung ekspor & impor tabel Excel dengan kolom terpisah
          </span>
        </div>
      </div>

      {/* Teachers High-Density Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-3">Pangkat / Gol.</th>
                <th className="py-3 px-3">Jabatan & Mapel</th>
                <th className="py-3 px-3">Kontak & Email</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada data pegawai yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{teacher.nama}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            teacher.jenisKelamin === 'L'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {teacher.jenisKelamin}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>NIP: {teacher.nip || '-'}</span>
                        {teacher.nuptk && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>NUPTK: {teacher.nuptk}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {teacher.pangkatGolongan}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800">{teacher.jabatan}</div>
                      {teacher.mataPelajaran ? (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Mapel: {teacher.mataPelajaran}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">Tenaga Kependidikan</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{teacher.noHp || '-'}</span>
                      </div>
                      {teacher.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5 font-sans">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{teacher.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onQuickCreateTugas(teacher)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          title="Buat Surat Tugas untuk Guru Ini"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Surat Tugas</span>
                        </button>

                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Apakah Anda yakin ingin menghapus data guru/pegawai: ${teacher.nama}?`
                              )
                            ) {
                              onDeleteTeacher(teacher.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Data"
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
      {/* MODAL IMPOR MASSAL EXCEL DENGAN KOLOM TERPISAH            */}
      {/* ========================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Impor Data Guru & Pegawai dari Tabel Excel (.xlsx / .xls / .csv)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Setiap data PTK berada pada kolom terpisah sesuai format tabel Excel resmi
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
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-950">
                    Format Tabel Excel (Kolom Terpisah):
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Format Template Excel (.xlsx)
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Format tabel Excel yang disiapkan memiliki kolom terpisah:{' '}
                  <code className="font-mono bg-white px-1 py-0.5 rounded text-[11px] border border-indigo-200 text-indigo-900">
                    Kolom A: NIP | B: NUPTK | C: Nama Lengkap | D: L/P | E: Pangkat/Golongan | F: Jabatan | G: Mata Pelajaran | H: No HP | I: Email | J: Status
                  </code>
                  .
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/40">
                <label className="cursor-pointer space-y-2 block">
                  <FileSpreadsheet className="w-10 h-10 text-indigo-600 mx-auto" />
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
              {importParsedTeachers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Pratinjau Hasil Pembacaan Tabel ({importParsedTeachers.length} PTK ditemukan):
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={importReplaceExisting}
                        onChange={e => setImportReplaceExisting(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-rose-700">Gantikan semua data guru saat ini</span>
                    </label>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">NIP</th>
                          <th className="p-2.5">NUPTK</th>
                          <th className="p-2.5">Nama Lengkap</th>
                          <th className="p-2.5 text-center">L/P</th>
                          <th className="p-2.5">Pangkat/Gol</th>
                          <th className="p-2.5">Jabatan</th>
                          <th className="p-2.5">Mata Pelajaran</th>
                          <th className="p-2.5">No. HP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {importParsedTeachers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono text-slate-700">{t.nip || '-'}</td>
                            <td className="p-2.5 font-mono text-slate-500">{t.nuptk || '-'}</td>
                            <td className="p-2.5 font-medium text-slate-900">{t.nama}</td>
                            <td className="p-2.5 text-center font-bold text-slate-700">
                              {t.jenisKelamin}
                            </td>
                            <td className="p-2.5 text-slate-700">{t.pangkatGolongan}</td>
                            <td className="p-2.5 text-slate-800">{t.jabatan}</td>
                            <td className="p-2.5 text-slate-600">{t.mataPelajaran || '-'}</td>
                            <td className="p-2.5 font-mono text-slate-600">{t.noHp || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setImportParsedTeachers([]);
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitImport}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Simpan {importParsedTeachers.length} PTK ke Database</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TAMBAH / EDIT GURU MANUAL                           */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTeacher ? 'Edit Data Pendidik / Pegawai' : 'Tambah Pendidik / GTK Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Drs. Bambang Sutrisno, M.Pd."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NIP (18 Digit)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={e => setNip(e.target.value)}
                    placeholder="Contoh: 19800101 200501 1 003"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NUPTK</label>
                  <input
                    type="text"
                    value={nuptk}
                    onChange={e => setNuptk(e.target.value)}
                    placeholder="Contoh: 1245756658200013"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Pangkat & Golongan Ruang
                  </label>
                  <input
                    type="text"
                    value={pangkatGolongan}
                    onChange={e => setPangkatGolongan(e.target.value)}
                    placeholder="Contoh: Pembina / IV/a"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jabatan Kedinasan</label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={e => setJabatan(e.target.value)}
                    placeholder="Contoh: Wakil Kepala Sekolah / Wali Kelas"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <input
                    type="text"
                    value={mataPelajaran}
                    onChange={e => setMataPelajaran(e.target.value)}
                    placeholder="Contoh: Bahasa Indonesia / Fisika"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    No. Handphone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={e => setNoHp(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email Dinas / Pribadi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
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
                  Simpan Data GTK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER UNTUK MEMETAKAN BARIS TABEL EXCEL KE DATA GURU & PTK ---
function mapRawRowsToTeachers(rawRows: Record<string, string>[]): Teacher[] {
  const results: Teacher[] = [];

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
    const nama = findVal(row, [
      'Nama Lengkap & Gelar',
      'Nama Lengkap',
      'Nama Guru',
      'Nama Pegawai',
      'Nama GTK',
      'Nama'
    ]);
    if (!nama) return;

    const nip =
      findVal(row, ['NIP', 'Nomor Induk Pegawai', 'No NIP', 'NIP Baru']) ||
      '198' + Math.floor(100000000000000 + Math.random() * 900000000000000);

    const nuptk = findVal(row, ['NUPTK', 'Nomor NUPTK', 'No NUPTK']);

    const jkRaw = findVal(row, ['Jenis Kelamin (L/P)', 'Jenis Kelamin', 'L/P', 'JK']).toUpperCase();
    const jk: 'L' | 'P' = jkRaw === 'P' || jkRaw === 'PEREMPUAN' ? 'P' : 'L';

    const pangkatGolongan =
      findVal(row, ['Pangkat / Golongan Ruang', 'Pangkat / Golongan', 'Pangkat/Gol', 'Pangkat', 'Golongan']) ||
      'Penata Muda / III/a';

    const jabatan =
      findVal(row, ['Jabatan Kedinasan', 'Jabatan / Tugas', 'Jabatan', 'Tugas Utama']) ||
      'Guru Mata Pelajaran';

    const mataPelajaran = findVal(row, [
      'Mata Pelajaran yang Diampu',
      'Mata Pelajaran',
      'Mapel',
      'Bidang Studi'
    ]);

    const noHp = findVal(row, [
      'No. HP / WhatsApp',
      'No HP',
      'No. HP',
      'HP',
      'WhatsApp',
      'Telepon'
    ]);

    const email = findVal(row, ['Email Dinas / Pribadi', 'Email', 'Pos-el']);

    const statusRaw = findVal(row, ['Status Keaktifan', 'Status']);
    const isActive = statusRaw.toLowerCase().includes('non') ? false : true;

    results.push({
      id: `tch_${Date.now()}_${i}`,
      nip,
      nuptk,
      nama,
      jenisKelamin: jk,
      pangkatGolongan,
      jabatan,
      mataPelajaran,
      noHp,
      email,
      isActive
    });
  });

  return results;
}
