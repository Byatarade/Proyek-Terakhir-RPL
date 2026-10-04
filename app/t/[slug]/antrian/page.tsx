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
    loadQueue();

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
      <div className="min-h-screen bg-[var(--forest)] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--mint)] mx-auto" />
          <p className="font-heading font-semibold text-sm tracking-wider text-[var(--mint)]">
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
    // Latar Hutan, nomor siap sangat besar berlatar Mint bertepi Putih/Hutan (design.md 14)
    <div className="min-h-screen bg-[var(--forest)] text-white flex flex-col justify-between selection:bg-[var(--mint)] selection:text-[var(--forest)]">
      {/* Top Header Layar Antrian */}
      <header className="px-6 py-4 bg-[#0a2c1e] border-b-2 border-[#17513A] flex items-center justify-between shadow-[0_4px_0px_#051810]">
        <div className="flex items-center gap-4">
          <Link
            href={`/t/${slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#17513A] hover:bg-[#1f684b] text-white border border-[var(--mint)]/40 text-xs font-semibold transition-all"
            title="Kembali ke Menu Toko"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Menu Toko</span>
          </Link>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--mint)] block">
              Papan Antrian Pesanan
            </span>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-wide">
              {queueData?.storeName || "Toko"}
            </h1>
          </div>
        </div>

        {/* Toolbar Jam & Kontrol TV */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#17513A] border border-[var(--mint)]/30 text-white font-heading font-bold text-sm tabular-nums">
            <Clock className="w-4 h-4 text-[var(--mint)]" />
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
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-bold transition-all cursor-pointer",
              soundEnabled
                ? "bg-[var(--mint)] text-[var(--forest)] border-white shadow-[2px_2px_0px_white]"
                : "bg-[#17513A] text-white border-[var(--mint)]/40 hover:bg-[#1f684b]"
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
                <VolumeX className="w-4 h-4 text-[var(--mint)]" />
                <span>Aktifkan Suara</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-[6px] bg-[#17513A] hover:bg-[#1f684b] text-white border border-[var(--mint)]/40 transition-all cursor-pointer"
            title="Layar Penuh (TV Mode)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Queue Display: 2 Columns (Sedang Dimasak vs Siap Diambil) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri (Lg 5 Kolom): SEDANG DIMASAK / DISIAPKAN */}
        <section className="lg:col-span-5 flex flex-col bg-[#0b3323] border-3 border-[#17513A] rounded-[10px] p-5 shadow-[6px_6px_0px_#051810]">
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#17513A] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#17513A] text-[var(--mint)] flex items-center justify-center border border-[var(--mint)]/30">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-white uppercase tracking-wider">
                  Sedang Dimasak
                </h2>
                <span className="text-[11px] text-[var(--mint)] opacity-80 block">
                  Koki sedang menyiapkan pesanan
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-[6px] bg-[#17513A] font-heading font-bold text-xs tabular-nums text-[var(--mint)] border border-[var(--mint)]/30">
              {cookingNumbers.length} Antrian
            </span>
          </div>

          {cookingNumbers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#17513A] rounded-[8px]">
              <ChefHat className="w-10 h-10 text-[var(--mint)]/50 mb-2" />
              <p className="font-heading font-semibold text-sm text-[var(--mint)]/70">
                Tidak ada pesanan dalam proses masak
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[65vh]">
              {cookingNumbers.map((num) => (
                <div
                  key={num}
                  className="bg-[#134631] border-2 border-[var(--mint)]/30 rounded-[8px] p-3 text-center shadow-[3px_3px_0px_#051810]"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--mint)] opacity-80 block">
                    Antrian
                  </span>
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white tabular-nums tracking-tight mt-0.5">
                    {String(num).padStart(3, "0")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Kolom Kanan (Lg 7 Kolom): SIAP DIAMBIL (Nomor Sangat Besar Berlatar Mint bertepi Hutan/Putih) */}
        <section className="lg:col-span-7 flex flex-col bg-[#0b3323] border-3 border-[var(--mint)] rounded-[10px] p-5 shadow-[6px_6px_0px_#051810]">
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#17513A] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[var(--mint)] text-[var(--forest)] flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_white]">
                <Bell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-[var(--mint)] uppercase tracking-wider">
                  Siap Diambil di Kasir
                </h2>
                <span className="text-[11px] text-white opacity-90 block">
                  Silakan menuju konter kasir membawa nomor antrian
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-[6px] bg-[var(--mint)] font-heading font-extrabold text-xs tabular-nums text-[var(--forest)] border-2 border-white shadow-[2px_2px_0px_white]">
              {readyNumbers.length} Siap
            </span>
          </div>

          {readyNumbers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#17513A] rounded-[8px]">
              <Bell className="w-12 h-12 text-[var(--mint)]/40 mb-3" />
              <p className="font-heading font-bold text-base text-[var(--mint)]">
                Belum ada pesanan yang siap diambil
              </p>
              <p className="text-xs text-white/70 max-w-xs mt-1">
                Nomor antrian yang sudah matang akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Highlight Nomor Paling Baru Dipanggil */}
              {lastCalled && (
                <div className="p-4 rounded-[8px] bg-[var(--mint)] border-3 border-white text-[var(--forest)] text-center shadow-[4px_4px_0px_white]">
                  <span className="inline-block px-3 py-0.5 rounded-[4px] bg-[var(--forest)] text-white text-[10px] font-extrabold uppercase tracking-widest mb-1">
                    Panggilan Terakhir
                  </span>
                  <div className="font-heading font-extrabold text-6xl sm:text-7xl lg:text-8xl tabular-nums tracking-tight">
                    {String(lastCalled).padStart(3, "0")}
                  </div>
                  <span className="text-xs font-bold block mt-1">
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
                        "rounded-[8px] p-3 text-center border-3 transition-all",
                        isLatest
                          ? "bg-[var(--mint)] text-[var(--forest)] border-white shadow-[3px_3px_0px_white]"
                          : "bg-white text-[var(--forest)] border-[var(--forest)] shadow-[3px_3px_0px_#17513A]"
                      )}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80 block">
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
      <footer className="px-6 py-3 bg-[#0a2c1e] border-t-2 border-[#17513A] text-center text-xs font-medium text-[var(--mint)]">
        <span>
          Harap memperhatikan nomor antrian yang tampil di layar. Tunjukkan bukti nota di ponselmu saat mengambil pesanan di kasir.
        </span>
      </footer>
    </div>
  );
}
