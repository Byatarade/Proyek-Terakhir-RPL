import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://paybuy.byatara.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/dashboard/*",
          "/admin",
          "/admin/",
          "/admin/*",
          "/api",
          "/api/",
          "/auth",
          "/auth/",
          "/onboarding",
          "/onboarding/",
          "/lupa-sandi",
          "/lupa-sandi/",
          "/t/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
