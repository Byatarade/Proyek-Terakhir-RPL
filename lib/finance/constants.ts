export const EXPENSE_CATEGORIES = [
  "Bahan Baku & Dapur",
  "Operasional & Kemasan",
  "Gaji & Upah Pegawai",
  "Utilitas (Listrik, Air & Gas)",
  "Sewa Tempat / Gerobak",
  "Pemasaran & Promosi",
  "Pemeliharaan Alat",
  "Lain-lain",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
