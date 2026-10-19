"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  CreditCard,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { readQrFromImageFile } from "@/lib/payments/scanner";
import { validateQris } from "@/lib/payments/qris";
import {
  getStoreSettingsAction,
  updateStoreSettingsAction,
  toggleStoreOpenStatusAction,
  StoreDetailData,
} from "@/lib/stores/actions";

import { StoreSettingsProps } from "./types";
import { GeneralSettings } from "./GeneralSettings";
import { QrisSettings } from "./QrisSettings";
import { SystemInfo } from "./SystemInfo";

export * from "./types";

export function StoreSettings({ className }: StoreSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "payment" | "system">(
    "general"
  );

  // Form Fields
  const [storeData, setStoreData] = useState<StoreDetailData | null>(null);
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [orderExpiryMinutes, setOrderExpiryMinutes] = useState(15);
  const [acceptCash, setAcceptCash] = useState(true);
  const [acceptQris, setAcceptQris] = useState(false);
  const [currentQrisPayload, setCurrentQrisPayload] = useState<string | null>(
    null
  );
  const [currentMerchantName, setCurrentMerchantName] = useState<
    string | null
  >(null);
  const [currentQrDataUrl, setCurrentQrDataUrl] = useState<string | null>(null);

  // New QR upload state
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [newPayload, setNewPayload] = useState<string | null>(null);
  const [newMerchantName, setNewMerchantName] = useState<string | null>(null);
  const [newMerchantCity, setNewMerchantCity] = useState<string | null>(null);
  const [newNmid, setNewNmid] = useState<string | null>(null);
  const [newQrDataUrl, setNewQrDataUrl] = useState<string | null>(null);

  const [copiedSlug, setCopiedSlug] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [isTogglingOpen, startToggleTransition] = useTransition();

  // Load existing store settings
  useEffect(() => {
    async function loadSettings() {
      const res = await getStoreSettingsAction();
      if (res.success && res.data) {
        setStoreData(res.data);
        setName(res.data.name);
        setIsOpen(res.data.isOpen);
        setTimezone(res.data.timezone || "Asia/Jakarta");
        setOrderExpiryMinutes(res.data.orderExpiryMinutes || 15);
        setAcceptCash(res.data.acceptCash);
        setAcceptQris(res.data.acceptQris);
        setCurrentQrisPayload(res.data.qrisPayload);
        setCurrentMerchantName(res.data.qrisMerchantName);

        if (res.data.qrisPayload) {
          try {
            const url = await QRCode.toDataURL(res.data.qrisPayload, {
              width: 220,
              margin: 2,
              color: { dark: "#0F3D2A", light: "#FFFFFF" },
            });
            setCurrentQrDataUrl(url);
          } catch {
            // ignore
          }
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  // Process uploaded image file
  const processImageFile = async (file: File) => {
    try {
      setIsScanning(true);
      setScanError(null);

      const scanRes = await readQrFromImageFile(file);
      if (!scanRes.success || !scanRes.data) {
        setScanError(
          scanRes.error ||
            "Kode QR tidak terdeteksi pada gambar. Pastikan gambar jelas, tidak buram, dan QRIS berada di tengah."
        );
        setIsScanning(false);
        return;
      }

      // Validasi struktur QRIS
      const validation = validateQris(scanRes.data);
      if (!validation.valid) {
        setScanError(
          validation.error ||
            "Format kode QR yang diunggah bukan kode QRIS standar Bank Indonesia."
        );
        setIsScanning(false);
        return;
      }

      setNewPayload(scanRes.data);
      setNewMerchantName(validation.merchantName || "Merchant QRIS");
      setNewMerchantCity(validation.merchantCity || null);
      setNewNmid(validation.nmid || null);

      const url = await QRCode.toDataURL(scanRes.data, {
        width: 220,
        margin: 2,
        color: { dark: "#0F3D2A", light: "#FFFFFF" },
      });
      setNewQrDataUrl(url);
      setScanError(null);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Gagal memproses berkas QRIS."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Salin Link Menu Publik
  const handleCopyLink = () => {
    if (!storeData?.slug) return;
    const url = `${window.location.origin}/t/${storeData.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  // Toggle Buka/Tutup Cepat
  const handleToggleStoreOpen = () => {
    startToggleTransition(async () => {
      const res = await toggleStoreOpenStatusAction();
      if (res.success && res.data) {
        setIsOpen(res.data.isOpen);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  // Save changes
  const handleSaveSettings = () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (!name.trim()) {
      setSaveError("Nama toko wajib diisi.");
      return;
    }

    const payloadToSave = newPayload || currentQrisPayload;
    const merchantNameToSave = newMerchantName || currentMerchantName;

    if (acceptQris && !payloadToSave) {
      setSaveError(
        "Silakan unggah gambar QRIS terlebih dahulu jika opsi QRIS diaktifkan."
      );
      return;
    }

    if (!acceptCash && !acceptQris) {
      setSaveError("Pilih minimal satu metode pembayaran (Tunai atau QRIS).");
      return;
    }

    startTransition(async () => {
      const res = await updateStoreSettingsAction({
        name,
        isOpen,
        timezone,
        orderExpiryMinutes,
        acceptCash,
        acceptQris,
        qrisPayload: acceptQris ? payloadToSave : null,
        qrisMerchantName: acceptQris ? merchantNameToSave : null,
      });

      if (!res.success || !res.data) {
        setSaveError(res.error || "Gagal menyimpan pengaturan toko.");
        return;
      }

      setStoreData(res.data);
      setSaveSuccess(true);

      if (newPayload) {
        setCurrentQrisPayload(newPayload);
        setCurrentMerchantName(newMerchantName);
        setCurrentQrDataUrl(newQrDataUrl);
        setIsUploadingNew(false);
        setNewPayload(null);
        setNewMerchantName(null);
        setNewQrDataUrl(null);
      }

      setTimeout(() => setSaveSuccess(false), 4000);
    });
  };

  // Remove QRIS
  const handleRemoveQris = () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menonaktifkan dan menghapus QRIS dari toko ini?"
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await updateStoreSettingsAction({
        name,
        isOpen,
        timezone,
        orderExpiryMinutes,
        acceptCash: true,
        acceptQris: false,
        qrisPayload: null,
        qrisMerchantName: null,
      });
      if (res.success && res.data) {
        setAcceptQris(false);
        setCurrentQrisPayload(null);
        setCurrentMerchantName(null);
        setCurrentQrDataUrl(null);
        setStoreData(res.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--leaf)] mx-auto" />
        <p className="text-xs text-[var(--muted)] font-medium">
          Memuat konfigurasi pengaturan toko...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 sm:space-y-8 bg-white max-w-4xl", className)}>
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--forest)]">
            Pengaturan Toko & Operasional
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Kelola profil toko, status buka/tutup, durasi kedaluwarsa pesanan,
            zona waktu, dan integrasi QRIS.
          </p>
        </div>

        {/* Quick Toggle Store Open Status (FR-ST-04) */}
        <button
          type="button"
          onClick={handleToggleStoreOpen}
          disabled={isTogglingOpen}
          className={cn(
            "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[8px] border-2 font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer select-none shrink-0 shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
            isOpen
              ? "bg-[var(--mint)] border-[var(--forest)] text-[var(--forest)]"
              : "bg-zinc-100 border-[var(--forest)] text-zinc-700"
          )}
        >
          {isTogglingOpen ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--forest)]" />
          ) : (
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full ring-2 shrink-0 inline-block",
                isOpen
                  ? "bg-emerald-600 ring-emerald-300 animate-pulse"
                  : "bg-rose-500 ring-rose-200"
              )}
            />
          )}
          <span>
            Status:{" "}
            {isOpen
              ? "Toko Buka (Menerima Pesanan)"
              : "Toko Tutup (Pemesanan Nonaktif)"}
          </span>
        </button>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-[8px] bg-emerald-50 border-2 border-[var(--leaf)] text-emerald-900 shadow-[3px_3px_0px_var(--forest)] flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            Pengaturan toko berhasil diperbarui! Perubahan langsung berlaku pada
            menu publik dan sistem kasir.
          </div>
        </div>
      )}

      {/* Error Alert */}
      {saveError && (
        <div className="p-4 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] text-red-900 shadow-[3px_3px_0px_var(--danger)] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">{saveError}</div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-[var(--forest)] gap-2 select-none overflow-x-auto overflow-y-hidden pt-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-heading font-bold text-xs sm:text-sm rounded-t-[8px] border-t-2 border-x-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "general"
              ? "bg-[var(--surface-2)] border-[var(--forest)] text-[var(--forest)] shadow-[2px_-2px_0px_var(--forest)] -mb-[2px] pb-[12px]"
              : "bg-white border-transparent text-[var(--muted)] hover:text-[var(--forest)]"
          )}
        >
          <Store className="w-4 h-4 text-[var(--forest)]" />
          <span>Profil & Operasional</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payment")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-heading font-bold text-xs sm:text-sm rounded-t-[8px] border-t-2 border-x-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "payment"
              ? "bg-[var(--surface-2)] border-[var(--forest)] text-[var(--forest)] shadow-[2px_-2px_0px_var(--forest)] -mb-[2px] pb-[12px]"
              : "bg-white border-transparent text-[var(--muted)] hover:text-[var(--forest)]"
          )}
        >
          <CreditCard className="w-4 h-4 text-[var(--leaf)]" />
          <span>Metode Bayar & QRIS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-heading font-bold text-xs sm:text-sm rounded-t-[8px] border-t-2 border-x-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "system"
              ? "bg-[var(--surface-2)] border-[var(--forest)] text-[var(--forest)] shadow-[2px_-2px_0px_var(--forest)] -mb-[2px] pb-[12px]"
              : "bg-white border-transparent text-[var(--muted)] hover:text-[var(--forest)]"
          )}
        >
          <ShieldCheck className="w-4 h-4 text-[var(--forest)]" />
          <span>Paket & Informasi</span>
        </button>
      </div>

      {/* TAB 1: PROFIL & OPERASIONAL */}
      {activeTab === "general" && (
        <GeneralSettings
          isOpen={isOpen}
          onIsOpenChange={setIsOpen}
          name={name}
          onNameChange={setName}
          storeData={storeData}
          copiedSlug={copiedSlug}
          onCopyLink={handleCopyLink}
          orderExpiryMinutes={orderExpiryMinutes}
          onOrderExpiryMinutesChange={setOrderExpiryMinutes}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
      )}

      {/* TAB 2: METODE BAYAR & QRIS */}
      {activeTab === "payment" && (
        <QrisSettings
          acceptCash={acceptCash}
          onAcceptCashChange={setAcceptCash}
          acceptQris={acceptQris}
          onAcceptQrisChange={setAcceptQris}
          currentQrisPayload={currentQrisPayload}
          currentMerchantName={currentMerchantName}
          currentQrDataUrl={currentQrDataUrl}
          isUploadingNew={isUploadingNew}
          onSetIsUploadingNew={setIsUploadingNew}
          isScanning={isScanning}
          scanError={scanError}
          newPayload={newPayload}
          newMerchantName={newMerchantName}
          newMerchantCity={newMerchantCity}
          newNmid={newNmid}
          newQrDataUrl={newQrDataUrl}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onCancelUploadNew={() => {
            setIsUploadingNew(false);
            setNewPayload(null);
          }}
          onRemoveQris={handleRemoveQris}
          storeName={storeData?.name || name}
        />
      )}

      {/* TAB 3: PAKET & SISTEM */}
      {activeTab === "system" && <SystemInfo storeData={storeData} />}

      {/* Action Footer: Tombol Simpan Pengaturan */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-[var(--forest)]">
        {storeData?.slug && (
          <Link
            href={`/t/${storeData.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--forest)] hover:underline self-start sm:self-auto"
          >
            <span>Lihat Tampilan Menu Publik Toko</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full sm:w-auto gap-2 font-bold text-sm sm:text-base px-6 h-12 shadow-[3px_3px_0px_var(--forest)] border-2 border-[var(--forest)]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menyimpan Pengaturan...</span>
            </>
          ) : (
            <span>Simpan Seluruh Pengaturan</span>
          )}
        </Button>
      </div>
    </div>
  );
}
