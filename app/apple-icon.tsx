import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1B7F45",
          borderRadius: "40px",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: 120,
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "inset 0 0 0 4px rgba(255, 255, 255, 0.2)",
        }}
      >
        $
      </div>
    ),
    {
      ...size,
    }
  );
}
