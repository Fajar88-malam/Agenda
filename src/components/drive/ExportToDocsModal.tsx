/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LetterRecord, SchoolProfile } from '../../types';
import {
  createGoogleDocFromLetter
} from '../../services/googleDocsService';
import {
  initAuth,
  googleSignIn,
  getAccessToken
} from '../../services/googleAuthService';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Cloud
} from 'lucide-react';
import { User } from 'firebase/auth';

interface ExportToDocsModalProps {
  letter: LetterRecord;
  school: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportToDocsModal: React.FC<ExportToDocsModalProps> = ({
  letter,
  school,
  isOpen,
  onClose
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [sheetTarget, setSheetTarget] = useState<'LEMBAR_1' | 'LEMBAR_2'>('LEMBAR_1');
  const [resultDoc, setResultDoc] = useState<{
    documentId: string;
    documentUrl: string;
    title: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setResultDoc(null);
      setErrorMsg(null);
      return;
    }

    const unsubscribe = initAuth((currentUser, currentToken) => {
      setUser(currentUser);
      setToken(currentToken);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const isMutasiKeluar = letter.content.type === 'SURAT_MUTASI_KELUAR';

  async function handleLogin() {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleExport() {
    setErrorMsg(null);
    setIsExporting(true);
    try {
      const currentToken = await getAccessToken();
      if (!currentToken) {
        throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
      }

      const res = await createGoogleDocFromLetter(
        letter,
        school,
        isMutasiKeluar && sheetTarget === 'LEMBAR_2'
      );
      setResultDoc(res);
    } catch (err: any) {
      console.error('Export to Docs error:', err);
      setErrorMsg(err.message || 'Gagal mengekspor surat ke Google Docs.');
    } finally {
      setIsExporting(false);
    }
  }

  function handleCopyLink() {
    if (!resultDoc) return;
    navigator.clipboard.writeText(resultDoc.documentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ekspor ke Google Docs</h3>
              <p className="text-[11px] text-slate-500">Buat dokumen resmi yang dapat diedit online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Letter Info Summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900">{letter.perihal}</div>
            <div className="text-slate-500 flex items-center gap-2">
              <span className="font-mono">{letter.nomorSurat}</span>
              <span>·</span>
              <span>{letter.tempatDibuat}</span>
            </div>
          </div>

          {/* Mutasi Keluar sheet selector */}
          {isMutasiKeluar && !resultDoc && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Pilih Lembar Dokumen:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSheetTarget('LEMBAR_1')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    sheetTarget === 'LEMBAR_1'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">Lembar 1: Sekolah</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Surat Keterangan Pindah Sekolah
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSheetTarget('LEMBAR_2')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    sheetTarget === 'LEMBAR_2'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">Lembar 2: Orang Tua</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Surat Permohonan dari Orang Tua
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Auth State & Action */}
          {!user ? (
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-center space-y-3">
              <p className="text-slate-600">
                Hubungkan akun Google Anda untuk menyimpan dokumen langsung ke Google Drive & Docs.
              </p>
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-2xs"
              >
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
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
              </button>
            </div>
          ) : resultDoc ? (
            /* Success State */
            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3.5 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Dokumen Berhasil Dibuat di Google Docs!
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                  "{resultDoc.title}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <a
                  href={resultDoc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Buka di Google Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Akun Google: <strong>{user.email}</strong></span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Surat akan otomatis disusun rapi dengan Kop Surat Resmi {school.namaSekolah}, nomor register, isi surat, dan penandatangan kepala sekolah.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
          {!resultDoc && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !user}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Membuat Google Doc...' : 'Ekspor ke Google Docs'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
