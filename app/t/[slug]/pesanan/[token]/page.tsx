"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import QRCode from "qrcode";
import { formatRupiah } from "@/lib/utils";
import {
  getOrderStatusAction,
  customerConfirmPaidAction,
  OrderStatusData,
} from "@/lib/public-menu/actions";
import { StampLunas } from "@/components/molecules/StampLunas";
import { DotLeader } from "@/components/molecules/DotLeader";
import { Button } from "@/components/atoms/Button";

export default function OrderStatusPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const token = params?.token as string;

  const [order, setOrder] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load order data
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      const res = await getOrderStatusAction(token, slug);
      if (res.success && res.data) {
        setOrder(res.data);
        setError(null);

        // Generate QR code if QRIS and pending
        if (res.data.paymentMethod === "qris" && res.data.qrisPayload) {
          try {
            const url = await QRCode.toDataURL(res.data.qrisPayload, {
              width: 260,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            });
            setQrDataUrl(url);
          } catch {
            // ignore qr render error
          }
        }
      } else {
        setError(res.error || "Pesanan tidak ditemukan.");
      }
      setLoading(false);
    };

    loadData();

    // Auto refresh order status every 6 seconds (PRD FR-OR-05)
    const interval = setInterval(loadData, 6000);

    return () => clearInterval(interval);
  }, [token, slug]);

  const handleConfirmPaid = () => {
    startTransition(async () => {
      await customerConfirmPaidAction(token);
      const res = await getOrderStatusAction(token, slug);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--forest)] mx-auto" />
          <p className="text-xs text-[var(--muted)] font-medium">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-[8px] border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[var(--danger)] mx-auto" />
          <h2 className="font-heading font-bold text-lg text-[var(--forest)]">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-xs text-[var(--muted)]">{error || "Tautan pesanan tidak valid atau telah kedaluwarsa."}</p>
          <Link href={`/t/${slug}`}>
            <Button variant="secondary" size="md" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Menu</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status !== "menunggu_bayar" && order.status !== "dibatalkan";
  const formattedQueue = String(order.queueNumber).padStart(3, "0");

  const timelineSteps = [
    { key: "menunggu_bayar", label: "Menunggu Bayar", icon: Clock },
    { key: "dibayar", label: "Sudah Dibayar", icon: CheckCircle2 },
    { key: "diproses", label: "Sedang Dimasak", icon: Utensils },
    { key: "siap", label: "Siap Diambil", icon: ShoppingBag },
  ];

  const getStepStatus = (stepKey: string) => {
    const orderIndex = timelineSteps.findIndex((s) => s.key === order.status);
    const thisIndex = timelineSteps.findIndex((s) => s.key === stepKey);

    if (order.status === "diambil") return "completed";
    if (thisIndex < orderIndex) return "completed";
    if (thisIndex === orderIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center p-0 sm:p-4 selection:bg-[var(--leaf)] selection:text-white">
      {/* Container maks. 480px per design.md 4.3 */}
      <div className="w-full max-w-[480px] min-h-screen sm:min-h-0 bg-[var(--bg)] sm:rounded-[8px] border-x-2 sm:border-2 border-[var(--forest)] sm:shadow-[6px_6px_0px_var(--forest)] overflow-hidden pb-12">
        {/* Header navigation */}
        <header className="p-3.5 border-b-2 border-[var(--forest)] flex items-center justify-between bg-white shadow-[0_2px_0px_var(--line)]">
          <Link
            href={`/t/${slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Menu Toko</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-medium cursor-pointer transition-all"
            title="Salin tautan status pesanan"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--leaf)] stroke-[2.5]" />
                <span className="text-[var(--leaf)] font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>
        </header>

        {/* 1. Queue Number Bintang Utama (design.md 6.3: Border putus-putus 3px warna Hutan di atas latar putih) */}
        <div className="p-5 text-center bg-white space-y-3 relative overflow-hidden border-b-2 border-[var(--forest)]">
          {/* Cap Lunas Overlay (design.md 6.4) */}
          {isPaid && (
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <StampLunas />
            </div>
          )}

          <div className="p-6 rounded-[8px] border-3 border-dashed border-[var(--forest)] bg-white max-w-[340px] mx-auto space-y-1 shadow-[4px_4px_0px_var(--forest)]">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--muted)] block">
              Nomor Antrian Kamu
            </span>
            <div className="font-heading font-extrabold text-6xl sm:text-7xl text-[var(--forest)] tracking-tight tabular-nums py-1">
              {formattedQueue}
            </div>
            <span className="text-xs font-bold text-[var(--leaf)] block font-heading">
              {order.storeName}
            </span>
          </div>
        </div>

        {/* 2. Order Status Timeline (design.md 9.4) */}
        <div className="px-4 py-3.5 border-b-2 border-[var(--forest)] bg-[var(--surface-2)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] block mb-2.5">
            Tahapan Pesanan
          </span>

          <div className="grid grid-cols-4 gap-2 text-center">
            {timelineSteps.map((step) => {
              const status = getStepStatus(step.key);
              const isCurrent = status === "current";
              const isCompleted = status === "completed";

              return (
                <div key={step.key} className="flex flex-col items-center space-y-1.5">
                  <div
                    className={`w-9 h-9 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-[var(--leaf)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                        : isCurrent
                        ? "bg-[var(--mint)] text-[var(--ink)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-bold ring-2 ring-[var(--forest)]"
                        : "bg-white text-[var(--disabled-text)] border-[var(--line)] shadow-none"
                    }`}
                  >
                    <step.icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span
                    className={`text-[10px] leading-tight font-medium ${
                      isCurrent
                        ? "text-[var(--forest)] font-bold"
                        : isCompleted
                        ? "text-[var(--forest)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Payment Instruction Section (QRIS or Cash per design.md 9.5) */}
        <div className="p-4 sm:p-5 space-y-4">
          {order.status === "menunggu_bayar" && (
            <div className="p-5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] text-center space-y-4">
              {order.paymentMethod === "qris" ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--leaf)]">
                      Pembayaran QRIS
                    </span>
                    <h3 className="font-heading font-bold text-lg text-[var(--forest)]">
                      Scan QR untuk Membayar
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Buka aplikasi m-banking atau e-wallet (BCA, GoPay, OVO, ShopeePay, Dana, dll.)
                    </p>
                  </div>

                  {/* QR Code Display per design.md 9.5: Modul hitam latar putih zona tenang */}
                  <div className="w-[240px] h-[240px] bg-white p-3 rounded-[8px] border-2 border-[var(--forest)] mx-auto shadow-[3px_3px_0px_var(--forest)] flex items-center justify-center">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="QRIS Pembayaran"
                        className="w-full h-full object-contain"
                      />
                    ) : order.qrisPayload ? (
                      <Loader2 className="w-8 h-8 animate-spin text-[var(--forest)]" />
                    ) : (
                      <div className="p-3 text-center text-xs text-[var(--muted)] space-y-1.5">
                        <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                        <span className="font-bold block text-[var(--forest)] font-heading">
                          QRIS Belum Diatur
                        </span>
                        <span className="text-[11px] leading-relaxed block">
                          Toko ini belum mengunggah kode QRIS. Silakan lakukan pembayaran tunai di kasir.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="font-heading font-bold text-2xl text-[var(--forest)] tabular-nums">
                    {formatRupiah(order.total)}
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleConfirmPaid}
                    disabled={isPending}
                    className="w-full gap-2 text-sm sm:text-base font-bold shadow-[3px_3px_0px_var(--forest)] h-12"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengonfirmasi...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saya Sudah Bayar</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-2 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--forest)]">
                    Pembayaran Tunai di Kasir
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[var(--forest)]">
                    Silakan Menuju ke Meja Kasir
                  </h3>
                  <p className="text-xs text-[var(--muted)] max-w-xs mx-auto leading-relaxed">
                    Sebutkan nomor antrian kamu <strong className="text-[var(--forest)] font-bold">{formattedQueue}</strong> kepada kasir untuk membayar sebesar{" "}
                    <strong className="text-[var(--forest)] font-bold tabular-nums">{formatRupiah(order.total)}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Rincian Nota Pesanan (Receipt Detail with DotLeader design.md 6.2) */}
          <div className="p-4 sm:p-5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] block border-b-2 border-dashed border-[var(--forest)] pb-2">
              Rincian Menu Pesanan
            </span>

            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <DotLeader
                  key={idx}
                  name={item.name}
                  qty={item.qty}
                  price={item.price * item.qty}
                  className="text-xs text-[var(--forest)]"
                />
              ))}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-[var(--forest)] flex items-baseline justify-between">
              <span className="font-heading font-bold text-sm text-[var(--forest)]">
                Total
              </span>
              <span className="font-heading font-bold text-lg text-[var(--leaf)] tabular-nums">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
