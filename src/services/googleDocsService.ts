/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LetterRecord, SchoolProfile, SuratMutasiKeluarData } from '../types';
import { formatTanggalIndonesia, getLetterTypeName } from '../utils/formatters';
import { getAccessToken } from './googleAuthService';

export interface GoogleDriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

/**
 * Formats full official letter text for inserting into Google Docs
 */
export function buildLetterDocumentText(letter: LetterRecord, school: SchoolProfile): string {
  const { content } = letter;
  const divider = '========================================================================\n';

  let text = '';

  // 1. KOP SURAT RESMI
  text += `${school.namaPemerintah.toUpperCase()}\n`;
  text += `${school.namaDinas.toUpperCase()}\n`;
  if (school.namaCabangDinas) {
    text += `${school.namaCabangDinas.toUpperCase()}\n`;
  }
  text += `${school.namaSekolah.toUpperCase()}\n`;
  text += `NPSN: ${school.npsn} | NSS: ${school.nss || '-'} | Akreditasi: ${school.akreditasi}\n`;
  text += `Alamat: ${school.alamatJalan}, Kel. ${school.kelurahan}, Kec. ${school.kecamatan}, ${school.kotaKab}, ${school.provinsi} ${school.kodePos}\n`;
  if (school.email || school.telepon) {
    text += `Telp: ${school.telepon || '-'} | Email: ${school.email || '-'} | Web: ${school.website || '-'}\n`;
  }
  text += divider + '\n';

  // 2. HEADER NASKAH DINAS
  if (content.type === 'SURAT_TUGAS') {
    text += `SURAT PERINTAH TUGAS\n`;
    text += `Nomor: ${letter.nomorSurat}\n\n`;
    text += `Dasar:\n${content.data.dasarPenugasan}\n\n`;
    text += `MEMERINTAHKAN:\n\n`;
    text += `Kepada:\n`;
    content.data.daftarPetugas.forEach((p, idx) => {
      text += `${idx + 1}. Nama               : ${p.nama}\n`;
      text += `   NIP                : ${p.nip || '-'}\n`;
      text += `   Pangkat/Golongan   : ${p.pangkatGolongan || '-'}\n`;
      text += `   Jabatan            : ${p.jabatan || '-'}\n\n`;
    });
    text += `Untuk:\n`;
    text += `1. ${content.data.keperluanTugas}\n`;
    text += `2. Hari / Tanggal : ${formatTanggalIndonesia(content.data.waktuMulai)}${content.data.waktuSelesai && content.data.waktuSelesai !== content.data.waktuMulai ? ' s.d. ' + formatTanggalIndonesia(content.data.waktuSelesai) : ''}\n`;
    text += `3. Waktu          : ${content.data.jamKegiatan}\n`;
    text += `4. Tempat         : ${content.data.tempatKegiatan}\n`;
    text += `5. Beban Anggaran : ${content.data.bebanAnggaran}\n\n`;
    text += `Demikian surat tugas ini diberikan kepada yang bersangkutan untuk dilaksanakan dengan penuh rasa tanggung jawab.\n\n`;
  } else {
    // Format Surat Standar dengan Nomor, Lampiran, Hal
    text += `${letter.tempatDibuat}, ${formatTanggalIndonesia(letter.tanggalSurat)}\n\n`;
    text += `Nomor     : ${letter.nomorSurat}\n`;
    text += `Sifat     : ${letter.sifat}\n`;
    text += `Lampiran  : ${letter.lampiran}\n`;
    text += `Hal       : ${letter.perihal}\n\n`;

    text += `Kepada Yth.\n`;
    text += `${letter.kepadaYth}\n`;
    text += `di Tempat\n\n`;

    // BODY SURAT
    if (content.type === 'SURAT_PENGANTAR') {
      text += `Dengan hormat,\n`;
      text += `Bersama ini kami kirimkan berkas administrasi sebagai berikut:\n\n`;
      content.data.daftarBerkas.forEach((b, idx) => {
        text += `${idx + 1}. ${b.naskahDinas} | Banyaknya: ${b.banyaknya} | Keterangan: ${b.keterangan}\n`;
      });
      text += `\n${content.data.catatanPenutup}\n\n`;
    } else if (content.type === 'SURAT_PANGGILAN_ORTU') {
      text += `Dengan hormat,\n`;
      text += `Sehubungan dengan perkembangan pembinaan dan kegiatan belajar mengajar siswa kami di ${school.namaSekolah}, dengan ini kami mengharapkan kehadiran Bapak/Ibu Orang Tua / Wali dari siswa:\n\n`;
      text += `Nama Siswa : ${content.data.namaSiswa}\n`;
      text += `NISN       : ${content.data.nisn}\n`;
      text += `Kelas      : ${content.data.kelas}\n\n`;
      text += `Untuk hadir pada:\n`;
      text += `Hari/Tanggal : ${formatTanggalIndonesia(content.data.hariTanggalPanggilan)}\n`;
      text += `Waktu        : ${content.data.waktuPanggilan}\n`;
      text += `Tempat       : ${content.data.tempatMenghadap}\n`;
      text += `Menemui      : ${content.data.menemuiPejabat}\n`;
      text += `Keperluan    : ${content.data.alasanPanggilan}\n\n`;
      text += `${content.data.catatanKhusus}\n\n`;
    } else if (content.type === 'SURAT_UNDANGAN_ORTU') {
      text += `Dengan hormat,\n`;
      text += `Dalam rangka ${content.data.perihalUndangan}, kami mengundang Bapak/Ibu Orang Tua / Wali Murid untuk dapat hadir pada:\n\n`;
      text += `Hari/Tanggal : ${formatTanggalIndonesia(content.data.hariTanggalAcara)}\n`;
      text += `Waktu        : ${content.data.waktuAcara}\n`;
      text += `Tempat       : ${content.data.tempatAcara}\n`;
      text += `Agenda Acara :\n${content.data.agendaAcara}\n\n`;
      text += `${content.data.catatanKhusus}\n\n`;
    } else if (content.type === 'SURAT_MUTASI_KELUAR') {
      text += `SURAT KETERANGAN PINDAH SEKOLAH (MUTASI KELUAR)\n`;
      text += `Nomor: ${letter.nomorSurat}\n\n`;
      text += `Yang bertanda tangan di bawah ini Kepala ${school.namaSekolah}, menerangkan bahwa:\n\n`;
      text += `Nama Lengkap Siswa  : ${content.data.namaSiswa}\n`;
      text += `NIS / NISN          : ${content.data.nis} / ${content.data.nisn}\n`;
      text += `Tempat/Tanggal Lahir: ${content.data.tempatTanggalLahir}\n`;
      text += `Jenis Kelamin       : ${content.data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}\n`;
      text += `Tingkat / Kelas     : ${content.data.tingkatKelas} (${content.data.jurusan})\n`;
      text += `Nama Orang Tua/Wali : ${content.data.namaOrtuWali}\n`;
      text += `Alamat Orang Tua    : ${content.data.alamatOrtu}\n\n`;
      text += `Sesuai Surat Permohonan Pindah Sekolah dari Orang Tua/Wali Siswa tertanggal ${formatTanggalIndonesia(content.data.tanggalPermohonanOrtu || letter.tanggalSurat)}, siswa yang bersangkutan telah mengajukan pindah sekolah ke:\n\n`;
      text += `Sekolah Tujuan      : ${content.data.namaSekolahTujuan}\n`;
      text += `Kabupaten / Kota    : ${content.data.kabKotaSekolahTujuan}, ${content.data.provinsiSekolahTujuan}\n`;
      text += `Alasan Pindah       : ${content.data.alasanPindah}\n\n`;
      text += `Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.\n\n`;
    } else if (content.type === 'SURAT_MUTASI_MASUK') {
      text += `SURAT KETERANGAN PENERIMAAN MUTASI MASUK\n`;
      text += `Nomor: ${letter.nomorSurat}\n\n`;
      text += `Berdasarkan permohonan mutasi siswa dan hasil verifikasi kelengkapan berkas serta daya tampung sekolah, Kepala ${school.namaSekolah} menerangkan bahwa:\n\n`;
      text += `Nama Lengkap Siswa : ${content.data.namaSiswa}\n`;
      text += `NISN               : ${content.data.nisn}\n`;
      text += `Sekolah Asal       : ${content.data.sekolahAsal}\n`;
      text += `Dinyatakan DITERIMA sebagai siswa baru di ${school.namaSekolah} pada Kelas: ${content.data.diterimaDiKelas}.\n\n`;
      text += `Demikian surat ini dibuat untuk dipergunakan sebagai kelengkapan mutasi siswa.\n\n`;
    } else if (content.type === 'SURAT_KETERANGAN_AKTIF' || content.type === 'SURAT_KETERANGAN_BAIK') {
      const isAktif = content.type === 'SURAT_KETERANGAN_AKTIF';
      text += isAktif ? `SURAT KETERANGAN SISWA AKTIF\n` : `SURAT KETERANGAN BERKELAKUAN BAIK\n`;
      text += `Nomor: ${letter.nomorSurat}\n\n`;
      text += `Yang bertanda tangan di bawah ini Kepala ${school.namaSekolah}, menerangkan dengan sesungguhnya bahwa:\n\n`;
      text += `Nama Lengkap Siswa : ${content.data.namaSiswa}\n`;
      text += `NIS / NISN         : ${content.data.nis} / ${content.data.nisn}\n`;
      text += `Kelas              : ${content.data.kelas}\n`;
      text += `Alamat             : ${content.data.alamat}\n\n`;
      text += isAktif
        ? `Adalah benar-benar siswa aktif terdaftar pada Tahun Pelajaran berjalan di ${school.namaSekolah}.\n`
        : `Selama menjadi siswa di ${school.namaSekolah}, yang bersangkutan berkelakuan baik, disiplin, dan tidak pernah terlibat tindakan kriminal maupun pelanggaran tata tertib sekolah.\n`;
      text += `Surat keterangan ini diberikan untuk keperluan: ${content.data.tujuanPenggunaan}.\n\n`;
    }
  }

  // 3. TANDA TANGAN PEJABAT
  text += `\n${letter.tempatDibuat}, ${formatTanggalIndonesia(letter.tanggalSurat)}\n`;
  text += `${letter.penandatanganJabatan || 'Kepala Sekolah'},\n\n\n\n`;
  text += `${letter.penandatanganNama}\n`;
  if (letter.penandatanganPangkat) {
    text += `${letter.penandatanganPangkat}\n`;
  }
  text += `NIP. ${letter.penandatanganNip}\n\n`;

  // 4. TEMBUSAN (JIKA ADA)
  if ('tembusan' in content.data && Array.isArray(content.data.tembusan) && content.data.tembusan.length > 0) {
    text += `Tembusan Yth:\n`;
    content.data.tembusan.forEach((t: string, idx: number) => {
      text += `${idx + 1}. ${t}\n`;
    });
  }

  return text;
}

