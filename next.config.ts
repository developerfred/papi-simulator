import type { NextConfig } from "next";
import type { Configuration, WebpackPluginInstance } from "webpack";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com https://vercel.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' wss: ws: https:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config: Configuration, { isServer }): Configuration => {
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.moduleIds = "deterministic";

      config.optimization.splitChunks = config.optimization.splitChunks || {};
      config.optimization.splitChunks.cacheGroups =
        config.optimization.splitChunks.cacheGroups || {};

      config.optimization.splitChunks.cacheGroups.wasm = {
        test: /\.wasm$/,
        type: "javascript/auto",
        enforce: true,
      };

      config.plugins = config.plugins || [];
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["typescript", "javascript"],
          filename: "static/[name].worker.js",
        }) as WebpackPluginInstance,
      );
    }

    config.module.rules.push({
      test: /\.d\.ts$/,
      use: "raw-loader",
    });

    return config;
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
