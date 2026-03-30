import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["@copilotkit/runtime", "sqlite3"],
  outputFileTracingIncludes: {
    '/api/chat': ['./src/config/system-prompt.md'],
  },
};

export default nextConfig;
