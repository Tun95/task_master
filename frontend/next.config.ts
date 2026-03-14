/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  serverRuntimeConfig: {
    fetchTimeout: 50000,
  },

  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  },

  // Add rewrites to proxy API requests to your backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://203.161.49.37:5005/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
