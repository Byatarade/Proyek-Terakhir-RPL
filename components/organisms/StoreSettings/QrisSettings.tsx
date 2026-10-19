import React from "react";
import {
  Banknote,
  CreditCard,
  QrCode,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Building2,
  Upload,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

interface QrisSettingsProps {
  acceptCash: boolean;
  onAcceptCashChange: (val: boolean) => void;
  acceptQris: boolean;
  onAcceptQrisChange: (val: boolean) => void;
  currentQrisPayload: string | null;
  currentMerchantName: string | null;
  currentQrDataUrl: string | null;
  isUploadingNew: boolean;
  onSetIsUploadingNew: (val: boolean) => void;
  isScanning: boolean;
  scanError: string | null;
  newPayload: string | null;
  newMerchantName: string | null;
  newMerchantCity: string | null;
  newNmid: string | null;
  newQrDataUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onCancelUploadNew: () => void;
  onRemoveQris: () => void;
  storeName: string;
}

export function QrisSettings({
  acceptCash,
  onAcceptCashChange,
  acceptQris,
  onAcceptQrisChange,
  currentQrisPayload,
  currentMerchantName,
  currentQrDataUrl,
  isUploadingNew,
  onSetIsUploadingNew,
  isScanning,
  scanError,
  newPayload,
  newMerchantName,
  newMerchantCity,
  newNmid,
  newQrDataUrl,
  onFileChange,
  onDrop,
  onCancelUploadNew,
  onRemoveQris,
  storeName,
}: QrisSettingsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Opsi Metode Pembayaran Aktif */}
      <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[var(--forest)]">
            Metode Pembayaran yang Diterima
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Tentukan metode pembayaran yang dapat dipilih oleh pelanggan saat
            checkout di menu publik.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Opsi Tunai */}
          <label
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-[8px] border-2 cursor-pointer transition-all select-none",
              acceptCash
                ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                : "bg-white border-[var(--line)] opacity-70 hover:border-[var(--forest)]"
            )}
          >
            <input
              type="checkbox"
              checked={acceptCash}
              onChange={(e) => onAcceptCashChange(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[var(--leaf)] focus:ring-[var(--leaf)] border-[var(--control)]"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[var(--forest)]" />
                <span className="font-heading font-bold text-sm text-[var(--forest)]">
                  Tunai di Kasir
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Pelanggan memesan secara mandiri, lalu membayar tunai saat
                mengambil pesanan di meja kasir.
              </p>
            </div>
          </label>

          {/* Opsi QRIS */}
          <label
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-[8px] border-2 cursor-pointer transition-all select-none",
              acceptQris
                ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                : "bg-white border-[var(--line)] opacity-70 hover:border-[var(--forest)]"
            )}
          >
            <input
              type="checkbox"
              checked={acceptQris}
              onChange={(e) => {
                const checked = e.target.checked;
                onAcceptQrisChange(checked);
                if (checked && !currentQrisPayload && !newPayload) {
                  onSetIsUploadingNew(true);
                }
              }}
              className="mt-1 w-4 h-4 rounded text-[var(--leaf)] focus:ring-[var(--leaf)] border-[var(--control)]"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--leaf)]" />
                <span className="font-heading font-bold text-sm text-[var(--forest)]">
                  QRIS Milik Toko
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Pelanggan membayar mandiri dengan scan QRIS toko Anda. Nominal
                pesanan otomatis diisi oleh sistem.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* 2. Kartu Manajemen QRIS Toko */}
      {acceptQris && (
        <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-[var(--line)] pb-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[var(--forest)]" />
                <span>Pengaturan QRIS Toko</span>
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Unggah atau perbarui QRIS toko Anda. Sistem akan memanipulasi
                nominal pesanan pelanggan secara otomatis.
              </p>
            </div>

            {currentQrisPayload && !isUploadingNew && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onSetIsUploadingNew(true)}
                className="gap-2 shrink-0 self-start sm:self-auto font-semibold text-xs border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti QRIS Baru</span>
              </Button>
            )}
          </div>

          {/* Kondisi A: QRIS Sedang Aktif & Tidak Sedang Upload Baru */}
          {currentQrisPayload && !isUploadingNew ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[var(--surface-2)] border-2 border-[var(--forest)] rounded-[8px] p-5 shadow-[2px_2px_0px_var(--forest)]">
              {/* Gambar QR */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-[8px] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] w-fit mx-auto md:mx-0">
                {currentQrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentQrDataUrl}
                    alt="QRIS Toko Aktif"
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--forest)]" />
                  </div>
                )}
                <span className="text-[10px] font-semibold text-[var(--forest)] mt-1.5 uppercase tracking-wider">
                  QRIS Toko Aktif
                </span>
              </div>

              {/* Rincian Merchant */}
              <div className="md:col-span-2 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                    Nama Merchant Terdaftar (Tag 59)
                  </span>
                  <div className="font-heading font-extrabold text-lg sm:text-xl text-[var(--forest)]">
                    {currentMerchantName || storeName || "Merchant QRIS"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--mint)] text-[var(--forest)] border-2 border-[var(--forest)] text-xs font-bold shadow-[1px_1px_0px_var(--forest)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Status: Terpasang & Aktif</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-white text-[var(--forest)] border-2 border-[var(--forest)] text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>NMID Nasional Terverifikasi</span>
                  </span>
                </div>

                <p className="text-xs text-[var(--muted)] leading-relaxed pt-1">
                  Pelanggan yang memesan di menu publik toko akan langsung
                  melihat QRIS ini dengan nominal total belanja yang otomatis
                  terisi.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onSetIsUploadingNew(true)}
                    className="gap-1.5 text-xs font-semibold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto QRIS Pengganti</span>
                  </Button>

                  <button
                    type="button"
                    onClick={onRemoveQris}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--danger)] hover:underline p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus QRIS</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Kondisi B: Belum Ada QRIS atau Sedang Klik Ganti QRIS Baru */
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className={cn(
                  "border-2 border-dashed rounded-[8px] p-6 sm:p-8 text-center transition-all cursor-pointer relative",
                  isScanning
                    ? "border-[var(--leaf)] bg-[var(--surface-2)]"
                    : "border-[var(--forest)] hover:bg-[var(--surface-2)] bg-white"
                )}
              >
                <input
                  type="file"
                  id="qris-uploader"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={onFileChange}
                  className="sr-only"
                  disabled={isScanning}
                />

                <label
                  htmlFor="qris-uploader"
                  className="cursor-pointer block space-y-3 w-full h-full select-none"
                >
                  <div className="w-12 h-12 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] flex items-center justify-center mx-auto text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]">
                    {isScanning ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="font-heading font-bold text-sm sm:text-base text-[var(--forest)] block">
                      {isScanning
                        ? "Memindai & Membaca QRIS..."
                        : "Klik atau Seret Foto QRIS Toko ke Sini"}
                    </span>
                    <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                      Format PNG, JPG, atau WEBP. Pastikan kode QR tampak jelas,
                      tidak terpotong, dan tidak buram.
                    </p>
                  </div>
                </label>
              </div>

              {/* Scan Error Alert */}
              {scanError && (
                <div className="p-3.5 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] text-xs text-red-700 font-semibold shadow-[2px_2px_0px_var(--danger)] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Preview Hasil Scan QRIS Baru */}
              {newPayload && (
                <div className="p-4 sm:p-5 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--leaf)] uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>QRIS Berhasil Dipindai & Valid</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-white p-4 rounded-[8px] border-2 border-[var(--forest)]">
                    {newQrDataUrl && (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={newQrDataUrl}
                          alt="Pratinjau QR Baru"
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                          Nama Merchant Terbaca:
                        </span>
                        <div className="font-heading font-bold text-base text-[var(--forest)]">
                          {newMerchantName}
                        </div>
                      </div>

                      {newNmid && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                            NMID:
                          </span>
                          <div className="text-xs font-mono font-medium text-[var(--forest)]">
                            {newNmid}
                          </div>
                        </div>
                      )}

                      {newMerchantCity && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                            Kota:
                          </span>
                          <div className="text-xs font-medium text-[var(--forest)]">
                            {newMerchantCity}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {currentQrisPayload && (
                      <button
                        type="button"
                        onClick={onCancelUploadNew}
                        className="text-xs text-[var(--muted)] hover:text-[var(--forest)] font-semibold underline cursor-pointer"
                      >
                        Batal Ganti
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
