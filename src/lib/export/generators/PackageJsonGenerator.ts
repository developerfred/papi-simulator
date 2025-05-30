/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import type { ExportOptions, ChainConfig } from '../types';
import { DEFAULT_DEPENDENCIES, FRAMEWORK_DEPENDENCIES, STYLE_DEPENDENCIES } from '../constants';

export class PackageJsonGenerator {
    private readonly options: ExportOptions;
    private readonly chainConfig: ChainConfig;

    constructor(options: ExportOptions, chainConfig: ChainConfig) {
        this.options = options;
        this.chainConfig = chainConfig;
    }

    generate(): string {
        const packageData = {
            name: `@polkadot/${this.options.componentName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            version: '1.0.0',
            description: `Production-ready Polkadot component: ${this.options.componentName}`,
            main: this.getMainField(),
            module: this.options.exportFormat !== 'cjs' ? 'dist/index.mjs' : undefined,
            types: this.options.includeTypes ? 'dist/index.d.ts' : undefined,
            files: ['dist', 'README.md', 'SETUP.md', 'papi-setup.js'],
            exports: this.generateExports(),
            scripts: this.generateScripts(),
            repository: {
                type: 'git',
                url: `https://github.com/polkadot-api/${this.options.componentName.toLowerCase()}.git`
            },
            keywords: [
                'polkadot', 'substrate', 'blockchain', 'web3', 'react', 'component',
                'typescript', this.chainConfig.chainId, this.options.componentName.toLowerCase()
            ],
            author: 'Polkadot API Playground',
            license: 'MIT',
            peerDependencies: { react: '>=16.8.0', 'react-dom': '>=16.8.0' },
            dependencies: this.generateDependencies(),
            devDependencies: this.generateDevDependencies(),
            engines: { node: '>=18.0.0', npm: '>=8.0.0' },
            publishConfig: { access: 'public' }
        };

        return JSON.stringify(this.removeUndefined(packageData), null, 2);
    }

    private getMainField(): string {
        return this.options.exportFormat === 'cjs' ? 'dist/index.js' :
            this.options.exportFormat === 'esm' ? 'dist/index.mjs' : 'dist/index.js';
    }

    private generateExports(): Record<string, unknown> {
        const exports: Record<string, unknown> = {};

        if (this.options.exportFormat === 'both') {
            exports['.'] = {
                import: './dist/index.mjs',
                require: './dist/index.js',
                types: this.options.includeTypes ? './dist/index.d.ts' : undefined
            };
        } else {
            exports['.'] = this.getMainField();
        }

        if (this.options.includeStyles) {
            exports['./styles'] = './dist/styles.css';
        }

        return exports;
    }

    private generateScripts(): Record<string, string> {
        const baseScripts = {
            clean: 'rimraf dist',
            'type-check': 'tsc --noEmit',
            lint: 'eslint src --ext .ts,.tsx --fix',
            'lint:check': 'eslint src --ext .ts,.tsx'
        };

        const frameworkScripts = {
            next: { build: 'next build', dev: 'next dev', start: 'next start' },
            vite: { build: 'vite build', dev: 'vite', preview: 'vite preview' },
            'create-react-app': { build: 'react-scripts build', start: 'react-scripts start' },
            react: { build: 'rollup -c', dev: 'rollup -c -w' }
        };

        const scripts = {
            ...baseScripts,
            ...frameworkScripts[this.options.framework] || frameworkScripts.react
        };

        if (this.options.includeTests) {
            Object.assign(scripts, {
                test: 'jest',
                'test:watch': 'jest --watch',
                'test:coverage': 'jest --coverage'
            });
        }

        if (this.options.includeStorybook) {
            Object.assign(scripts, {
                storybook: 'storybook dev -p 6006',
                'build-storybook': 'storybook build'
            });
        }

        scripts.prepublishOnly = 'npm run lint:check && npm run type-check && npm run build';
        return scripts;
    }

    private generateDependencies(): Record<string, string> {
        return {
            ...DEFAULT_DEPENDENCIES,
            ...FRAMEWORK_DEPENDENCIES[this.options.framework],
            ...STYLE_DEPENDENCIES[this.options.styleFramework]
        };
    }

    private generateDevDependencies(): Record<string, string> {
        const devDeps: Record<string, string> = {
            'rimraf': '^5.0.0',
            'eslint': '^8.57.0',
            '@typescript-eslint/eslint-plugin': '^6.21.0',
            '@typescript-eslint/parser': '^6.21.0'
        };

        if (this.options.includeTypes) {
            Object.assign(devDeps, {
                'typescript': '^5.3.0',
                '@types/react': '^18.2.0',
                '@types/react-dom': '^18.2.0'
            });
        }

        if (this.options.includeTests) {
            Object.assign(devDeps, {
                'jest': '^29.7.0',
                '@testing-library/react': '^14.1.0',
                '@testing-library/jest-dom': '^6.1.0',
                '@types/jest': '^29.5.0'
            });
        }

        if (this.options.includeStorybook) {
            Object.assign(devDeps, {
                '@storybook/react': '^7.6.0',
                '@storybook/react-vite': '^7.6.0',
                '@storybook/addon-essentials': '^7.6.0'
            });
        }

        return devDeps;
    }

    private removeUndefined(obj: Record<string, unknown>): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    const nested = this.removeUndefined(value as Record<string, unknown>);
                    if (Object.keys(nested).length > 0) result[key] = nested;
                } else {
                    result[key] = value;
                }
            }
        }
        return result;
    }
}