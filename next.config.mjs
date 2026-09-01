import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Pin the workspace root. Without this, a stray lockfile in a parent
    // directory makes Turbopack infer the wrong root and the build output
    // lands where the server cannot find it — every route 404s.
    root: __dirname,
  },
};

export default nextConfig;
