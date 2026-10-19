import React from "react";
import { ShieldCheck, CheckCircle2, Info } from "lucide-react";

export function QrTipsCard() {
  return (
    <div className="p-5 sm:p-6 bg-[var(--surface-2)]/50 rounded-2xl border border-[var(--line)] space-y-3.5">
      <div className="flex items-center gap-2 text-[var(--forest)]">
        <ShieldCheck className="w-5 h-5 text-[var(--leaf)] shrink-0" />
        <h4 className="font-heading font-bold text-sm">
          Keunggulan 1 QR Code Seumur Toko
        </h4>
      </div>

      <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed font-normal">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
          <span>
            <strong>QR Tidak Pernah Berubah:</strong> Saat Anda menambah menu baru, mengubah harga, atau stok habis di dashboard, QR yang sudah tercetak di meja tetap sama dan tidak perlu dicetak ulang.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
          <span>
            <strong>Universal untuk Semua Ponsel:</strong> Bisa dipindai menggunakan kamera bawaan iPhone/Android, aplikasi m-Banking (BCA, Mandiri, BRI), atau e-Wallet (GoPay, OVO, ShopeePay, Dana).
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[var(--forest)] shrink-0 mt-0.5" />
          <span>
            <strong>Rekomendasi Cetak:</strong> Gunakan akrilik meja ukuran <strong>A6 (10.5 x 14.8 cm)</strong> untuk meja pelanggan, atau stiker vinil tahan air agar tidak luntur saat dibersihkan.
          </span>
        </li>
      </ul>
    </div>
  );
}
