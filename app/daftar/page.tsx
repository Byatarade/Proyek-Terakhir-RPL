import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { RegisterForm } from "@/components/organisms";

export const metadata: Metadata = {
  title: "Daftar Toko Gratis - PayBuy",
  description:
    "Daftarkan warung makan, kafe, atau kedai Anda di PayBuy 100% gratis. Cetak satu QR menu seumur toko, terima pembayaran QRIS & tunai, dan rapihkan antrian dapur.",
};

export default async function DaftarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      type="register"
      title="Daftarkan Toko Anda Gratis"
      subtitle="Mulai terima pesanan mandiri lewat satu scan QR menu tanpa perangkat kasir mahal."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
