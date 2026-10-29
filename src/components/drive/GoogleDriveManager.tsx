/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../../services/googleAuthService';
import {
  listGoogleDriveFiles,
  uploadBackupToGoogleDrive,
  deleteDriveFile,
  GoogleDriveFileItem
} from '../../services/googleDocsService';
import { AppDatabase, SchoolProfile } from '../../types';
import {
  Cloud,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  LogOut,
  User as UserIcon,
  HardDrive
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleDriveManagerProps {
  database: AppDatabase;
  school: SchoolProfile;
  onNavigateToLetters: () => void;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  database,
  school,
  onNavigateToLetters
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Backup state
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

  // Delete modal state
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth((currentUser, currentToken) => {
      setUser(currentUser);
      setToken(currentToken);
      if (currentUser && currentToken) {
        fetchFiles(currentToken);
      } else if (!currentUser) {
        setDriveFiles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogin() {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setSuccessMsg(`Berhasil terhubung dengan Google (${result.user.email})`);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun Google?')) {
      await logout();
      setUser(null);
      setToken(null);
      setDriveFiles([]);
    }
  }

  async function fetchFiles(currentToken?: string | null, search?: string) {
    const activeToken = currentToken || token;
    if (!activeToken) return;

    setIsLoadingFiles(true);
    setErrorMsg(null);
    try {
      const files = await listGoogleDriveFiles(search !== undefined ? search : searchQuery);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Fetch Drive files error:', err);
      setErrorMsg(err.message || 'Gagal memuat daftar berkas dari Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  }

  async function handleBackupDatabaseToDrive() {
    if (!token) {
      setErrorMsg('Silakan hubungkan akun Google terlebih dahulu.');
      return;
    }

    setIsBackingUp(true);
    setErrorMsg(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const fileName = `Backup_ESurat_${school.namaSekolah.replace(/\s+/g, '_')}_${today}.json`;
      const content = JSON.stringify(database, null, 2);

      const result = await uploadBackupToGoogleDrive(fileName, content, 'application/json');
      setSuccessMsg(`Database berhasil dicadangkan ke Google Drive: "${result.name}"`);
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchFiles(token);
    } catch (err: any) {
      console.error('Backup error:', err);
      setErrorMsg(err.message || 'Gagal mencadangkan data ke Google Drive.');
    } finally {
      setIsBackingUp(false);
    }
  }

  async function confirmDeleteFile() {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setSuccessMsg(`Berkas "${fileToDelete.name}" berhasil dihapus dari Google Drive.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setFileToDelete(null);
      fetchFiles(token);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorMsg(err.message || 'Gagal menghapus berkas dari Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Cloud className="w-3.5 h-3.5" />
            <span>Integrasi Google Workspace (Drive & Docs)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Pusat Dokumen Google Drive & Google Docs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hubungkan akun Google Anda untuk menyimpan surat dinas resmi langsung ke Google Docs, mengedit secara kolaboratif bersama rekan guru, serta mencadangkan data persuratan ke Google Drive.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Terjadi Kesalahan: </span>
            {errorMsg}
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="flex-1 font-medium">{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Account Connection Status Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google User'}
                className="w-12 h-12 rounded-full border-2 border-indigo-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <UserIcon className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {user ? user.displayName || 'Pengguna Google' : 'Belum Terhubung ke Google'}
                </h3>
                {user && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Terhubung
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {user
                  ? user.email
                  : 'Masuk dengan akun Google untuk mengaktifkan sinkronisasi Google Drive & Docs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                {/* Official Google 'G' Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Ekspor Surat ke Google Docs */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Ekspor Surat ke Google Docs</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buka buku agenda atau saat membuat surat baru, lalu klik <strong>"Ekspor ke Google Docs"</strong> untuk membuat dokumen resmi siap diedit.
            </p>
          </div>
          <button
            onClick={onNavigateToLetters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors w-full"
          >
            <span>Buka Buku Agenda Surat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Cadangkan Database ke Drive */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Cadangkan Data ke Google Drive</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Simpan salinan cadangan lengkap database siswa, guru, agenda surat, dan profil sekolah ke Google Drive pribadi Anda.
            </p>
          </div>
          <button
            onClick={handleBackupDatabaseToDrive}
            disabled={isBackingUp || !user}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors w-full shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isBackingUp ? 'Mengunggah ke Drive...' : 'Cadangkan Sekarang'}</span>
          </button>
        </div>

        {/* Card 3: Buka Google Docs / Drive Langsung */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Akses Google Workspace</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Akses langsung beranda Google Drive dan Google Docs untuk meninjau seluruh berkas dan dokumen yang telah dibuat.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Google Drive</span>
            </a>
            <a
              href="https://docs.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Google Docs</span>
            </a>
          </div>
        </div>
      </div>

      {/* Google Drive Explorer Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Explorer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Berkas Terkini di Google Drive</span>
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen dan berkas arsip yang tersimpan di akun Google Anda ({driveFiles.length} berkas ditampilkan)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') fetchFiles(token, searchQuery);
                }}
                placeholder="Cari berkas di Drive..."
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-44 sm:w-56"
              />
            </div>

            <button
              onClick={() => fetchFiles(token)}
              disabled={isLoadingFiles || !user}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40"
              title="Perbarui Berkas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Files Table / Empty State */}
        {!user ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Cloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Akun Google Belum Terhubung</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Silakan masuk dengan akun Google di atas untuk melihat dan mengelola dokumen Google Drive & Docs Anda.
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Cloud className="w-4 h-4" />
              <span>Masuk dengan Google</span>
            </button>
          </div>
        ) : isLoadingFiles ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Memuat berkas dari Google Drive...</p>
          </div>
        ) : driveFiles.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">Tidak ada berkas yang ditemukan</p>
            <p className="text-[11px] text-slate-400">
              Buat dokumen baru dari menu Buku Agenda Surat atau cadangkan database ke Google Drive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Nama Berkas</th>
                  <th className="py-2.5 px-4">Tipe Berkas</th>
                  <th className="py-2.5 px-4 text-center">Terakhir Diubah</th>
                  <th className="py-2.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {driveFiles.map(file => {
                  const isDoc = file.mimeType.includes('document');
                  return (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {isDoc ? (
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {isDoc ? 'Google Doc' : file.mimeType.split('.').pop() || 'File'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 tabular-nums">
                        {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              title="Buka di Google Docs"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus dari Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog for Deleting Drive File */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Berkas dari Google Drive?</h3>
                <p className="text-xs text-slate-500">Tindakan ini memerlukan konfirmasi Anda</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <strong className="text-slate-900 font-semibold">"{fileToDelete.name}"</strong> dari Google Drive Anda? Berkas akan dipindahkan ke tempat sampah Google Drive.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Berkas'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
