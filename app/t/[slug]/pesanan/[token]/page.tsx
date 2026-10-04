"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
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
  Flame,
  ChefHat,
  Bell,
  Tv,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import QRCode from "qrcode";
import { formatRupiah, cn } from "@/lib/utils";
import {
  getOrderStatusAction,
  customerConfirmPaidAction,
  OrderStatusData,
} from "@/lib/public-menu/actions";
import { createClient } from "@/lib/supabase/client";
import { StampLunas } from "@/components/molecules/StampLunas";
import { DotLeader } from "@/components/molecules/DotLeader";
import { Button } from "@/components/atoms/Button";

// Suara Chime Notifikasi Pesanan Siap (design.md 12.2)
function playReadyChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.2); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.85);
  } catch {
    // Ignore audio restriction
  }
}

// Suara Panggilan Bahasa Indonesia + Getar Ponsel Pelanggan
function speakCustomerCall(queueNumber: number) {
  playReadyChime();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const formatted = String(queueNumber).padStart(3, "0");
    const utterance = new SpeechSynthesisUtterance(
      `Nomor antrian ${formatted}, pesananmu sudah siap diambil di kasir.`
    );
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 350);
  }
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([300, 150, 300, 150, 400]);
    } catch {
      // Ignore vibration error
    }
  }
}

