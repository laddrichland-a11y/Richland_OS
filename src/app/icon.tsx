import { ImageResponse } from "next/og";

// Browser tab icon, generated from the Richland OS monogram.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

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
          borderRadius: 14,
          background: "#1F3A4D",
        }}
      >
        <svg width="56" height="56" viewBox="0 0 64 64">
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
