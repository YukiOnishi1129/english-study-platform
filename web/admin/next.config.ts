import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  transpilePackages: ["@acme/shared"],
};

export default nextConfig;
