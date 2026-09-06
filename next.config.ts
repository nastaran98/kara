import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  // @kara/domain is workspace TS source, not a pre-built package — Next
  // needs to compile it itself rather than treating it as opaque node_modules.
  transpilePackages: ["@kara/domain"],
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)