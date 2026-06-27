import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Playwright (used by the save/re-render route) out of the server bundle —
  // it's a large native package loaded on demand at request time.
  serverExternalPackages: ["playwright"],
};

export default nextConfig;
