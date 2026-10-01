// lib/export-excel.ts

/**
 * Export array of flat objects ke file .xlsx dan langsung trigger download.
 * `xlsx` di-import dynamic supaya gak masuk main bundle, cuma di-load
 * pas tombol export beneran diklik.
 *
 * @param rows        Data mentah, tiap object = 1 baris. Key object jadi
 *                     header kolom (urutan mengikuti urutan key di object
 *                     pertama).
 * @param sheetName    Nama sheet di dalam workbook.
 * @param filenamePrefix  Prefix nama file, tanggal hari ini otomatis
 *                     ditambahkan di belakang (mis. "lp3h" -> lp3h-2026-09-07.xlsx)
 */
export async function exportToExcel<T extends Record<string, unknown>>(rows: T[], sheetName: string, filenamePrefix: string) {
  const XLSX = await import('xlsx');

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}-${today}.xlsx`);
}
