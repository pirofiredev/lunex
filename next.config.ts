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

		// Serve images directly without the /_next/image optimizer
		unoptimized: true,

		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
			{
				protocol: "http",
				hostname: "**",
			},
		],
	},
};

export default nextConfig;