/**
 * Builds Google Doc text for Lembar 2 (Surat Permohonan Mutasi Keluar dari Orang Tua)
 */
export function buildParentTransferDocText(letter: LetterRecord, school: SchoolProfile): string {
  const data = letter.content.data as SuratMutasiKeluarData;
  const tglPermohonan = data.tanggalPermohonanOrtu || letter.tanggalSurat;

  let text = '';
  text += `${letter.tempatDibuat}, ${formatTanggalIndonesia(tglPermohonan)}\n\n`;
  text += `Hal      : Permohonan Pindah Sekolah (Mutasi Keluar) Siswa\n`;
  text += `Lampiran : 1 (satu) Berkas Lengkap\n\n`;
  text += `Kepada Yth.\n`;
  text += `Bapak / Ibu Kepala ${school.namaSekolah}\n`;
  text += `di ${school.kotaKab}\n\n`;

  text += `Dengan hormat,\n`;
  text += `Yang bertanda tangan di bawah ini saya selaku orang tua / wali siswa:\n\n`;
  text += `1. Nama Orang Tua / Wali : ${data.namaOrtuWali}\n`;
  text += `2. Hubungan Keluarga     : ${data.hubunganDenganSiswa || 'Orang Tua / Wali Siswa'}\n`;
  text += `3. Pekerjaan             : ${data.pekerjaanOrtu}\n`;
  text += `4. Alamat Lengkap        : ${data.alamatOrtu}\n`;
  text += `5. No. Handphone / WA    : ${data.noHpOrtu || '-'}\n\n`;

  text += `Dengan ini mengajukan permohonan pindah sekolah (mutasi keluar) bagi putra / putri kami:\n\n`;
  text += `1. Nama Lengkap Siswa    : ${data.namaSiswa}\n`;
  text += `2. Nomor Induk Siswa     : ${data.nis}\n`;
  text += `3. NISN                  : ${data.nisn}\n`;
  text += `4. Tempat, Tanggal Lahir : ${data.tempatTanggalLahir}\n`;
  text += `5. Jenis Kelamin         : ${data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}\n`;
  text += `6. Tingkat / Kelas       : ${data.tingkatKelas} - ${data.jurusan}\n\n`;

  text += `Adapun permohonan pindah sekolah ini kami ajukan untuk melanjutkan pendidikan ke sekolah tujuan:\n\n`;
  text += `Nama Sekolah Tujuan      : ${data.namaSekolahTujuan}\n`;
  text += `Kabupaten / Kota Tujuan  : ${data.kabKotaSekolahTujuan}, ${data.provinsiSekolahTujuan}\n`;
  text += `Alasan Kepindahan        : ${data.alasanPindah}\n\n`;

  text += `Bersama ini kami lampirkan dokumen persyaratan pendukung. Segala hal dan kewajiban administrasi kesiswaan dengan pihak sekolah telah kami selesaikan dengan sebaik-baiknya.\n\n`;
  text += `Kami menyampaikan ucapan terima kasih dan penghargaan yang setinggi-tingginya kepada Bapak/Ibu Kepala Sekolah, Bapak/Ibu Dewan Guru, dan segenap staf tenaga kependidikan atas segala bimbingan, didikan, budi pekerti, dan ilmu yang telah dicurahkan kepada anak kami selama menempuh studi di ${school.namaSekolah}.\n\n`;
  text += `Demikian surat permohonan ini kami buat dengan penuh kesadaran dan tanpa paksaan dari pihak manapun, agar dapat diproses dan diterbitkan Surat Keterangan Pindah Sekolah resmi sebagaimana mestinya.\n\n`;

  text += `${letter.tempatDibuat}, ${formatTanggalIndonesia(tglPermohonan)}\n`;
  text += `Pemohon,\n`;
  text += `${data.hubunganDenganSiswa || 'Orang Tua / Wali Siswa'}\n\n\n`;
  text += `[ Materai Rp 10.000 ]\n\n\n`;
  text += `( ${data.tandaTanganOrtuNama || data.namaOrtuWali} )\n`;

  return text;
}

