import React from "react";
import { QrCode } from "lucide-react";
import { QrPreviewTicketProps } from "./types";

export function QrPreviewTicket({
  storeName,
  tableLabel,
  fullMenuUrl,
  qrPngUrl,
  isGenerating,
  showSteps,
  cardRef,
}: QrPreviewTicketProps) {
  return (
    <div className="lg:col-span-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3 px-1 no-print">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Pratinjau Karcis Fisik (Siap Cetak / Tempel)
        </span>
        <span className="text-[11px] font-mono font-semibold text-[var(--forest)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--line)]">
          Ukuran Ideal: A6 / A5
        </span>
      </div>

      {/* CARD FISIK (ID printable-qr-card untuk target @media print) */}
      <div
        id="printable-qr-card"
        ref={cardRef}
        className="w-full max-w-[420px] bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] overflow-hidden relative transition-all"
      >
        {/* Hiasan Robekan Karcis Retro Kiri & Kanan */}
        <div className="ticket-notch-left top-[138px]" />
        <div className="ticket-notch-right top-[138px]" />

        {/* Bagian Atas Karcis: Branding Toko */}
        <div className="p-6 text-center space-y-1.5 bg-gradient-to-b from-[var(--surface-2)]/60 to-white border-b-2 border-dashed border-[var(--forest)]">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] text-[10px] font-bold text-[var(--leaf)] uppercase tracking-wider mb-1">
            <span>Pemesanan Mandiri</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--forest)] tracking-tight">
            {storeName || "Toko Kami"}
          </h2>
          <div className="text-xs font-semibold text-[var(--forest)] uppercase tracking-wider font-mono">
            {tableLabel || "Meja & Kasir"}
          </div>
        </div>

        {/* Bagian Tengah Karcis: QR Code Bintang Utama */}
        <div className="p-6 sm:p-7 text-center space-y-4 bg-white">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--leaf)] block">
              Scan untuk Pesan & Bayar
            </span>
            <p className="text-xs text-[var(--muted)] max-w-[260px] mx-auto">
              Arahkan kamera ponsel Anda ke QR Code di bawah ini untuk melihat menu lengkap
            </p>
          </div>

          {/* QR Code Container Beresolusi Tinggi */}
          <div className="w-[230px] h-[230px] sm:w-[250px] sm:h-[250px] mx-auto bg-white p-3 rounded-xl border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] flex items-center justify-center">
            {isGenerating || !qrPngUrl ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <QrCode className="w-10 h-10 animate-pulse text-[var(--forest)]" />
                <span className="text-xs text-[var(--muted)]">Membuat QR Toko...</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrPngUrl}
                alt={`QR Menu Toko ${storeName}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Tautan URL Cetak (Untuk Pelanggan yang Mengetik Manual) */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Tautan Menu Toko:
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--forest)] max-w-full truncate">
              <span>{fullMenuUrl.replace(/^https?:\/\//, "")}</span>
            </div>
          </div>
        </div>

        {/* Bagian Bawah Karcis: 3 Langkah Pelanggan */}
        {showSteps && (
          <div className="px-5 py-4 bg-[var(--surface-2)]/60 border-t-2 border-dashed border-[var(--forest)]">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-6 rounded-full bg-[var(--forest)] text-white text-[11px] font-bold flex items-center justify-center shadow-[1px_1px_0px_var(--forest)]">
                  1
                </div>
                <span className="text-[10px] font-bold text-[var(--forest)] leading-tight">
                  Pindai QR
                </span>
                <span className="text-[9px] text-[var(--muted)] leading-tight">
                  Buka kamera HP
                </span>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-6 rounded-full bg-[var(--forest)] text-white text-[11px] font-bold flex items-center justify-center shadow-[1px_1px_0px_var(--forest)]">
                  2
                </div>
                <span className="text-[10px] font-bold text-[var(--forest)] leading-tight">
                  Pesan & Bayar
                </span>
                <span className="text-[9px] text-[var(--muted)] leading-tight">
                  QRIS / Tunai
                </span>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-6 rounded-full bg-[var(--forest)] text-white text-[11px] font-bold flex items-center justify-center shadow-[1px_1px_0px_var(--forest)]">
                  3
                </div>
                <span className="text-[10px] font-bold text-[var(--forest)] leading-tight">
                  Ambil Pesanan
                </span>
                <span className="text-[9px] text-[var(--muted)] leading-tight">
                  Cek no. antrian
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Karcis */}
        <div className="py-2.5 px-4 text-center bg-white border-t border-[var(--line)]">
          <span className="text-[10px] text-[var(--muted)] font-medium">
            Didukung oleh <strong className="text-[var(--forest)] font-bold">PayBuy</strong> • Kasir & Menu Mandiri
          </span>
        </div>
      </div>
    </div>
  );
}
