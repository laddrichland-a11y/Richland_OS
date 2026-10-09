import { ImageResponse } from "next/og";

// Next.js App Router file convention: auto-generates the
// <link rel="apple-touch-icon"> tag, which is what iOS actually uses for
// "Add to Home Screen" (it ignores manifest.json icons for this). No
// border-radius here — iOS applies its own rounded-square mask on top, so a
// pre-rounded image would double up / look inconsistent with other icons.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#1F3A4D",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 64 64">
          <path
            d="M22 46V18h11.5c6.4 0 10.5 3.4 10.5 8.6 0 4-2.4 6.9-6.3 8L45 46h-6.9l-6.5-10.6H28V46h-6Zm6-15.8h5.2c3.1 0 4.8-1.3 4.8-3.6s-1.7-3.6-4.8-3.6H28v7.2Z"
            fill="#F7F3EC"
          />
          <path d="M14 52h36" stroke="#C9A45C" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
