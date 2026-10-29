/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LetterRecord, SchoolProfile, PaperSize, SuratMutasiKeluarData } from '../../types';
import { formatTanggalIndonesia, getNamaHari } from '../../utils/formatters';
import { SchoolEmblem, RegionalEmblem, OfficialStamp, DigitalSignature } from '../common/SchoolEmblem';

interface LetterDocumentViewProps {
  letter: LetterRecord;
  school: SchoolProfile;
  previewMode?: boolean; // if true, renders in card container on screen
  paperSize?: PaperSize; // 'A4' | 'F4'
  activeSheetMutasi?: 'ALL' | 'LEMBAR_1' | 'LEMBAR_2';
  hideHeader?: boolean; // Sembunyikan kop surat saat cetak pada kertas yang sudah ada kopnya
}

export const LetterDocumentView: React.FC<LetterDocumentViewProps> = ({
  letter,
  school,
  previewMode = true,
  paperSize = 'A4',
  activeSheetMutasi = 'ALL',
  hideHeader = false
}) => {
  const { content } = letter;
  const isF4 = paperSize === 'F4';

  // If this is Surat Mutasi Keluar and user selected to only show Lembar 2 (Surat Permohonan Orang Tua)
  if (content.type === 'SURAT_MUTASI_KELUAR' && activeSheetMutasi === 'LEMBAR_2') {
    return (
      <ParentTransferRequestSheet
        letter={letter}
        school={school}
        previewMode={previewMode}
        paperSize={paperSize}
      />
    );
  }

  return (
    <div className="w-full">
      <div
        id="printable-document"
        className={`bg-white text-slate-900 font-surat leading-relaxed print:p-0 print:m-0 print:border-none print:shadow-none printable-page ${
          previewMode
            ? `w-full max-w-[820px] mx-auto ${
                isF4 ? 'min-h-[1250px]' : 'min-h-[1100px]'
              } p-8 sm:p-12 shadow-sm border border-slate-200`
            : 'p-0 m-0'
        }`}
        style={{
          boxSizing: 'border-box',
          fontSize: '11.5pt'
        }}
      >
      {/* ======================================================== */}
      {/* 1. KOP SURAT RESMI (Official Indonesian School Letterhead) */}
      {/* ======================================================== */}
      {!hideHeader ? (
        <div className="relative pb-3 mb-5 kop-double-border text-center">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Kiri (Kemdikbud / Daerah) */}
            <div className="shrink-0 w-24 flex items-center justify-center">
              {school.logoLeftUrl ? (
                <img
                  src={school.logoLeftUrl}
                  alt="Logo Instansi"
                  className="max-h-24 max-w-24 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <RegionalEmblem size={76} />
              )}
            </div>

            {/* Teks Kop Surat */}
            <div className="flex-1 px-1">
              <h4 className="text-[12pt] font-bold tracking-wider uppercase text-slate-900 leading-tight">
                {school.namaPemerintah}
              </h4>
              <h3 className="text-[13pt] font-bold tracking-wider uppercase text-slate-900 leading-tight">
                {school.namaDinas}
              </h3>
              {school.namaCabangDinas && (
                <p className="text-[10pt] font-semibold uppercase text-slate-800 leading-tight">
                  {school.namaCabangDinas}
                </p>
              )}
              <h1 className="text-[15pt] font-extrabold uppercase text-slate-950 tracking-wide my-0.5 leading-snug">
                {school.namaSekolah}
              </h1>
              <p className="text-[9pt] leading-tight text-slate-700">
                NPSN: <span className="tabular-nums font-medium">{school.npsn}</span>
                {school.nss ? ` · NSS: ${school.nss}` : ''} · Akreditasi: {school.akreditasi}
              </p>
              <p className="text-[8.5pt] leading-tight text-slate-600 mt-0.5">
                {school.alamatJalan}, Kel. {school.kelurahan}, Kec. {school.kecamatan}, {school.kotaKab}, {school.provinsi} {school.kodePos}
              </p>
              <p className="text-[8.5pt] leading-tight text-slate-600">
                Telp: {school.telepon} · Pos-el: {school.email} · Laman: {school.website}
              </p>
            </div>

            {/* Logo Kanan (Logo Sekolah / Tut Wuri Handayani) - Hanya jika mode Dual Logo aktif */}
            {school.showDualLogo && (
              <div className="shrink-0 w-24 flex items-center justify-center">
                {school.logoRightUrl ? (
                  <img
                    src={school.logoRightUrl}
                    alt="Logo Sekolah"
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
      ) : (
        /* Jika Kop Surat (Header) disembunyikan untuk pencetakan di blanko / kertas berkop resmi percetakan */
        <div className="pt-20 print:pt-28 mb-6 border-b border-dashed border-slate-300 print:border-none pb-2 text-center no-print-border">
          {previewMode && (
            <span className="no-print inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium rounded-full">
              Kop Surat (Header) Disembunyikan — Ruang Kosong untuk Kertas Berkop Resmi Cetakan Percetakan
            </span>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BODY SURAT SESUAI JENIS / TIPE NASKAH DINAS           */}
      {/* ======================================================== */}

      {/* ----------------- TYPE A: SURAT TUGAS ----------------- */}
      {content.type === 'SURAT_TUGAS' && (
        <div>
          {/* Judul Surat Tugas */}
          <div className="text-center my-4">
            <h2 className="text-[13pt] font-bold uppercase tracking-wider underline">
              SURAT PERINTAH TUGAS
            </h2>
            <p className="text-[10.5pt] tracking-normal mt-0.5">
              Nomor: <span className="tabular-nums">{letter.nomorSurat}</span>
            </p>
          </div>

          {/* Menimbang / Dasar */}
          <div className="mt-4 text-justify">
            <table className="w-full text-[11pt] border-collapse mb-3">
              <tbody>
                <tr className="align-top">
                  <td className="w-24 font-semibold pb-1">Dasar</td>
                  <td className="w-4 text-center pb-1">:</td>
                  <td className="pb-1 text-slate-800">{content.data.dasarPenugasan}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-center font-bold tracking-widest my-3 text-[11pt]">
              MEMERINTAHKAN:
            </div>

            {/* Kepada */}
            <table className="w-full text-[11pt] border-collapse mb-4">
              <tbody>
                <tr className="align-top">
                  <td className="w-24 font-semibold pb-1">Kepada</td>
                  <td className="w-4 text-center pb-1">:</td>
                  <td className="pb-1">
                    <ol className="list-decimal pl-5 space-y-2">
                      {content.data.daftarPetugas.map((petugas, idx) => (
                        <li key={idx} className="pl-1">
                          <span className="font-bold">{petugas.nama}</span>
                          <div className="text-[10pt] text-slate-700 leading-tight">
                            NIP: <span className="tabular-nums">{petugas.nip || '-'}</span> · Pangkat/Gol: {petugas.pangkatGolongan || '-'} · Jabatan: {petugas.jabatan}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Untuk */}
            <table className="w-full text-[11pt] border-collapse mb-4">
              <tbody>
                <tr className="align-top">
                  <td className="w-24 font-semibold pb-1">Untuk</td>
                  <td className="w-4 text-center pb-1">:</td>
                  <td className="pb-1 space-y-2">
                    <p className="font-semibold text-slate-900">{content.data.keperluanTugas}</p>
                    <table className="w-full text-[10.5pt] mt-2">
                      <tbody>
                        <tr>
                          <td className="w-32 text-slate-700 py-0.5">Hari / Tanggal</td>
                          <td className="w-3 py-0.5">:</td>
                          <td className="py-0.5 font-medium">
                            {formatTanggalIndonesia(content.data.waktuMulai)}
                            {content.data.waktuSelesai && content.data.waktuSelesai !== content.data.waktuMulai
                              ? ` s.d. ${formatTanggalIndonesia(content.data.waktuSelesai)}`
                              : ''}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-slate-700 py-0.5">Waktu</td>
                          <td className="py-0.5">:</td>
                          <td className="py-0.5">{content.data.jamKegiatan || 'Pukul 08.00 WIB s.d Selesai'}</td>
                        </tr>
                        <tr className="align-top">
                          <td className="text-slate-700 py-0.5">Tempat</td>
                          <td className="py-0.5">:</td>
                          <td className="py-0.5">{content.data.tempatKegiatan}</td>
                        </tr>
                        {content.data.bebanAnggaran && (
                          <tr className="align-top">
                            <td className="text-slate-700 py-0.5">Beban Biaya</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5 text-slate-800">{content.data.bebanAnggaran}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-[11pt] mt-3">
              Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan setelah selesai melaksanakan tugas agar menyampaikan laporan tertulis kepada Kepala Sekolah.
            </p>
          </div>
        </div>
      )}

      {/* ----------------- TYPE B: SURAT PENGANTAR ----------------- */}
      {content.type === 'SURAT_PENGANTAR' && (
        <div>
          {/* Header Nomor & Tanggal */}
          <div className="flex justify-between items-start text-[11pt] mb-4">
            <div>
              <table className="border-collapse">
                <tbody>
                  <tr>
                    <td className="w-20 py-0.5">Nomor</td>
                    <td className="w-3 py-0.5">:</td>
                    <td className="py-0.5 font-semibold tabular-nums">{letter.nomorSurat}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Sifat</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{letter.sifat}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Lampiran</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{letter.lampiran || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Perihal</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-semibold">{letter.perihal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <p>{letter.tempatDibuat}, {formatTanggalIndonesia(letter.tanggalSurat)}</p>
              <div className="text-left mt-3">
                <p>Kepada Yth.</p>
                <p className="font-bold">{content.data.tujuanInstansi || letter.kepadaYth}</p>
                <p className="text-[10pt] text-slate-700">{content.data.alamatInstansi || 'Di Tempat'}</p>
              </div>
            </div>
          </div>

          <div className="text-center font-bold underline uppercase my-3 tracking-wide text-[12pt]">
            SURAT PENGANTAR
          </div>

          {/* Tabel Pengantar 4 Kolom Resmi */}
          <table className="w-full text-[10.5pt] border-collapse border border-black my-4 tabel-surat">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-black p-2 w-10">No</th>
                <th className="border border-black p-2">Jenis Naskah Dinas / Berkas yang Dikirimkan</th>
                <th className="border border-black p-2 w-32">Banyaknya</th>
                <th className="border border-black p-2 w-44">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {content.data.daftarBerkas.map((item, idx) => (
                <tr key={item.id || idx} className="align-top">
                  <td className="border border-black p-2 text-center tabular-nums">{idx + 1}.</td>
                  <td className="border border-black p-2 font-medium">{item.naskahDinas}</td>
                  <td className="border border-black p-2 text-center">{item.banyaknya}</td>
                  <td className="border border-black p-2 text-slate-800 text-[10pt]">{item.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[11pt] mt-3">
            {content.data.catatanPenutup || 'Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerjasama Bapak/Ibu kami haturkan terima kasih.'}
          </p>
        </div>
      )}

      {/* ----------------- TYPE C: SURAT PANGGILAN ORANG TUA ----------------- */}
      {content.type === 'SURAT_PANGGILAN_ORTU' && (
        <div>
          {/* Header Nomor & Tujuan */}
          <div className="flex justify-between items-start text-[11pt] mb-4">
            <div>
              <table className="border-collapse">
                <tbody>
                  <tr>
                    <td className="w-20 py-0.5">Nomor</td>
                    <td className="w-3 py-0.5">:</td>
                    <td className="py-0.5 font-semibold tabular-nums">{letter.nomorSurat}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Sifat</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-semibold text-rose-950">{letter.sifat || 'Penting / Rahasia'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Lampiran</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{letter.lampiran || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Perihal</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-bold underline">Panggilan Orang Tua / Wali Siswa</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <p>{letter.tempatDibuat}, {formatTanggalIndonesia(letter.tanggalSurat)}</p>
              <div className="text-left mt-3">
                <p>Kepada Yth.</p>
                <p className="font-bold">Bapak / Ibu Orang Tua / Wali Siswa</p>
                <p>dari: <span className="font-bold">{content.data.namaSiswa}</span> ({content.data.kelas})</p>
                <p className="text-[10pt] text-slate-700">di Tempat</p>
              </div>
            </div>
          </div>

          <div className="text-[11pt] space-y-3 text-justify mt-2">
            <p>
              Dengan hormat,
            </p>
            <p>
              Sehubungan dengan kelancaran proses pembelajaran serta perkembangan akademik dan kedisiplinan putra/putri Bapak/Ibu di sekolah, bersama surat ini kami mengharap kehadiran Bapak/Ibu Orang Tua / Wali dari:
            </p>

            {/* Biodata Siswa */}
            <div className="bg-slate-50/70 p-3 border-l-2 border-slate-700 my-2">
              <table className="w-full text-[10.5pt]">
                <tbody>
                  <tr>
                    <td className="w-36 py-0.5 text-slate-700">Nama Siswa</td>
                    <td className="w-3 py-0.5">:</td>
                    <td className="py-0.5 font-bold">{content.data.namaSiswa}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-700">NISN</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-mono tabular-nums">{content.data.nisn}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-700">Kelas / Tingkat</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{content.data.kelas}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Untuk hadir di sekolah pada:
            </p>

            {/* Jadwal Kehadiran */}
            <table className="w-full text-[11pt] ml-4">
              <tbody>
                <tr>
                  <td className="w-36 py-0.5">Hari / Tanggal</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-semibold">
                    {getNamaHari(content.data.hariTanggalPanggilan)}, {formatTanggalIndonesia(content.data.hariTanggalPanggilan)}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5">Waktu</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-medium">{content.data.waktuPanggilan}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Tempat</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.tempatMenghadap}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Menemui</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-semibold">{content.data.menemuiPejabat}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Keperluan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.alasanPanggilan}</td>
                </tr>
              </tbody>
            </table>

            <p className="italic text-slate-800 font-medium">
              Catatan: {content.data.catatanKhusus || 'Mengingat pentingnya koordinasi demi masa depan dan keberhasilan belajar siswa, kami sangat mengharapkan kehadiran Bapak/Ibu tepat waktu dan tidak diwakilkan.'}
            </p>

            <p>
              Demikian surat panggilan ini kami sampaikan, atas kehadiran dan kerjasama yang baik dari Bapak/Ibu, kami ucapkan terima kasih.
            </p>
          </div>
        </div>
      )}

      {/* ----------------- TYPE D: SURAT UNDANGAN ORANG TUA ----------------- */}
      {content.type === 'SURAT_UNDANGAN_ORTU' && (
        <div>
          <div className="flex justify-between items-start text-[11pt] mb-4">
            <div>
              <table className="border-collapse">
                <tbody>
                  <tr>
                    <td className="w-20 py-0.5">Nomor</td>
                    <td className="w-3 py-0.5">:</td>
                    <td className="py-0.5 font-semibold tabular-nums">{letter.nomorSurat}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Sifat</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{letter.sifat || 'Penting'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Lampiran</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{letter.lampiran || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Perihal</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-bold underline">Undangan Pertemuan / Rapat</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <p>{letter.tempatDibuat}, {formatTanggalIndonesia(letter.tanggalSurat)}</p>
              <div className="text-left mt-3">
                <p>Kepada Yth.</p>
                <p className="font-bold">{content.data.ditujukanKepada}</p>
                <p className="text-[10pt] text-slate-700">di Tempat</p>
              </div>
            </div>
          </div>

          <div className="text-[11pt] space-y-3 text-justify mt-2">
            <p>
              Dengan hormat,
            </p>
            <p>
              Dalam rangka <span className="font-semibold">{content.data.perihalUndangan}</span>, kami bermaksud mengundang Bapak/Ibu Orang Tua / Wali Siswa untuk dapat hadir pada pertemuan yang akan diselenggarakan pada:
            </p>

            <table className="w-full text-[11pt] ml-4">
              <tbody>
                <tr>
                  <td className="w-36 py-0.5">Hari / Tanggal</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-semibold">
                    {getNamaHari(content.data.hariTanggalAcara)}, {formatTanggalIndonesia(content.data.hariTanggalAcara)}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5">Waktu</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-medium">{content.data.waktuAcara}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Tempat</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.tempatAcara}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Agenda Kegiatan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 whitespace-pre-line text-slate-900 font-medium">
                    {content.data.agendaAcara}
                  </td>
                </tr>
              </tbody>
            </table>

            {content.data.catatanKhusus && (
              <p className="text-[10.5pt] text-slate-800 italic">
                * {content.data.catatanKhusus}
              </p>
            )}

            <p>
              Mengingat pentingnya agenda tersebut bagi perkembangan pendidikan putra/putri kita bersama, kehadiran Bapak/Ibu sangat kami harapkan. Atas perhatian dan kerjasamanya, kami sampaikan terima kasih.
            </p>
          </div>
        </div>
      )}

      {/* ----------------- TYPE E: SURAT MUTASI KELUAR SISWA ----------------- */}
      {content.type === 'SURAT_MUTASI_KELUAR' && (
        <div>
          <div className="text-center my-3">
            <h2 className="text-[13pt] font-bold uppercase tracking-wider underline">
              SURAT KETERANGAN PINDAH SEKOLAH
            </h2>
            <p className="text-[10.5pt] tracking-normal mt-0.5">
              Nomor: <span className="tabular-nums">{letter.nomorSurat}</span>
            </p>
          </div>

          <div className="text-[11pt] space-y-2 text-justify mt-3">
            <p>
              Yang bertanda tangan di bawah ini Kepala {school.namaSekolah}, menerangkan dengan sesungguhnya bahwa:
            </p>

            <table className="w-full text-[10.5pt] ml-4 border-collapse my-2">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5">1. Nama Lengkap Siswa</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold uppercase">{content.data.namaSiswa}</td>
                </tr>
                <tr>
                  <td className="py-0.5">2. Nomor Induk Siswa (NIS)</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{content.data.nis}</td>
                </tr>
                <tr>
                  <td className="py-0.5">3. NISN</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{content.data.nisn}</td>
                </tr>
                <tr>
                  <td className="py-0.5">4. Tempat, Tanggal Lahir</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.tempatTanggalLahir}</td>
                </tr>
                <tr>
                  <td className="py-0.5">5. Jenis Kelamin</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr>
                  <td className="py-0.5">6. Tingkat / Kelas / Jurusan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-medium">{content.data.tingkatKelas} - {content.data.jurusan}</td>
                </tr>
                <tr>
                  <td className="py-0.5">7. Nama Orang Tua / Wali</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-medium">{content.data.namaOrtuWali}</td>
                </tr>
                <tr>
                  <td className="py-0.5">8. Pekerjaan Orang Tua</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.pekerjaanOrtu}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">9. Alamat Orang Tua</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.alamatOrtu}</td>
                </tr>
              </tbody>
            </table>

            <p>
              Sesuai dengan Surat Permohonan Pindah Sekolah dari orang tua/wali siswa tertanggal {formatTanggalIndonesia(letter.tanggalSurat)}, bahwa yang bersangkutan mengajukan pindah belajar ke:
            </p>

            <table className="w-full text-[10.5pt] ml-4 border-collapse my-1 bg-slate-50 p-2">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5 font-semibold">Nama Sekolah Tujuan</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold text-slate-950 uppercase">{content.data.namaSekolahTujuan}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Kabupaten / Kota Tujuan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-medium">{content.data.kabKotaSekolahTujuan}, {content.data.provinsiSekolahTujuan}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Alasan Kepindahan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.alasanPindah}</td>
                </tr>
              </tbody>
            </table>

            <p>
              Bersama ini kami lampirkan dokumen pendukung siswa:
            </p>
            <ul className="list-disc pl-8 space-y-0.5 text-[10pt] text-slate-800">
              {content.data.bukuRaportDiserahkan && <li>Buku Laporan Hasil Belajar (Raport Asli) yang telah diisi lengkap.</li>}
              {content.data.suratValidasiNisn && <li>Surat Keterangan Validasi NISN dari Data Pokok Pendidikan (Dapodik).</li>}
              {content.data.fotokopiAkreditasi && <li>Salinan Sertifikat Akreditasi Sekolah Asal.</li>}
              {content.data.keteranganLainnya && <li>{content.data.keteranganLainnya}</li>}
            </ul>

            <p className="mt-2">
              Sejak dikeluarkannya surat keterangan ini, maka yang bersangkutan bukan lagi merupakan tanggung jawab dan peserta didik {school.namaSekolah}. Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
            </p>
          </div>
        </div>
      )}

      {/* ----------------- TYPE F: SURAT PENERIMAAN MUTASI MASUK ----------------- */}
      {content.type === 'SURAT_MUTASI_MASUK' && (
        <div>
          <div className="text-center my-3">
            <h2 className="text-[13pt] font-bold uppercase tracking-wider underline">
              SURAT KETERANGAN PENERIMAAN MUTASI MASUK
            </h2>
            <p className="text-[10.5pt] tracking-normal mt-0.5">
              Nomor: <span className="tabular-nums">{letter.nomorSurat}</span>
            </p>
          </div>

          <div className="text-[11pt] space-y-2 text-justify mt-3">
            <p>
              Yang bertanda tangan di bawah ini Kepala {school.namaSekolah}, dengan ini menerangkan bahwa:
            </p>

            <table className="w-full text-[10.5pt] ml-4 border-collapse my-2">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5">Nama Siswa</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold uppercase">{content.data.namaSiswa}</td>
                </tr>
                <tr>
                  <td className="py-0.5">NISN</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{content.data.nisn}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tempat, Tanggal Lahir</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.tempatTanggalLahir}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Jenis Kelamin</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Asal Sekolah</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-bold uppercase">{content.data.sekolahAsal}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Kota / Kabupaten Asal</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.kabKotaSekolahAsal}</td>
                </tr>
              </tbody>
            </table>

            <p className="font-semibold text-slate-900">
              DAPAT DITERIMA sebagai peserta didik di {school.namaSekolah} pada:
            </p>

            <table className="w-full text-[10.5pt] ml-4 border-collapse my-1 bg-slate-50 p-2">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5 font-semibold">Tingkat / Kelas</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold text-slate-950">{content.data.diterimaDiKelas} ({content.data.jurusanDiterima})</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tahun Pelajaran</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-medium tabular-nums">{content.data.tahunPelajaran}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Terhitung Mulai Tanggal</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-semibold">{formatTanggalIndonesia(content.data.tanggalDiterima)}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-[10pt] text-slate-800 space-y-1 mt-2">
              <p className="font-semibold">Dasar Pertimbangan Penerimaan:</p>
              <p className="whitespace-pre-line pl-3">{content.data.dasarPenerimaan}</p>
            </div>

            {content.data.persyaratanTersisa && (
              <p className="text-[10pt] text-slate-700 italic">
                Catatan: {content.data.persyaratanTersisa}
              </p>
            )}

            <p className="mt-2">
              Demikian Surat Keterangan Penerimaan Mutasi Masuk ini kami terbitkan untuk dapat dipergunakan sebagai syarat penyelesaian administrasi mutasi keluar di sekolah asal dan pembaruan data Dapodik.
            </p>
          </div>
        </div>
      )}

      {/* ----------------- TYPE G: SURAT KETERANGAN AKTIF / BAIK ----------------- */}
      {(content.type === 'SURAT_KETERANGAN_AKTIF' || content.type === 'SURAT_KETERANGAN_BAIK') && (
        <div>
          <div className="text-center my-3">
            <h2 className="text-[13pt] font-bold uppercase tracking-wider underline">
              {content.type === 'SURAT_KETERANGAN_AKTIF'
                ? 'SURAT KETERANGAN AKTIF BELAJAR'
                : 'SURAT KETERANGAN BERKELAKUAN BAIK'}
            </h2>
            <p className="text-[10.5pt] tracking-normal mt-0.5">
              Nomor: <span className="tabular-nums">{letter.nomorSurat}</span>
            </p>
          </div>

          <div className="text-[11pt] space-y-3 text-justify mt-3">
            <p>
              Yang bertanda tangan di bawah ini Kepala {school.namaSekolah}, Kabupaten/Kota {school.kotaKab}, Provinsi {school.provinsi}, dengan ini menerangkan bahwa:
            </p>

            <table className="w-full text-[10.5pt] ml-4 border-collapse my-2">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5">Nama Siswa</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold uppercase">{content.data.namaSiswa}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Nomor Induk Siswa (NIS)</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{content.data.nis}</td>
                </tr>
                <tr>
                  <td className="py-0.5">NISN</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono tabular-nums">{content.data.nisn}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tempat, Tanggal Lahir</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.tempatTanggalLahir}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Jenis Kelamin</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tingkat / Kelas</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-semibold">{content.data.kelas}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Nama Orang Tua / Wali</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.namaOrtu}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Alamat</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{content.data.alamat}</td>
                </tr>
              </tbody>
            </table>

            <p>
              {content.data.keteranganTambahan ||
                (content.type === 'SURAT_KETERANGAN_AKTIF'
                  ? 'Adalah benar yang bersangkutan merupakan peserta didik aktif terdaftar di sekolah kami pada Tahun Pelajaran 2026/2027 dan tercatat resmi dalam Data Pokok Pendidikan (Dapodik).'
                  : 'Selama menjadi peserta didik di sekolah kami, yang bersangkutan senantiasa menunjukkan sikap, budi pekerti, dan kepatuhan yang baik terhadap seluruh tata tertib sekolah, serta tidak pernah terlibat tindakan pidana maupun penyalahgunaan narkoba.')}
            </p>

            <p>
              Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan:{' '}
              <span className="font-semibold">{content.data.tujuanPenggunaan || 'Persyaratan Administrasi Resmi'}</span>.
            </p>

            <p>
              Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BLOK TANDA TANGAN & STEMPEL CAP RESMI                 */}
      {/* ======================================================== */}
      <div className="mt-8 pt-4 signature-block flex justify-between items-start text-[11pt]">
        {/* Tembusan (Sisi Kiri) */}
        <div className="w-1/2 pr-4 text-[9.5pt]">
          {getTembusanList(content).length > 0 && (
            <div>
              <p className="font-semibold text-slate-800">Tembusan disampaikan kepada Yth:</p>
              <ol className="list-decimal pl-5 space-y-0.5 text-slate-700">
                {getTembusanList(content).map((tembusan, idx) => (
                  <li key={idx}>{tembusan}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Tanda Tangan Pejabat (Sisi Kanan) */}
        <div className="w-1/2 pl-6 text-left">
          <p>
            {letter.tempatDibuat}, {formatTanggalIndonesia(letter.tanggalSurat)}
          </p>
          <p className="font-semibold mt-0.5">{letter.penandatanganJabatan || 'Kepala Sekolah'},</p>

          {/* Area Tanda Tangan & Stempel Bersebelahan / Tumpang Tindih Resmi */}
          <div className="relative my-2 h-24 flex items-center">
            {/* Stempel Cap Bulat Dinas */}
            {letter.includeStempel && (
              <div className="absolute left-[-24px] top-[-8px] z-10">
                <OfficialStamp
                  schoolName={school.namaSekolah}
                  kotaKab={school.kotaKab}
                  dinas={school.namaDinas}
                  customUrl={school.stempelCustomUrl}
                />
              </div>
            )}

            {/* Tanda Tangan Digital Pejabat */}
            {letter.includeTtd && (
              <div className="relative z-0 pl-10">
                <DigitalSignature
                  signerName={letter.penandatanganNama}
                  customUrl={school.ttdCustomUrl}
                />
              </div>
            )}
          </div>

          <p className="font-bold uppercase underline tracking-wide text-slate-950">
            {letter.penandatanganNama}
          </p>
          <p className="text-[10pt] text-slate-700 leading-tight">
            {letter.penandatanganPangkat}
          </p>
          <p className="text-[10pt] text-slate-700 leading-tight">
            NIP. <span className="tabular-nums">{letter.penandatanganNip}</span>
          </p>
        </div>
      </div>
      </div>

      {/* Jika jenis surat adalah Surat Mutasi Keluar dan mode ALL (Paket Lengkap), lampirkan Lembar 2 (Surat Permohonan Orang Tua) */}
      {content.type === 'SURAT_MUTASI_KELUAR' && activeSheetMutasi === 'ALL' && (
        <>
          {/* Page break CSS for clean separate page print */}
          <div className="page-break-after" />

          {/* Visual Divider on Screen Preview */}
          {previewMode && (
            <div className="no-print my-8 flex items-center justify-center gap-3 max-w-[820px] mx-auto">
              <div className="h-px bg-slate-300 flex-1" />
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                Lembar 2: Surat Permohonan dari Orang Tua / Wali Siswa
              </span>
              <div className="h-px bg-slate-300 flex-1" />
            </div>
          )}

          <ParentTransferRequestSheet
            letter={letter}
            school={school}
            previewMode={previewMode}
            paperSize={paperSize}
          />
        </>
      )}
    </div>
  );
};

/**
 * Lembar 2: Surat Permohonan Pindah Sekolah (Mutasi Keluar) dari Orang Tua / Wali Siswa
 * Ditandatangani oleh orang tua/wali pemohon dengan tempat materai Rp 10.000 resmi.
 */
export const ParentTransferRequestSheet: React.FC<{
  letter: LetterRecord;
  school: SchoolProfile;
  previewMode?: boolean;
  paperSize?: PaperSize;
}> = ({ letter, school, previewMode = true, paperSize = 'A4' }) => {
  const data = letter.content.data as SuratMutasiKeluarData;
  const isF4 = paperSize === 'F4';
  const tglPermohonan = data.tanggalPermohonanOrtu || letter.tanggalSurat;

  return (
    <div
      className={`bg-white text-slate-900 font-surat leading-relaxed print:p-0 print:m-0 print:border-none print:shadow-none printable-page ${
        previewMode
          ? `w-full max-w-[820px] mx-auto ${
              isF4 ? 'min-h-[1250px]' : 'min-h-[1100px]'
            } p-8 sm:p-12 shadow-sm border border-slate-200`
          : 'p-0 m-0'
      }`}
      style={{
        boxSizing: 'border-box',
        fontSize: '11.5pt'
      }}
    >
      {/* 1. Tempat & Tanggal Permohonan (Kanan Atas) */}
      <div className="text-right text-[11pt] mb-6">
        <p>
          {letter.tempatDibuat}, {formatTanggalIndonesia(tglPermohonan)}
        </p>
      </div>

      {/* 2. Lampiran, Perihal & Tujuan (Kiri Atas) */}
      <div className="flex justify-between items-start mb-6 text-[11pt]">
        <div>
          <table className="border-collapse">
            <tbody>
              <tr>
                <td className="w-24 py-0.5 font-semibold">Hal</td>
                <td className="w-4 text-center py-0.5">:</td>
                <td className="py-0.5 font-bold text-slate-900">
                  Permohonan Pindah Sekolah (Mutasi Keluar) Siswa
                </td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">Lampiran</td>
                <td className="text-center py-0.5">:</td>
                <td className="py-0.5">1 (satu) Berkas Lengkap</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11pt] mb-6">
        <p className="font-semibold text-slate-900">Kepada Yth.</p>
        <p className="font-bold text-slate-900">Bapak / Ibu Kepala {school.namaSekolah}</p>
        <p className="text-slate-700">di</p>
        <p className="text-slate-800 font-medium pl-4">{school.kotaKab}</p>
      </div>

      {/* 3. Isi Permohonan */}
      <div className="text-[11pt] space-y-3 text-justify">
        <p>Dengan hormat,</p>
        <p>
          Yang bertanda tangan di bawah ini saya selaku orang tua / wali siswa:
        </p>

        <table className="w-full text-[10.5pt] ml-4 border-collapse my-2">
          <tbody>
            <tr>
              <td className="w-48 py-0.5">1. Nama Orang Tua / Wali</td>
              <td className="w-3 py-0.5">:</td>
              <td className="py-0.5 font-bold uppercase text-slate-900">
                {data.namaOrtuWali}
              </td>
            </tr>
            <tr>
              <td className="py-0.5">2. Hubungan Keluarga</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-medium">
                {data.hubunganDenganSiswa || 'Orang Tua / Wali Siswa'}
              </td>
            </tr>
            <tr>
              <td className="py-0.5">3. Pekerjaan</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{data.pekerjaanOrtu}</td>
            </tr>
            <tr className="align-top">
              <td className="py-0.5">4. Alamat Lengkap</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{data.alamatOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.5">5. No. Handphone / WA</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-mono">{data.noHpOrtu || '-'}</td>
            </tr>
          </tbody>
        </table>

        <p>
          Dengan ini mengajukan permohonan pindah sekolah (mutasi keluar) bagi putra / putri kami:
        </p>

        <table className="w-full text-[10.5pt] ml-4 border-collapse my-2">
          <tbody>
            <tr>
              <td className="w-48 py-0.5">1. Nama Lengkap Siswa</td>
              <td className="w-3 py-0.5">:</td>
              <td className="py-0.5 font-bold uppercase text-slate-950">
                {data.namaSiswa}
              </td>
            </tr>
            <tr>
              <td className="py-0.5">2. Nomor Induk Siswa (NIS)</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-mono">{data.nis}</td>
            </tr>
            <tr>
              <td className="py-0.5">3. NISN</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-mono">{data.nisn}</td>
            </tr>
            <tr>
              <td className="py-0.5">4. Tempat, Tanggal Lahir</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{data.tempatTanggalLahir}</td>
            </tr>
            <tr>
              <td className="py-0.5">5. Jenis Kelamin</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">
                {data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </td>
            </tr>
            <tr>
              <td className="py-0.5">6. Tingkat / Kelas / Jurusan</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-semibold">
                {data.tingkatKelas} - {data.jurusan}
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          Adapun permohonan pindah sekolah ini kami ajukan untuk melanjutkan pendidikan ke sekolah tujuan:
        </p>

        <table className="w-full text-[10.5pt] ml-4 border-collapse my-1 bg-slate-50 p-2">
          <tbody>
            <tr>
              <td className="w-48 py-0.5 font-semibold">Nama Sekolah Tujuan</td>
              <td className="w-3 py-0.5">:</td>
              <td className="py-0.5 font-bold uppercase text-slate-950">
                {data.namaSekolahTujuan}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 font-semibold">Kabupaten / Kota Tujuan</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-medium">
                {data.kabKotaSekolahTujuan}, {data.provinsiSekolahTujuan}
              </td>
            </tr>
            <tr className="align-top">
              <td className="py-0.5 font-semibold">Alasan Kepindahan</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{data.alasanPindah}</td>
            </tr>
          </tbody>
        </table>

        <p>
          Bersama ini kami lampirkan dokumen persyaratan pendukung. Segala hal dan kewajiban administrasi kesiswaan dengan pihak sekolah telah kami selesaikan dengan sebaik-baiknya.
        </p>

        <p>
          Kami menyampaikan ucapan terima kasih dan penghargaan yang setinggi-tingginya kepada Bapak/Ibu Kepala Sekolah, Bapak/Ibu Dewan Guru, dan segenap staf tenaga kependidikan atas segala bimbingan, didikan, budi pekerti, dan ilmu yang telah dicurahkan kepada anak kami selama menempuh studi di {school.namaSekolah}.
        </p>

        <p>
          Demikian surat permohonan ini kami buat dengan penuh kesadaran dan tanpa paksaan dari pihak manapun, agar dapat diproses dan diterbitkan Surat Keterangan Pindah Sekolah resmi sebagaimana mestinya.
        </p>
      </div>

      {/* 4. Blok Tanda Tangan Orang Tua / Wali Pemohon */}
      <div className="mt-8 pt-4 signature-block flex justify-end text-[11pt]">
        <div className="w-72 text-center">
          <p>
            {letter.tempatDibuat}, {formatTanggalIndonesia(tglPermohonan)}
          </p>
          <p className="font-semibold mt-0.5">Pemohon,</p>
          <p className="text-slate-600 text-[10pt]">
            {data.hubunganDenganSiswa || 'Orang Tua / Wali Siswa'}
          </p>

          {/* Area Tanda Tangan & Kotak Materai 10.000 */}
          <div className="relative my-2 h-28 flex items-center justify-center">
            {/* Kotak Materai */}
            <div className="w-32 h-20 border-2 border-dashed border-slate-400 bg-slate-50/70 rounded flex flex-col items-center justify-center text-slate-500 text-[8pt] p-1 text-center font-sans">
              <span className="font-bold text-slate-700">MATERAI</span>
              <span className="text-[7.5pt] font-semibold">Rp 10.000</span>
              <span className="text-[6.5pt] text-slate-400 mt-0.5">
                (Tanda tangan kena materai)
              </span>
            </div>

            {/* Custom Scan TTD Orang Tua if provided */}
            {data.tandaTanganOrtuUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <img
                  src={data.tandaTanganOrtuUrl}
                  alt="TTD Orang Tua"
                  className="max-h-24 max-w-full object-contain mix-blend-multiply"
                />
              </div>
            )}
          </div>

          <p className="font-bold uppercase underline tracking-wide text-slate-950 mt-1">
            ( {data.tandaTanganOrtuNama || data.namaOrtuWali} )
          </p>
          <p className="text-[9.5pt] text-slate-500 mt-0.5">
            Nama Jelas Orang Tua / Wali
          </p>
        </div>
      </div>
    </div>
  );
};

function getTembusanList(content: LetterRecord['content']): string[] {
  if ('tembusan' in content.data && Array.isArray(content.data.tembusan)) {
    return content.data.tembusan;
  }
  return [];
}
