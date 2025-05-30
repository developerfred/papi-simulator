export type PackageManager = 'npm' | 'yarn' | 'pnpm';
export type Framework = 'react' | 'next' | 'vite' | 'create-react-app';
export type ExportFormat = 'esm' | 'cjs' | 'both';
export type StyleFramework = 'css' | 'styled-components' | 'emotion' | 'tailwind';

export interface ExportOptions {
    readonly componentName: string;
    readonly includeStyles: boolean;
    readonly includeTypes: boolean;
    readonly packageManager: PackageManager;
    readonly framework: Framework;
    readonly exportFormat: ExportFormat;
    readonly styleFramework: StyleFramework;
    readonly includePapiConfig: boolean;
    readonly includeTests: boolean;
    readonly includeStorybook: boolean;
    readonly minifyOutput: boolean;
}

export interface ExportedComponent {
    readonly componentCode: string;
    readonly packageJson: string;
    readonly readme: string;
    readonly setupInstructions: string;
    readonly papiConfig: string;
    readonly dependencies: Readonly<Record<string, string>>;
    readonly devDependencies: Readonly<Record<string, string>>;
    readonly types?: string;
    readonly styles?: string;
    readonly tests?: string;
    readonly storybook?: string;
    readonly buildConfig: string;
    readonly deployConfig: string;
}

export interface ChainConfig {
    readonly chainId: string;
    readonly descriptorKey: string;
    readonly endpoint: string;
    readonly alternativeEndpoints: readonly string[];
    readonly papiName: string;
}

export interface ExportMetrics {
    readonly linesOfCode: number;
    readonly bundleSize: number;
    readonly dependencies: number;
    readonly typeComplexity: number;
}