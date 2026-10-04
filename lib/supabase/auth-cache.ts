import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/database";

export interface AuthenticatedProfile {
  userId: string;
  storeId: string | null;
  role: UserRole;
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface CachedStore {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  is_open: boolean;
  accept_cash?: boolean;
  accept_qris?: boolean;
  qris_merchant_name?: string | null;
  qris_payload?: string | null;
}

/**
 * Cached auth & store helper — deduplicates supabase.auth.getUser(), profiles,
 * and stores queries within the same React Server Component request lifecycle.
 *
 * React's cache() ensures this function is called only ONCE per request,
 * even if invoked from layout.tsx AND page.tsx (and any nested server components).
 */
export const getAuthenticatedProfile = cache(async (): Promise<{
  user: { id: string; email?: string } | null;
  profile: { store_id: string; role: UserRole; full_name?: string; is_active?: boolean } | null;
  store: CachedStore | null;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, store: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id, role, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile = profile as {
    store_id: string;
    role: UserRole;
    full_name?: string;
    is_active?: boolean;
  } | null;

  let store: CachedStore | null = null;
  if (typedProfile?.store_id) {
    const { data: storeData } = await supabase
      .from("stores")
      .select("id, name, slug, plan, is_open, accept_cash, accept_qris, qris_merchant_name, qris_payload")
      .eq("id", typedProfile.store_id)
      .maybeSingle();

    store = storeData as CachedStore | null;
  }

  return {
    user: { id: user.id, email: user.email },
    profile: typedProfile,
    store,
  };
});

