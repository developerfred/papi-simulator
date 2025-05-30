import { BaseTemplates } from '../templates/BaseTemplates';
import type { DeploymentConfig, BoilerplateFile } from '../types';

export class FrameworkGenerator {
  private readonly config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  generateBoilerplate(): ReadonlyArray<BoilerplateFile> {
    const generators: Record<string, () => BoilerplateFile[]> = {
      next: () => this.generateNext(),
      vite: () => this.generateVite(),
      'create-react-app': () => this.generateCRA(),
      remix: () => this.generateRemix(),
      gatsby: () => this.generateGatsby(),
      react: () => this.generateReact()
    };

    return generators[this.config.framework]?.() || generators.react();
  }

  private generateNext(): BoilerplateFile[] {
    return [
      {
        path: 'pages/_app.tsx',
        framework: 'next',
        content: `// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ErrorBoundary } from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>${this.config.componentName} Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}`
      },
      {
        path: 'pages/index.tsx',
        framework: 'next',
        content: `// pages/index.tsx
import { ComponentDemo } from '../components/ComponentDemo';

export default function Home() {
  return <ComponentDemo />;
}`
      },
      {
        path: 'components/ErrorBoundary.tsx',
        framework: 'next',
        content: `// components/ErrorBoundary.tsx
${BaseTemplates.ERROR_BOUNDARY}`
      },
      {
        path: 'components/ComponentDemo.tsx',
        framework: 'next',
        content: `// components/ComponentDemo.tsx
${BaseTemplates.DEMO_COMPONENT(this.config.componentName, this.config.packageName)}`
      },
      {
        path: 'next.config.js',
        framework: 'next',
        content: `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, net: false, tls: false, crypto: false
      };
    }
    return config;
  },
  transpilePackages: ['polkadot-api', '@polkadot-api/descriptors', '${this.config.packageName}']
};

module.exports = nextConfig;`
      },
      this.generatePackageJson('next')
    ];
  }

  private generateVite(): BoilerplateFile[] {
    return [
      {
        path: 'src/main.tsx',
        framework: 'vite',
        content: `// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ComponentDemo } from './components/ComponentDemo';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ComponentDemo />
    </ErrorBoundary>
  </React.StrictMode>
);`
      },
      {
        path: 'src/components/ErrorBoundary.tsx',
        framework: 'vite',
        content: `// src/components/ErrorBoundary.tsx
${BaseTemplates.ERROR_BOUNDARY}`
      },
      {
        path: 'src/components/ComponentDemo.tsx',
        framework: 'vite',
        content: `// src/components/ComponentDemo.tsx
${BaseTemplates.DEMO_COMPONENT(this.config.componentName, this.config.packageName)}`
      },
      {
        path: 'vite.config.ts',
        framework: 'vite',
        content: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  optimizeDeps: {
    include: ['react', 'react-dom', 'polkadot-api', '${this.config.packageName}']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          polkadot: ['polkadot-api', '@polkadot-api/descriptors']
        }
      }
    }
  }
});`
      },
      this.generatePackageJson('vite')
    ];
  }

  private generateCRA(): BoilerplateFile[] {
    return [
      {
        path: 'src/index.tsx',
        framework: 'create-react-app',
        content: `// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ComponentDemo } from './components/ComponentDemo';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ComponentDemo />
    </ErrorBoundary>
  </React.StrictMode>
);`
      },
      {
        path: 'src/components/ErrorBoundary.tsx',
        framework: 'create-react-app',
        content: `// src/components/ErrorBoundary.tsx
${BaseTemplates.ERROR_BOUNDARY}`
      },
      {
        path: 'src/components/ComponentDemo.tsx',
        framework: 'create-react-app',
        content: `// src/components/ComponentDemo.tsx
${BaseTemplates.DEMO_COMPONENT(this.config.componentName, this.config.packageName)}`
      },
      this.generatePackageJson('create-react-app')
    ];
  }

  private generateRemix(): BoilerplateFile[] {
    return [
      {
        path: 'app/root.tsx',
        framework: 'remix',
        content: `// app/root.tsx
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';
import { ErrorBoundary } from './components/ErrorBoundary';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: '/styles/app.css' }
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}`
      },
      {
        path: 'app/routes/_index.tsx',
        framework: 'remix',
        content: `// app/routes/_index.tsx
import type { MetaFunction } from '@remix-run/node';
import { ComponentDemo } from '../components/ComponentDemo';

