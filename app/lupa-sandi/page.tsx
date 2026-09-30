import type { Metadata } from "next";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { ForgotPasswordForm } from "@/components/organisms";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi - PayBuy",
  description:
    "Atur ulang kata sandi akun toko PayBuy Anda secara aman melalui tautan pemulihan email.",
};

export default function LupaSandiPage() {
  return (
    <AuthLayout
      type="forgot-password"
      title="Pemulihan Kata Sandi"
      subtitle="Masukkan alamat email yang terdaftar untuk menerima instruksi pengaturan ulang kata sandi."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
