import type { NextConfig } from "next";

/**
 * API yönlendirmesi `src/app/api/proxy/[...path]/route.ts` üzerinden yapılır.
 */
const devAllowedOrigins = (
  process.env.DEV_ALLOWED_ORIGINS?.split(",").map((h) => h.trim()).filter(Boolean) ?? [
    "10.192.173.233",
    "127.0.0.1",
    "localhost",
  ]
);

const nextConfig: NextConfig = {
  // Next 16: Network URL (10.x.x.x:3000) ile açılınca HMR engellenmesin — aksi halde beyaz ekran
  allowedDevOrigins: devAllowedOrigins,
};

export default nextConfig;
