import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // TODO: hapus ini kalau sudah tidak butuh testing pakai gambar
      // placeholder (dipakai di scripts/seed-banners.ts &
      // scripts/seed-test-umkm.ts)
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // Proxy Umami Analytics lewat domain sendiri supaya request-nya
  // terlihat first-party dan gak gampang diblokir ad blocker. Sengaja
  // pakai path "/stats/..." dan nama file "lib.js" (bukan "umami" /
  // "script.js" / "analytics") karena itu pola yang dicocokkan blocker.
  // Tracker Umami otomatis ngirim data ke <folder script>/api/send, jadi
  // /stats/api/send juga harus di-rewrite.
  async rewrites() {
    return [
      {
        source: '/stats/lib.js',
        destination: 'https://cloud.umami.is/script.js',
      },
      {
        source: '/stats/api/send',
        destination: 'https://cloud.umami.is/api/send',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },

          { key: 'X-Content-Type-Options', value: 'nosniff' },

          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
