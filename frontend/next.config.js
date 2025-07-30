// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Cesium for client-side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        cesium: 'cesium'
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        url: false,
        https: false,
        http: false,
        stream: false,
        crypto: false,
        zlib: false
      };
    }

    return config;
  },

  // API Rewrites - Forward API calls to backend
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    console.log(`🔄 Setting up API rewrites to: ${backendUrl}`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // Optional: Headers for better CORS handling
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  env: {
    CESIUM_BASE_URL: 'https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium',
    // Backend URL for API calls
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },

  images: {
    domains: ['localhost'],
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Disable static optimization in development for better debugging
    experimental: {
      // Add any experimental features here if needed
    },
  }),

  // onDemandEntries: {
  //   websocketPort: 0, // Tắt WebSocket port
  // },
  // experimental: {
  //   reactRefresh: false,
  // },
};

module.exports = nextConfig;