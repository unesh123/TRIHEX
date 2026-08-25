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
          background: "#f8fbfd",
          borderRadius: 8,
          padding: 5,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
          <path d="M10 8.5 16 5l6 3.5v7L16 19l-6-3.5v-7Z" fill="#0c5877" />
          <path d="m14 16.5 6-3.5 6 3.5v7L20 27l-6-3.5v-7Z" fill="#08a5bf" />
          <path d="m6 16.5 6-3.5 6 3.5v7L12 27l-6-3.5v-7Z" fill="#6757d9" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
