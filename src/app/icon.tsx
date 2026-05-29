import { ImageResponse } from "next/og";

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
          background: "#11141c",
          color: "#c9a227",
          fontSize: 26,
          fontWeight: 700,
          borderRadius: 14,
          border: "2px solid rgba(201,162,39,0.35)",
        }}
      >
        FH
      </div>
    ),
    { ...size },
  );
}
