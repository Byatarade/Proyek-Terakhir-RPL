import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { LoginForm } from "@/components/organisms";

export const metadata: Metadata = {
  title: "Masuk ke Akun Toko - PayBuy",
  description:
    "Masuk ke dashboard toko PayBuy Anda untuk memantau pesanan mandiri, mengelola menu, antrian kasir & dapur, serta laporan keuangan.",
};

export default async function MasukPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      type="login"
      title="Masuk ke Akun Toko"
      subtitle="Kelola pesanan mandiri, antrian dapur, dan pantau keuangan tokomu dalam satu dashboard."
    >
      <LoginForm />
    </AuthLayout>
  );
}
