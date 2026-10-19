// Suara Chime Dapur untuk Pesanan Masuk Baru (design.md 17 #6 & PRD FR-KT-02)
export function playKitchenChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  } catch {
    // Ignore audio restriction
  }
}

// Format waktu berjalan sejak pesanan dibayar (design.md 356)
export function formatCookingElapsedTime(paidAt: string | null, createdAt: string) {
  const startTime = new Date(paidAt || createdAt).getTime();
  const diffMinutes = Math.floor((Date.now() - startTime) / 60000);

  if (diffMinutes < 1) return { text: "< 1 mnt", level: "normal" as const, minutes: 0 };
  if (diffMinutes < 5) return { text: `${diffMinutes} mnt`, level: "normal" as const, minutes: diffMinutes };
  if (diffMinutes <= 10) return { text: `${diffMinutes} mnt`, level: "warning" as const, minutes: diffMinutes };
  return { text: `${diffMinutes} mnt`, level: "danger" as const, minutes: diffMinutes };
}
