"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Printer, ExternalLink } from "lucide-react";
import { Button } from "@/components/atoms/Button";

import {
  StoreQrManagementProps,
  QrColorType,
} from "./types";
import { QrPreviewTicket } from "./QrPreviewTicket";
import { QrActionPanel } from "./QrActionPanel";
import { QrCustomizePanel } from "./QrCustomizePanel";
import { QrTipsCard } from "./QrTipsCard";

export type { StoreQrManagementProps } from "./types";

export function StoreQrManagement({
  storeName,
  storeSlug,
  initialBaseUrl,
}: StoreQrManagementProps) {
  const OFFICIAL_DOMAIN = "https://paybuy.web.id";
  const [baseUrl, setBaseUrl] = useState<string>(initialBaseUrl || OFFICIAL_DOMAIN);
  const [tableLabel, setTableLabel] = useState<string>("Meja & Kasir");
  const [qrColor, setQrColor] = useState<QrColorType>("forest");
  const [showSteps, setShowSteps] = useState<boolean>(true);

  const [qrPngUrl, setQrPngUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  const cardRef = useRef<HTMLDivElement>(null);

  // Deteksi URL asal browser (domain tempat aplikasi berjalan)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (window.location.host.includes("web.id")) {
          setBaseUrl("https://paybuy.web.id");
        } else if (window.location.origin.includes("localhost")) {
          setBaseUrl("https://paybuy.web.id");
        } else {
          setBaseUrl(window.location.origin || "https://paybuy.web.id");
        }
      }, 0);
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
        {/* KOLOM KIRI: Pratinjau Karcis / Standee Meja Siap Cetak */}
        <QrPreviewTicket
          storeName={storeName}
          tableLabel={tableLabel}
          fullMenuUrl={fullMenuUrl}
          qrPngUrl={qrPngUrl}
          isGenerating={isGenerating}
          showSteps={showSteps}
          cardRef={cardRef}
        />

        {/* KOLOM KANAN: Panel Aksi Unduh, Kustomisasi & Panduan Cetak */}
        <div className="lg:col-span-6 space-y-5 no-print">
          <QrActionPanel
            fullMenuUrl={fullMenuUrl}
            copied={copied}
            onCopyLink={handleCopyLink}
            onPrint={handlePrint}
            onDownloadFullCardPng={handleDownloadFullCardPng}
            onDownloadQrOnly={handleDownloadQrOnly}
            onDownloadSvg={handleDownloadSvg}
          />

          <QrCustomizePanel
            tableLabel={tableLabel}
            setTableLabel={setTableLabel}
            qrColor={qrColor}
            setQrColor={setQrColor}
            showSteps={showSteps}
            setShowSteps={setShowSteps}
          />

          <QrTipsCard />
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
