/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    // Fix chunk loading errors in production
    // Remove standalone for traditional hosting like Hostinger
    // output: 'standalone', // Commented out for Hostinger compatibility
    // Optimize for production hosting
    compress: true,
    // Fix webpack chunk loading
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            }
        }
        // Fix chunk loading issues
        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Vendor chunk
                    vendor: {
                        name: 'vendor',
                        chunks: 'all',
                        test: /node_modules/,
                        priority: 20
                    },
                    // Common chunk
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'async',
                        priority: 10,
                        reuseExistingChunk: true,
                        enforce: true
                    }
                }
            }
        }
        return config
    },
    // Production optimizations
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    // Ensure proper static file serving
    trailingSlash: false,
    // Fix for production chunk loading
    generateBuildId: async () => {
        return 'build-' + Date.now()
    },
}

module.exports = nextConfig
