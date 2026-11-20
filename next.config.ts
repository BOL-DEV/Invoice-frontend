import type { NextConfig } from "next";

const securityHeaders = [
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:5000 https://api.lenco.co https://api.squadco.com https://invoice-backend-murex.vercel.app",
      "frame-src 'self' blob:",
      "frame-ancestors 'self'",
    ].join('; '),
  },
  // Prevent clickjacking by forbidding embedding in foreign iframes:
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-sniffing:
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent sensitive path & token leakage in HTTP Referer:
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict sensitive device APIs:
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  // Enforce HTTPS Strict Transport Security:
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Disable 'x-powered-by: Next.js' to eliminate framework fingerprinting
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'https://invoice-backend-murex.vercel.app';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
