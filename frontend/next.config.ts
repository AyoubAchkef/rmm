import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@react-three/fiber', 'three'],
  },
};

export default nextConfig;
