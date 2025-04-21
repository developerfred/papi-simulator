import type { NextConfig } from 'next';
import type { Configuration, WebpackPluginInstance } from 'webpack';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

const nextConfig: NextConfig = {
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
      config.optimization.moduleIds = 'deterministic';

    
      config.optimization.splitChunks = config.optimization.splitChunks || {};
      config.optimization.splitChunks.cacheGroups =
        config.optimization.splitChunks.cacheGroups || {};

      
      config.optimization.splitChunks.cacheGroups.wasm = {
        test: /\.wasm$/,
        type: 'javascript/auto',
        enforce: true,
      };

      
      config.plugins = config.plugins || [];
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['typescript', 'javascript'],
          filename: 'static/[name].worker.js',
        }) as WebpackPluginInstance
      );
    }


    config.module.rules.push({
      test: /\.d\.ts$/,
      use: 'raw-loader',
    });

    return config;
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
};

export default nextConfig;