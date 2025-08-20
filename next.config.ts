import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.daisyui.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
