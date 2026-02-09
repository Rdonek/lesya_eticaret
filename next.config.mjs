// Silence Node.js warnings (like the localstorage-file warning on Windows)
process.env.NODE_NO_WARNINGS = '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration and other noisy fetch logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  webpack: (config) => {
    // Suppress Webpack performance hints about big strings
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
};

export default nextConfig;
