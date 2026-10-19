export const EXPIRY_PRESETS = [
  { label: "5 Menit (Cepat)", value: 5 },
  { label: "10 Menit", value: 10 },
  { label: "15 Menit (Standar)", value: 15 },
  { label: "30 Menit", value: 30 },
  { label: "60 Menit (1 Jam)", value: 60 },
];

export const TIMEZONE_OPTIONS = [
  {
    value: "Asia/Jakarta",
    label: "WIB — Waktu Indonesia Barat (UTC+7)",
    cities: "Jakarta, Surabaya, Medan, Bandung",
  },
  {
    value: "Asia/Makassar",
    label: "WITA — Waktu Indonesia Tengah (UTC+8)",
    cities: "Denpasar (Bali), Makassar, Balikpapan, Manado",
  },
  {
    value: "Asia/Jayapura",
    label: "WIT — Waktu Indonesia Timur (UTC+9)",
    cities: "Jayapura, Ambon, Sorong, Merauke",
  },
];

export interface StoreSettingsProps {
  className?: string;
}
