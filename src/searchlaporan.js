/**
 * searchlaporan.js
 * 
 * Modul pencarian Laporan Keuangan.
 * Pencarian kini dilakukan via redirect ke laporan.html?search=...
 * sehingga menggunakan data yang sama persis dengan aplikasi Laporan.
 * 
 * File ini dipertahankan sebagai referensi dan bisa digunakan untuk
 * keperluan lain di masa depan (misalnya: widget ringkasan keuangan).
 */

export const LAPORAN_URL = '/laporan.html';

/**
 * Buka halaman Cek Transaksi di laporan.html dengan query pencarian.
 * @param {string} query - Nomor kuitansi atau unit ID yang dicari
 * @param {boolean} newTab - Jika true, buka di tab baru
 */
export function searchLaporan(query, newTab = false) {
    const url = `${LAPORAN_URL}?search=${encodeURIComponent(query)}`;
    if (newTab) {
        window.open(url, '_blank');
    } else {
        window.location.href = url;
    }
}
