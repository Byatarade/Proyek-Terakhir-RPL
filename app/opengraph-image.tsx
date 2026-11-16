import { ImageResponse } from "next/og";

// Image metadata
export const alt = "PayBuy - Sistem Kasir & Pemesanan Mandiri UMKM Kuliner";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// OpenGraph Image Generation
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          backgroundColor: "#0A1410",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(27, 127, 69, 0.28) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(22, 107, 58, 0.22) 0%, transparent 45%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Top Header: Logo & Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Dollar Brand Icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                backgroundColor: "#1B7F45",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "46px",
                fontWeight: 900,
                boxShadow: "0 10px 25px -5px rgba(27, 127, 69, 0.6), inset 0 0 0 2px rgba(255, 255, 255, 0.2)",
              }}
            >
              $
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                PayBuy
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#4ade80",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: "6px",
                }}
              >
                Kasir & Pemesanan Mandiri UMKM
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "rgba(27, 127, 69, 0.2)",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#86efac",
            }}
          >
            <span>●</span>
            <span>paybuy.web.id</span>
          </div>
        </div>

        {/* Main Hero Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Pesanan Rapi Tanpa Antri,{" "}
            <span style={{ color: "#4ade80" }}>Bayar Dulu</span>, Dapur Tenang.
          </h1>

          <p
            style={{
              fontSize: "24px",
              color: "#cbd5e1",
              lineHeight: 1.45,
              margin: 0,
              fontWeight: 500,
            }}
          >
            Satu scan QR menu meja seumur toko tanpa unduh aplikasi. Pelanggan pesan mandiri, bayar QRIS dinamis otomatis, dan nomor antrian terhubung langsung ke layar dapur.
          </p>
        </div>

        {/* Feature Badges Grid */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            📱 1 QR Menu Seumur Toko
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            ⚡ QRIS Dinamis Otomatis
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            🍳 Layar Dapur Realtime
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            📊 Laba Rugi & HPP Otomatis
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
