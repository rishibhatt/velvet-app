import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";

/** PostHog US/EU clouds use *.i.posthog.com for API + asset CDN (not only app.posthog.com). */
const posthogScriptSrc =
  "https://app.posthog.com https://*.i.posthog.com https://*.posthog.com";
const posthogConnectSrc =
  "https://app.posthog.com https://*.i.posthog.com https://*.posthog.com";

const adsenseScriptSrc = process.env.NEXT_PUBLIC_ADSENSE_ID
  ? "https://pagead2.googlesyndication.com https://www.googletagservices.com"
  : "";
const adsenseConnectSrc = process.env.NEXT_PUBLIC_ADSENSE_ID
  ? "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net"
  : "";

const clarityScriptSrc = "https://www.clarity.ms https://scripts.clarity.ms";
const clarityConnectSrc = "https://www.clarity.ms https://*.clarity.ms";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com ${clarityScriptSrc} ${posthogScriptSrc} ${adsenseScriptSrc}`.trim(),
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https: ${supabaseUrl}`,
      "font-src 'self' data:",
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com ${posthogConnectSrc} ${clarityConnectSrc} ${adsenseConnectSrc}`.trim(),
      "worker-src 'self' blob:",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.ngrok.io",
    "127.0.0.1",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 430, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 256, 320, 384],
    qualities: [70, 75],
    /** Fallback for non-Supabase `/_next/image` when DNS uses NAT64 (IPv4-in-IPv6) */
    dangerouslyAllowLocalIP: true,
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
      { protocol: "https", hostname: supabaseHost },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "*.pinimg.com" },
      { protocol: "https", hostname: "**.pinimg.com" },
      { protocol: "https", hostname: "*.pinterest.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "*.twimg.com" },
      { protocol: "https", hostname: "*.redd.it" },
      { protocol: "https", hostname: "*.amazon.com" },
      { protocol: "https", hostname: "*.media-amazon.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "maps.google.com" },
      { protocol: "https", hostname: "s.microlink.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
