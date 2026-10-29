/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LetterRecord, Student, Teacher, SchoolProfile, LetterType } from '../../types';
import { getLetterTypeName, formatTanggalIndonesia } from '../../utils/formatters';
import {
  FileText,
  Users,
  GraduationCap,
  Calendar,
  Send,
  Eye,
  Plus,
  ArrowRight,
  Printer,
  Compass,
  FileCheck2,
  UserPlus,
  UserMinus,
  MailCheck
} from 'lucide-react';

interface DashboardOverviewProps {
  letters: LetterRecord[];
  students: Student[];
  teachers: Teacher[];
  school: SchoolProfile;
  onNavigateTab: (tab: string) => void;
  onCreateLetter: (type: LetterType) => void;
  onPreviewLetter: (letter: LetterRecord) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  letters,
  students,
  teachers,
  school,
  onNavigateTab,
  onCreateLetter,
  onPreviewLetter
}) => {
  // Statistics calculation
  const totalLetters = letters.length;
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Aktif').length;
  const totalTeachers = teachers.length;

  const currentMonthLetters = letters.filter(l => {
    if (!l.tanggalSurat) return false;
    const parts = l.tanggalSurat.split('-');
    const now = new Date();
    return parts.length >= 2 && parseInt(parts[1], 10) === now.getMonth() + 1;
  }).length;

  // Breakdown by type
  const typeCounts = {
    SURAT_TUGAS: letters.filter(l => l.jenisSurat === 'SURAT_TUGAS').length,
    SURAT_PENGANTAR: letters.filter(l => l.jenisSurat === 'SURAT_PENGANTAR').length,
    SURAT_PANGGILAN_ORTU: letters.filter(l => l.jenisSurat === 'SURAT_PANGGILAN_ORTU').length,
    SURAT_UNDANGAN_ORTU: letters.filter(l => l.jenisSurat === 'SURAT_UNDANGAN_ORTU').length,
    SURAT_MUTASI_KELUAR: letters.filter(l => l.jenisSurat === 'SURAT_MUTASI_KELUAR').length,
    SURAT_MUTASI_MASUK: letters.filter(l => l.jenisSurat === 'SURAT_MUTASI_MASUK').length,
    SURAT_KETERANGAN_AKTIF: letters.filter(l => l.jenisSurat === 'SURAT_KETERANGAN_AKTIF' || l.jenisSurat === 'SURAT_KETERANGAN_BAIK').length
  };

  const recentLetters = [...letters].sort((a, b) => b.nomorUrut - a.nomorUrut).slice(0, 5);

  return (
    <div className="space-y-6 no-print print:hidden" data-no-print="true">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-[11px] font-medium text-slate-300">
            <span>Sistem Tata Naskah Dinas Sekolah</span>
            <span>·</span>
            <span>Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Administrasi & Database Persuratan {school.namaSekolah}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Buat dan cetak surat dinas standar resmi (Surat Tugas, Surat Pengantar, Surat Panggilan Orang Tua, Surat Undangan, Surat Mutasi Keluar & Masuk) dengan penomoran otomatis dan autofill dari database master.
          </p>
        </div>

        {/* Ambient geometric background effect */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Surat Keluar</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {totalLetters}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Buku agenda teregistrasi
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Surat Bulan Ini</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {currentMonthLetters}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            Tercatat aktif bulan berjalan
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Master Peserta Didik</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {totalStudents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeStudents} siswa status aktif
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendidik & GTK</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {totalTeachers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Guru & staf kedinasan
          </div>
        </div>
      </div>

      {/* Quick Launchpad: Buat Surat Baru 1-Klik */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Pintasan Pembuatan Surat Dinas Cepat
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih jenis naskah dinas untuk membuka formulir pembuatan otomatis
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('letters')}
            className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Arsip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            {
              type: 'SURAT_TUGAS' as LetterType,
              title: 'Surat Tugas (SPPD)',
              desc: 'Penugasan guru, diklat, lomba & dinas luar',
              icon: FileCheck2,
              badge: `${typeCounts.SURAT_TUGAS} arsip`
            },
            {
              type: 'SURAT_PENGANTAR' as LetterType,
              title: 'Surat Pengantar',
              desc: 'Kirim berkas & laporan ke Cabang Dinas',
              icon: Send,
              badge: `${typeCounts.SURAT_PENGANTAR} arsip`
            },
            {
              type: 'SURAT_PANGGILAN_ORTU' as LetterType,
              title: 'Panggilan Orang Tua',
              desc: 'Bimbingan Konseling & tata tertib kedisiplinan',
              icon: MailCheck,
              badge: `${typeCounts.SURAT_PANGGILAN_ORTU} arsip`
            },
            {
              type: 'SURAT_UNDANGAN_ORTU' as LetterType,
              title: 'Undangan Orang Tua',
              desc: 'Rapat pleno komite, pembagian raport & ANBK',
              icon: Users,
              badge: `${typeCounts.SURAT_UNDANGAN_ORTU} arsip`
            },
            {
              type: 'SURAT_MUTASI_KELUAR' as LetterType,
              title: 'Mutasi Keluar Siswa',
              desc: 'Surat keterangan pindah sekolah siswa',
              icon: UserMinus,
              badge: `${typeCounts.SURAT_MUTASI_KELUAR} arsip`
            },
            {
              type: 'SURAT_MUTASI_MASUK' as LetterType,
              title: 'Mutasi Masuk Siswa',
              desc: 'Penerimaan kepindahan siswa baru',
              icon: UserPlus,
              badge: `${typeCounts.SURAT_MUTASI_MASUK} arsip`
            },
            {
              type: 'SURAT_KETERANGAN_AKTIF' as LetterType,
              title: 'Suket Siswa Aktif',
              desc: 'Persyaratan KIP, Beasiswa, Visa/Paspor',
              icon: GraduationCap,
              badge: `${typeCounts.SURAT_KETERANGAN_AKTIF} arsip`
            },
            {
              type: 'SURAT_KETERANGAN_BAIK' as LetterType,
              title: 'Suket Berkelakuan Baik',
              desc: 'Surat keterangan kepribadian baik siswa',
              icon: FileText,
              badge: 'Kesiswaan'
            }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <button
                key={`dash-shortcut-${item.type}-${idx}`}
                onClick={() => onCreateLetter(item.type)}
                className="p-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-left transition-all hover:border-slate-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 group-hover:text-slate-900 group-hover:border-slate-300 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-950">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-semibold text-slate-700 group-hover:text-indigo-600">
                  <Plus className="w-3 h-3" />
                  <span>Buat Surat</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Letters & Master Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Letters Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Arsip Surat Keluar Terbaru</h3>
            <button
              onClick={() => onNavigateTab('letters')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Buka Buku Agenda
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentLetters.map((letter, idx) => (
              <div
                key={letter.id ? `recent-ltr-${letter.id}` : `recent-idx-${idx}-${letter.nomorUrut || idx}`}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {letter.nomorSurat}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500">
                      {getLetterTypeName(letter.jenisSurat)}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800 truncate mt-0.5">
                    {letter.perihal}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Tujuan: {letter.kepadaYth} · {formatTanggalIndonesia(letter.tanggalSurat)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPreviewLetter(letter)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                    title="Pratinjau & Cetak"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Information & Database Status (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Identitas Satuan Pendidikan</h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="text-[11px] text-slate-400 block">Nama Sekolah:</span>
              <span className="font-bold text-slate-900 text-sm">{school.namaSekolah}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 block">NPSN:</span>
                <span className="font-mono font-medium text-slate-800 tabular-nums">{school.npsn}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Akreditasi:</span>
                <span className="font-medium text-slate-800">{school.akreditasi}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block">Kepala Sekolah:</span>
              <span className="font-semibold text-slate-900 block">{school.kepalaSekolahNama}</span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">NIP. {school.kepalaSekolahNip}</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block">Format Nomor Surat:</span>
              <span className="font-mono text-[11px] text-slate-700 font-medium">
                [KODE]/[NO]/{school.namaSingkatanSekolah}/[BULAN]/[TAHUN]
              </span>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
              >
                Ubah Profil Sekolah & Kop Surat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
