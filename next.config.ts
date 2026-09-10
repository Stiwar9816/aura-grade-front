import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
	reactCompiler: true,
	reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN,
	silent: !process.env.CI,
	release: {
		name: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
	},
	widenClientFileUpload: true,
	sourcemaps: {
		deleteSourcemapsAfterUpload: true,
	},
	webpack: {
		treeshake: {
			removeDebugLogging: true,
		},
	},
});
