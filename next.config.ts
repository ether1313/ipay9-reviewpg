import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ✅ 改這裡
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
