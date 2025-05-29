import React, { useState, useMemo } from 'react';
import type { TabProps } from '../types';

export const PreviewTab: React.FC<TabProps> = ({
  exportedComponent,
  metrics,
  getColor
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Overview */}
      {metrics && (
        <div style={{
          padding: '20px',
          backgroundColor: getColor('surface-variant'),
          borderRadius: '12px',
          border: `1px solid ${getColor('border')}`
        }}>
          <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
            📊 Export Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: getColor('primary') }}>
                {metrics.linesOfCode}
              </div>
              <div style={{ fontSize: '12px', color: getColor('text-secondary') }}>Lines of Code</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: getColor('primary') }}>
                {(metrics.bundleSize / 1024).toFixed(1)}KB
              </div>
              <div style={{ fontSize: '12px', color: getColor('text-secondary') }}>Bundle Size</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: getColor('primary') }}>
                {metrics.dependencies}
              </div>
              <div style={{ fontSize: '12px', color: getColor('text-secondary') }}>Dependencies</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: getColor('primary') }}>
                {metrics.typeComplexity}
              </div>
              <div style={{ fontSize: '12px', color: getColor('text-secondary') }}>Complexity</div>
            </div>
          </div>
        </div>
      )}

      {/* File Selector */}
      <div>
        <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
          📁 Generated Files
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {Object.entries(files).map(([key, file]) => (
            <button
              key={key}
              onClick={() => setSelectedFile(key)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${getColor('border')}`,
                backgroundColor: selectedFile === key ? getColor('primary') : getColor('surface'),
                color: selectedFile === key ? 'white' : getColor('text-primary'),
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* File Content Preview */}
        <div style={{
          border: `1px solid ${getColor('border')}`,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: getColor('surface')
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: getColor('surface-variant'),
            borderBottom: `1px solid ${getColor('border')}`,
            fontWeight: '600',
            fontSize: '14px',
            color: getColor('text-primary')
          }}>
            {files[selectedFile as keyof typeof files]?.name}
          </div>
          <pre style={{
            margin: 0,
            padding: '20px',
            fontSize: '13px',
            lineHeight: '1.5',
            overflow: 'auto',
            maxHeight: '400px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            color: getColor('text-primary'),
            backgroundColor: getColor('surface')
          }}>
            <code>
              {files[selectedFile as keyof typeof files]?.content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
