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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://paybuy.web.id";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "PayBuy - Sistem Kasir & Pemesanan Mandiri untuk UMKM Kuliner",
    template: "%s | PayBuy",
  },
  description:
    "Aplikasi kasir dan pemesanan mandiri berbasis web untuk UMKM makanan & minuman. Pelanggan memesan lewat scan 1 QR menu tanpa unduh aplikasi, bayar dulu dengan QRIS dinamis atau tunai, dan nomor antrian otomatis.",
  keywords: [
    // Brand & Identitas
    "PayBuy",
    "PayBuy POS",
    "PayBuy Indonesia",
    // Sistem Kasir & POS F&B
    "aplikasi kasir online",
    "aplikasi kasir gratis",
    "software kasir UMKM",
    "sistem kasir berbasis web",
    "POS kasir restoran",
    "aplikasi kasir kafe",
    "aplikasi kasir kedai kopi",
    "aplikasi kasir warung makan",
    "cloud POS Indonesia",
    "mesin kasir tanpa hardware mahal",
    // Pemesanan Mandiri & QR Menu
    "self ordering system",
    "menu QR code restoran",
    "scan QR menu meja",
    "pesan makanan lewat QR",
    "QR order cafe",
    "buku menu digital QR",
    "aplikasi pemesanan mandiri",
    "satu QR seumur toko",
    "menu digital tanpa download aplikasi",
    "contactless ordering restaurant",
    // Pembayaran & QRIS Dinamis
    "QRIS dinamis otomatis",
    "kasir QRIS tanpa salah nominal",
    "pembayaran QRIS restoran",
    "kasir non tunai UMKM",
    "QRIS merchant UMKM kuliner",
    // Dapur & Antrian
    "kitchen display system indonesia",
    "KDS layar dapur realtime",
    "sistem antrian makanan otomatis",
    "nomor antrian dapur",
    "manajemen pesanan restoran",
    // Manajemen & Keuangan
    "aplikasi hitung HPP kuliner",
    "laporan laba rugi UMKM",
    "pencatatan omzet harian restoran",
    "manajemen menu dan kasir cafe",
  ],
  authors: [{ name: "Byatarade" }],
  creator: "Byatarade",
  publisher: "PayBuy",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: appUrl,
    siteName: "PayBuy",
    title: "PayBuy - Sistem Kasir & Pemesanan Mandiri untuk UMKM Kuliner",
    description:
      "Pesanan rapi tanpa antri, bayar dulu, dapur tenang. Scan 1 QR menu meja tanpa unduh aplikasi, QRIS dinamis otomatis, dan layar dapur realtime.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayBuy - Sistem Kasir & Pemesanan Mandiri untuk UMKM Kuliner",
    description:
      "Aplikasi kasir web & self-ordering QR untuk UMKM kuliner. Scan QR, bayar QRIS otomatis, dan antrian dapur rapi.",
  },
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
