/**
 * Modul QRIS Murni (EMVCo & Standar QRIS Bank Indonesia / ASPI)
 * Logika bisnis murni tanpa dependensi UI / jaringan untuk validasi,
 * pembacaan, dan konversi QRIS statis ke dinamis.
 */

export interface TlvItem {
  tag: string;
  length: number;
  value: string;
}

export interface QrisValidationResult {
  valid: boolean;
  error?: string;
  merchantName?: string;
  merchantCity?: string;
  nmid?: string;
  isDynamic?: boolean;
  currency?: string;
  countryCode?: string;
  payload?: string;
}

/**
 * Menghitung CRC16 (CRC-CCITT / XMODEM) sesuai standar EMVCo
 * Polinomial: 0x1021, Nilai awal: 0xFFFF
 */
export function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    crc ^= code << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Mem-parse string TLV (Tag-Length-Value) EMVCo
 */
export function parseTlv(payload: string): TlvItem[] {
  const items: TlvItem[] = [];
  let i = 0;

  while (i < payload.length) {
    if (i + 4 > payload.length) break;

    const tag = payload.substring(i, i + 2);
    const lengthStr = payload.substring(i + 2, i + 4);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length) || length < 0 || i + 4 + length > payload.length) {
      break;
    }

    const value = payload.substring(i + 4, i + 4 + length);
    items.push({ tag, length, value });
    i += 4 + length;
  }

  return items;
}

/**
 * Mem-parse sub-TLV di dalam tag tertentu (misalnya Tag 26-45 / 51)
 */
export function parseSubTlv(value: string): Map<string, string> {
  const map = new Map<string, string>();
  const items = parseTlv(value);
  for (const item of items) {
    map.set(item.tag, item.value);
  }
  return map;
}

/**
 * Mengambil nama merchant dari payload QRIS (Tag 59)
 */
export function getMerchantName(payload: string): string | null {
  const items = parseTlv(payload);
  const tag59 = items.find((item) => item.tag === "59");
  return tag59 ? tag59.value.trim() : null;
}

/**
 * Memvalidasi apakah string merupakan QRIS yang sah:
 * 1. Struktur TLV valid
 * 2. Tag 00 bernilai "01" (Payload Format Indicator)
 * 3. Tag 01 ada ("11" = statis atau "12" = dinamis)
 * 4. Memiliki merchant account (Tag 26 - 45 atau 51)
 * 5. Negara "ID" (Tag 58) dan Mata uang "360" (Tag 53, Rupiah)
 * 6. Nama merchant tidak kosong (Tag 59)
 * 7. Checksum CRC16 (Tag 63) cocok dengan kalkulasi
 */
