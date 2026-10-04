"use client";

import React, { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { TicketCard, TicketPerforation } from "@/components/molecules/TicketCard";
import { readQrFromImageFile } from "@/lib/payments/scanner";
import { validateQris, crc16 } from "@/lib/payments/qris";
import {
  saveStorePaymentSettingsAction,
  StoreOnboardingData,
} from "@/lib/stores/actions";

interface OnboardingWizardProps {
  initialStore: StoreOnboardingData;
}

export function OnboardingWizard({ initialStore }: OnboardingWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Wizard Step: 1 = Toko, 2 = Pertanyaan QRIS (Inti PRD), 3 = Selesai
  const [step, setStep] = useState<1 | 2 | 3>(2);

  // Store data state
  const [store, setStore] = useState<StoreOnboardingData>(initialStore);

  // Step 2: Pertanyaan QRIS
  // "yes" = punya QRIS, "no" = belum / hanya tunai
  const [hasQris, setHasQris] = useState<"yes" | "no" | null>(
    initialStore.acceptQris ? "yes" : initialStore.acceptCash ? "no" : null
  );

  // QRIS upload & scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);
  const [rawPayload, setRawPayload] = useState<string | null>(
    initialStore.qrisPayload || null
  );
  const [merchantName, setMerchantName] = useState<string>(
    initialStore.qrisMerchantName || ""
  );
  const [merchantCity, setMerchantCity] = useState<string>("");
  const [nmid, setNmid] = useState<string>("");
  const [isMerchantConfirmed, setIsMerchantConfirmed] = useState<boolean>(
    Boolean(initialStore.qrisMerchantName)
  );
  const [acceptCashAlso, setAcceptCashAlso] = useState<boolean>(true);

  // Form error & success notification
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload & scan
  const processImageFile = async (file: File) => {
    setIsScanning(true);
    setScanError(null);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setQrisPreviewUrl(previewUrl);

    try {
      const scanRes = await readQrFromImageFile(file);
      if (!scanRes.success || !scanRes.data) {
        setScanError(
          scanRes.error ||
            "Kode QR tidak terdeteksi pada gambar. Pastikan gambar jelas dan tidak terpotong."
        );
        setIsScanning(false);
        return;
      }

      // Validasi QRIS dengan standar EMVCo & BI
      const validation = validateQris(scanRes.data);
      if (!validation.valid) {
        setScanError(
          validation.error ||
            "Format kode QR yang diunggah bukan kode QRIS standar Bank Indonesia."
        );
        setIsScanning(false);
        return;
      }

      // Validasi sukses
      setRawPayload(scanRes.data);
      setMerchantName(validation.merchantName || "Merchant QRIS");
      setMerchantCity(validation.merchantCity || "");
      setNmid(validation.nmid || "");
      setIsMerchantConfirmed(true);
      setScanError(null);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Gagal memproses gambar QRIS."
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

  // Helper untuk menggunakan QRIS contoh valid untuk pengujian cepat
  const handleUseDemoQris = () => {
    setIsScanning(true);
    setScanError(null);

    setTimeout(() => {
      const val26 = "0014ID.CO.QRIS.WWW01189360000000000000010203UMI";
      const tag26 = `2647${val26}`;
      const name = store.name ? store.name.toUpperCase() : "KOPI PAYBUY";
      const lenStr = name.length.toString().padStart(2, "0");
      const base = `000201010211${tag26}5204549953033605802ID59${lenStr}${name}6007JAKARTA6105123406304`;
      const full = base + crc16(base);

      const val = validateQris(full);
      if (val.valid) {
        setRawPayload(full);
        setMerchantName(val.merchantName || name);
        setMerchantCity(val.merchantCity || "JAKARTA");
        setNmid("ID102003884920");
        setIsMerchantConfirmed(true);
      }
      setIsScanning(false);
    }, 400);
  };

  // Simpan pengaturan pembayaran toko
  const handleSavePaymentSettings = () => {
    setActionError(null);

    if (hasQris === "yes") {
      if (!rawPayload) {
        setActionError("Silakan unggah gambar kode QRIS toko Anda terlebih dahulu.");
        return;
      }
      if (!isMerchantConfirmed) {
        setActionError(
          "Silakan konfirmasi kesesuaian nama merchant QRIS sebelum melanjutkan."
        );
        return;
      }
    }

    startTransition(async () => {
      const acceptCash = hasQris === "yes" ? acceptCashAlso : true;
      const acceptQris = hasQris === "yes";

      const res = await saveStorePaymentSettingsAction({
        acceptCash,
        acceptQris,
        qrisPayload: acceptQris ? rawPayload : null,
        qrisMerchantName: acceptQris ? merchantName : null,
      });

      if (!res.success || !res.data) {
        setActionError(res.error || "Gagal menyimpan pengaturan pembayaran.");
        return;
      }

      setStore(res.data);
      setStep(3); // Pindah ke langkah selesai
    });
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/t/${store.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8 px-4">
      {/* Step Indicator Header (Ticket-style numbers) */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--line)] -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-semibold text-sm transition-all border ${
                step === 1
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-card"
                  : step > 1
                  ? "bg-emerald-600 text-white border-emerald-600 cursor-pointer"
                  : "bg-white text-[var(--muted)] border-[var(--line-strong)]"
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : "01"}
            </button>
            <span
              className={`text-xs font-semibold mt-2 ${
                step === 1 ? "text-[var(--forest)]" : "text-[var(--muted)]"
              }`}
            >
              Toko
            </span>
          </div>

          {/* Step 2 (Pertanyaan QRIS - PRD Focus) */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-semibold text-sm transition-all border ${
                step === 2
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-card ring-4 ring-emerald-500/20"
                  : step > 2
                  ? "bg-emerald-600 text-white border-emerald-600 cursor-pointer"
                  : "bg-white text-[var(--muted)] border-[var(--line-strong)]"
              }`}
            >
              {step > 2 ? <Check className="w-4 h-4" /> : "02"}
            </button>
            <span
              className={`text-xs font-semibold mt-2 ${
                step === 2 ? "text-[var(--leaf)] font-bold" : "text-[var(--muted)]"
              }`}
            >
              Metode QRIS
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-semibold text-sm transition-all border ${
                step === 3
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-card"
                  : "bg-white text-[var(--muted)] border-[var(--line-strong)]"
              }`}
            >
              03
            </div>
            <span
              className={`text-xs font-semibold mt-2 ${
                step === 3 ? "text-[var(--forest)]" : "text-[var(--muted)]"
              }`}
            >
              Selesai
            </span>
          </div>
        </div>
      </div>

      {/* ================= STEP 1: RINGKASAN TOKO ================= */}
      {step === 1 && (
        <TicketCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-[var(--leaf)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-semibold text-2xl text-[var(--ink)]">
                  Identitas Toko Anda
                </h2>
                <Badge variant="mint" size="sm">
                  Aktif
                </Badge>
              </div>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                Konfirmasi nama toko dan alamat tautan menu publik Anda.
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-5 space-y-4 mb-6">
            <div>
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">
                Nama Toko
              </span>
              <p className="font-heading font-semibold text-xl text-[var(--ink)] mt-0.5">
                {store.name}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--line)]">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">
                Tautan Menu Publik Pelanggan (QR Menu)
              </span>
              <div className="mt-1.5 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <code className="px-3 py-2 bg-white border border-[var(--line)] rounded-lg text-sm font-mono text-[var(--leaf)] font-semibold flex-1 select-all break-all">
                  paybuy.byatara.dev/t/{store.slug}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copyPublicUrl}
                  className="gap-1.5 shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-[var(--muted)] mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Satu tautan dan satu QR seumur toko. Menu dapat diperbarui tanpa mencetak ulang QR.
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              className="gap-2"
            >
              <span>Lanjut ke Pengaturan Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </TicketCard>
      )}

      {/* ================= STEP 2: PERTANYAAN PEMBAYARAN QRIS (PRD 7.1) ================= */}
      {step === 2 && (
        <TicketCard className="p-6 sm:p-9">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-xs font-semibold text-[var(--forest)] mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--leaf)]" />
              <span>Langkah Utama: Pengaturan Pembayaran</span>
            </div>
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
              Apakah toko Anda memiliki QRIS sendiri?
            </h1>
            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
              Sesuai standar operasional PayBuy, toko dapat menerima pembayaran non-tunai (QRIS)
              secara langsung di meja pelanggan, menerima pembayaran tunai di kasir, atau keduanya.
            </p>
          </div>

          {/* Action Error Alert */}
          {actionError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Perhatian:</strong>
                <span>{actionError}</span>
              </div>
            </div>
          )}

          {/* Dua Pilihan Besar (PRD & design.md) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Pilihan 1: Ya, Punya QRIS */}
            <div
              onClick={() => {
                setHasQris("yes");
                setActionError(null);
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                hasQris === "yes"
                  ? "border-[var(--leaf)] bg-emerald-50/50 shadow-card ring-2 ring-[var(--leaf)]/20"
                  : "border-[var(--line)] bg-white hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasQris === "yes"
                        ? "bg-[var(--leaf)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--forest)]"
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                  </div>
                  {hasQris === "yes" && (
                    <Badge variant="leaf" size="sm">
                      <Check className="w-3 h-3" />
                      <span>Dipilih</span>
                    </Badge>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-lg text-[var(--ink)]">
                  Ya, Toko Punya QRIS
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                  Punya QRIS dari Bank (BCA, Mandiri, BRI, dll.) atau E-Wallet (GoPay, OVO, Dana,
                  ShopeePay).
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)]/60 text-[11px] font-semibold text-[var(--leaf)]">
                ✓ Nominal terisi otomatis saat pelanggan pesan
              </div>
            </div>

            {/* Pilihan 2: Belum / Hanya Tunai */}
            <div
              onClick={() => {
                setHasQris("no");
                setActionError(null);
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                hasQris === "no"
                  ? "border-[var(--forest)] bg-zinc-50 shadow-card ring-2 ring-[var(--forest)]/20"
                  : "border-[var(--line)] bg-white hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasQris === "no"
                        ? "bg-[var(--forest)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--forest)]"
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                  </div>
                  {hasQris === "no" && (
                    <Badge variant="forest" size="sm">
                      <Check className="w-3 h-3" />
                      <span>Dipilih</span>
                    </Badge>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-lg text-[var(--ink)]">
                  Belum / Hanya Tunai
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                  Toko hanya menerima pembayaran tunai di kasir. QRIS dapat ditambahkan kapan saja
                  nanti.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)]/60 text-[11px] font-semibold text-[var(--muted)]">
                ✓ Pelanggan membawa nomor antrian ke kasir
              </div>
            </div>
          </div>

          {/* ================= SECTION: JIKA MEMILIH PUNYA QRIS ================= */}
          {hasQris === "yes" && (
            <div className="space-y-6 pt-2">
              <TicketPerforation />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-heading font-semibold text-base text-[var(--ink)] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[var(--leaf)]" />
                    <span>Unggah Gambar / Foto QRIS Toko</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseDemoQris}
                    className="text-xs font-semibold text-[var(--leaf)] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gunakan QRIS Simulasi Demo</span>
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Unggah tangkapan layar (screenshot) atau foto QRIS toko Anda. Sistem kami akan
                  membaca dan memvalidasi kode QRIS secara otomatis.
                </p>
              </div>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="qris-file-input"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isScanning
                    ? "border-emerald-400 bg-emerald-50/60"
                    : scanError
                    ? "border-red-300 bg-red-50/30"
                    : rawPayload
                    ? "border-emerald-500 bg-emerald-50/20"
                    : "border-[var(--line-strong)] hover:border-[var(--leaf)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]"
                }`}
              >
                {isScanning ? (
                  <div className="py-4 flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[var(--leaf)] animate-spin" />
                    <div>
                      <p className="font-semibold text-sm text-[var(--ink)]">
                        Menganalisis Kode QRIS...
                      </p>
                      <span className="text-xs text-[var(--muted)]">
                        Memeriksa format TLV EMVCo & checksum CRC16
                      </span>
                    </div>
                  </div>
                ) : rawPayload ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm text-emerald-900">
                        Kode QRIS Berhasil Dibaca!
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        Klik di sini jika ingin mengganti dengan gambar lain
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white border border-[var(--line)] shadow-subtle flex items-center justify-center text-[var(--leaf)]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--ink)]">
                        Tarik & letakkan foto QRIS ke sini, atau{" "}
                        <span className="text-[var(--leaf)] underline">Pilih Berkas</span>
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        Mendukung format PNG, JPG, atau WEBP (Maksimal 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Scan Error Message */}
              {scanError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-semibold block">Gagal Membaca QRIS:</strong>
                    <span>{scanError}</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs h-8"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Unggah Ulang
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHasQris("no");
                          setScanError(null);
                        }}
                        className="text-xs h-8 text-[var(--muted)]"
                      >
                        Lanjut dengan Tunai Saja Dulu
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Validated Merchant Display (FR-PY-03 & FR-PY-04) */}
              {rawPayload && (
                <div className="bg-white border-2 border-emerald-600/40 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-xs uppercase tracking-wider text-[var(--muted)]">
                          Nama Merchant QRIS Terverifikasi
                        </span>
                        <Badge variant="mint" size="sm">
                          <Check className="w-3 h-3" />
                          <span>QRIS Standar BI</span>
                        </Badge>
                      </div>
                      <p className="font-heading font-semibold text-xl sm:text-2xl text-[var(--ink)] tracking-tight">
                        {merchantName}
                      </p>
                      {merchantCity && (
                        <p className="text-xs text-[var(--muted)] font-medium">
                          Kota: <span className="text-[var(--ink)]">{merchantCity}</span>
                          {nmid && (
                            <>
                              {" • "}
                              NMID: <span className="font-mono">{nmid}</span>
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    {qrisPreviewUrl && (
                      <div className="w-16 h-16 rounded-xl border border-[var(--line)] overflow-hidden shrink-0 bg-white p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrisPreviewUrl}
                          alt="QRIS Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Nama merchant di atas akan ditampilkan kepada pelanggan saat memindai QRIS di
                      halaman pembayaran agar pelanggan yakin dana masuk ke rekening yang tepat.
                    </span>
                  </div>

                  {/* Merchant Name Confirmation Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={isMerchantConfirmed}
                      onChange={(e) => setIsMerchantConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[var(--leaf)] focus:ring-[var(--leaf)] cursor-pointer"
                    />
                    <div className="text-xs sm:text-sm text-[var(--ink)]">
                      <strong className="font-semibold block">
                        Konfirmasi Nama Merchant
                      </strong>
                      <span className="text-[var(--muted)]">
                        Saya mengonfirmasi bahwa nama merchant &ldquo;{merchantName}&rdquo; adalah
                        benar milik usaha saya.
                      </span>
                    </div>
                  </label>

                  {/* Accept Cash Also Checkbox */}
                  <div className="pt-3 border-t border-[var(--line)]">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptCashAlso}
                        onChange={(e) => setAcceptCashAlso(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-[var(--leaf)] focus:ring-[var(--leaf)] cursor-pointer"
                      />
                      <div className="text-xs sm:text-sm text-[var(--ink)]">
                        <strong className="font-semibold block">
                          Terima Pembayaran Tunai (Cash) Juga
                        </strong>
                        <span className="text-[var(--muted)]">
                          Pelanggan dapat memilih antara membayar dengan QRIS langsung atau tunai ke
                          kasir.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= SECTION: JIKA MEMILIH HANYA TUNAI ================= */}
          {hasQris === "no" && (
            <div className="space-y-4 pt-2">
              <TicketPerforation />

              <div className="bg-zinc-50 border border-[var(--line)] rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-5 h-5 text-[var(--forest)]" />
                  <h4 className="font-heading font-semibold text-base text-[var(--ink)]">
                    Toko Anda Diatur Menerima Tunai di Kasir
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Pelanggan tetap dapat memesan secara mandiri lewat scan QR menu di meja atau konter.
                  Setelah menekan pesan, pelanggan akan membawa nomor antrian ke meja kasir untuk
                  pembayaran tunai. Kasir Anda akan menekan tombol &ldquo;Konfirmasi Bayar&rdquo;
                  sebelum pesanan masuk ke layar dapur.
                </p>

                <div className="p-3 bg-white border border-[var(--line)] rounded-xl text-xs text-[var(--forest)] flex items-start gap-2">
                  <Info className="w-4 h-4 text-[var(--leaf)] shrink-0 mt-0.5" />
                  <span>
                    Anda dapat menambahkan dan mengaktifkan QRIS kapan saja di kemudian hari lewat menu{" "}
                    <strong>Dashboard &gt; Pengaturan Toko</strong>.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigasi Bawah */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[var(--line)] mt-6">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStep(1)}
              className="gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={
                hasQris === null ||
                (hasQris === "yes" && (!rawPayload || !isMerchantConfirmed)) ||
                isPending
              }
              onClick={handleSavePaymentSettings}
              className="gap-2 w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <span>Simpan & Selesaikan Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </TicketCard>
      )}

      {/* ================= STEP 3: SELESAI & MENUJU DASHBOARD ================= */}
      {step === 3 && (
        <TicketCard className="p-6 sm:p-9 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2">
            <span>Setup Onboarding Berhasil</span>
          </div>

          <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
            Toko {store.name} Siap Beroperasi!
          </h2>

          <p className="text-sm text-[var(--muted)] max-w-md mx-auto mt-2 leading-relaxed">
            Metode pembayaran toko Anda telah berhasil dikonfigurasi. Anda kini dapat mulai menyusun
            menu makanan/minuman dan mengunduh QR menu untuk dicetak.
          </p>

          <TicketPerforation className="my-6" />

          {/* Ringkasan Konfigurasi Toko */}
          <div className="max-w-md mx-auto bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-5 text-left space-y-3.5">
            <div>
              <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider block">
                Toko
              </span>
              <span className="font-heading font-semibold text-base text-[var(--ink)]">
                {store.name}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--line)]">
              <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider block">
                Metode Pembayaran Aktif
              </span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {store.acceptQris && (
                  <Badge variant="mint" size="sm">
                    <QrCode className="w-3 h-3" />
                    <span>QRIS Dinamis ({store.qrisMerchantName || "Aktif"})</span>
                  </Badge>
                )}
                {store.acceptCash && (
                  <Badge variant="forest" size="sm">
                    <Banknote className="w-3 h-3" />
                    <span>Tunai di Kasir</span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)]">
              <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider block">
                Tautan Menu Publik
              </span>
              <div className="flex items-center justify-between mt-1 text-xs font-mono text-[var(--leaf)] font-semibold">
                <span>paybuy.byatara.dev/t/{store.slug}</span>
                <Link
                  href={`/t/${store.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 hover:underline text-[var(--forest)]"
                >
                  <span>Buka</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="gap-2 w-full sm:w-auto"
            >
              <span>Buka Dashboard Toko</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Link href={`/t/${store.slug}`} target="_blank" className="w-full sm:w-auto">
              <Button type="button" variant="secondary" size="lg" className="gap-2 w-full">
                <ExternalLink className="w-4 h-4" />
                <span>Pratinjau Menu Pelanggan</span>
              </Button>
            </Link>
          </div>
        </TicketCard>
      )}
    </div>
  );
}