export default function OrderStatusPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const token = params?.token as string;

  const [order, setOrder] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const prevStatusRef = useRef<string | null>(null);
  const prevUpdatedAtRef = useRef<string | null>(null);
  const hasAcknowledgedCallRef = useRef<boolean>(false);

  // Load order data
  const loadData = async () => {
    if (!token) return;
    const res = await getOrderStatusAction(token, slug);
    if (res.success && res.data) {
      // Simpan ke localStorage agar jika user membuka /t/[slug] kembali, pesanan tetap terpantau
      try {
        localStorage.setItem(
          `paybuy_active_order_${slug}`,
          JSON.stringify({
            token,
            queueNumber: res.data.queueNumber,
            storeSlug: slug,
            status: res.data.status,
            updatedAt: res.data.updatedAt,
          })
        );
      } catch {
        // Ignore localStorage error
      }

      // Deteksi jika pesanan siap atau jika koki/kasir memanggil ulang (updatedAt berubah)
      const isNewlyReady =
        prevStatusRef.current &&
        prevStatusRef.current !== "siap" &&
        res.data.status === "siap";

      const isReCalled =
        prevUpdatedAtRef.current &&
        prevUpdatedAtRef.current !== res.data.updatedAt &&
        res.data.status === "siap";

      const shouldAlert =
        isNewlyReady ||
        isReCalled ||
        (!hasAcknowledgedCallRef.current && res.data.status === "siap");

      if (shouldAlert) {
        setShowCallModal(true);
        speakCustomerCall(res.data.queueNumber);
      }

      prevStatusRef.current = res.data.status;
      prevUpdatedAtRef.current = res.data.updatedAt || null;

      setOrder(res.data);
      setError(null);

      // Generate QR code jika QRIS dan status masih menunggu bayar
      if (
        res.data.paymentMethod === "qris" &&
        res.data.qrisPayload &&
        res.data.status === "menunggu_bayar"
      ) {
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

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime channel untuk update seketika saat koki mengubah status
    const supabase = createClient();
    const channel = supabase
      .channel(`order-status-${token}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    // Fallback polling otomatis setiap 4 detik (PRD FR-OR-05)
    const interval = setInterval(loadData, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [token, slug]);

  const handleConfirmPaid = () => {
    startTransition(async () => {
      await customerConfirmPaidAction(token);
      await loadData();
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

  const isPaid = order.status !== "menunggu_bayar" && order.status !== "dibatalkan" && order.status !== "kedaluwarsa";
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

          <div className="flex items-center gap-2">
            <Link
              href={`/t/${slug}/antrian`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[var(--surface-2)] hover:bg-[#d8edd9] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-semibold transition-all"
              title="Lihat papan antrian layar TV restoran"
            >
              <Tv className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden xs:inline">Layar TV</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-medium cursor-pointer transition-all"
              title="Salin tautan status pesanan ini"
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
          </div>
        </header>

        {/* 1. Queue Number Bintang Utama (design.md 6.3: Border putus-putus 3px warna Hutan di atas latar putih) */}
        <div className="p-5 text-center bg-white space-y-3 relative overflow-hidden border-b-2 border-[var(--forest)]">
          {/* Cap Lunas Overlay (design.md 6.4: Mint bertepi 3px Hutan, bayangan keras, miring -4°) */}
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

        {/* 2. Order Status Timeline (design.md 9.4: Menunggu Bayar -> Sudah Dibayar -> Sedang Dimasak -> Siap Diambil) */}
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
                    className={cn(
                      "w-9 h-9 rounded-[6px] border-2 flex items-center justify-center transition-all",
                      isCompleted &&
                        "bg-[var(--leaf)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]",
                      isCurrent &&
                        "bg-[var(--mint)] text-[var(--ink)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-bold ring-2 ring-[var(--forest)]",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-white text-[var(--disabled-text)] border-[var(--line)] shadow-none"
                    )}
                  >
                    <step.icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] leading-tight font-medium",
                      isCurrent && "text-[var(--forest)] font-bold",
                      isCompleted && "text-[var(--forest)]",
                      !isCompleted && !isCurrent && "text-[var(--muted)]"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Dynamic Status Content Section */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* A. Status: MENUNGGU PEMBAYARAN */}
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
                    className="w-full gap-2 text-sm sm:text-base font-bold shadow-[3px_3px_0px_var(--forest)] h-12 cursor-pointer"
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

          {/* B. Status: SUDAH DIBAYAR (Menunggu Koki Memasak) */}
          {order.status === "dibayar" && (
            <div className="p-5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[8px] bg-[var(--blue)] text-white flex items-center justify-center border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] shrink-0">
                  <ChefHat className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--blue)] text-white text-[10px] font-bold uppercase tracking-wider">
                    Sudah Dibayar • Antrian Dapur
                  </span>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--forest)] mt-0.5">
                    Menunggu Giliran Dimasak
                  </h3>
                </div>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[var(--surface-2)] border border-[var(--forest)]/40 text-xs text-[var(--forest)] space-y-2 leading-relaxed">
                <p className="font-medium">
                  Terima kasih! Pembayaranmu telah berhasil kami terima. Pesananmu sudah masuk ke sistem antrian dapur dan sedang menunggu giliran untuk dimasak koki.
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--forest)]/20 text-[11px] text-[var(--muted)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--forest)]" />
                  <span>Silakan duduk santai. Halaman ini akan otomatis terbarui saat koki mulai memasak.</span>
                </div>
              </div>

              <Link href={`/t/${slug}/antrian`} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full gap-2 text-xs font-bold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                >
                  <Tv className="w-4 h-4 text-[var(--forest)]" />
                  <span>Pantau di Layar Antrian Restoran</span>
                </Button>
              </Link>
            </div>
          )}

          {/* C. Status: SEDANG DIMASAK (Chef Sedang Memasak di Dapur) (design.md 2.4 & 12.2) */}
          {order.status === "diproses" && (
            <div className="p-5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[8px] bg-[var(--brick)] text-white flex items-center justify-center border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] shrink-0">
                  <Flame className="w-6 h-6 stroke-[2.2] animate-bounce" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--brick)] text-white text-[10px] font-bold uppercase tracking-wider">
                    Sedang Dimasak
                  </span>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--forest)] mt-0.5">
                    Pesananmu Sedang Dimasak!
                  </h3>
                </div>
              </div>

              {/* Copy sesuai design.md 12.2: "Pesananmu sedang dimasak oleh dapur. Harap menunggu panggilan nomor antrianmu." */}
              <div className="p-3.5 rounded-[6px] bg-amber-50 border-2 border-[var(--forest)] text-xs text-[var(--forest)] space-y-2 leading-relaxed shadow-[2px_2px_0px_var(--forest)]">
                <p className="font-semibold text-sm text-[#8c3e16]">
                  &ldquo;Pesananmu sedang dimasak oleh dapur. Harap menunggu panggilan nomor antrianmu.&rdquo;
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  Koki sedang menyiapkan hidangan segar untukmu. Begitu siap, nomor antrian <strong className="text-[var(--forest)] font-bold">#{formattedQueue}</strong> akan dipanggil di kasir.
                </p>
              </div>

              {/* Progress bar solid per design.md D1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[var(--forest)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[var(--brick)]" />
                    <span>Dapur sedang memproses menu</span>
                  </span>
                  <span className="text-[var(--brick)] font-extrabold uppercase">Memasak</span>
                </div>
                <div className="w-full h-3 bg-[var(--surface-2)] rounded-[4px] border-2 border-[var(--forest)] overflow-hidden p-0.5">
                  <div className="h-full bg-[var(--brick)] rounded-[2px] w-[65%]" />
                </div>
              </div>

              <Link href={`/t/${slug}/antrian`} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full gap-2 text-xs font-bold border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                >
                  <Tv className="w-4 h-4 text-[var(--forest)]" />
                  <span>Buka Layar Panggilan Antrian TV</span>
                </Button>
              </Link>
            </div>
          )}

          {/* D. Status: SIAP DIAMBIL (design.md 2.4 & 12.2: Mint bertepi Hutan) */}
          {order.status === "siap" && (
            <div className="p-5 rounded-[8px] bg-[var(--mint)] border-3 border-[var(--forest)] shadow-[5px_5px_0px_var(--forest)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[8px] bg-[var(--forest)] text-white flex items-center justify-center border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] shrink-0">
                  <Bell className="w-6 h-6 stroke-[2.2] animate-bounce" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[var(--forest)] text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Siap Diambil Sekarang
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-[var(--forest)] mt-0.5">
                    Pesananmu Sudah Siap! 🛎️
                  </h3>
                </div>
              </div>

              {/* Copy sesuai design.md 12.2: "Pesananmu sudah siap! Ambil di kasir dengan nomor 012." */}
              <div className="p-4 rounded-[6px] bg-white border-2 border-[var(--forest)] text-center space-y-2 shadow-[3px_3px_0px_var(--forest)]">
                <p className="font-heading font-extrabold text-base sm:text-lg text-[var(--forest)]">
                  Pesananmu sudah siap! Ambil di kasir dengan nomor antrian:
                </p>
                <div className="font-heading font-extrabold text-5xl sm:text-6xl text-[var(--forest)] tabular-nums tracking-tight">
                  #{formattedQueue}
                </div>
                <p className="text-xs text-[var(--muted)] font-medium">
                  Silakan menuju ke konter kasir dan tunjukkan layar ini kepada staf kami.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={playReadyChime}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-[6px] bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-[var(--forest)]" />
                  <span>Ulangi Bunyi Bel</span>
                </button>
                <Link
                  href={`/t/${slug}/antrian`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-[6px] bg-[var(--forest)] hover:bg-[var(--forest-2)] text-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold transition-all"
                >
                  <Tv className="w-4 h-4" />
                  <span>Lihat Layar TV</span>
                </Link>
              </div>
            </div>
          )}

          {/* E. Status: SUDAH DIAMBIL (Selesai) */}
          {order.status === "diambil" && (
            <div className="p-5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] text-center space-y-3">
              <div className="w-12 h-12 rounded-[8px] bg-[var(--forest)] text-white flex items-center justify-center mx-auto border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[var(--forest)]">
                Pesanan Telah Selesai Diambil
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-xs mx-auto leading-relaxed">
                Terima kasih banyak telah berbelanja di <strong className="text-[var(--forest)]">{order.storeName}</strong>. Selamat menikmati hidanganmu!
              </p>
              <div className="pt-2">
                <Link href={`/t/${slug}`}>
                  <Button variant="primary" size="md" className="w-full gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Pesan Menu Baru Lagi</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* F. Status: DIBATALKAN */}
          {order.status === "dibatalkan" && (
            <div className="p-5 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] shadow-[4px_4px_0px_var(--danger)] text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-[var(--danger)] mx-auto" />
              <h3 className="font-heading font-bold text-lg text-[var(--danger)]">
                Pesanan Dibatalkan
              </h3>
              <p className="text-xs text-red-800 max-w-xs mx-auto">
                {order.cancelReason || "Pesanan telah dibatalkan oleh kasir atau sistem toko."}
              </p>
              <div className="pt-2">
                <Link href={`/t/${slug}`}>
                  <Button variant="secondary" size="md" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Menu Toko</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* G. Status: KEDALUWARSA */}
          {order.status === "kedaluwarsa" && (
            <div className="p-5 rounded-[8px] bg-amber-50 border-2 border-amber-600 shadow-[4px_4px_0px_#b45309] text-center space-y-3">
              <Clock className="w-10 h-10 text-amber-700 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-amber-900">
                Waktu Pembayaran Habis
              </h3>
              <p className="text-xs text-amber-800 max-w-xs mx-auto">
                Batas waktu pembayaran pesanan telah terlewati. Silakan buat pesanan baru.
              </p>
              <div className="pt-2">
                <Link href={`/t/${slug}`}>
                  <Button variant="primary" size="md" className="w-full gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Pesan Ulang</span>
                  </Button>
                </Link>
              </div>
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

      {/* MODAL PANGGILAN ANTRIAN DARI DAPUR & KASIR (PRD FR-KS-03 & design.md 6.3) */}
      {showCallModal && order && order.status === "siap" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop: ink solid 60% per design.md 5.5 (tanpa blur) */}
          <div
            className="fixed inset-0 bg-[#12201A]/80 transition-opacity animate-in fade-in duration-200"
            onClick={() => {
              hasAcknowledgedCallRef.current = true;
              setShowCallModal(false);
            }}
            aria-hidden="true"
          />

          {/* Modal Karcis Panggilan */}
          <div className="relative w-full max-w-[420px] bg-white rounded-[8px] border-3 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] overflow-hidden z-10 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[var(--mint)] border-2 border-[var(--forest)] text-[var(--forest)] text-xs font-extrabold shadow-[2px_2px_0px_var(--forest)]">
              <Bell className="w-4 h-4 animate-bounce stroke-[2.5]" />
              <span>PANGGILAN ANTRIAN KASIR</span>
            </div>

            {/* Nomor Antrian Kamu */}
            <div className="p-5 rounded-[8px] border-3 border-dashed border-[var(--forest)] bg-[var(--mint)] shadow-[3px_3px_0px_var(--forest)] space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--forest)] opacity-90 block">
                Nomor Antrian Kamu
              </span>
              <div className="font-heading font-extrabold text-6xl sm:text-7xl text-[var(--forest)] tabular-nums tracking-tight">
                #{formattedQueue}
              </div>
              <span className="text-xs font-bold text-[var(--forest)] block">
                Pesanan Sudah Selesai Dimasak!
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-extrabold text-xl text-[var(--forest)]">
                Silakan Ambil di Meja Kasir
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
                Koki di dapur telah selesai menyiapkan seluruh pesananmu. Tunjukkan nomor antrian ini ke staf kasir untuk mengambil makananmu!
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  hasAcknowledgedCallRef.current = true;
                  setShowCallModal(false);
                }}
                className="w-full gap-2 font-heading font-bold text-sm sm:text-base h-13 shadow-[3px_3px_0px_var(--forest)] cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Saya Menuju Kasir Sekarang</span>
              </Button>

              <button
                type="button"
                onClick={() => speakCustomerCall(order.queueNumber)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--forest)] hover:underline py-1 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[var(--forest)]" />
                <span>Dengarkan Ulang Suara Panggilan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