export function validateQris(rawPayload: string): QrisValidationResult {
  const payload = rawPayload.trim();

  if (!payload || payload.length < 24) {
    return {
      valid: false,
      error: "Kode QR tidak memiliki format QRIS yang lengkap atau terlalu pendek.",
    };
  }

  const items = parseTlv(payload);
  if (items.length === 0) {
    return {
      valid: false,
      error: "Format kode QR tidak dapat dibaca sebagai format standar TLV EMVCo.",
    };
  }

  const tagMap = new Map<string, string>();
  for (const item of items) {
    tagMap.set(item.tag, item.value);
  }

  // 1. Tag 00: Payload Format Indicator (harus "01")
  if (tagMap.get("00") !== "01") {
    return {
      valid: false,
      error: "Bukan format standar EMVCo (Tag 00 bukan 01). Pastikan ini adalah kode QRIS resmi.",
    };
  }

  // 2. Tag 01: Point of Initiation Method ("11" = Statis, "12" = Dinamis)
  const tag01 = tagMap.get("01");
  if (tag01 !== "11" && tag01 !== "12") {
    return {
      valid: false,
      error: "Metode inisiasi QRIS tidak dikenali (bukan QRIS Statis maupun Dinamis).",
    };
  }

  // 3. Penanda Akun Merchant: Tag 26-45 atau Tag 51
  let hasMerchantAccount = false;
  let nmid: string | undefined;

  for (let t = 26; t <= 45; t++) {
    const tStr = t.toString().padStart(2, "0");
    if (tagMap.has(tStr)) {
      hasMerchantAccount = true;
      const sub = parseSubTlv(tagMap.get(tStr)!);
      const sub01 = sub.get("01");
      if (sub01 && !nmid) {
        nmid = sub01;
      }
    }
  }

  if (tagMap.has("51")) {
    hasMerchantAccount = true;
    const sub = parseSubTlv(tagMap.get("51")!);
    const sub01 = sub.get("01");
    if (sub01 && !nmid) {
      nmid = sub01;
    }
  }

  if (!hasMerchantAccount) {
    return {
      valid: false,
      error: "Kode QR tidak memiliki informasi rekening/merchant QRIS Bank Indonesia yang sah.",
    };
  }

  // 4. Tag 58: Country Code ("ID")
  const country = tagMap.get("58");
  if (country !== "ID") {
    return {
      valid: false,
      error: "Kode QR bukan untuk wilayah Indonesia (Kode negara bukan 'ID').",
    };
  }

  // 5. Tag 53: Transaction Currency ("360" = IDR)
  const currency = tagMap.get("53");
  if (currency !== "360") {
    return {
      valid: false,
      error: "Mata uang pada QRIS bukan Rupiah (360).",
    };
  }

  // 6. Tag 59: Merchant Name
  const merchantName = tagMap.get("59")?.trim();
  if (!merchantName) {
    return {
      valid: false,
      error: "Nama merchant tidak ditemukan di dalam data QRIS.",
    };
  }

  // 7. Tag 60: Merchant City
  const merchantCity = tagMap.get("60")?.trim();

  // 8. Tag 63: CRC16 Verification
  const crcItem = items.find((item) => item.tag === "63");
  if (!crcItem || crcItem.length !== 4) {
    return {
      valid: false,
      error: "Kode checksum CRC16 (Tag 63) tidak ditemukan pada kode QRIS.",
    };
  }

  const crcIndex = payload.lastIndexOf("6304");
  if (crcIndex === -1) {
    return {
      valid: false,
      error: "Struktur checksum Tag 6304 tidak valid.",
    };
  }

  const stringToHash = payload.substring(0, crcIndex + 4);
  const expectedCrc = crc16(stringToHash);
  const actualCrc = payload.substring(crcIndex + 4, crcIndex + 8).toUpperCase();

  if (expectedCrc !== actualCrc) {
    return {
      valid: false,
      error: `Checksum QRIS tidak cocok (dihitung: ${expectedCrc}, terbaca: ${actualCrc}). Gambar mungkin buram atau data QR rusak.`,
    };
  }

  return {
    valid: true,
    merchantName,
    merchantCity,
    nmid,
    isDynamic: tag01 === "12",
    currency: "IDR",
    countryCode: "ID",
    payload,
  };
}

/**
 * Mengubah QRIS Statis menjadi QRIS Dinamis dengan menyisipkan nominal (Tag 54)
 * dan menghitung ulang checksum CRC16 (Tag 63)
 */
export function toDynamicQris(payload: string, amount: number): string {
  const validation = validateQris(payload);
  if (!validation.valid) {
    throw new Error(`QRIS tidak valid: ${validation.error}`);
  }

  const items = parseTlv(payload);
  const amountStr = Math.round(amount).toString();
  const formattedAmount = `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`;

  // Filter out Tag 63 (CRC) and build new string
  let output = "";
  let tag54Inserted = false;

  for (const item of items) {
    // Abaikan Tag 63 lama karena akan dihitung ulang di akhir
    if (item.tag === "63") continue;

    // Jika Tag 01, ubah menjadi "12" (Dynamic)
    if (item.tag === "01") {
      output += "010212";
      continue;
    }

    // Jika ada Tag 54 lama, ganti dengan yang baru
    if (item.tag === "54") {
      output += formattedAmount;
      tag54Inserted = true;
      continue;
    }

    // Jika belum disisipkan dan kita melewati Tag 53 atau masuk Tag 58, sisipkan Tag 54
    if (!tag54Inserted && (parseInt(item.tag, 10) > 54 || item.tag === "58")) {
      output += formattedAmount;
      tag54Inserted = true;
    }

    // Tambahkan tag asli
    const lenStr = item.length.toString().padStart(2, "0");
    output += `${item.tag}${lenStr}${item.value}`;
  }

  if (!tag54Inserted) {
    output += formattedAmount;
  }

  // Tambahkan tag CRC 6304 dan kalkulasikan checksum baru
  const baseForCrc = `${output}6304`;
  const newCrc = crc16(baseForCrc);

  return `${baseForCrc}${newCrc}`;
}
