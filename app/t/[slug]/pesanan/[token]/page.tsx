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
      const res = await getOrderStatusAction(token);
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
  }, [token]);

  const handleConfirmPaid = () => {
    startTransition(async () => {
      await customerConfirmPaidAction(token);
      const res = await getOrderStatusAction(token);
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--leaf)] mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-zinc-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="font-heading font-bold text-lg text-zinc-900">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-xs text-zinc-500">{error || "Tautan pesanan tidak valid atau telah kedaluwarsa."}</p>
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
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col items-center p-0 sm:p-4 selection:bg-[var(--leaf)] selection:text-white">
      {/* Container maks. 480px per design.md 4.3 */}
      <div className="w-full max-w-[480px] min-h-screen sm:min-h-0 bg-white sm:rounded-3xl border-x sm:border border-[var(--line)] shadow-sm overflow-hidden pb-12">
        {/* Header navigation */}
        <header className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <Link
            href={`/t/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-full shadow-2xs"
            title="Salin tautan status pesanan"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[var(--leaf)]" />
                <span className="text-[var(--leaf)]">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>
        </header>

        {/* 1. Queue Number Bintang Utama (design.md 6.3) */}
        <div className="p-6 text-center bg-white space-y-3 relative overflow-hidden">
          {/* Cap Lunas Overlay (design.md 6.4) */}
          {isPaid && (
            <div className="absolute top-4 right-5 z-20 pointer-events-none">
              <StampLunas />
            </div>
          )}

          <div className="p-6 rounded-3xl border-2 border-dashed border-[var(--line)] bg-zinc-50/60 max-w-[340px] mx-auto space-y-1">
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 block">
              Nomor Antrian Kamu
            </span>
            <div className="font-heading font-extrabold text-6xl sm:text-7xl text-zinc-950 tracking-tight tabular-nums py-1">
              {formattedQueue}
            </div>
            <span className="text-xs font-semibold text-[var(--leaf)] block">
              {order.storeName}
            </span>
          </div>
        </div>

        {/* 2. Order Status Timeline (design.md 9.4) */}
        <div className="px-6 py-4 border-y border-zinc-100 bg-zinc-50/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
            Status Pesanan
          </span>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            {timelineSteps.map((step) => {
              const status = getStepStatus(step.key);
              const isCurrent = status === "current";
              const isCompleted = status === "completed";

              return (
                <div key={step.key} className="flex flex-col items-center space-y-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-[var(--leaf)] text-white"
                        : isCurrent
                        ? "bg-emerald-100 text-[var(--leaf)] ring-4 ring-emerald-50 font-bold"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] leading-tight font-medium ${
                      isCurrent
                        ? "text-zinc-950 font-bold"
                        : isCompleted
                        ? "text-zinc-700"
                        : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Payment Instruction Section (QRIS or Cash) */}
        <div className="p-6 space-y-4">
          {order.status === "menunggu_bayar" && (
            <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200/90 text-center space-y-4">
              {order.paymentMethod === "qris" ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--leaf)]">
                      Pembayaran QRIS
                    </span>
                    <h3 className="font-heading font-bold text-lg text-zinc-950">
                      Scan QR untuk Membayar
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Buka aplikasi m-banking atau e-wallet (BCA, GoPay, OVO, ShopeePay, Dana, dll.)
                    </p>
                  </div>

                  {/* QR Code Display */}
                  <div className="w-[240px] h-[240px] bg-white p-3 rounded-2xl border border-zinc-200 mx-auto shadow-2xs flex items-center justify-center">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="QRIS Pembayaran"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                    )}
                  </div>

                  <div className="font-heading font-bold text-2xl text-zinc-950 tabular-nums">
                    {formatRupiah(order.total)}
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirmPaid}
                    disabled={isPending}
                    className="w-full gap-2 text-sm font-bold shadow-md rounded-2xl"
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Pembayaran Tunai di Kasir
                  </span>
                  <h3 className="font-heading font-bold text-lg text-zinc-950">
                    Silakan Menuju ke Meja Kasir
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Sebutkan nomor antrian Anda <strong className="text-zinc-900 font-bold">{formattedQueue}</strong> kepada kasir untuk membayar sebesar{" "}
                    <strong className="text-zinc-900 font-bold tabular-nums">{formatRupiah(order.total)}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Rincian Nota Pesanan (Receipt Detail with DotLeader) */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block border-b border-zinc-100 pb-2">
              Rincian Menu Pesanan
            </span>

            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <DotLeader
                  key={idx}
                  name={item.name}
                  qty={item.qty}
                  price={item.price * item.qty}
                  className="text-xs text-zinc-800"
                />
              ))}
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-200 flex items-baseline justify-between">
              <span className="font-heading font-bold text-sm text-zinc-950">
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
