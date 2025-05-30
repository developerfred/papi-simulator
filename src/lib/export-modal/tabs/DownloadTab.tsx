import type React from 'react';
import { useMemo } from 'react';
import type { TabProps } from '../types';
import { getFileExtension } from '../utils';

export const DownloadTab: React.FC<TabProps> = ({
  exportedComponent,
  options,
  onDownloadFile,
  onDownloadAll,
}) => {
  const downloadableFiles = useMemo(() => [
    { key: 'component', name: 'Component (index.tsx)', content: exportedComponent?.componentCode, icon: '⚛️' },
    { key: 'package', name: 'package.json', content: exportedComponent?.packageJson, icon: '📦' },
    { key: 'readme', name: 'README.md', content: exportedComponent?.readme, icon: '📋' },
    { key: 'setup', name: 'SETUP.md', content: exportedComponent?.setupInstructions, icon: '🔧' },
    ...(exportedComponent?.types ? [{ key: 'types', name: 'Type Definitions (index.d.ts)', content: exportedComponent.types, icon: '🏷️' }] : []),
    ...(exportedComponent?.styles ? [{ key: 'styles', name: 'Styles (styles.css)', content: exportedComponent.styles, icon: '🎨' }] : [])
  ], [exportedComponent]);

  if (!exportedComponent || !options) return null;

  return (
    <div className="flex flex-col gap-8 p-2">
      {/* Download All Section */}
      <div className="relative overflow-hidden rounded-xl border border-theme bg-theme-surface network-transition group hover:border-network-primary">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="absolute inset-0 bg-gradient-to-br from-network-primary/5 to-network-primary/10"></div>
        <div className="relative p-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-network-primary/10 text-network-primary text-2xl">
            📦
          </div>
          <h3 className="text-theme-primary font-semibold text-xl mb-3 m-0">
            Complete Package
          </h3>
          <p className="text-theme-secondary text-sm mb-6 m-0 max-w-sm mx-auto leading-relaxed">
            Download everything as a single file with complete project structure and setup instructions
          </p>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={onDownloadAll}
            className="btn-primary network-transition inline-flex items-center gap-3 px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">📥</span>
            Download Complete Package
          </button>
        </div>
      </div>

      {/* Individual Files Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-theme-surface-variant flex items-center justify-center text-theme-secondary">
            📄
          </div>
          <h3 className="text-theme-primary font-semibold text-xl m-0">
            Individual Files
          </h3>
          <div className="flex-1 h-px bg-theme-surface-variant"></div>
        </div>

        <div className="grid gap-3">
          {downloadableFiles.map(({ key, name, content, icon }) => {
            const sizeKB = (content?.length ? content.length / 1024 : 0).toFixed(1);
            const lineCount = content?.split('\n').length || 0;

            return (
              <div
                key={key}
                className="group relative overflow-hidden rounded-lg border border-theme bg-theme-surface network-transition hover:border-network-primary hover:shadow-md"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-theme-surface-variant flex items-center justify-center text-lg group-hover:bg-network-primary/10 network-transition">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-theme-primary mb-1 group-hover:text-network-primary network-transition truncate">
                        {name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-theme-tertiary">
                        <span className="flex items-center gap-1">
                          📊 {sizeKB}KB
                        </span>
                        <span className="flex items-center gap-1">
                          📝 {lineCount} lines
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDownloadFile?.(
                      name.toLowerCase().replace(/[^a-z0-9]/g, '-') + getFileExtension(name),
                      content || ''
                    )}
                    className="btn-outline flex-shrink-0 px-4 py-2 text-sm font-medium network-transition"
                  >
                    <span className="mr-2">⬇️</span>
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div className="relative overflow-hidden rounded-xl border border-theme bg-theme-surface network-transition">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 dark:from-blue-400/5 dark:to-blue-500/10"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
              🚀
            </div>
            <h3 className="text-theme-primary font-semibold text-lg m-0">
              Quick Setup Guide
            </h3>
          </div>

          <ol className="m-0 space-y-3 text-theme-secondary">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-network-primary/10 text-network-primary text-xs font-bold flex items-center justify-center mt-0.5">
                1
              </span>
              <span>Download the complete package using the button above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-network-primary/10 text-network-primary text-xs font-bold flex items-center justify-center mt-0.5">
                2
              </span>
              <span>Extract all files to your project directory</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-network-primary/10 text-network-primary text-xs font-bold flex items-center justify-center mt-0.5">
                3
              </span>
              <div className="flex flex-col gap-2">
                <span>Install dependencies:</span>
                <code className="inline-block bg-theme-surface-variant text-network-primary px-3 py-2 rounded-md text-sm font-mono border border-theme">
                  {options.packageManager} install
                </code>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-network-primary/10 text-network-primary text-xs font-bold flex items-center justify-center mt-0.5">
                4
              </span>
              <div className="flex flex-col gap-2">
                <span>Start building your project:</span>
                <code className="inline-block bg-theme-surface-variant text-network-primary px-3 py-2 rounded-md text-sm font-mono border border-theme">
                  {options.packageManager} run build
                </code>
              </div>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-theme-surface-variant rounded-lg border border-theme">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 dark:text-yellow-400 text-lg">💡</span>
              <div>
                <p className="text-theme-primary font-medium text-sm mb-1 m-0">Pro Tip:</p>
                <p className="text-theme-secondary text-sm m-0">
                  Check the README.md file for detailed documentation and configuration options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};