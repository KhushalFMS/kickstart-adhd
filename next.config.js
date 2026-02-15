module.exports = {
  images: {
    domains: ['example.com'], // List your allowed image domains here
  },
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: true,
  },
  performance: {
    hints: false,
  },
};