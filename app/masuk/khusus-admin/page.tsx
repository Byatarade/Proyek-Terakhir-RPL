import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSuperadminUser } from "@/lib/superadmin/auth";
import { KhususAdminLoginForm } from "./KhususAdminLoginForm";

export const metadata: Metadata = {
  title: "Superadmin Login - PayBuy Control Center",
  description: "Portal masuk khusus administrator pusat platform PayBuy.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function KhususAdminLoginPage() {
  const admin = await getSuperadminUser();
  if (admin) {
    redirect("/khusus-admin");
  }

  return <KhususAdminLoginForm />;
}
