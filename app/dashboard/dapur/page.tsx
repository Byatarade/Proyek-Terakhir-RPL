import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardDapurPage() {
  // Alur dapur sekarang dikendalikan langsung melalui Layar Kasir
  redirect("/dashboard/kasir");
}

