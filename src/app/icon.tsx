import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

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
          background:
            "radial-gradient(circle at 20% 20%, #6d5dfc 0%, #311f67 45%, #050811 100%)",
          color: "#7effd4",
          fontSize: 30,
          fontWeight: 700,
          borderRadius: 14,
          border: "2px solid rgba(126,255,212,0.35)",
        }}
      >
        FH
      </div>
    ),
    {
      ...size,
    },
  );
}
