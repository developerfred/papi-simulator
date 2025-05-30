/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ExportOptions } from '../types';

export class ConfigGenerator {

    static generateBuildConfig(options: ExportOptions): string {
        const generators = {
            vite: () => this.generateViteConfig(options),
            next: () => this.generateNextConfig(options),
            'create-react-app': () => this.generateCRAConfig(options),
            react: () => this.generateRollupConfig(options)
        };

        return generators[options.framework]?.() || generators.react();
    }

  
    private static generateViteConfig(options: ExportOptions): string {
        return `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
${options.includeTypes ? "import dts from 'vite-plugin-dts';" : ''}
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    ${options.includeTypes ? 'dts({ include: ["src"], outDir: "dist/types" }),' : ''}
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: '${options.componentName}',
      formats: [${this.getFormats(options.exportFormat)}],
      fileName: (format) => \`index.\${format === 'es' ? 'mjs' : 'js'}\`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsx'
        }
      }
    },
    minify: ${options.minifyOutput ? "'terser'" : 'false'},
    sourcemap: true,
    target: 'esnext'
  },
  // Essential for polkadot-api compatibility
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'polkadot-api',
      '@polkadot-api/descriptors'
    ]
  },
  server: {
    port: 3000,
    open: true
  }
});`;
    }

    /**
     * Generates Next.js configuration with polkadot-api optimizations
     */
    private static generateNextConfig(options: ExportOptions): string {
        return `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Essential webpack configuration for polkadot-api
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        util: false,
        buffer: false
      };
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };
    
    return config;
  },
  
  // Transpile polkadot packages for compatibility
  transpilePackages: [
    'polkadot-api',
    '@polkadot-api/descriptors'
  ],
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
    browsersListForSwc: true,
    esmExternals: true
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;`;
    }

    /**
     * Generates Create React App configuration via CRACO
     */
    private static generateCRAConfig(options: ExportOptions): string {
        return `// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Polkadot-api compatibility
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        fs: false,
        net: false,
        tls: false
      };
      
      // Add polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
      
      return webpackConfig;
    },
  },
  ${options.includeTypes ? `
  typescript: {
    enableTypeChecking: true,
  },` : ''}
};

// package.json script modification needed:
// "start": "craco start",
// "build": "craco build",
// "test": "craco test"`;
    }

