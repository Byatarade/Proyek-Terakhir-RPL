import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { UserRole } from "@/lib/types/database";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Uses React cache() — user, profile, and store are cached in a single call
  const { user, profile: profileData, store } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard");
  }

  if (profileData && profileData.is_active === false) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/masuk?error=inactive");
  }

  const role: UserRole = profileData?.role || "owner";
  const fullName = profileData?.full_name || user.email || "Pengguna Toko";
  const storeName = store?.name || "Toko Saya";
  const storeSlug = store?.slug || "";
  const isOpen = store?.is_open ?? true;

  return (
    <DashboardShell
      storeName={storeName}
      storeSlug={storeSlug}
      isOpen={isOpen}
      fullName={fullName}
      role={role}
    >
      {children}
    </DashboardShell>
  );
}
