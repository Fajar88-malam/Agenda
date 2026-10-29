/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { SchoolProfile, AppDatabase } from '../../types';
import { SchoolEmblem, RegionalEmblem, OfficialStamp, DigitalSignature } from '../common/SchoolEmblem';
import { StorageService } from '../../services/storageService';
import {
  Save,
  Building,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  PenTool,
  Check,
  Sparkles,
  UserCheck,
  Plus,
  Shield
} from 'lucide-react';

interface SchoolProfileSettingsProps {
  school: SchoolProfile;
  database: AppDatabase;
  onSaveProfile: (profile: SchoolProfile) => void;
  onDatabaseRestored: (db: AppDatabase) => void;
}

export const SchoolProfileSettings: React.FC<SchoolProfileSettingsProps> = ({
  school,
  database,
  onSaveProfile,
  onDatabaseRestored
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...school });
  const [notification, setNotification] = useState<string | null>(null);

  // Signature Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [showCanvasPad, setShowCanvasPad] = useState(false);
  const [newOperatorEmail, setNewOperatorEmail] = useState('');

  const handleAddOperatorEmail = () => {
    if (!newOperatorEmail || !newOperatorEmail.includes('@')) return;
    const cleanEmail = newOperatorEmail.trim().toLowerCase();
    const currentList = formData.allowedEmails || ['sangpujangga.malam88@gmail.com', 'smpnegeripacet@gmail.com'];
    if (!currentList.some(e => e.toLowerCase() === cleanEmail)) {
      setFormData(prev => ({
        ...prev,
        allowedEmails: [...currentList, cleanEmail]
      }));
    }
    setNewOperatorEmail('');
  };

  const handleRemoveOperatorEmail = (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === 'sangpujangga.malam88@gmail.com') {
      alert('Email administrator utama tidak dapat dihapus demi keamanan sistem.');
      return;
    }
    const currentList = formData.allowedEmails || ['sangpujangga.malam88@gmail.com', 'smpnegeripacet@gmail.com'];
    setFormData(prev => ({
      ...prev,
      allowedEmails: currentList.filter(e => e.toLowerCase() !== emailToRemove.toLowerCase())
    }));
  };

  function handleChange(field: keyof SchoolProfile, value: unknown) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSaveProfile(formData);
    setNotification('Pengaturan Profil Sekolah, Kop Surat, Logo, Cap & Tanda Tangan berhasil disimpan!');
    setTimeout(() => setNotification(null), 3500);
  }

  function handleExportBackup() {
    StorageService.exportDatabaseToJson(database);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const restored = StorageService.importDatabaseFromJson(text);
        onDatabaseRestored(restored);
        setFormData(restored.schoolProfile);
        setNotification('Database sekolah berhasil dipulihkan dari file backup!');
        setTimeout(() => setNotification(null), 4000);
      } catch (err) {
        alert('Gagal memulihkan database: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengatur ulang database ke data bawaan demo? Semua data yang belum dibackup akan diganti dengan data resmi default.'
      )
    ) {
      const resetDb = StorageService.resetDatabase();
      onDatabaseRestored(resetDb);
      setFormData(resetDb.schoolProfile);
      setNotification('Database berhasil direset ke data default.');
      setTimeout(() => setNotification(null), 3000);
    }
  }

  // --- LOGO UPLOADERS ---
  function handleUploadLogoLeft(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      handleChange('logoLeftUrl', dataUrl);
      setNotification('Logo kiri berhasil diunggah!');
      setTimeout(() => setNotification(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleUploadLogoRight(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      handleChange('logoRightUrl', dataUrl);
      setNotification('Logo kanan berhasil diunggah!');
      setTimeout(() => setNotification(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // --- CAP / STEMPEL UPLOADER ---
  function handleUploadStempel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      handleChange('stempelCustomUrl', dataUrl);
      handleChange('stempelEnabled', true);
      setNotification('Cap/stempel dinas kustom berhasil diunggah!');
      setTimeout(() => setNotification(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // --- TANDA TANGAN UPLOADER ---
  function handleUploadSignature(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      handleChange('ttdCustomUrl', dataUrl);
      handleChange('ttdEnabled', true);
      setNotification('Tanda tangan kepala sekolah berhasil diunggah!');
      setTimeout(() => setNotification(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // --- CANVAS SIGNATURE PAD HANDLERS ---
  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e1b4b'; // Deep navy ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearSignaturePad() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  }

  function saveSignatureFromPad() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    handleChange('ttdCustomUrl', dataUrl);
    handleChange('ttdEnabled', true);
    setShowCanvasPad(false);
    setNotification('Tanda tangan digital langsung berhasil disimpan!');
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pengaturan Profil Sekolah, Kop Surat, Cap & Tanda Tangan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesuaikan identitas sekolah, unggah logo instansi, atur stempel cap dinas, dan upload/gambar tanda tangan kepala sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Download file backup JSON"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Backup JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-colors"
            title="Reset ke data bawaan demo"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Live Preview of Kop Surat & Stempel / TTD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pratinjau Langsung Kop Surat & Otoritas Tanda Tangan
          </span>
          <span className="text-[11px] text-slate-400">Format Resmi Tata Naskah Dinas</span>
        </div>

        {/* Kop Surat Live Preview Box */}
        <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-200 font-surat">
          <div className="relative pb-3 kop-double-border text-center">
            <div className="flex items-center justify-between gap-4">
              {/* Logo Kiri */}
              <div className="shrink-0 w-24 flex items-center justify-center">
                {formData.logoLeftUrl ? (
                  <img
                    src={formData.logoLeftUrl}
                    alt="Logo Kiri"
                    className="max-h-24 max-w-24 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <RegionalEmblem size={74} />
                )}
              </div>

              {/* Teks Kop Surat */}
              <div className="flex-1 px-1">
                <h4 className="text-[10pt] font-bold tracking-wider uppercase text-slate-900 leading-tight">
                  {formData.namaPemerintah}
                </h4>
                <h3 className="text-[11pt] font-bold tracking-wider uppercase text-slate-900 leading-tight">
                  {formData.namaDinas}
                </h3>
                {formData.namaCabangDinas && (
                  <p className="text-[8.5pt] font-semibold uppercase text-slate-800 leading-tight">
                    {formData.namaCabangDinas}
                  </p>
                )}
                <h1 className="text-[13pt] font-extrabold uppercase text-slate-950 tracking-wide my-0.5 leading-snug">
                  {formData.namaSekolah}
                </h1>
                <p className="text-[8pt] leading-tight text-slate-700">
                  NPSN: <span className="tabular-nums font-medium">{formData.npsn}</span>
                  {formData.nss ? ` · NSS: ${formData.nss}` : ''} · Akreditasi: {formData.akreditasi}
                </p>
                <p className="text-[7.5pt] leading-tight text-slate-600 mt-0.5">
                  {formData.alamatJalan}, Kel. {formData.kelurahan}, Kec. {formData.kecamatan}, {formData.kotaKab}, {formData.provinsi} {formData.kodePos}
                </p>
                <p className="text-[7.5pt] leading-tight text-slate-600">
                  Telp: {formData.telepon} · Pos-el: {formData.email} · Laman: {formData.website}
                </p>
              </div>

              {/* Logo Kanan (hanya jika mode Dual Logo aktif) */}
              {formData.showDualLogo && (
                <div className="shrink-0 w-24 flex items-center justify-center">
                  {formData.logoRightUrl ? (
                    <img
                      src={formData.logoRightUrl}
                      alt="Logo Kanan"
                      className="max-h-24 max-w-24 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <SchoolEmblem size={74} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mini Signature & Stamp Preview */}
          <div className="pt-2 flex justify-end">
            <div className="w-64 text-left text-[10pt]">
              <p className="text-slate-600">
                {formData.kotaKab.replace('Kota ', '').replace('Kabupaten ', '')}, 20 Oktober 2026
              </p>
              <p className="font-semibold text-slate-800">{formData.kepalaSekolahJabatan},</p>

              <div className="relative my-1.5 h-20 flex items-center">
                {/* Cap Stempel Preview */}
                {formData.stempelEnabled && (
                  <div className="absolute left-[-20px] top-[-8px] z-10">
                    <OfficialStamp
                      schoolName={formData.namaSekolah}
                      kotaKab={formData.kotaKab}
                      dinas={formData.namaDinas}
                      customUrl={formData.stempelCustomUrl}
                    />
                  </div>
                )}

                {/* Tanda Tangan Preview */}
                {formData.ttdEnabled && (
                  <div className="relative z-0 pl-10">
                    <DigitalSignature
                      signerName={formData.kepalaSekolahNama}
                      customUrl={formData.ttdCustomUrl}
                    />
                  </div>
                )}
              </div>

              <p className="font-bold underline text-slate-900 leading-tight">
                {formData.kepalaSekolahNama}
              </p>
              <p className="text-[9pt] text-slate-600 leading-tight">
                {formData.kepalaSekolahPangkat}
              </p>
              <p className="text-[9pt] text-slate-600 leading-tight">
                NIP. {formData.kepalaSekolahNip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =================================================== */}
        {/* SECTION A: UPLOAD & EDIT LOGO KOP SURAT             */}
        {/* =================================================== */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Pengaturan & Upload Logo Kop Surat</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah gambar logo instansi (kiri) dan logo sekolah (kanan) dengan format PNG, JPG, atau SVG.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-950">Mode Tampilan Logo Kop Surat</span>
              <p className="text-[11px] text-slate-500">
                Pilih apakah kop surat resmi menggunakan 2 logo bersebelahan (kiri & kanan) atau 1 logo saja (sisi kiri).
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-indigo-900 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.showDualLogo}
                onChange={e => handleChange('showDualLogo', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Aktifkan 2 Logo (Kiri & Kanan)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Logo Kiri (Kemdikbud / Pemda) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Logo Sisi Kiri (Instansi / Pemda)</span>
                {formData.logoLeftUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoLeftUrl', '')}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset ke Vektor Bawaan
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                  {formData.logoLeftUrl ? (
                    <img
                      src={formData.logoLeftUrl}
                      alt="Logo Kiri"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <RegionalEmblem size={64} />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Logo (PNG/SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogoLeft}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Atau tempel URL gambar logo langsung:
                  </div>
                  <input
                    type="text"
                    value={formData.logoLeftUrl || ''}
                    onChange={e => handleChange('logoLeftUrl', e.target.value)}
                    placeholder="https://... atau data:image/png;base64,..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Logo Kanan (Sekolah / Tut Wuri Handayani) */}
            <div className={`p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 transition-opacity ${!formData.showDualLogo ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Logo Sisi Kanan (Sekolah / Tut Wuri)</span>
                  {!formData.showDualLogo && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      Dinonaktifkan
                    </span>
                  )}
                </div>
                {formData.logoRightUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoRightUrl', '')}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset ke Vektor Bawaan
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                  {formData.logoRightUrl ? (
                    <img
                      src={formData.logoRightUrl}
                      alt="Logo Kanan"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <SchoolEmblem size={64} />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Logo (PNG/SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogoRight}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Atau tempel URL gambar logo langsung:
                  </div>
                  <input
                    type="text"
                    value={formData.logoRightUrl || ''}
                    onChange={e => handleChange('logoRightUrl', e.target.value)}
                    placeholder="https://... atau data:image/png;base64,..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* SECTION B: UPLOAD CAP STEMPEL & TANDA TANGAN         */}
        {/* =================================================== */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Upload Cap/Stempel Dinas & Tanda Tangan Kepala Sekolah</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah pindaian cap basah sekolah dan tanda tangan resmi kepala sekolah agar tercetak otomatis pada semua dokumen surat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Cap / Stempel Sekolah */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Cap / Stempel Resmi Dinas</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stempelEnabled}
                    onChange={e => handleChange('stempelEnabled', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Tampilkan di Surat</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                  {formData.stempelCustomUrl ? (
                    <img
                      src={formData.stempelCustomUrl}
                      alt="Cap Kustom"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="scale-75 origin-center">
                      <OfficialStamp
                        schoolName={formData.namaSekolah}
                        kotaKab={formData.kotaKab}
                        dinas={formData.namaDinas}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Cap (PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadStempel}
                        className="hidden"
                      />
                    </label>

                    {formData.stempelCustomUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('stempelCustomUrl', '')}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200"
                      >
                        Gunakan Stempel Vektor
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Disarankan file PNG transparan tinta biru/ungu. Atau tempel URL cap:
                  </div>
                  <input
                    type="text"
                    value={formData.stempelCustomUrl || ''}
                    onChange={e => {
                      handleChange('stempelCustomUrl', e.target.value);
                      if (e.target.value) handleChange('stempelEnabled', true);
                    }}
                    placeholder="https://... atau data:image/png;base64,..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Tanda Tangan Kepala Sekolah */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Tanda Tangan Kepala Sekolah</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ttdEnabled}
                    onChange={e => handleChange('ttdEnabled', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Tampilkan di Surat</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                  {formData.ttdCustomUrl ? (
                    <img
                      src={formData.ttdCustomUrl}
                      alt="Tanda Tangan Kustom"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="scale-75 origin-center">
                      <DigitalSignature signerName={formData.kepalaSekolahNama} />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Scan TTD</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadSignature}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCanvasPad(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Tanda Tangan Langsung</span>
                    </button>

                    {formData.ttdCustomUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('ttdCustomUrl', '')}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-rose-600"
                        title="Kembalikan ke TTD Digital Default"
                      >
                        Reset TTD
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bisa berupa foto scan TTD atau gambar langsung dengan pena/layar sentuh. Atau tempel URL TTD:
                  </div>
                  <input
                    type="text"
                    value={formData.ttdCustomUrl || ''}
                    onChange={e => {
                      handleChange('ttdCustomUrl', e.target.value);
                      if (e.target.value) handleChange('ttdEnabled', true);
                    }}
                    placeholder="https://... atau data:image/png;base64,..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Canvas Drawing Signature Pad */}
        {showCanvasPad && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-indigo-600" />
                  <span>Goreskan Tanda Tangan Kepala Sekolah</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCanvasPad(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-500">
                  Gunakan mouse, trackpad, atau sentuhan jari pada layar untuk membuat tanda tangan:
                </p>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 bg-slate-50/50 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="bg-white rounded-lg shadow-inner cursor-crosshair touch-none w-full max-w-[380px] h-[160px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={clearSignaturePad}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Hapus / Ulangi
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCanvasPad(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={saveSignatureFromPad}
                      disabled={!hasDrawnSignature}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs"
                    >
                      Gunakan Tanda Tangan Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SECTION C: DATA TEKS INSTANSI & SEKOLAH             */}
        {/* =================================================== */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Identitas Resmi Satuan Pendidikan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pemerintah Atasan / Yayasan
              </label>
              <input
                type="text"
                required
                value={formData.namaPemerintah}
                onChange={e => handleChange('namaPemerintah', e.target.value)}
                placeholder="PEMERINTAH DAERAH PROVINSI JAWA BARAT"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dinas Terkait
              </label>
              <input
                type="text"
                required
                value={formData.namaDinas}
                onChange={e => handleChange('namaDinas', e.target.value)}
                placeholder="DINAS PENDIDIKAN"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cabang Dinas / UPTD (Opsional)
              </label>
              <input
                type="text"
                value={formData.namaCabangDinas || ''}
                onChange={e => handleChange('namaCabangDinas', e.target.value)}
                placeholder="CABANG DINAS PENDIDIKAN WILAYAH VII"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nama Resmi Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.namaSekolah}
                onChange={e => handleChange('namaSekolah', e.target.value)}
                placeholder="SMA NEGERI 1 KOTA BANDUNG"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">NPSN</label>
              <input
                type="text"
                value={formData.npsn}
                onChange={e => handleChange('npsn', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">NSS (Opsional)</label>
              <input
                type="text"
                value={formData.nss || ''}
                onChange={e => handleChange('nss', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status Akreditasi</label>
              <input
                type="text"
                value={formData.akreditasi}
                onChange={e => handleChange('akreditasi', e.target.value)}
                placeholder="A (Unggul)"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Singkatan Kode Surat</label>
              <input
                type="text"
                value={formData.namaSingkatanSekolah}
                onChange={e => handleChange('namaSingkatanSekolah', e.target.value)}
                placeholder="SMAN1-BDG"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* SECTION D: ALAMAT & KONTAK                          */}
        {/* =================================================== */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Alamat & Kontak Satuan Pendidikan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Jalan</label>
              <input
                type="text"
                value={formData.alamatJalan}
                onChange={e => handleChange('alamatJalan', e.target.value)}
                placeholder="Jl. Ir. H. Juanda No. 93"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kode Pos</label>
              <input
                type="text"
                value={formData.kodePos}
                onChange={e => handleChange('kodePos', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kelurahan</label>
              <input
                type="text"
                value={formData.kelurahan}
                onChange={e => handleChange('kelurahan', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kecamatan</label>
              <input
                type="text"
                value={formData.kecamatan}
                onChange={e => handleChange('kecamatan', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={formData.kotaKab}
                onChange={e => handleChange('kotaKab', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Provinsi</label>
              <input
                type="text"
                value={formData.provinsi}
                onChange={e => handleChange('provinsi', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">No. Telepon / Fax</label>
              <input
                type="text"
                value={formData.telepon}
                onChange={e => handleChange('telepon', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Sekolah</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Website Resmi</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => handleChange('website', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* SECTION E: PEJABAT KEPALA SEKOLAH                   */}
        {/* =================================================== */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Pejabat Kepala Sekolah & Penandatangan Resmi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nama Lengkap Beserta Gelar
              </label>
              <input
                type="text"
                value={formData.kepalaSekolahNama}
                onChange={e => handleChange('kepalaSekolahNama', e.target.value)}
                placeholder="Dr. H. Ahmad Sudrajat, M.Pd."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jabatan</label>
              <input
                type="text"
                value={formData.kepalaSekolahJabatan}
                onChange={e => handleChange('kepalaSekolahJabatan', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                NIP (Nomor Induk Pegawai)
              </label>
              <input
                type="text"
                value={formData.kepalaSekolahNip}
                onChange={e => handleChange('kepalaSekolahNip', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pangkat / Golongan Ruang
              </label>
              <input
                type="text"
                value={formData.kepalaSekolahPangkat}
                onChange={e => handleChange('kepalaSekolahPangkat', e.target.value)}
                placeholder="Pembina Utama Muda, IV/c"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* SECTION F: DAFTAR EMAIL OPERATOR TERDAFTAR          */}
        {/* =================================================== */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Daftar Email Operator Resmi (Akses Login & Google Drive)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hanya email Google yang tercantum di bawah ini yang dapat masuk ke dalam sistem dan terhubung langsung ke Google Drive.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              {(formData.allowedEmails || ['sangpujangga.malam88@gmail.com', 'smpnegeripacet@gmail.com']).length} Email Terdaftar
            </span>
          </div>

          {/* Form Tambah Email Operator */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Daftarkan Email Operator Baru
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newOperatorEmail}
                onChange={e => setNewOperatorEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOperatorEmail();
                  }
                }}
                placeholder="contoh: tatausaha.smpn1pacet@gmail.com"
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAddOperatorEmail}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Email Operator</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Pastikan email merupakan akun Google aktif yang digunakan oleh staf TU / operator sekolah.
            </p>
          </div>

          {/* Daftar Email Aktif */}
          <div className="space-y-2 pt-1">
            {(formData.allowedEmails || ['sangpujangga.malam88@gmail.com', 'smpnegeripacet@gmail.com']).map((email) => {
              const isSuperAdmin = email.toLowerCase() === 'sangpujangga.malam88@gmail.com';
              return (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-900 truncate font-mono">
                      {email}
                    </span>
                    {isSuperAdmin && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold shrink-0">
                        Administrator Utama
                      </span>
                    )}
                  </div>

                  {!isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOperatorEmail(email)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Izin Akses Email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan & Logo/Cap/TTD</span>
          </button>
        </div>
      </form>
    </div>
  );
};
