import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/organisms/OnboardingWizard";
import { StoreOnboardingData } from "@/lib/stores/actions";

export const metadata = {
  title: "Onboarding Toko & Pengaturan QRIS - PayBuy",
  description:
    "Konfigurasi metode pembayaran QRIS dan identitas toko Anda setelah pendaftaran akun PayBuy.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk?next=/onboarding");
  }

  // Ambil profil pengguna
  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const profileData = profile as {
    store_id?: string;
    full_name?: string;
    role?: string;
  } | null;

  if (!profileData?.store_id) {
    // Jika profil belum terhubung dengan toko (misal pendaftaran abnormal), arahkan ke daftar
    redirect("/daftar");
  }

  // Ambil data toko
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, accept_cash, accept_qris, qris_merchant_name, qris_payload")
    .eq("id", profileData.store_id)
    .maybeSingle();

  const storeData = store as {
    id: string;
    name: string;
    slug: string;
    accept_cash: boolean;
    accept_qris: boolean;
    qris_merchant_name: string | null;
    qris_payload: string | null;
  } | null;

  if (!storeData) {
    redirect("/daftar");
  }

  const initialStore: StoreOnboardingData = {
    id: storeData.id,
    name: storeData.name,
    slug: storeData.slug,
    acceptCash: storeData.accept_cash ?? true,
    acceptQris: storeData.accept_qris ?? false,
    qrisMerchantName: storeData.qris_merchant_name,
    qrisPayload: storeData.qris_payload,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-[var(--line)] bg-white px-4 sm:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-[var(--leaf)] flex items-center justify-center shadow-subtle group-hover:bg-zinc-800 transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-tight text-zinc-950 leading-none">
                PayBuy
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-zinc-500 mt-0.5">
                Onboarding Toko &amp; Pembayaran
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-[var(--muted)] hidden sm:inline">Masuk sebagai:</span>
            <span className="font-medium text-[var(--ink)] bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--line)]">
              {profileData.full_name || user.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Wizard Area */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-10">
        <OnboardingWizard initialStore={initialStore} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--line)] bg-white py-4 px-4 text-center text-xs text-[var(--muted)]">
        <p>
          &copy; {new Date().getFullYear()} PayBuy. Sistem Kasir &amp; Pemesanan Mandiri UMKM.
          Multi-Tenant Terisolasi Aman.
        </p>
      </footer>
    </div>
  );
}
