/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile } from '../../types';
import { googleSignIn, logout, DEFAULT_SUPERADMIN_EMAIL } from '../../services/googleAuthService';
import { User } from 'firebase/auth';
import { RegionalEmblem } from '../common/SchoolEmblem';
import { ShieldCheck, Cloud, AlertCircle, RefreshCw, LogOut, Lock, CheckCircle2 } from 'lucide-react';

interface LoginGateProps {
  school: SchoolProfile;
  currentUser: User | null;
  isAuthorized: boolean;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  school,
  currentUser,
  isAuthorized,
  onLoginSuccess,
  onLogout
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onLoginSuccess(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login ditutup sebelum proses selesai. Silakan coba lagi.');
      } else {
        setErrorMsg(err?.message || 'Terjadi kesalahan saat masuk dengan akun Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await logout();
      onLogout();
      await handleSignIn();
    } catch (err: any) {
      console.error('Switch account error:', err);
    }
  };

  // State: User is logged in with Google, but their email is NOT in the registered whitelist
  if (currentUser && !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans-ui">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header Warning Bar */}
          <div className="bg-rose-50 border-b border-rose-100 p-6 text-center">
            <div className="w-14 h-14 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Akses Ditolak</h2>
            <p className="text-xs text-rose-700 font-medium mt-1">
              Email Anda belum terdaftar sebagai operator resmi
            </p>
          </div>

          {/* Body Information */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="text-slate-500 font-medium">Akun Google yang Digunakan:</div>
              <div className="font-semibold text-slate-900 break-all flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span>{currentUser.email}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 border border-amber-200/70 p-3.5 rounded-xl">
              <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Ketentuan Akses Terbatas:</span>
              </div>
              <p>
                Sistem database & persuratan <strong>{school.namaSekolah}</strong> hanya dapat diakses oleh email staf/operator yang telah didaftarkan dalam basis data sekolah.
              </p>
            </div>

            <div className="text-xs text-slate-500 pt-1">
              Untuk mendapatkan izin akses, silakan hubungi Administrator Utama:
              <div className="font-semibold text-slate-800 mt-0.5">
                {DEFAULT_SUPERADMIN_EMAIL}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Ganti Akun Google Lain</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Sign Out)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {school.namaSekolah} · Tata Naskah Dinas & Administrasi Sekolah
        </div>
      </div>
    );
  }

  // State: Standard Login Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans-ui">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-b from-slate-50 to-white px-8 pt-8 pb-6 text-center border-b border-slate-100">
          <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4">
            {school.logoLeftUrl ? (
              <img
                src={school.logoLeftUrl}
                alt="Logo Sekolah"
                className="max-h-20 max-w-20 object-contain drop-shadow-sm"
              />
            ) : (
              <div className="p-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                <RegionalEmblem size={68} />
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            E-Surat & Database Sekolah
          </h1>
          <p className="text-xs font-semibold text-indigo-700 mt-1 uppercase tracking-wider">
            {school.namaSekolah}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {school.namaDinas} · {school.namaPemerintah}
          </p>
        </div>

        {/* Main Body */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Value Prop Highlights */}
          <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Akses Email Terdaftar:</strong> Khusus operator dan staf administrasi sekolah resmi.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Cloud className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Langsung Terhubung ke Google Drive:</strong> Sekali login langsung dapat mengarsipkan surat dan mengekspor dokumen ke Google Docs.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Sinkronisasi Realtime Cloud:</strong> Pembaruan data siswa, agenda surat, dan draft tersimpan otomatis.
              </span>
            </div>
          </div>

          {/* Official Google Sign In Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span>Menghubungkan ke Akun Google & Drive...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span className="text-slate-800 font-medium">
                    Masuk dengan Akun Google
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-500 leading-normal pt-1">
            Dengan masuk, Anda menyetujui akses tata kelola arsip persuratan sekolah sesuai wewenang dan izin operator dinas.
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-500">
        NPSN: <span className="text-slate-400 font-mono">{school.npsn}</span> · Sistem Tata Naskah Dinas Terakreditasi {school.akreditasi}
      </div>
    </div>
  );
};
