import { ExportOptions } from "../../types/ExportOptions";

interface PackageJsonConfig {
  name: string;
  version: string;
  description: string;
  main?: string;
  module?: string;
  types?: string;
  scripts: Record<string, string | undefined>;
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  keywords: string[];
  author: string;
  license: string;
}

export const generatePackageJson = (
  options: ExportOptions,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  networkName: string
): string => {
  const config: PackageJsonConfig = {
    name: `polkadot-${options.componentName.toLowerCase()}`,
    version: '1.0.0',
    description: `Exported Polkadot component: ${options.componentName} for ${networkName}`,
    scripts: {
      build: options.framework === 'vite' 
        ? 'vite build' 
        : options.framework === 'next' 
          ? 'next build' 
          : 'tsc && rollup -c',
      dev: options.framework === 'vite' 
        ? 'vite' 
        : options.framework === 'next' 
          ? 'next dev' 
          : 'tsc --watch',
      lint: 'eslint src --ext .ts,.tsx',
      'type-check': options.includeTypes ? 'tsc --noEmit' : undefined,
    },
    peerDependencies: {
      react: '>=16.8.0',
      'react-dom': '>=16.8.0',
    },
    dependencies,
    keywords: [
      'polkadot',
      'substrate',
      'blockchain',
      'react',
      'component',
      networkName.toLowerCase(),
    ],
    author: 'Polkadot API Playground',
    license: 'MIT',
  };

  if (options.exportFormat !== 'cjs') config.module = 'dist/index.mjs';
  if (options.exportFormat !== 'esm') config.main = 'dist/index.js';
  if (options.includeTypes) config.types = 'dist/index.d.ts';
  if (Object.keys(devDependencies).length > 0) {
    config.devDependencies = devDependencies;
  }

  // Clean undefined values
  Object.keys(config.scripts).forEach(key => {
    if (config.scripts[key] === undefined) {
      delete config.scripts[key];
    }
  });

  return JSON.stringify(config, null, 2);
};
