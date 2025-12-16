import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@supabase/supabase-js', '@supabase/ssr'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    // Suppress the default export warning for Supabase wrapper
    config.module.rules.push({
      test: /node_modules\/@supabase\/supabase-js\/dist\/esm\/wrapper\.mjs$/,
      parser: {
        strictExportPresence: false,
      },
    })
    return config
  },
}

export default nextConfig