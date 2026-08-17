import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Placeholder art (hero image, logo slot) ships as SVG until real photography/logo
    // files are dropped in. Safe to allow locally — these are our own static assets,
    // not user-uploaded or remote SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Disable optimization for local development to avoid fetch issues
    unoptimized: process.env.NODE_ENV === "development",

    remotePatterns: [
      {
        protocol: "https",
        hostname: "dlzeiktbmoenwwkwlzmq.supabase.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
      },
    ],
  },
};

export default nextConfig;