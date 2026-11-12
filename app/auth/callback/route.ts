import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  // Tentukan base URL tujuan (utamakan domain publik resmi)
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (requestUrl.origin.includes("localhost") ? "https://paybuy.web.id" : requestUrl.origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl));
    }
  }

  // If code is missing or exchange failed, redirect to login
  return NextResponse.redirect(
    new URL("/masuk?error=Tautan verifikasi tidak valid atau telah kedaluwarsa", baseUrl)
  );
}
