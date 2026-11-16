import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
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
          borderRadius: "8px",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: 22,
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
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
