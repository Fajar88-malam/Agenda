/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
}

/**
 * Exports data to a genuine Microsoft Excel (.xlsx) file with distinct columns,
 * auto-adjusted column widths, and text-safe formatting to preserve leading zeroes
 * (e.g. for NISN, NIP, NUPTK, and Phone Numbers).
 */
export function exportToExcelFile(
  filename: string,
  sheetName: string,
  columns: ColumnDefinition[],
  data: Record<string, unknown>[]
): void {
  // Build header row and data rows
  const headerRow = columns.map(col => col.header);
  const rows: unknown[][] = [headerRow];

  data.forEach(item => {
    const row = columns.map(col => {
      const val = item[col.key];
      if (val === null || val === undefined) return '';
      // Ensure strings like "0081234567" or "08123456" remain text in Excel
      return String(val);
    });
    rows.push(row);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = columns.map(col => {
    let maxLen = col.header.length;
    data.forEach(item => {
      const val = item[col.key];
      if (val) {
        const len = String(val).length;
        if (len > maxLen) maxLen = len;
      }
    });
    return { wch: Math.max(col.width || 12, maxLen + 3) };
  });

  // Ensure all cells are treated as text so Excel won't format "008123" as number or scientific notation
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef];
      if (cell && cell.v !== undefined) {
        cell.t = 's'; // type string
        cell.v = String(cell.v);
      }
    }
  }

  // Create workbook and write file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // sheet name max 31 chars

  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalName, { bookType: 'xlsx' });
}

/**
 * Reads any uploaded spreadsheet (.xlsx, .xls, .csv) and returns normalized objects.
 */
export async function readSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return [];

  const ws = wb.Sheets[firstSheetName];
  // Convert sheet to JSON with raw strings to preserve leading zeros
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
    raw: false // raw: false ensures strings with leading zeros are preserved
  });

  if (!rawData || rawData.length < 2) return [];

  // Find header row (first non-empty row)
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i] && (rawData[i] as unknown[]).some(cell => String(cell).trim().length > 0)) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaders = (rawData[headerRowIndex] as unknown[]).map(h => String(h || '').trim());
  const results: Record<string, string>[] = [];

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const row = rawData[r] as unknown[];
    if (!row || row.length === 0) continue;

    // Check if row has at least one value
    const hasValue = row.some(c => String(c || '').trim().length > 0);
    if (!hasValue) continue;

    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, colIdx) => {
      if (header) {
        const val = row[colIdx];
        rowObj[header] = val !== undefined && val !== null ? String(val).trim() : '';
      }
    });

    results.push(rowObj);
  }

  return results;
}
