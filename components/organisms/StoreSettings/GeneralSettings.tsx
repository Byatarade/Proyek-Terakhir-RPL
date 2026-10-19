import React from "react";
import Link from "next/link";
import {
  Power,
  Store,
  Lock,
  Check,
  Copy,
  ExternalLink,
  Clock,
  Info,
  Globe,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { StoreDetailData } from "@/lib/stores/actions";
import { EXPIRY_PRESETS, TIMEZONE_OPTIONS } from "./types";

interface GeneralSettingsProps {
  isOpen: boolean;
  onIsOpenChange: (val: boolean) => void;
  name: string;
  onNameChange: (val: string) => void;
  storeData: StoreDetailData | null;
  copiedSlug: boolean;
  onCopyLink: () => void;
  orderExpiryMinutes: number;
  onOrderExpiryMinutesChange: (val: number) => void;
  timezone: string;
  onTimezoneChange: (val: string) => void;
}

export function GeneralSettings({
  isOpen,
  onIsOpenChange,
  name,
  onNameChange,
  storeData,
  copiedSlug,
  onCopyLink,
  orderExpiryMinutes,
  onOrderExpiryMinutesChange,
  timezone,
  onTimezoneChange,
}: GeneralSettingsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* A. Status Buka / Tutup Toko (FR-ST-04) */}
      <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
            <Power className="w-4 h-4 text-[var(--forest)]" />
            <span>Status Operasional Toko (Buka / Tutup)</span>
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Atur apakah toko Anda sedang aktif menerima pesanan dari pelanggan
            atau sedang tutup sementara.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label
            className={cn(
              "flex items-start gap-3 p-4 rounded-[8px] border-2 cursor-pointer transition-all select-none",
              isOpen
                ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                : "bg-white border-[var(--line)] opacity-70 hover:border-[var(--forest)]"
            )}
          >
            <input
              type="radio"
              name="store_open_radio"
              checked={isOpen}
              onChange={() => onIsOpenChange(true)}
              className="mt-1 w-4 h-4 text-[var(--leaf)] focus:ring-[var(--leaf)]"
            />
            <div className="space-y-1 w-full">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0 inline-block" />
                <span className="font-heading font-bold text-sm text-[var(--forest)]">
                  Toko Buka (Menerima Pesanan)
                </span>
                <span className="ml-auto text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Aktif
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Menu publik aktif sepenuhnya. Pelanggan dapat membuat pesanan
                mandiri via scan QR meja atau tautan menu.
              </p>
            </div>
          </label>

          <label
            className={cn(
              "flex items-start gap-3 p-4 rounded-[8px] border-2 cursor-pointer transition-all select-none",
              !isOpen
                ? "bg-amber-50 border-amber-600 shadow-[2px_2px_0px_#b45309]"
                : "bg-white border-[var(--line)] opacity-70 hover:border-[var(--forest)]"
            )}
          >
            <input
              type="radio"
              name="store_open_radio"
              checked={!isOpen}
              onChange={() => onIsOpenChange(false)}
              className="mt-1 w-4 h-4 text-amber-700 focus:ring-amber-600"
            />
            <div className="space-y-1 w-full">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200 shrink-0 inline-block" />
                <span className="font-heading font-bold text-sm text-amber-900">
                  Toko Tutup Sementara
                </span>
                <span className="ml-auto text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                  Nonaktif
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Menu tetap dapat dilihat untuk informasi harga, namun tombol
                checkout pesanan dinonaktifkan sementara.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* B. Identitas & Slug Toko (FR-ST-01, FR-ST-02) */}
      <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
            <Store className="w-4 h-4 text-[var(--forest)]" />
            <span>Identitas & Alamat Menu Toko</span>
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Nama toko yang ditampilkan pada nota pesanan, layar antrian, dan
            menu publik pelanggan.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {/* Nama Toko */}
          <div className="space-y-1.5">
            <label
              htmlFor="store-name"
              className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block"
            >
              Nama Toko / Usaha <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id="store-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Contoh: Ababil Cake & Bakery"
              className="w-full px-3.5 py-2.5 rounded-[6px] border-2 border-[var(--forest)] bg-white text-sm text-[var(--forest)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[2px_2px_0px_var(--forest)]"
            />
          </div>

          {/* Slug Toko (Terkunci FR-ST-02) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="store-slug"
                className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block"
              >
                Slug Menu Publik (Alamat QR Meja)
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
                <Lock className="w-3 h-3 text-[var(--forest)]" />
                <span>Terkunci Permanen (FR-ST-02)</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-[6px] border-2 border-[var(--forest)] bg-zinc-100 text-xs font-mono text-[var(--forest)] font-bold select-all">
                <span>
                  {typeof window !== "undefined" ? window.location.origin : ""}
                  /t/
                </span>
                <span className="text-[var(--leaf)] underline underline-offset-2">
                  {storeData?.slug}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onCopyLink}
                  className="gap-1.5 text-xs font-bold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                >
                  {copiedSlug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[var(--leaf)]" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </Button>

                <Link
                  href={`/t/${storeData?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs font-bold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Menu</span>
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Slug bersifat permanen agar seluruh stiker QR Code meja yang sudah
              dicetak tidak rusak atau kedaluwarsa.
            </p>
          </div>
        </div>
      </section>

      {/* C. Auto-Expiry & Batas Waktu Pembayaran (FR-ST-05, BR-04) */}
      <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--forest)]" />
            <span>Batas Waktu Kedaluwarsa Pesanan (Auto-Expiry)</span>
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Berapa lama pelanggan diberi waktu untuk menyelesaikan pembayaran
            sebelum pesanan otomatis dibatalkan oleh sistem.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap gap-2">
            {EXPIRY_PRESETS.map((preset) => {
              const isSelected = orderExpiryMinutes === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onOrderExpiryMinutesChange(preset.value)}
                  className={cn(
                    "px-3.5 py-2 rounded-[6px] border-2 font-heading font-bold text-xs transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--mint)]"
                      : "bg-white text-[var(--forest)] border-[var(--forest)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-bold text-[var(--forest)]">
              Durasi Kustom:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="1440"
                value={orderExpiryMinutes}
                onChange={(e) =>
                  onOrderExpiryMinutesChange(Number(e.target.value) || 15)
                }
                className="w-24 px-3 py-1.5 rounded-[6px] border-2 border-[var(--forest)] bg-white text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"
              />
              <span className="text-xs text-[var(--muted)] font-medium">
                Menit
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[var(--surface-2)] border-2 border-[var(--forest)] text-xs text-[var(--forest)] space-y-1 shadow-[2px_2px_0px_var(--forest)]">
            <div className="flex items-center gap-2 font-bold text-[var(--leaf)]">
              <Info className="w-4 h-4" />
              <span>Mekanisme Pembersihan Pesanan Otomatis (BR-04)</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Pesanan berstatus <strong>Menunggu Bayar</strong> yang melewati
              batas waktu di atas akan otomatis beralih menjadi{" "}
              <strong>Kedaluwarsa</strong>. Antrian tidak akan menumpuk dan stok
              produk tetap terjaga.
            </p>
          </div>
        </div>
      </section>

      {/* D. Zona Waktu Toko (FR-ST-06) */}
      <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--forest)]" />
            <span>Zona Waktu Operasional Toko</span>
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Zona waktu digunakan untuk mereset nomor antrian harian kembali ke
            #001 tepat di tengah malam dan mengelompokkan laporan penjualan.
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {TIMEZONE_OPTIONS.map((tz) => {
            const isSelected = timezone === tz.value;
            return (
              <label
                key={tz.value}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-[8px] border-2 cursor-pointer transition-all select-none",
                  isSelected
                    ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                    : "bg-white border-[var(--line)] opacity-75 hover:border-[var(--forest)]"
                )}
              >
                <input
                  type="radio"
                  name="store_timezone_radio"
                  value={tz.value}
                  checked={isSelected}
                  onChange={(e) => onTimezoneChange(e.target.value)}
                  className="mt-0.5 w-4 h-4 text-[var(--leaf)] focus:ring-[var(--leaf)]"
                />
                <div className="space-y-0.5">
                  <span className="font-heading font-bold text-xs sm:text-sm text-[var(--forest)] block">
                    {tz.label}
                  </span>
                  <span className="text-[11px] text-[var(--muted)] block">
                    Cakupan Wilayah: {tz.cities}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
