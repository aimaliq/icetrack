/**
 * Canonical origin. Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every
 * deployment, which keeps preview builds from advertising the production
 * domain in their metadata — but production still resolves to icetrack.vip.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_ENV === "production"
    ? "https://icetrack.vip"
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://icetrack.vip";

export const SITE_NAME = "IceTrack";
