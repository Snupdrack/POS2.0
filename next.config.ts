import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Railway necesita escuchar en 0.0.0.0
  // El custom server.ts maneja hostname y PORT dinámico
};

export default nextConfig;
