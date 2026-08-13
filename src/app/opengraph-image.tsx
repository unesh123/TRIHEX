import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TRIHEX DIGITAL — AI & Digital Tools for Nepal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #0f3d6e 0%, #0d5c63 45%, #0f766e 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9, letterSpacing: 2 }}>
          TRIHEX DIGITAL
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            Premium AI & Digital Tools for Nepal
          </div>
          <div style={{ fontSize: 28, opacity: 0.92 }}>
            NPR pricing · Website checkout · WhatsApp support
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.85 }}>trihexdigital.shop</div>
      </div>
    ),
    { ...size },
  );
}