    /**
     * Generates Rollup configuration for standalone React builds
     */
    private static generateRollupConfig(options: ExportOptions): string {
        return `// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';

const config = {
  input: 'src/index.tsx',
  output: [
    ${options.exportFormat === 'cjs' || options.exportFormat === 'both' ? `{
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },` : ''}
    ${options.exportFormat === 'esm' || options.exportFormat === 'both' ? `{
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true
    },` : ''}
  ].filter(Boolean),
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      preferBuiltins: false,
      skip: ['react', 'react-dom']
    }),
    commonjs({
      include: ['node_modules/**']
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: ${options.includeTypes},
      declarationDir: ${options.includeTypes ? "'dist/types'" : 'undefined'},
      exclude: ['**/*.test.*', '**/*.stories.*']
    }),
    ${options.minifyOutput ? 'terser({' : ''}
    ${options.minifyOutput ? `  compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true
    }),` : ''}
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false
    })
  ].filter(Boolean),
  external: ['react', 'react-dom', 'polkadot-api', '@polkadot-api/descriptors']
};

export default config;`;
    }

    /**
     * Generates TypeScript configuration
     */
    static generateTSConfig(options: ExportOptions): string {
        return `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": [
      "DOM",
      "DOM.Iterable",
      "ES6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": ${!options.includeTypes},
    "jsx": "react-jsx",
    ${options.includeTypes ? `"declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist",` : ''}
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.*",
    "**/*.spec.*"
  ]
}`;
    }

    /**
     * Generates ESLint configuration
     */
    static generateESLintConfig(options: ExportOptions): string {
        return `{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}`;
    }

    /**
     * Generates Prettier configuration
     */
    static generatePrettierConfig(): string {
        return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "quoteProps": "as-needed",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}`;
    }

    /**
     * Generates PostCSS configuration for CSS processing
     */
    static generatePostCSSConfig(options: ExportOptions): string {
        const plugins = ['autoprefixer'];

        if (options.styleFramework === 'tailwind') {
            plugins.unshift('tailwindcss');
        }

        return `module.exports = {
  plugins: [
    ${plugins.map(plugin => `require('${plugin}'),`).join('\n    ')}
  ],
};`;
    }

    /**
     * Generates Tailwind CSS configuration
     */
    static generateTailwindConfig(options: ExportOptions): string {
        if (options.styleFramework !== 'tailwind') return '';

        return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./stories/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polkadot: {
          primary: '#E6007A',
          secondary: '#552BBF',
          accent: '#00D2AA',
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#E6007A',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};`;
    }

    /**
     * Generates environment configuration
     */
    static generateEnvConfig(): string {
        return `# Environment Configuration
# Copy this file to .env.local and update values as needed

# Polkadot API Configuration
NEXT_PUBLIC_POLKADOT_ENDPOINT=wss://polkadot-rpc.dwellir.com
NEXT_PUBLIC_KUSAMA_ENDPOINT=wss://kusama-rpc.dwellir.com
NEXT_PUBLIC_WESTEND_ENDPOINT=wss://westend-rpc.dwellir.com

# Development Configuration
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=false

# Application Configuration
NEXT_PUBLIC_APP_NAME=Polkadot Component
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Custom Chain Configuration
# NEXT_PUBLIC_CUSTOM_CHAIN_ENDPOINT=wss://your-chain-endpoint.com
# NEXT_PUBLIC_CUSTOM_CHAIN_NAME=Your Chain Name`;
    }

    /**
     * Generates Docker configuration
     */
    static generateDockerConfig(options: ExportOptions): string {
        return `# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN ${options.packageManager} ci --only=production

# Copy source code
COPY . .

# Build the application
RUN ${options.packageManager} run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# .dockerignore
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
.idea`;
    }

    /**
     * Generates GitHub Actions workflow
     */
    static generateGitHubActions(options: ExportOptions): string {
        return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: '${options.packageManager}'
    
    - name: Install dependencies
      run: ${options.packageManager} ci
    
    - name: Run linter
      run: ${options.packageManager} run lint
    
    - name: Type check
      run: ${options.packageManager} run type-check
    
    ${options.includeTests ? `- name: Run tests
      run: ${options.packageManager} run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3` : ''}
    
    - name: Build
      run: ${options.packageManager} run build
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: '${options.packageManager}'
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: ${options.packageManager} ci
    
    - name: Build package
      run: ${options.packageManager} run build
    
    - name: Publish to NPM
      run: ${options.packageManager} publish
      env:
        NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
      if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')`;
    }

    /**
     * Helper method to get build formats
     */
    private static getFormats(exportFormat: string): string {
        switch (exportFormat) {
            case 'esm': return "'es'";
            case 'cjs': return "'cjs'";
            case 'both': return "'es', 'cjs'";
            default: return "'es'";
        }
    }

    /**
     * Generates complete configuration bundle
     */
    static generateCompleteConfig(options: ExportOptions): Record<string, string> {
        const configs: Record<string, string> = {
            'build.config.js': this.generateBuildConfig(options),
            'tsconfig.json': this.generateTSConfig(options),
            '.eslintrc.json': this.generateESLintConfig(options),
            '.prettierrc': this.generatePrettierConfig(),
            '.env.example': this.generateEnvConfig(),
            'Dockerfile': this.generateDockerConfig(options),
            '.github/workflows/ci.yml': this.generateGitHubActions(options)
        };

        if (options.styleFramework === 'tailwind') {
            configs['tailwind.config.js'] = this.generateTailwindConfig(options);
            configs['postcss.config.js'] = this.generatePostCSSConfig(options);
        }

        return configs;
    }
}