"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChefHat,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Loader2,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  UtensilsCrossed,
} from "lucide-react";
import { getPublicQueueAction, PublicQueueData } from "@/lib/kitchen/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Suara Chime Lonceng 2-Nada
function playChimeSound() {
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
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.22); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);
  } catch {
    // Ignore audio restriction
  }
}

// Panggil Suara Bahasa Indonesia via Web Speech API (FR-KS-03)
function speakQueueAnnouncement(queueNumber: number) {
  playChimeSound();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const formatted = String(queueNumber).padStart(3, "0");
    const utterance = new SpeechSynthesisUtterance(
      `Nomor antrian ${formatted}, pesanan siap diambil di kasir.`
    );
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 450);
  }
}

export default function PublicQueuePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [queueData, setQueueData] = useState<PublicQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const prevReadyNumbersRef = useRef<number[]>([]);

  // Update Jam Digital
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data antrian publik
  const loadQueue = async () => {
    if (!slug) return;
    const res = await getPublicQueueAction(slug);
    if (res.success && res.data) {
      // Deteksi nomor baru yang masuk ke status siap
      const prev = prevReadyNumbersRef.current;
      const current = res.data.readyNumbers;

      if (prev.length > 0 && soundEnabled) {
        const newlyReady = current.filter((n) => !prev.includes(n));
        if (newlyReady.length > 0) {
          speakQueueAnnouncement(newlyReady[0]);
        }
      }
      prevReadyNumbersRef.current = current;

      setQueueData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      loadQueue();
    }, 0);

    // Supabase Realtime channel
    const supabase = createClient();
    const channel = supabase
      .channel("public-queue-screen")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadQueue();
        }
      )
      .subscribe();

    // Polling fallback setiap 4 detik
    const poll = setInterval(loadQueue, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, soundEnabled]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--leaf)] mx-auto" />
          <p className="font-heading font-semibold text-sm tracking-wider text-zinc-700">
            Memuat Layar Antrian Restoran...
          </p>
        </div>
      </div>
    );
  }

  const cookingNumbers = queueData?.cookingNumbers || [];
  const readyNumbers = queueData?.readyNumbers || [];
  const lastCalled = queueData?.lastCalledNumber || (readyNumbers.length > 0 ? readyNumbers[0] : null);

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-[var(--mint)] selection:text-[var(--forest)]">
      {/* Top Header Layar Antrian */}
      <header className="px-6 py-4 bg-white border-b border-[var(--line)] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href={`/t/${slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white hover:bg-zinc-50 text-zinc-700 border border-[var(--line)] text-xs font-semibold shadow-2xs transition-all"
            title="Kembali ke Menu Toko"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Menu Toko</span>
          </Link>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--leaf)] block">
              Papan Antrian Pesanan
            </span>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-zinc-950 tracking-wide">
              {queueData?.storeName || "Toko"}
            </h1>
          </div>
        </div>

        {/* Toolbar Jam & Kontrol TV */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-zinc-50 border border-[var(--line)] text-zinc-800 font-heading font-bold text-sm tabular-nums shadow-2xs">
            <Clock className="w-4 h-4 text-[var(--leaf)]" />
            <span>{currentTime}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!soundEnabled) {
                // Mainkan test chime saat pertama kali diaktifkan
                playChimeSound();
              }
              setSoundEnabled(!soundEnabled);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] border text-xs font-bold transition-all cursor-pointer shadow-2xs",
              soundEnabled
                ? "bg-[var(--leaf)] text-white border-[var(--leaf)] hover:bg-[#166B3A]"
                : "bg-white text-zinc-700 border-[var(--line)] hover:bg-zinc-50"
            )}
            title={soundEnabled ? "Panggilan suara aktif" : "Aktifkan suara panggilan"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Panggilan Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-zinc-400" />
                <span>Aktifkan Suara</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-[8px] bg-white hover:bg-zinc-50 text-zinc-700 border border-[var(--line)] shadow-2xs transition-all cursor-pointer"
            title="Layar Penuh (TV Mode)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Queue Display: 2 Columns (Sedang Dimasak vs Siap Diambil) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
        {/* Kolom Kiri (Lg 5 Kolom): SEDANG DIMASAK / DISIAPKAN */}
        <section className="lg:col-span-5 flex flex-col bg-white border-2 border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-dashed border-[var(--line)] pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-zinc-900 uppercase tracking-wider">
                  Sedang Dimasak
                </h2>
                <span className="text-[11px] text-zinc-500 block">
                  Koki sedang menyiapkan pesanan
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-100 font-heading font-bold text-xs tabular-nums text-zinc-700 border border-zinc-200">
              {cookingNumbers.length} Antrian
            </span>
          </div>

          {cookingNumbers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <ChefHat className="w-12 h-12 text-zinc-300 mb-2" />
              <p className="font-heading font-semibold text-sm text-zinc-400">
                Tidak ada pesanan dalam proses masak
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[65vh]">
              {cookingNumbers.map((num) => (
                <div
                  key={num}
                  className="bg-zinc-50 hover:bg-white border-2 border-zinc-200 hover:border-zinc-300 rounded-xl p-3 text-center shadow-2xs transition-all"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Antrian
                  </span>
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-zinc-900 tabular-nums tracking-tight mt-0.5">
                    {String(num).padStart(3, "0")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Kolom Kanan (Lg 7 Kolom): SIAP DIAMBIL DI KASIR */}
        <section className="lg:col-span-7 flex flex-col bg-emerald-50/40 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(27,127,69,0.06)]">
          <div className="flex items-center justify-between border-b border-dashed border-emerald-200 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--leaf)] text-white flex items-center justify-center border border-emerald-700 shadow-xs">
                <Bell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-[var(--leaf)] uppercase tracking-wider">
                  Siap Diambil di Kasir
                </h2>
                <span className="text-[11px] text-zinc-600 block">
                  Silakan menuju konter kasir membawa nomor antrian
                </span>
              </div>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-[var(--leaf)] font-heading font-extrabold text-xs tabular-nums text-white shadow-xs">
              {readyNumbers.length} Siap
            </span>
          </div>

          {readyNumbers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-emerald-200 rounded-xl bg-white/80">
              <Bell className="w-12 h-12 text-emerald-300 mb-3" />
              <p className="font-heading font-bold text-base text-zinc-800">
                Belum ada pesanan yang siap diambil
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mt-1">
                Nomor antrian yang sudah matang akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Highlight Nomor Paling Baru Dipanggil */}
              {lastCalled && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[var(--leaf)] border-2 border-emerald-700 text-white text-center shadow-[0_8px_24px_rgba(27,127,69,0.22)]">
                  <span className="inline-block px-3.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest mb-1 backdrop-blur-xs">
                    Panggilan Terakhir
                  </span>
                  <div className="font-heading font-black text-6xl sm:text-7xl lg:text-8xl tabular-nums tracking-tight">
                    {String(lastCalled).padStart(3, "0")}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold block mt-1 text-emerald-100">
                    Pesanan Siap! Silakan ambil di kasir
                  </span>
                </div>
              )}

              {/* Grid Nomor Siap Lainnya */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[45vh]">
                {readyNumbers.map((num) => {
                  const isLatest = num === lastCalled;
                  return (
                    <div
                      key={num}
                      className={cn(
                        "rounded-xl p-3.5 text-center border-2 transition-all shadow-xs",
                        isLatest
                          ? "bg-[var(--leaf)] text-white border-emerald-700 shadow-md ring-2 ring-emerald-300"
                          : "bg-white text-zinc-950 border-emerald-300 hover:border-emerald-500 hover:shadow-md"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-extrabold uppercase tracking-wider block",
                          isLatest ? "text-emerald-100 opacity-90" : "text-emerald-700"
                        )}
                      >
                        Siap Diambil
                      </span>
                      <div className="font-heading font-extrabold text-4xl sm:text-5xl tabular-nums tracking-tight mt-0.5">
                        {String(num).padStart(3, "0")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer Info Ticker Bar */}
      <footer className="px-6 py-3.5 bg-white border-t border-[var(--line)] text-center text-xs font-medium text-zinc-500 flex items-center justify-center gap-2 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
        <span>
          Harap memperhatikan nomor antrian yang tampil di layar. Tunjukkan bukti nota di ponselmu saat mengambil pesanan di kasir.
        </span>
      </footer>
    </div>
  );
}
