/* eslint-disable @typescript-eslint/no-unused-vars, react/display-name, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports  */
// @ts-nocheck
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useThemeHook } from '@/lib/hooks/useTheme';
import type { Network } from '@/lib/types/network';


let ComponentExporter: any = null;
let OptionsTab: any = null;
let PreviewTab: any = null;
let DownloadTab: any = null;

try {
  ComponentExporter = require('@/lib/component-exporter/ComponentExporter').ComponentExporter;
} catch (error) {
  console.warn('ComponentExporter not available:', error);
}

try {
  OptionsTab = require('./tabs/OptionsTab').OptionsTab;
} catch (error) {
  console.warn('OptionsTab not available:', error);
}

try {
  PreviewTab = require('./tabs/PreviewTab').PreviewTab;
} catch (error) {
  console.warn('PreviewTab not available:', error);
}

try {
  DownloadTab = require('./tabs/DownloadTab').DownloadTab;
} catch (error) {
  console.warn('DownloadTab not available:', error);
}

// Types
interface ExportOptions {
  componentName: string;
  includeStyles: boolean;
  includeTypes: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  framework: 'react' | 'vue' | 'svelte';
  exportFormat: 'esm' | 'cjs';
  styleFramework: 'css' | 'tailwind' | 'styled-components';
  includePapiConfig: boolean;
  includeTests: boolean;
  includeStorybook: boolean;
  minifyOutput: boolean;
}

interface ExportedComponent {
  componentCode: string;
  packageJson: string;
  readme: string;
  setupInstructions: string;
  types?: string;
  styles?: string;
}

interface ExportMetrics {
  linesOfCode: number;
  bundleSize: number;
  dependencies: number;
  typeComplexity: number;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  network: Network;
  componentName?: string;
}

type TabType = 'options' | 'preview' | 'download';

const downloadFile = (filename: string, content: string) => {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  }
};

const TAB_CONFIG = {
  options: { icon: '⚙️', label: 'Options' },
  preview: { icon: '👁️', label: 'Preview' },
  download: { icon: '📦', label: 'Download' }
} as const;

// Fallback Options Tab Component
const FallbackOptionsTab: React.FC<any> = ({
  options,
  updateOptions,
  onExport,
  isExporting,
  exportError,
  getColor
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-theme-primary mb-2">
          Component Name
        </label>
        <input
          type="text"
          value={options.componentName}
          onChange={(e) => updateOptions({ componentName: e.target.value })}
          className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-surface-variant text-theme-primary focus:ring-2 focus:ring-network-primary focus:border-transparent"
          placeholder="MyComponent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-primary mb-2">
          Package Manager
        </label>
        <select
          value={options.packageManager}
          onChange={(e) => updateOptions({ packageManager: e.target.value as any })}
          className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-surface-variant text-theme-primary focus:ring-2 focus:ring-network-primary focus:border-transparent"
        >
          <option value="npm">npm</option>
          <option value="yarn">yarn</option>
          <option value="pnpm">pnpm</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { key: 'includeStyles', label: 'Include Styles' },
        { key: 'includeTypes', label: 'Include Types' },
        { key: 'includeTests', label: 'Include Tests' },
        { key: 'includePapiConfig', label: 'PAPI Config' }
      ].map(({ key, label }) => (
        <label key={key} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options[key]}
            onChange={(e) => updateOptions({ [key]: e.target.checked })}
            className="rounded border-theme text-network-primary focus:ring-network-primary"
          />
          <span className="text-sm text-theme-primary">{label}</span>
        </label>
      ))}
    </div>

    {exportError && (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-400">{exportError}</p>
      </div>
    )}

    <button
      onClick={onExport}
      disabled={isExporting}
      className="w-full py-3 px-4 bg-network-primary text-white rounded-lg font-medium hover:bg-network-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      {isExporting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Exporting...
        </span>
      ) : (
        '🚀 Generate Export Package'
      )}
    </button>
  </div>
);

