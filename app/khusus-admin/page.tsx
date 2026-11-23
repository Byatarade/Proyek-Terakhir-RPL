import type { Metadata } from "next";
import { requireSuperadmin } from "@/lib/superadmin/auth";
import { getSuperadminDataAction } from "@/lib/superadmin/actions";
import { SuperadminClient } from "./SuperadminClient";

export const metadata: Metadata = {
  title: "Superadmin Control Center - PayBuy",
  description: "Dashboard pusat pemantauan dan pengelolaan seluruh toko platform PayBuy.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function KhususAdminDashboardPage() {
  const admin = await requireSuperadmin();
  const { metrics, stores } = await getSuperadminDataAction();

  return (
    <SuperadminClient
      initialMetrics={metrics}
      initialStores={stores}
      adminEmail={admin.email}
    />
  );
}
