/**
 * audio.ts — Utilitas suara untuk layar kasir
 * Berisi fungsi playChime (lonceng 2-nada) dan callQueueVoice (TTS Bahasa Indonesia).
 * Dipisahkan agar mudah diuji unit secara independen.
 */

/** Mainkan lonceng 2-nada D5 → A5 via Web Audio API */
export function playChime() {
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
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.22); // A5
    gain2.gain.setValueAtTime(0.28, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);
  } catch {
    // Abaikan batasan audio browser
  }
}

/**
 * Panggil nomor antrian via text-to-speech Bahasa Indonesia.
 * Memutar lonceng terlebih dahulu, lalu ucapkan nomor antrian 450ms kemudian.
 */
export function callQueueVoice(queueNumber: number) {
  playChime();
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

/** Format waktu berjalan sejak pesanan dibuat dengan level urgency */
export function formatElapsedTime(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const diffMinutes = Math.floor((Date.now() - created) / 60000);

  if (diffMinutes < 1) return { text: "Baru saja", level: "normal" as const };
  if (diffMinutes < 5)
    return { text: `${diffMinutes} mnt lalu`, level: "normal" as const };
  if (diffMinutes <= 10)
    return { text: `${diffMinutes} mnt lalu`, level: "warning" as const };
  return { text: `${diffMinutes} mnt lalu`, level: "danger" as const };
}
