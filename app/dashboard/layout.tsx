import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { UserRole } from "@/lib/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk?next=/dashboard");
  }

  // Load user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profileData = profile as {
    is_active?: boolean;
    role?: UserRole;
    store_id?: string;
    full_name?: string;
  } | null;

  if (profileData && profileData.is_active === false) {
    await supabase.auth.signOut();
    redirect("/masuk?error=inactive");
  }

  // Load store details
  let store = null;
  if (profileData?.store_id) {
    const { data: storeData } = await supabase
      .from("stores")
      .select("*")
      .eq("id", profileData.store_id)
      .maybeSingle();
    store = storeData;
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
