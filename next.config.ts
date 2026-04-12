import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.CAPACITOR === "true",
  },
};

export default nextConfig;
