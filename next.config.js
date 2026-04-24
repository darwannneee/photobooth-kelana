/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase API route body size limit to 20MB (for photo + GIF uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
}

module.exports = nextConfig
