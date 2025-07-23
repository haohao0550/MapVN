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
  env: {
    CESIUM_BASE_URL: 'https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium',
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
