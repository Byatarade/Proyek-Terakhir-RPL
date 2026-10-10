import { headers } from "next/headers";

/**
 * Interface hasil pengecekan rate limit
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Timestamp waktu reset (ms)
  retryAfter: number; // Detik yang harus ditunggu sebelum mencoba lagi
  error?: string;
}

export interface RateLimitOptions {
  /** Jumlah maksimal request yang diizinkan dalam satu window waktu */
  limit: number;
  /** Durasi window waktu dalam satuan detik */
  windowSeconds: number;
  /** Pesan error kustom jika batas tercapai */
  errorMessage?: string;
}

// In-memory sliding window cache per key -> array timestamp (ms)
const rateLimitMap = new Map<string, number[]>();

// Batas ukuran cache sebelum dilakukan pembersihan otomatis (garbage collection)
const MAX_CACHE_SIZE = 10000;

/**
 * Membersihkan entri yang sudah kedaluwarsa dari in-memory cache
 */
function cleanupExpiredEntries(now: number, windowSeconds: number) {
  const cutoff = now - windowSeconds * 1000;
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const validTimestamps = timestamps.filter((t) => t > cutoff);
    if (validTimestamps.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, validTimestamps);
    }
  }
}

/**
 * Mendapatkan IP client pengirim request secara aman dari HTTP Headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();

    // 1. Cek header standar proksi x-forwarded-for (ambil IP pertama jika rantai proksi)
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      const firstIp = forwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }

    // 2. Cek header x-real-ip
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp.trim();

    // 3. Cek Cloudflare connecting IP
    const cfIp = headerList.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    // 4. Cek Fastly / True-Client-IP
    const trueClientIp = headerList.get("true-client-ip");
    if (trueClientIp) return trueClientIp.trim();

    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Pengecekan rate limit generik menggunakan algoritma Sliding Window
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { limit, windowSeconds, errorMessage } = options;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  // Lakukan pembersihan jika ukuran map melebihi batas aman
  if (rateLimitMap.size > MAX_CACHE_SIZE) {
    cleanupExpiredEntries(now, windowSeconds);
  }

  // Ambil data timestamp request sebelumnya untuk key ini
  const existingTimestamps = rateLimitMap.get(key) || [];
  const validTimestamps = existingTimestamps.filter((t) => t > windowStart);

  // Jika jumlah request sudah melebihi batas yang diizinkan
  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0] || now;
    const resetTime = oldestTimestamp + windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));

    const defaultMsg = `Terlalu banyak permintaan. Mohon tunggu ${retryAfter} detik sebelum mencoba kembali.`;

    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
      retryAfter,
      error: errorMessage || defaultMsg,
    };
  }

  // Tambahkan timestamp saat ini ke daftar request
  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - validTimestamps.length),
    reset: now + windowMs,
    retryAfter: 0,
  };
}

/**
 * Rate limiter khusus pembuatan pesanan publik pelanggan (PRD 9.6 FR-OR-07)
 * Membatasi maksimal 5 pesanan per 60 detik per IP dan per toko untuk mencegah spam pesanan iseng.
 */
export async function rateLimitOrderCreation(slug: string): Promise<RateLimitResult> {
  const clientIp = await getClientIp();
  const key = `order_create:${slug.toLowerCase().trim()}:${clientIp}`;

  return checkRateLimit(key, {
    limit: 5, // Maksimal 5 pesanan
    windowSeconds: 60, // Dalam kurun waktu 1 menit (60 detik)
    errorMessage:
      "Terlalu banyak pesanan dibuat dalam waktu singkat dari perangkat Anda. Mohon tunggu 1 menit sebelum membuat pesanan baru.",
  });
}
