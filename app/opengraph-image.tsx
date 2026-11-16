import { ImageResponse } from "next/og";

// Image metadata
export const alt = "PayBuy - Kasir & Pemesanan Mandiri UMKM";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Minimalist Center-Aligned OpenGraph Image (Matching Reference)
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Center Container: Logo Dollar + Nama Brand PayBuy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "36px",
          }}
        >
          {/* Logo Dollar PayBuy */}
          <div
            style={{
              width: "136px",
              height: "136px",
              borderRadius: "38px",
              backgroundColor: "#1B7F45",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "88px",
              fontWeight: 900,
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxShadow: "0 14px 35px -6px rgba(27, 127, 69, 0.32)",
            }}
          >
            $
          </div>

          {/* Nama Web: PayBuy */}
          <span
            style={{
              fontSize: "128px",
              fontWeight: 900,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.045em",
              color: "#09090b",
              lineHeight: 1,
            }}
          >
            PayBuy
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
