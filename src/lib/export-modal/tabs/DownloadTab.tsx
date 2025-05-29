import React, { useMemo } from 'react';
import type { TabProps } from '../types';
import { getFileExtension } from '../utils';

export const DownloadTab: React.FC<TabProps> = ({
  exportedComponent,
  options,
  onDownloadFile,
  onDownloadAll,
  getColor
}) => {
  const downloadableFiles = useMemo(() => [
    { key: 'component', name: 'Component (index.tsx)', content: exportedComponent?.componentCode },
    { key: 'package', name: 'package.json', content: exportedComponent?.packageJson },
    { key: 'readme', name: 'README.md', content: exportedComponent?.readme },
    { key: 'setup', name: 'SETUP.md', content: exportedComponent?.setupInstructions },
    ...(exportedComponent?.types ? [{ key: 'types', name: 'Type Definitions (index.d.ts)', content: exportedComponent.types }] : []),
    ...(exportedComponent?.styles ? [{ key: 'styles', name: 'Styles (styles.css)', content: exportedComponent.styles }] : [])
  ], [exportedComponent]);

  if (!exportedComponent || !options) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Download All */}
      <div style={{
        padding: '20px',
        backgroundColor: getColor('surface-variant'),
        borderRadius: '12px',
        border: `1px solid ${getColor('border')}`,
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 12px', color: getColor('text-primary') }}>
          📦 Complete Package
        </h3>
        <p style={{ margin: '0 0 20px', color: getColor('text-secondary'), fontSize: '14px' }}>
          Download everything as a single file with project structure
        </p>
        <button
          onClick={onDownloadAll}
          style={{
            backgroundColor: getColor('primary'),
            color: 'white',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📦 Download Complete Package
        </button>
      </div>

      {/* Individual Files */}
      <div>
        <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
          📄 Individual Files
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {downloadableFiles.map(({ key, name, content }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                border: `1px solid ${getColor('border')}`,
                borderRadius: '8px',
                backgroundColor: getColor('surface'),
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: getColor('text-primary'), marginBottom: '4px' }}>
                  {name}
                </div>
                <div style={{ fontSize: '12px', color: getColor('text-secondary') }}>
                  {(content?.length / 1024).toFixed(1)}KB • {content?.split('\n').length} lines
                </div>
              </div>
              <button
                onClick={() => onDownloadFile?.(
                  name.toLowerCase().replace(/[^a-z0-9]/g, '-') + getFileExtension(name), 
                  content || ''
                )}
                style={{
                  backgroundColor: 'transparent',
                  color: getColor('primary'),
                  border: `1px solid ${getColor('primary')}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(33, 150, 243, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#1976d2' }}>
          🚀 Quick Setup
        </h3>
        <ol style={{ margin: '0', paddingLeft: '20px', color: getColor('text-primary') }}>
          <li style={{ marginBottom: '8px' }}>Download the complete package above</li>
          <li style={{ marginBottom: '8px' }}>Extract files to your project directory</li>
          <li style={{ marginBottom: '8px' }}>Run: <code style={{ 
            backgroundColor: getColor('surface-variant'), 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '13px'
          }}>{options.packageManager} install</code></li>
          <li>Start building: <code style={{ 
            backgroundColor: getColor('surface-variant'), 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '13px'
          }}>{options.packageManager} run build</code></li>
        </ol>
      </div>
    </div>
  );
};
