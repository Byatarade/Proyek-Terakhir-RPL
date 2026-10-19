"use client";

import React, { useState, useRef, useTransition } from "react";
import { readQrFromImageFile } from "@/lib/payments/scanner";
import { validateQris, crc16 } from "@/lib/payments/qris";
import {
  saveStorePaymentSettingsAction,
  StoreOnboardingData,
} from "@/lib/stores/actions";

import {
  OnboardingWizardProps,
  WizardStep,
  HasQrisChoice,
} from "./types";
import { WizardStepIndicator } from "./WizardStepIndicator";
import { Step1StoreIdentity } from "./Step1StoreIdentity";
import { Step2QrisPayment } from "./Step2QrisPayment";
import { Step3Completion } from "./Step3Completion";

export type { OnboardingWizardProps } from "./types";

export function OnboardingWizard({ initialStore }: OnboardingWizardProps) {
  const [isPending, startTransition] = useTransition();

  // Wizard Step: 1 = Toko, 2 = Pertanyaan QRIS (Inti PRD), 3 = Selesai
  const [step, setStep] = useState<WizardStep>(2);

  // Store data state
  const [store, setStore] = useState<StoreOnboardingData>(initialStore);

  // Step 2: Pertanyaan QRIS
  // "yes" = punya QRIS, "no" = belum / hanya tunai
  const [hasQris, setHasQris] = useState<HasQrisChoice>(
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
      <WizardStepIndicator step={step} onSetStep={setStep} />

      {/* Step 1: Identitas Toko */}
      {step === 1 && (
        <Step1StoreIdentity
          store={store}
          copiedLink={copiedLink}
          onCopyPublicUrl={copyPublicUrl}
          onNext={() => setStep(2)}
        />
      )}

      {/* Step 2: Pertanyaan Pembayaran QRIS */}
      {step === 2 && (
        <Step2QrisPayment
          store={store}
          hasQris={hasQris}
          setHasQris={setHasQris}
          actionError={actionError}
          setActionError={setActionError}
          isScanning={isScanning}
          scanError={scanError}
          setScanError={setScanError}
          rawPayload={rawPayload}
          merchantName={merchantName}
          merchantCity={merchantCity}
          nmid={nmid}
          qrisPreviewUrl={qrisPreviewUrl}
          isMerchantConfirmed={isMerchantConfirmed}
          setIsMerchantConfirmed={setIsMerchantConfirmed}
          acceptCashAlso={acceptCashAlso}
          setAcceptCashAlso={setAcceptCashAlso}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onUseDemoQris={handleUseDemoQris}
          isPending={isPending}
          onBack={() => setStep(1)}
          onSave={handleSavePaymentSettings}
        />
      )}

      {/* Step 3: Selesai & Menuju Dashboard */}
      {step === 3 && <Step3Completion store={store} />}
    </div>
  );
}
