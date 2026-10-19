import React from "react";
import { Download, Printer, QrCode, FileCode, Check, Copy } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { QrActionPanelProps } from "./types";

export function QrActionPanel({
  fullMenuUrl,
  copied,
  onCopyLink,
  onPrint,
  onDownloadFullCardPng,
  onDownloadQrOnly,
  onDownloadSvg,
}: QrActionPanelProps) {
  return (
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
          onClick={onPrint}
          className="w-full gap-2 font-bold shadow-[2px_2px_0px_var(--forest)]"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Karcis Meja</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onDownloadFullCardPng}
          className="w-full gap-2 font-bold shadow-[2px_2px_0px_var(--forest)]"
        >
          <Download className="w-4 h-4 text-[var(--leaf)]" />
          <span>Unduh Karcis Lengkap (PNG)</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onDownloadQrOnly}
          className="w-full gap-2 text-xs font-semibold"
        >
          <QrCode className="w-4 h-4 text-zinc-600" />
          <span>Unduh QR Saja (PNG)</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onDownloadSvg}
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
            onClick={onCopyLink}
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
  );
}