// Fallback Preview Tab Component
const FallbackPreviewTab: React.FC<any> = ({ exportedComponent, metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics && [
        { label: 'Lines of Code', value: metrics.linesOfCode },
        { label: 'Bundle Size', value: `${(metrics.bundleSize / 1024).toFixed(1)}KB` },
        { label: 'Dependencies', value: metrics.dependencies },
        { label: 'Complexity', value: metrics.typeComplexity }
      ].map(({ label, value }) => (
        <div key={label} className="bg-theme-surface-variant p-4 rounded-lg">
          <div className="text-2xl font-bold text-network-primary">{value}</div>
          <div className="text-sm text-theme-secondary">{label}</div>
        </div>
      ))}
    </div>

    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">📄 README.md</h3>
        <pre className="bg-theme-surface-variant p-4 rounded-lg text-sm overflow-auto max-h-40">
          {exportedComponent?.readme || 'No README generated'}
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">📦 package.json</h3>
        <pre className="bg-theme-surface-variant p-4 rounded-lg text-sm overflow-auto max-h-40">
          {exportedComponent?.packageJson || 'No package.json generated'}
        </pre>
      </div>
    </div>
  </div>
);

// Fallback Download Tab Component
const FallbackDownloadTab: React.FC<any> = ({ exportedComponent, options, onDownloadAll }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-xl font-semibold text-theme-primary mb-4">
        🎉 Export Ready!
      </h3>
      <p className="text-theme-secondary mb-6">
        Your component package has been generated and is ready for download.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: 'README.md', desc: 'Documentation and usage guide' },
        { name: 'package.json', desc: 'Package configuration' },
        { name: 'src/index.tsx', desc: 'Main component code' },
        { name: 'SETUP.md', desc: 'Setup instructions' }
      ].map(({ name, desc }) => (
        <div key={name} className="bg-theme-surface-variant p-4 rounded-lg">
          <div className="font-medium text-theme-primary">{name}</div>
          <div className="text-sm text-theme-secondary">{desc}</div>
        </div>
      ))}
    </div>

    <button
      onClick={onDownloadAll}
      className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
    >
      📥 Download Complete Package
    </button>
  </div>
);

