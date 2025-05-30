import React, { useState, useMemo } from 'react';
import type { TabProps } from '../types';

export const PreviewTab: React.FC<TabProps> = ({
  exportedComponent,
  metrics,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('component');

  const files = useMemo(() => ({
    component: { name: 'Component Code', content: exportedComponent?.componentCode, language: 'tsx' },
    package: { name: 'package.json', content: exportedComponent?.packageJson, language: 'json' },
    readme: { name: 'README.md', content: exportedComponent?.readme, language: 'markdown' },
    setup: { name: 'Setup Instructions', content: exportedComponent?.setupInstructions, language: 'markdown' },
    ...(exportedComponent?.types && { types: { name: 'Type Definitions', content: exportedComponent.types, language: 'typescript' } }),
    ...(exportedComponent?.styles && { styles: { name: 'Styles', content: exportedComponent.styles, language: 'css' } })
  }), [exportedComponent]);

  if (!exportedComponent) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h3 className="text-foreground font-semibold text-lg mb-4 m-0">
            📊 Export Metrics
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {metrics.linesOfCode}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Lines of Code</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {(metrics.bundleSize / 1024).toFixed(1)}KB
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Bundle Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {metrics.dependencies}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {metrics.typeComplexity}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Complexity</div>
            </div>
          </div>
        </div>
      )}

      {/* File Selector */}
      <div>
        <h3 className="text-foreground font-semibold text-lg mb-4 m-0">
          📁 Generated Files
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(files).map(([key, file]) => (
            <button
              key={key}
              onClick={() => setSelectedFile(key)}
              className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${selectedFile === key
                  ? 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600 dark:border-primary-500'
                  : 'bg-white dark:bg-gray-800 text-foreground border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* File Content Preview */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm text-foreground">
            {files[selectedFile as keyof typeof files]?.name}
          </div>
          <pre className="m-0 p-5 text-sm leading-relaxed overflow-auto max-h-96 font-mono text-foreground bg-white dark:bg-gray-900">
            <code className="text-foreground">
              {files[selectedFile as keyof typeof files]?.content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};