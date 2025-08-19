
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Set ignoreBuildErrors to true only in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Set ignoreDuringBuilds to true only in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || 'imagedelivery.net',
      },
    ],
  },
};

export default nextConfig;
