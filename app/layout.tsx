import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const heading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "PayBuy - Sistem Kasir & Pemesanan Mandiri untuk UMKM Kuliner",
  description:
    "Aplikasi kasir dan pemesanan mandiri berbasis web untuk UMKM makanan & minuman. Pelanggan memesan lewat scan 1 QR menu tanpa unduh aplikasi, bayar dulu dengan QRIS atau tunai, dan nomor antrian otomatis.",
  keywords: [
    "Sistem Kasir",
    "POS UMKM",
    "Self Ordering QR",
    "QRIS Dinamis",
    "Aplikasi Kasir Warung Kafe",
    "Nomor Antrian Dapur",
  ],
  authors: [{ name: "Byatarade" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
