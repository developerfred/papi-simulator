import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }): Configuration => {
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];
    
    if (!isServer) {      
      config.plugins = config.plugins || [];
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['typescript', 'javascript'],
          filename: 'static/[name].worker.js', 
        })
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
};

export default nextConfig;