import type {
  NextConfig,
} from "next";

const isProduction =
  process.env.NODE_ENV ===
  "production";

const contentSecurityPolicy =
[
  "default-src 'self'",

  "base-uri 'self'",

  "frame-ancestors 'none'",

  "object-src 'none'",

  "form-action 'self'",

  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

  "style-src 'self' 'unsafe-inline'",

  "img-src 'self' data: blob: https:",

  "font-src 'self' data:",

  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",

  "frame-src 'self' blob: https:",

  "media-src 'self' blob: https:",

  isProduction
    ? "upgrade-insecure-requests"
    : "",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [

  {
    key:
      "Content-Security-Policy",

    value:
      contentSecurityPolicy,
  },

  {
    key:
      "Referrer-Policy",

    value:
      "strict-origin-when-cross-origin",
  },

  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },

  {
    key:
      "X-Frame-Options",

    value:
      "DENY",
  },

  {
    key:
      "Permissions-Policy",

    value:
      "camera=(), microphone=(), geolocation=()",
  },

  ...(isProduction
    ? [
        {
          key:
            "Strict-Transport-Security",

          value:
            "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig:
  NextConfig =
{
  output:
    "standalone",

  poweredByHeader:
    false,

  compress:
    true,

  reactStrictMode:
    true,

  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

  async headers() {

    return [
      {
        source:
          "/(.*)",

        headers:
          securityHeaders,
      },
    ];
  },
};

export default nextConfig;
