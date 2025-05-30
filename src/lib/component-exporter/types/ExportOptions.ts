export type PackageManager = 'npm' | 'yarn' | 'pnpm';
export type Framework = 'react' | 'next' | 'vite';
export type ExportFormat = 'esm' | 'cjs' | 'both';

export interface ExportOptions {
  componentName: string;
  includeStyles: boolean;
  includeTypes: boolean;
  packageManager: PackageManager;
  framework: Framework;
  exportFormat: ExportFormat;
}
