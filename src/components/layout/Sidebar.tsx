/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LetterType, SchoolProfile } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Send,
  MailCheck,
  Users,
  UserMinus,
  UserPlus,
  GraduationCap,
  Briefcase,
  Settings,
  Plus,
  BookOpen,
  X,
  Building2,
  ChevronRight,
  Cloud
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateLetter: (type: LetterType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  school: SchoolProfile;
  totalLetters: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onCreateLetter,
  isOpenMobile,
  onCloseMobile,
  school,
  totalLetters
}) => {
  const navMain = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'letters',
      label: 'Buku Agenda Surat',
      icon: BookOpen,
      badge: totalLetters > 0 ? String(totalLetters) : null
    }
  ];

  const navSurat = [
    {
      type: 'SURAT_TUGAS' as LetterType,
      label: 'Surat Tugas (SPPD)',
      icon: FileText
    },
    {
      type: 'SURAT_PENGANTAR' as LetterType,
      label: 'Surat Pengantar',
      icon: Send
    },
    {
      type: 'SURAT_PANGGILAN_ORTU' as LetterType,
      label: 'Panggilan Orang Tua',
      icon: MailCheck
    },
    {
      type: 'SURAT_UNDANGAN_ORTU' as LetterType,
      label: 'Undangan Orang Tua',
      icon: Users
    },
    {
      type: 'SURAT_MUTASI_KELUAR' as LetterType,
      label: 'Mutasi Keluar Siswa',
      icon: UserMinus
    },
    {
      type: 'SURAT_MUTASI_MASUK' as LetterType,
      label: 'Mutasi Masuk Siswa',
      icon: UserPlus
    },
    {
      type: 'SURAT_KETERANGAN_AKTIF' as LetterType,
      label: 'Surat Keterangan',
      icon: GraduationCap
    }
  ];

  const navMaster = [
    {
      id: 'students',
      label: 'Data Siswa',
      icon: GraduationCap
    },
    {
      id: 'teachers',
      label: 'Data Guru & GTK',
      icon: Briefcase
    },
    {
      id: 'settings',
      label: 'Profil & Kop Surat',
      icon: Settings
    }
  ];

  function handleSelectTab(tabId: string) {
    onTabChange(tabId);
    onCloseMobile();
  }

  function handleQuickMakeLetter(type: LetterType) {
    onCreateLetter(type);
    onCloseMobile();
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar container */}
      <aside
        data-no-print="true"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto no-print print:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              ES
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                E-Surat Sekolah
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {school.namaSekolah}
              </div>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white lg:hidden rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 border-b border-slate-800/80 no-print print:hidden" data-no-print="true">
          <button
            onClick={() => handleQuickMakeLetter('SURAT_TUGAS')}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Baru</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          {/* Main Navigation */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
            <div className="space-y-0.5">
              {navMain.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Create Letters */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Format Persuratan
            </div>
            <div className="space-y-0.5">
              {navSurat.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleQuickMakeLetter(item.type)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Database */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Database Master
            </div>
            <div className="space-y-0.5">
              {navMaster.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cloud Workspace Integration */}
          <div>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cloud Workspace
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectTab('drive')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'drive'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className={`w-4 h-4 ${activeTab === 'drive' ? 'text-white' : 'text-blue-400'}`} />
                  <span>Google Drive & Docs</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Cloud
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="truncate">
              <div className="text-white font-medium truncate">{school.namaSekolah}</div>
              <div className="text-[10px] text-slate-400">NPSN: {school.npsn}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
