import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,

  // SQLite ফাইলটি সার্ভারলেস ফাংশনের বান্ডেলে যোগ করা
  outputFileTracingIncludes: {
    '/**': ['./dev.db'],
  },

  images: {
    // দোকানের নিজের আপলোড করা ছবি /public/uploads এ থাকে।
    // বাইরের কোনো সোর্স ব্যবহার করতে চাইলে এখানে যোগ করুন।
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    // পণ্যের কার্ড থেকে শুরু করে বড় গ্যালারি পর্যন্ত যেসব মাপ দরকার
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 90],
  },

  // অর্ডারের ছবি আপলোডের জন্য বডি সাইজ একটু বাড়ানো
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
}

export default nextConfig
