"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Banknote,
  CreditCard,
  Building2,
  RefreshCw,
  Trash2,
  ExternalLink,
  Store,
  Clock,
  Globe,
  Copy,
  Check,
  Lock,
  Power,
  Info,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";
import Link from "next/link";
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

const EXPIRY_PRESETS = [
  { label: "5 Menit (Cepat)", value: 5 },
  { label: "10 Menit", value: 10 },
  { label: "15 Menit (Standar)", value: 15 },
  { label: "30 Menit", value: 30 },
  { label: "60 Menit (1 Jam)", value: 60 },
];

const TIMEZONE_OPTIONS = [
  {
    value: "Asia/Jakarta",
    label: "WIB — Waktu Indonesia Barat (UTC+7)",
    cities: "Jakarta, Surabaya, Medan, Bandung",
  },
  {
    value: "Asia/Makassar",
    label: "WITA — Waktu Indonesia Tengah (UTC+8)",
    cities: "Denpasar (Bali), Makassar, Balikpapan, Manado",
  },
  {
    value: "Asia/Jayapura",
    label: "WIT — Waktu Indonesia Timur (UTC+9)",
    cities: "Jayapura, Ambon, Sorong, Merauke",
  },
];

export function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "payment" | "system">("general");

  // Form Fields
  const [storeData, setStoreData] = useState<StoreDetailData | null>(null);
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [orderExpiryMinutes, setOrderExpiryMinutes] = useState(15);
  const [acceptCash, setAcceptCash] = useState(true);
  const [acceptQris, setAcceptQris] = useState(false);
  const [currentQrisPayload, setCurrentQrisPayload] = useState<string | null>(null);
  const [currentMerchantName, setCurrentMerchantName] = useState<string | null>(null);
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
      setScanError(err instanceof Error ? err.message : "Gagal memproses berkas QRIS.");
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
      setSaveError("Silakan unggah gambar QRIS terlebih dahulu jika opsi QRIS diaktifkan.");
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
    if (!confirm("Apakah Anda yakin ingin menonaktifkan dan menghapus QRIS dari toko ini?")) {
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
        <p className="text-xs text-[var(--muted)] font-medium">Memuat konfigurasi pengaturan toko...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-white max-w-4xl">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--forest)]">
            Pengaturan Toko & Operasional
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Kelola profil toko, status buka/tutup, durasi kedaluwarsa pesanan, zona waktu, dan integrasi QRIS.
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
            <Power className={cn("w-4 h-4", isOpen ? "text-emerald-700" : "text-zinc-500")} />
          )}
          <span>Status: {isOpen ? "Toko Buka (Menerima Pesanan)" : "Toko Tutup (Pemesanan Nonaktif)"}</span>
        </button>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-[8px] bg-emerald-50 border-2 border-[var(--leaf)] text-emerald-900 shadow-[3px_3px_0px_var(--forest)] flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[var(--leaf)] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            Pengaturan toko berhasil diperbarui! Perubahan langsung berlaku pada menu publik dan sistem kasir.
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
      <div className="flex border-b-2 border-[var(--forest)] gap-2 select-none overflow-x-auto">
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
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* A. Status Buka / Tutup Toko (FR-ST-04) */}
          <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
                <Power className="w-4 h-4 text-[var(--forest)]" />
                <span>Status Operasional Toko (Buka / Tutup)</span>
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Atur apakah toko Anda sedang aktif menerima pesanan dari pelanggan atau sedang tutup sementara.
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
                  onChange={() => setIsOpen(true)}
                  className="mt-1 w-4 h-4 text-[var(--leaf)] focus:ring-[var(--leaf)]"
                />
                <div className="space-y-1">
                  <span className="font-heading font-bold text-sm text-[var(--forest)] block">
                    🟢 Toko Buka (Menerima Pesanan)
                  </span>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Menu publik aktif sepenuhnya. Pelanggan dapat membuat pesanan mandiri via scan QR meja atau tautan menu.
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
                  onChange={() => setIsOpen(false)}
                  className="mt-1 w-4 h-4 text-amber-700 focus:ring-amber-600"
                />
                <div className="space-y-1">
                  <span className="font-heading font-bold text-sm text-amber-900 block">
                    🔴 Toko Tutup Sementara
                  </span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Menu tetap dapat dilihat untuk informasi harga, namun tombol checkout pesanan dinonaktifkan sementara.
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
                Nama toko yang ditampilkan pada nota pesanan, layar antrian, dan menu publik pelanggan.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Nama Toko */}
              <div className="space-y-1.5">
                <label htmlFor="store-name" className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
                  Nama Toko / Usaha <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  id="store-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ababil Cake & Bakery"
                  className="w-full px-3.5 py-2.5 rounded-[6px] border-2 border-[var(--forest)] bg-white text-sm text-[var(--forest)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[2px_2px_0px_var(--forest)]"
                />
              </div>

              {/* Slug Toko (Terkunci FR-ST-02) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="store-slug" className="text-xs font-bold text-[var(--forest)] uppercase tracking-wider block">
                    Slug Menu Publik (Alamat QR Meja)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
                    <Lock className="w-3 h-3 text-[var(--forest)]" />
                    <span>Terkunci Permanen (FR-ST-02)</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-[6px] border-2 border-[var(--forest)] bg-zinc-100 text-xs font-mono text-[var(--forest)] font-bold select-all">
                    <span>{typeof window !== "undefined" ? window.location.origin : ""}/t/</span>
                    <span className="text-[var(--leaf)] underline underline-offset-2">{storeData?.slug}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyLink}
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

                    <Link href={`/t/${storeData?.slug}`} target="_blank" rel="noopener noreferrer">
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
                  Slug bersifat permanen agar seluruh stiker QR Code meja yang sudah dicetak tidak rusak atau kedaluwarsa.
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
                Berapa lama pelanggan diberi waktu untuk menyelesaikan pembayaran sebelum pesanan otomatis dibatalkan oleh sistem.
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
                      onClick={() => setOrderExpiryMinutes(preset.value)}
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
                <span className="text-xs font-bold text-[var(--forest)]">Durasi Kustom:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={orderExpiryMinutes}
                    onChange={(e) => setOrderExpiryMinutes(Number(e.target.value) || 15)}
                    className="w-24 px-3 py-1.5 rounded-[6px] border-2 border-[var(--forest)] bg-white text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"
                  />
                  <span className="text-xs text-[var(--muted)] font-medium">Menit</span>
                </div>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[var(--surface-2)] border-2 border-[var(--forest)] text-xs text-[var(--forest)] space-y-1 shadow-[2px_2px_0px_var(--forest)]">
                <div className="flex items-center gap-2 font-bold text-[var(--leaf)]">
                  <Info className="w-4 h-4" />
                  <span>Mekanisme Pembersihan Pesanan Otomatis (BR-04)</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Pesanan berstatus <strong>Menunggu Bayar</strong> yang melewati batas waktu di atas akan otomatis beralih menjadi <strong>Kedaluwarsa</strong>. Antrian tidak akan menumpuk dan stok produk tetap terjaga.
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
                Zona waktu digunakan untuk mereset nomor antrian harian kembali ke #001 tepat di tengah malam dan mengelompokkan laporan penjualan.
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
                      onChange={(e) => setTimezone(e.target.value)}
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
      )}

      {/* TAB 2: METODE BAYAR & QRIS */}
      {activeTab === "payment" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 1. Opsi Metode Pembayaran Aktif */}
          <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[var(--forest)]">
                Metode Pembayaran yang Diterima
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Tentukan metode pembayaran yang dapat dipilih oleh pelanggan saat checkout di menu publik.
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
                  onChange={(e) => setAcceptCash(e.target.value === "true" || e.target.checked)}
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
                    Pelanggan memesan secara mandiri, lalu membayar tunai saat mengambil pesanan di meja kasir.
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
                    setAcceptQris(checked);
                    if (checked && !currentQrisPayload && !newPayload) {
                      setIsUploadingNew(true);
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
                    Pelanggan membayar mandiri dengan scan QRIS toko Anda. Nominal pesanan otomatis diisi oleh sistem.
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
                    Unggah atau perbarui QRIS toko Anda. Sistem akan memanipulasi nominal pesanan pelanggan secara otomatis.
                  </p>
                </div>

                {currentQrisPayload && !isUploadingNew && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsUploadingNew(true)}
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
                        {currentMerchantName || storeData?.name || "Merchant QRIS"}
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
                      Pelanggan yang memesan di menu publik toko akan langsung melihat QRIS ini dengan nominal total belanja yang otomatis terisi.
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsUploadingNew(true)}
                        className="gap-1.5 text-xs font-semibold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Foto QRIS Pengganti</span>
                      </Button>

                      <button
                        type="button"
                        onClick={handleRemoveQris}
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
                    onDrop={handleDrop}
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
                      onChange={handleFileChange}
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
                          Format PNG, JPG, atau WEBP. Pastikan kode QR tampak jelas, tidak terpotong, dan tidak buram.
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
                            onClick={() => {
                              setIsUploadingNew(false);
                              setNewPayload(null);
                            }}
                            className="text-xs text-[var(--muted)] hover:text-[var(--forest)] font-semibold underline"
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
      )}

      {/* TAB 3: PAKET & SISTEM */}
      {activeTab === "system" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <section className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-5 sm:p-6 shadow-[3px_3px_0px_var(--forest)] space-y-5">
            <div>
              <h2 className="font-heading font-bold text-base text-[var(--forest)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--forest)]" />
                <span>Informasi Akun Toko</span>
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Rincian langganan paket toko dan metadata sistem PayBuy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
                  Paket Langganan
                </span>
                <div className="font-heading font-extrabold text-lg text-[var(--forest)] uppercase">
                  {storeData?.plan === "maximal"
                    ? "Paket Maximal"
                    : storeData?.plan === "pro"
                    ? "Paket Pro"
                    : "Paket Gratis (Free)"}
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  Mendukung menu mandiri tanpa batas, QRIS dinamis, dan sistem POS kasir.
                </p>
              </div>

              <div className="p-4 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
                  Terdaftar Sejak
                </span>
                <div className="font-heading font-bold text-base text-[var(--forest)]">
                  {storeData?.createdAt
                    ? new Date(storeData.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  ID Toko: <span className="font-mono text-[10px]">{storeData?.id}</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

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
