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