export const meta: MetaFunction = () => [
  { title: '${this.config.componentName} Demo' }
];

export default function Index() {
  return <ComponentDemo />;
}`
      },
      {
        path: 'app/components/ErrorBoundary.tsx',
        framework: 'remix',
        content: `// app/components/ErrorBoundary.tsx
${BaseTemplates.ERROR_BOUNDARY}`
      },
      {
        path: 'app/components/ComponentDemo.tsx',
        framework: 'remix',
        content: `// app/components/ComponentDemo.tsx
${BaseTemplates.DEMO_COMPONENT(this.config.componentName, this.config.packageName)}`
      },
      this.generatePackageJson('remix')
    ];
  }

  private generateGatsby(): BoilerplateFile[] {
    return [
      {
        path: 'src/pages/index.tsx',
        framework: 'gatsby',
        content: `// src/pages/index.tsx
import React from 'react';
import type { HeadFC, PageProps } from 'gatsby';
import { ComponentDemo } from '../components/ComponentDemo';

const IndexPage: React.FC<PageProps> = () => <ComponentDemo />;

export default IndexPage;

export const Head: HeadFC = () => (
  <>
    <title>${this.config.componentName} Demo</title>
    <meta name="description" content="Polkadot component demo with Gatsby" />
  </>
);`
      },
      {
        path: 'src/components/ComponentDemo.tsx',
        framework: 'gatsby',
        content: `// src/components/ComponentDemo.tsx
${BaseTemplates.DEMO_COMPONENT(this.config.componentName, this.config.packageName)}`
      },
      {
        path: 'gatsby-config.ts',
        framework: 'gatsby',
        content: `// gatsby-config.ts
import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: '${this.config.componentName} Demo'
  },
  plugins: ['gatsby-plugin-postcss', 'gatsby-plugin-image']
};

export default config;`
      },
      this.generatePackageJson('gatsby')
    ];
  }

  private generateReact(): BoilerplateFile[] {
    return [
      {
        path: 'src/App.tsx',
        framework: 'react',
        content: `// src/App.tsx
import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ComponentDemo } from './components/ComponentDemo';

export default function App() {
  return (
    <ErrorBoundary>
      <ComponentDemo />
    </ErrorBoundary>
  );
}`
      },
      {
        path: 'src/components/ErrorBoundary.tsx',
        framework: 'react',
        content: `// src/components/ErrorBoundary.tsx
${BaseTemplates.ERROR_BOUNDARY}`
      },
      {
        path: 'src/components/ComponentDemo.tsx',
        framework: 'react',
        content: `// src/components/ComponentDemo.tsx
${BaseTemplates.DEMO_COMPONENT(this.config.componentName, this.config.packageName)}`
      },
      this.generatePackageJson('react')
    ];
  }

  private generatePackageJson(framework: string): BoilerplateFile {
    const frameworkDeps: Record<string, Record<string, string>> = {
      next: { next: '^14.0.0', '@types/node': '^20.0.0' },
      vite: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.2.1' },
      'create-react-app': { 'react-scripts': '^5.0.1' },
      remix: { '@remix-run/node': '^2.0.0', '@remix-run/react': '^2.0.0' },
      gatsby: { gatsby: '^5.0.0', 'gatsby-plugin-postcss': '^6.0.0' }
    };

    const pkg = {
      ...BaseTemplates.PACKAGE_JSON_BASE,
      name: `${this.config.packageName}-demo`,
      dependencies: {
        ...BaseTemplates.PACKAGE_JSON_BASE.dependencies,
        [this.config.packageName]: '^1.0.0',
        ...frameworkDeps[framework]
      },
      scripts: this.getScripts(framework)
    };

    return {
      path: 'package.json',
      framework: framework as any,
      content: `// package.json
${JSON.stringify(pkg, null, 2)}`
    };
  }

  private getScripts(framework: string): Record<string, string> {
    const scripts: Record<string, Record<string, string>> = {
      next: { dev: 'next dev', build: 'next build', start: 'next start' },
      vite: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      'create-react-app': { start: 'react-scripts start', build: 'react-scripts build' },
      remix: { dev: 'remix dev', build: 'remix build', start: 'remix-serve build' },
      gatsby: { develop: 'gatsby develop', build: 'gatsby build', serve: 'gatsby serve' }
    };
    return scripts[framework] || scripts.react;
  }
}