export const ExportModal: React.FC<ExportModalProps> = React.memo(({
  isOpen,
  onClose,
  code,
  network,
  componentName = 'PolkadotComponent'
}) => {
  const { getColor, isDarkTheme, getNetworkColor } = useThemeHook();

  const [options, setOptions] = useState<ExportOptions>({
    componentName,
    includeStyles: true,
    includeTypes: true,
    packageManager: 'npm',
    framework: 'react',
    exportFormat: 'esm',
    styleFramework: 'css',
    includePapiConfig: true,
    includeTests: true,
    includeStorybook: false,
    minifyOutput: true
  });

  const [exportedComponent, setExportedComponent] = useState<ExportedComponent | null>(null);
  const [metrics, setMetrics] = useState<ExportMetrics | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('options');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setExportedComponent(null);
      setMetrics(null);
      setExportError('');
      setActiveTab('options');
      setIsExporting(false);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Update component name when prop changes
  useEffect(() => {
    setOptions(prev => ({ ...prev, componentName }));
  }, [componentName]);

  const handleExport = useCallback(async () => {
    if (!ComponentExporter) {
      setExportError('ComponentExporter is not available');
      return;
    }

    setIsExporting(true);
    setExportError('');

    try {
      const exporter = new ComponentExporter(network, code);
      const result = await exporter.exportComponent(options);
      const exportMetrics = exporter.calculateMetrics();

      setExportedComponent(result);
      setMetrics(exportMetrics);
      setActiveTab('preview');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setExportError(errorMessage);
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [network, code, options]);

  const downloadAll = useCallback(() => {
    if (!exportedComponent) return;

    try {
      const files = [
        { name: 'README.md', content: exportedComponent.readme },
        { name: 'package.json', content: exportedComponent.packageJson },
        { name: 'src/index.tsx', content: exportedComponent.componentCode },
        { name: 'SETUP.md', content: exportedComponent.setupInstructions },
        ...(exportedComponent.types ? [{ name: 'src/index.d.ts', content: exportedComponent.types }] : []),
        ...(exportedComponent.styles ? [{ name: 'src/styles.css', content: exportedComponent.styles }] : [])
      ];

      let packageContent = `# ${options.componentName} Export Package\n\n`;
      packageContent += `Generated: ${new Date().toISOString()}\n`;
      packageContent += `Network: ${network.name}\n`;
      packageContent += `Framework: ${options.framework}\n\n`;

      if (metrics) {
        packageContent += `## Metrics\n`;
        packageContent += `- Lines of Code: ${metrics.linesOfCode}\n`;
        packageContent += `- Bundle Size: ${(metrics.bundleSize / 1024).toFixed(1)}KB\n`;
        packageContent += `- Dependencies: ${metrics.dependencies}\n`;
        packageContent += `- Complexity: ${metrics.typeComplexity}\n\n`;
      }

      packageContent += `## Files\n\n`;
      files.forEach(({ name, content }) => {
        packageContent += `### ${name}\n\`\`\`\n${content}\n\`\`\`\n\n`;
      });

      downloadFile(`${options.componentName.toLowerCase()}-export-${Date.now()}.txt`, packageContent);
    } catch (error) {
      console.error('Download failed:', error);
      setExportError('Download failed. Please try again.');
    }
  }, [exportedComponent, options, network, metrics]);

  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  
  const CurrentOptionsTab = OptionsTab || FallbackOptionsTab;
  const CurrentPreviewTab = PreviewTab || FallbackPreviewTab;
  const CurrentDownloadTab = DownloadTab || FallbackDownloadTab;

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-index-export fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
        onClick={handleOverlayClick}
      >
        {/* Modal Content */}
        <div
          className="bg-theme-surface border-theme rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: isDarkTheme
              ? '0 20px 40px rgba(0, 0, 0, 0.5)'
              : '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center p-6 border-b border-theme sticky top-0 z-10"
            style={{
              background: `linear-gradient(135deg, ${getNetworkColor('primary')}10, ${getColor('surface')})`
            }}
          >
            <div>
              <h2 className="text-2xl font-semibold text-theme-primary flex items-center gap-2 m-0">
                📦 Export Component
              </h2>
              <p className="text-sm text-theme-secondary mt-1 m-0">
                Create production-ready package for{' '}
                <span
                  className="font-medium"
                  style={{ color: getNetworkColor('primary') }}
                >
                  {network.name}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-xl text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-variant rounded-lg transition-all duration-200"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 pt-4 border-b border-theme gap-2 bg-theme-surface sticky top-[85px] z-10">
            {(Object.keys(TAB_CONFIG) as TabType[]).map(tab => {
              const isActive = activeTab === tab;
              const isDisabled = tab !== 'options' && !exportedComponent;
              const { icon, label } = TAB_CONFIG[tab];

              return (
                <button
                  key={tab}
                  onClick={() => !isDisabled && setActiveTab(tab)}
                  disabled={isDisabled}
                  className={`
                    px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2
                    ${isActive
                      ? 'text-white border-transparent -translate-y-0.5 shadow-lg'
                      : 'text-theme-primary border-transparent hover:bg-theme-surface-variant hover:-translate-y-0.5'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{
                    backgroundColor: isActive ? getNetworkColor('primary') : 'transparent'
                  }}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-theme-surface">
            {activeTab === 'options' && (
              <CurrentOptionsTab
                options={options}
                updateOptions={updateOptions}
                onExport={handleExport}
                isExporting={isExporting}
                exportError={exportError}
                getColor={getColor}
              />
            )}

            {activeTab === 'preview' && exportedComponent && (
              <CurrentPreviewTab
                exportedComponent={exportedComponent}
                metrics={metrics}
                getColor={getColor}
              />
            )}

            {activeTab === 'download' && exportedComponent && (
              <CurrentDownloadTab
                exportedComponent={exportedComponent}
                options={options}
                onDownloadFile={downloadFile}
                onDownloadAll={downloadAll}
                getColor={getColor}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
});