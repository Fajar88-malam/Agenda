/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const HARI_INDONESIA = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatTanggalIndonesia(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && month >= 0 && month < 12) {
        return `${day} ${BULAN_INDONESIA[month]} ${year}`;
      }
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateString;
  }
}

export function getNamaHari(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return HARI_INDONESIA[d.getDay()];
  } catch {
    return '';
  }
}

export function toRoman(num: number): string {
  const romanMap: { [key: number]: string } = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
    11: 'XI', 12: 'XII'
  };
  return romanMap[num] || String(num);
}

export function generateNomorSurat(
  kodeKlasifikasi: string,
  nomorUrut: number,
  singkatanSekolah: string,
  tanggalStr: string
): string {
  const parts = tanggalStr ? tanggalStr.split('-') : [];
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();

  if (parts.length === 3) {
    const parsedYear = parseInt(parts[0], 10);
    const parsedMonth = parseInt(parts[1], 10);
    if (!isNaN(parsedYear)) year = parsedYear;
    if (!isNaN(parsedMonth)) month = parsedMonth;
  }

  const paddedNum = String(nomorUrut).padStart(3, '0');
  const romanMonth = toRoman(month);
  const cleanKode = kodeKlasifikasi || '421';
  const cleanSchool = singkatanSekolah || 'SEKOLAH';

  return `${cleanKode}/${paddedNum}/${cleanSchool}/${romanMonth}/${year}`;
}

export function getLetterTypeName(type: string): string {
  switch (type) {
    case 'SURAT_TUGAS':
      return 'Surat Perintah Tugas';
    case 'SURAT_PENGANTAR':
      return 'Surat Pengantar Berkas';
    case 'SURAT_PANGGILAN_ORTU':
      return 'Surat Panggilan Orang Tua / Wali';
    case 'SURAT_UNDANGAN_ORTU':
      return 'Surat Undangan Orang Tua';
    case 'SURAT_MUTASI_KELUAR':
      return 'Surat Keterangan Pindah (Mutasi Keluar)';
    case 'SURAT_MUTASI_MASUK':
      return 'Surat Penerimaan Mutasi Masuk';
    case 'SURAT_KETERANGAN_AKTIF':
      return 'Surat Keterangan Aktif Siswa';
    case 'SURAT_KETERANGAN_BAIK':
      return 'Surat Keterangan Berkelakuan Baik';
    default:
      return type;
  }
}

export function getDefaultClassificationCode(type: string): string {
  switch (type) {
    case 'SURAT_TUGAS':
      return '800'; // Kepegawaian / Penugasan
    case 'SURAT_PENGANTAR':
      return '045.2'; // Kearsipan / Pengantar
    case 'SURAT_PANGGILAN_ORTU':
      return '421.7'; // Kesiswaan / BK / Disiplin
    case 'SURAT_UNDANGAN_ORTU':
      return '005'; // Undangan Kedinasan
    case 'SURAT_MUTASI_KELUAR':
      return '422.1'; // Mutasi Siswa Keluar
    case 'SURAT_MUTASI_MASUK':
      return '422.2'; // Mutasi Siswa Masuk
    case 'SURAT_KETERANGAN_AKTIF':
      return '421.3'; // Keterangan Siswa
    case 'SURAT_KETERANGAN_BAIK':
      return '421.3'; // Keterangan Siswa
    default:
      return '421';
  }
}

export function exportToCsv(filename: string, rows: object[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            const rawVal = (row as Record<string, unknown>)[k];
            let cellStr = '';
            if (rawVal !== null && rawVal !== undefined) {
              if (rawVal instanceof Date) {
                cellStr = rawVal.toLocaleString();
              } else {
                cellStr = String(rawVal);
              }
            }
            cellStr = cellStr.replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              cellStr = `"${cellStr}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Triggers browser printing with dynamic paper size (A4: 210x297mm vs F4 / Folio: 215x330mm)
 * and suppresses browser headers/footers by specifying explicit print page margins.
 */
export function triggerPrintWithPaperSize(paperSize: 'A4' | 'F4' = 'A4'): void {
  const existingStyle = document.getElementById('print-page-size-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'print-page-size-style';
  if (paperSize === 'F4') {
    // Indonesian F4 / Folio standard: 215mm x 330mm
    style.innerHTML = `
      @page {
        size: 215mm 330mm portrait !important;
        margin: 12mm 15mm 12mm 18mm !important;
      }
    `;
    document.body.classList.add('paper-f4');
    document.body.classList.remove('paper-a4');
  } else {
    // International A4 standard: 210mm x 297mm
    style.innerHTML = `
      @page {
        size: 210mm 297mm portrait !important;
        margin: 12mm 15mm 12mm 18mm !important;
      }
    `;
    document.body.classList.add('paper-a4');
    document.body.classList.remove('paper-f4');
  }
  document.head.appendChild(style);

  setTimeout(() => {
    window.print();
  }, 60);
}
