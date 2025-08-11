import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This stops ESLint from failing the build
  },
};

export default nextConfig;
