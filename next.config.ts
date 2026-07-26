import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Note: This is only useful if you are NOT using the `appDir` option.
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withSerwist(nextConfig);
