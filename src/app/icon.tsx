import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Compact TRIHEX brand mark for browser tabs and installed app icons. */
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(2, 132, 199, 0.4)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
          <path d="M10 8.5 16 5l6 3.5v7L16 19l-6-3.5v-7Z" fill="#38bdf8" />
          <path d="m14 16.5 6-3.5 6 3.5v7L20 27l-6-3.5v-7Z" fill="#60a5fa" />
          <path d="m6 16.5 6-3.5 6 3.5v7L12 27l-6-3.5v-7Z" fill="#818cf8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