/**
 * Creates a real Google Doc from a letter and inserts formatted text
 */
export async function createGoogleDocFromLetter(
  letter: LetterRecord,
  school: SchoolProfile,
  isParentRequestSheet: boolean = false
): Promise<{
  documentId: string;
  documentUrl: string;
  title: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum masuk dengan Google. Silakan login terlebih dahulu.');
  }

  const title = isParentRequestSheet
    ? `[PERMOHONAN ORTU] Mutasi Siswa - ${letter.nomorSurat.replace(/[\/\\]/g, '-')}`
    : `[SURAT RESMI] ${letter.nomorSurat.replace(/[\/\\]/g, '-')} - ${getLetterTypeName(letter.jenisSurat)}`;

  // Step 1: Create Blank Google Doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat Google Doc (Status ${createRes.status})`
    );
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // Step 2: Build letter content
  const docContent = isParentRequestSheet
    ? buildParentTransferDocText(letter, school)
    : buildLetterDocumentText(letter, school);

  // Step 3: Insert text into Google Doc via batchUpdate
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: docContent
          }
        }
      ]
    })
  });

  if (!updateRes.ok) {
    console.warn('Gagal memasukkan teks lengkap ke dokumen:', await updateRes.text());
  }

  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  return {
    documentId,
    documentUrl,
    title
  };
}

/**
 * Lists Google Drive files (Google Docs and letters created)
 */
export async function listGoogleDriveFiles(searchQuery?: string): Promise<GoogleDriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum masuk dengan Google.');
  }

  let query = 'trashed = false';
  if (searchQuery && searchQuery.trim()) {
    query += ` and name contains '${searchQuery.trim().replace(/'/g, "\\'")}'`;
  }

  const params = new URLSearchParams({
    q: query,
    orderBy: 'modifiedTime desc',
    pageSize: '30',
    fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime, size, owners)'
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengambil berkas Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Uploads a file (e.g. JSON database backup or Excel roster) to Google Drive
 */
export async function uploadBackupToGoogleDrive(
  fileName: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum masuk dengan Google.');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Backup Database Resmi Aplikasi E-Surat Administrasi Sekolah SMP Negeri 1 Pacet'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengunggah berkas ke Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Deletes a file from Google Drive (Mandatory user confirmation must be called by caller)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum masuk dengan Google.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menghapus berkas dari Google Drive (${res.status})`);
  }
}
