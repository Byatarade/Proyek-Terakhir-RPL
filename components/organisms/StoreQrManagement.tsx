"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Info,
  CheckCircle2,
  Share2,
  FileCode,
  Tag,
  Palette,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

export interface StoreQrManagementProps {
  storeName: string;
  storeSlug: string;
  initialBaseUrl?: string;
}

export function StoreQrManagement({
  storeName,
  storeSlug,
  initialBaseUrl,
}: StoreQrManagementProps) {
  const OFFICIAL_DOMAIN = "https://paybuy.web.id";
  const [baseUrl, setBaseUrl] = useState<string>(initialBaseUrl || OFFICIAL_DOMAIN);
  const [tableLabel, setTableLabel] = useState<string>("Meja & Kasir");
  const [qrColor, setQrColor] = useState<"forest" | "black">("forest");
  const [showSteps, setShowSteps] = useState<boolean>(true);

  const [qrPngUrl, setQrPngUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  const cardRef = useRef<HTMLDivElement>(null);

  // Deteksi URL asal browser (domain tempat aplikasi berjalan)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Jika browser membuka domain resmi atau subdomain web.id, prioritaskan https://paybuy.web.id
      if (window.location.host.includes("web.id")) {
        setBaseUrl("https://paybuy.web.id");
      } else if (window.location.origin.includes("localhost")) {
        // Jika sedang di localhost, tetap gunakan domain live resmi https://paybuy.web.id agar QR dapat discan ponsel
        setBaseUrl("https://paybuy.web.id");
      } else {
        setBaseUrl(window.location.origin || "https://paybuy.web.id");
      }
    }
  }, []);

  // URL menu toko publik yang unik untuk toko ini (FR-QR-01 & FR-QR-04)
  const fullMenuUrl = `${baseUrl || OFFICIAL_DOMAIN}/t/${storeSlug}`;

  // Warna modul QR Code
  const darkColor = qrColor === "forest" ? "#0F3D2A" : "#000000";

  // Generate QR Code saat slug, URL, atau preferensi warna berubah
  useEffect(() => {
    async function generateCodes() {
      if (!storeSlug) return;
      setIsGenerating(true);
      try {
        // 1. Generate High-Res PNG Data URL (1024x1024 untuk cetak tajam)
        const pngUrl = await QRCode.toDataURL(fullMenuUrl, {
          width: 1024,
          margin: 2,
          color: {
            dark: darkColor,
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });
        setQrPngUrl(pngUrl);

        // 2. Generate Scalable Vector SVG
        const svg = await QRCode.toString(fullMenuUrl, {
          type: "svg",
          margin: 2,
          color: {
            dark: darkColor,
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });
        setQrSvgString(svg);
      } catch (err) {
        console.error("Gagal menghasilkan QR Code:", err);
      } finally {
        setIsGenerating(false);
      }
    }

    generateCodes();
  }, [fullMenuUrl, storeSlug, darkColor]);

  // Salin Tautan Menu ke Clipboard
  const handleCopyLink = () => {
    if (!fullMenuUrl) return;
    navigator.clipboard.writeText(fullMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Unduh QR Code Saja (PNG)
  const handleDownloadQrOnly = () => {
    if (!qrPngUrl) return;
    const link = document.createElement("a");
    link.href = qrPngUrl;
    link.download = `qr-menu-${storeSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unduh QR Code Vektor (SVG)
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-menu-${storeSlug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Unduh Poster Karcis Meja Lengkap (PNG High-Res) menggunakan HTML Canvas
  const handleDownloadFullCardPng = () => {
    if (!qrPngUrl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensi poster siap cetak (800 x 1150 px @ 2x scale)
    const width = 800;
    const height = 1150;
    canvas.width = width;
    canvas.height = height;

    // 1. Background putih kertas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // 2. Bingkai luar tebal khas retro nota
    ctx.strokeStyle = "#0F3D2A";
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Bingkai dalam halus
    ctx.strokeStyle = "#CFE0D2";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // 3. Header Karcis
    ctx.fillStyle = "#1B7F45";
    ctx.font = "bold 20px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PAYBUY • PEMESANAN MANDIRI", width / 2, 85);

    // Nama Toko
    ctx.fillStyle = "#0F3D2A";
    ctx.font = "bold 38px Montserrat, sans-serif";
    ctx.fillText(storeName || "Toko Kami", width / 2, 140);

    // Label Meja / Kasir
    if (tableLabel) {
      ctx.fillStyle = "#4F6357";
      ctx.font = "600 20px Inter, sans-serif";
      ctx.fillText(tableLabel.toUpperCase(), width / 2, 175);
    }

    // Garis putus-putus pembatas (Dashed Divider)
    ctx.strokeStyle = "#0F3D2A";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(60, 205);
    ctx.lineTo(width - 60, 205);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Subtitle ajakan
    ctx.fillStyle = "#12201A";
    ctx.font = "bold 22px Montserrat, sans-serif";
    ctx.fillText("PINDAI QR UNTUK PESAN & BAYAR", width / 2, 248);

    ctx.fillStyle = "#4F6357";
    ctx.font = "normal 16px Inter, sans-serif";
    ctx.fillText("Tanpa antre di kasir • Buka kamera ponsel & scan sekarang", width / 2, 278);

    // 4. Gambar QR Code
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 420;
      const qrX = (width - qrSize) / 2;
      const qrY = 310;

      // Kotak latar belakang QR Code dengan shadow blok
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#0F3D2A";
      ctx.lineWidth = 4;
      ctx.strokeRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28);
      ctx.fillRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28);

      // Gambar QR Code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Teks URL Toko di bawah QR
      ctx.fillStyle = "#0F3D2A";
      ctx.font = "bold 18px monospace";
      ctx.fillText(fullMenuUrl.replace(/^https?:\/\//, ""), width / 2, 790);

      // 5. Garis pemisah bawah
      ctx.strokeStyle = "#CFE0D2";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 825);
      ctx.lineTo(width - 60, 825);
      ctx.stroke();

      // 6. Tiga Langkah Mudah Pemesanan
      if (showSteps) {
        ctx.fillStyle = "#0F3D2A";
        ctx.font = "bold 16px Montserrat, sans-serif";
        ctx.fillText("3 LANGKAH MUDAH:", width / 2, 860);

        const steps = [
          "1. Pindai QR di Meja",
          "2. Pilih Menu & Bayar",
          "3. Dapatkan Antrian",
        ];

        ctx.fillStyle = "#12201A";
        ctx.font = "600 16px Inter, sans-serif";
        const stepSpacing = (width - 120) / 3;
        steps.forEach((step, idx) => {
          const stepX = 60 + stepSpacing * idx + stepSpacing / 2;
          ctx.fillText(step, stepX, 900);
        });
      }

      // Footer Karcis
      ctx.fillStyle = "#7A8C80";
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillText("Satu QR Code Seumur Toko • Menu Otomatis Terkini", width / 2, 1070);
      ctx.fillText("Didukung oleh PayBuy", width / 2, 1095);

      // Unduh hasil render canvas
      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `karcis-meja-${storeSlug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    qrImg.src = qrPngUrl;
  };

  // Cetak Langsung menggunakan dialog Print Browser (FR-QR-03)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-5 no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--leaf)] text-xs font-bold mb-2">
            <span>1 QR Code Seumur Toko (FR-QR-04)</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
            Cetak & Unduh QR Menu Toko
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl font-normal">
            Setiap toko memiliki QR menu permanen yang terhubung ke alamat toko Anda. Pelanggan cukup memindai QR ini dari meja tanpa perlu mengunduh aplikasi atau membuat akun.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href={`/t/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <span>Buka Menu Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>

          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            className="gap-2 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_var(--forest)]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Karcis Meja</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid Konten Utama: Kolom Kiri (Pratinjau Karcis) & Kolom Kanan (Kontrol & Panduan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KOLOM KIRI: Pratinjau Karcis / Standee Meja Siap Cetak (design.md 480 & 6.1) */}
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
            {/* Hiasan Robekan Karcis Retro Kiri & Kanan (design.md 6.1) */}
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

        {/* KOLOM KANAN: Panel Aksi Unduh, Kustomisasi & Panduan Cetak */}
        <div className="lg:col-span-6 space-y-5 no-print">
          {/* Card 1: Tombol Aksi Unduh & Cetak */}
          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
              <Download className="w-5 h-5 text-[var(--forest)]" />
              <h3 className="font-heading font-bold text-base text-[var(--forest)]">
                Unduh & Cetak QR Menu
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handlePrint}
                className="w-full gap-2 font-bold shadow-[2px_2px_0px_var(--forest)]"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Karcis Meja</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadFullCardPng}
                className="w-full gap-2 font-bold shadow-[2px_2px_0px_var(--forest)]"
              >
                <Download className="w-4 h-4 text-[var(--leaf)]" />
                <span>Unduh Karcis Lengkap (PNG)</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadQrOnly}
                className="w-full gap-2 text-xs font-semibold"
              >
                <QrCode className="w-4 h-4 text-zinc-600" />
                <span>Unduh QR Saja (PNG)</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadSvg}
                className="w-full gap-2 text-xs font-semibold"
              >
                <FileCode className="w-4 h-4 text-zinc-600" />
                <span>Unduh Vektor (SVG)</span>
              </Button>
            </div>

            {/* Baris Salin Tautan Langsung */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                Alamat Menu Publik Toko Anda:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullMenuUrl}
                  className="flex-1 h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50 text-xs font-mono font-semibold text-[var(--forest)] select-all focus:outline-none"
                />
                <Button
                  variant={copied ? "primary" : "secondary"}
                  size="md"
                  onClick={handleCopyLink}
                  className="gap-1.5 shrink-0 text-xs font-bold"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: Pengaturan Kustomisasi Pratinjau Karcis */}
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
              <Palette className="w-4 h-4 text-[var(--leaf)]" />
              <h3 className="font-heading font-bold text-sm text-[var(--forest)]">
                Kustomisasi Tampilan Karcis
              </h3>
            </div>

            <div className="space-y-4">
              {/* Opsi Nomor Meja / Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--forest)] flex items-center justify-between">
                  <span>Label Posisi / Meja:</span>
                  <span className="text-[10px] font-normal text-[var(--muted)]">
                    (Contoh: Meja 01, Lantai 2, Kasir Utama)
                  </span>
                </label>
                <input
                  type="text"
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  placeholder="Misal: Meja 01 atau Kasir"
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--line)] text-xs text-[var(--forest)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
                />
              </div>

              {/* Opsi Warna QR Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--forest)] block">
                  Pilihan Warna Modul QR:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQrColor("forest")}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all",
                      qrColor === "forest"
                        ? "border-2 border-[var(--forest)] bg-[var(--surface-2)] text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                        : "border-[var(--line)] hover:bg-zinc-50 text-zinc-600"
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#0F3D2A] border border-white" />
                    <span>Hijau PayBuy (Khas)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrColor("black")}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all",
                      qrColor === "black"
                        ? "border-2 border-[var(--forest)] bg-[var(--surface-2)] text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                        : "border-[var(--line)] hover:bg-zinc-50 text-zinc-600"
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#000000] border border-white" />
                    <span>Hitam Standar</span>
                  </button>
                </div>
              </div>

              {/* Toggle Petunjuk Langkah */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-bold text-[var(--forest)] cursor-pointer">
                  Tampilkan Petunjuk 3 Langkah di Karcis
                </label>
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="w-4 h-4 accent-[var(--forest)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Panduan Cetak & Tips Penempatan (PRD FR-QR-04 & BR) */}
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
        </div>
      </div>

      {/* Style CSS Khusus Dialog Print Browser */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan elemen dashboard dari kertas cetak */
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .no-print,
          aside,
          header,
          nav,
          button,
          .topbar {
            display: none !important;
          }

          /* Tampilkan kartu meja di tengah halaman cetak tanpa bayangan */
          #printable-qr-card {
            display: block !important;
            max-width: 480px !important;
            margin: 40px auto !important;
            box-shadow: none !important;
            border: 3px solid #0f3d2a !important;
            border-radius: 12px !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
