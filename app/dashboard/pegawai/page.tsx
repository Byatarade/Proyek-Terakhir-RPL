import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";
import { StaffManagement } from "@/components/organisms/StaffManagement";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";

import { getEmployeesAction } from "@/lib/employees/actions";

export const metadata: Metadata = {
  title: "Kelola Pegawai & Staf Toko - PayBuy",
  description:
    "Kelola akun pegawai toko, tentukan peran kasir dan koki dapur, atur kata sandi, serta kontrol akses staf toko Anda.",
};

export default async function DashboardPegawaiPage() {
  const { user, profile } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/pegawai");
  }

  const role = profile?.role || "owner";

  // PRD Bagian 10: Kelola Pegawai hanya dapat diakses oleh Owner
  if (role !== "owner" || !profile?.store_id) {
    return (
      <div className="bg-white border-2 border-[var(--forest)] rounded-[8px] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-[4px_4px_0px_var(--forest)]">
        <div className="w-14 h-14 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] text-[var(--danger)] flex items-center justify-center mx-auto shadow-[2px_2px_0px_var(--danger)]">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-extrabold text-xl text-[var(--forest)]">
          Akses Pegawai Terbatas
        </h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Halaman manajemen pegawai, pembagian peran kasir/dapur, dan pengaturan akun staf hanya dapat diakses oleh Pemilik Toko (Owner).
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="secondary" size="md">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const employeesRes = await getEmployeesAction(profile.store_id, user.id);
  const initialEmployees = employeesRes.success && employeesRes.data ? employeesRes.data : [];

  return <StaffManagement initialEmployees={initialEmployees} />;
}
