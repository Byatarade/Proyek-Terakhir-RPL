import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { ResetPasswordForm } from "@/components/organisms";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi - PayBuy",
  description:
    "Tetapkan kata sandi baru yang aman untuk akun toko PayBuy Anda.",
};

export default async function AturUlangSandiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthLayout
      type="reset-password"
      title="Atur Kata Sandi Baru"
      subtitle="Masukkan kata sandi baru yang aman untuk melanjutkan akses ke toko Anda."
    >
      <ResetPasswordForm initialEmail={user?.email} />
    </AuthLayout>
  );
}
