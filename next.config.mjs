
/** @type {import('next').NextConfig} */
const nextConfig = {
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
