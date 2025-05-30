/* eslint-disable @typescript-eslint/no-unused-vars, react/display-name, @typescript-eslint/ban-ts-comment  */
// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { ComponentExporter } from '@/lib/component-exporter/ComponentExporter';
import type { ExportOptions, ExportedComponent, ExportMetrics } from '@/lib/component-exporter/types';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { Network } from '@/lib/types/network';
import type { ExportModalProps, TabType } from './types';
import { OptionsTab } from './tabs/OptionsTab';
import { PreviewTab } from './tabs/PreviewTab';
import { DownloadTab } from './tabs/DownloadTab';
import { downloadFile, modalStyle, contentStyle, tabStyle, inputStyle } from './utils';

export const ExportModal: React.FC<ExportModalProps> = React.memo(({
  isOpen,
  onClose,
  code,
  network,
  componentName = 'PolkadotComponent'
}) => {
  const { getColor } = useTheme();
  
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

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError('');
    
    try {
      const exporter = new ComponentExporter(network, code);
      const [result, exportMetrics] = await Promise.all([
        exporter.exportComponent(options),
        Promise.resolve(exporter.calculateMetrics())
      ]);
      
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
  }, [exportedComponent, options, network, metrics]);

  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  }, []);

  if (!isOpen) return null;

  return (
    <div style={modalStyle(getColor)} onClick={onClose}>
      <div style={contentStyle(getColor)} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: `1px solid ${getColor('border')}`,
          background: `linear-gradient(135deg, ${getColor('primary')}15, ${getColor('surface')})`
        }}>
          <div>
            <h2 style={{ margin: 0, color: getColor('text-primary'), fontSize: '24px' }}>
              📦 Export Component
            </h2>
            <p style={{ margin: '4px 0 0', color: getColor('text-secondary'), fontSize: '14px' }}>
              Create production-ready package for {network.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: getColor('text-secondary'),
              padding: '4px',
              borderRadius: '8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          padding: '16px 24px 0',
          borderBottom: `1px solid ${getColor('border')}`,
          gap: '8px'
        }}>
          {(['options', 'preview', 'download'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab !== 'options' && !exportedComponent}
              style={{
                ...tabStyle(activeTab === tab, getColor),
                opacity: (tab !== 'options' && !exportedComponent) ? 0.5 : 1,
                cursor: (tab !== 'options' && !exportedComponent) ? 'not-allowed' : 'pointer'
              }}
            >
              {tab === 'options' && '⚙️ Options'}
              {tab === 'preview' && '👁️ Preview'}
              {tab === 'download' && '📦 Download'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
          {activeTab === 'options' && (
            <OptionsTab 
              options={options}
              updateOptions={updateOptions}
              onExport={handleExport}
              isExporting={isExporting}
              exportError={exportError}
              inputStyle={inputStyle(getColor)}
              getColor={getColor}
            />
          )}
          
          {activeTab === 'preview' && exportedComponent && (
            <PreviewTab 
              exportedComponent={exportedComponent}
              metrics={metrics}
              getColor={getColor}
            />
          )}
          
          {activeTab === 'download' && exportedComponent && (
            <DownloadTab 
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
  );
});
