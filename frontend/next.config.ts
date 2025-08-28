import type { NextConfig } from "next";

// Proxy de API: encaminha /api/* para o backend (NestJS).
// Use a env BACKEND_URL para customizar o destino em outros ambientes.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
