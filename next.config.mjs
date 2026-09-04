import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 *
 * `script-src` keeps 'unsafe-inline' because Next's App Router ships its
 * hydration payload as inline scripts; going stricter means nonce plumbing
 * through the render. Even so, the policy blocks what matters most here:
 * scripts loading from anywhere else, framing by other sites, and form
 * posts leaving the origin. Dev additionally needs eval and websockets —
 * granted only there, so production never carries them.
 *
 * vercel.live is the preview-deployment toolbar; harmless in production,
 * where it never loads.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  // Contributors link photos from Wikimedia and elsewhere; https-anywhere for
  // images is the feature, not an oversight.
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live${isDev ? " ws:" : ""}`,
  // The two tracking maps are the only third-party frames.
  "frame-src https://globe.adsb.fi https://www.vesselfinder.com https://vercel.live",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Legacy twin of frame-ancestors, for anything old enough to need it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Pin the workspace root. Without this, a stray lockfile in a parent
    // directory makes Turbopack infer the wrong root and the build output
    // lands where the server cannot find it — every route 404s.
    root: __dirname,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
