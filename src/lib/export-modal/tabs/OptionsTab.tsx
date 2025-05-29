import React from 'react';
import type { TabProps } from '../types';

export const OptionsTab: React.FC<TabProps> = ({
  options,
  updateOptions,
  onExport,
  isExporting,
  exportError,
  inputStyle,
  getColor
}) => (
  <div style={{ display: 'grid', gap: '24px' }}>
    {/* Basic Configuration */}
    <div>
      <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
        Basic Configuration
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: getColor('text-primary') }}>
            Component Name
          </label>
          <input
            type="text"
            value={options?.componentName}
            onChange={(e) => updateOptions?.({ componentName: e.target.value })}
            style={inputStyle}
            placeholder="e.g., PolkadotBalanceChecker"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: getColor('text-primary') }}>
              Package Manager
            </label>
            <select
              value={options?.packageManager}
              onChange={(e) => updateOptions?.({ packageManager: e.target.value as any })}
              style={inputStyle}
            >
              <option value="npm">npm</option>
              <option value="yarn">Yarn</option>
              <option value="pnpm">pnpm</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: getColor('text-primary') }}>
              Framework
            </label>
            <select
              value={options?.framework}
              onChange={(e) => updateOptions?.({ framework: e.target.value as any })}
              style={inputStyle}
            >
              <option value="react">React</option>
              <option value="next">Next.js</option>
              <option value="vite">Vite</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* Advanced Options */}
    <div>
      <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
        Advanced Options
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: getColor('text-primary') }}>
            Export Format
          </label>
          <select
            value={options?.exportFormat}
            onChange={(e) => updateOptions?.({ exportFormat: e.target.value as any })}
            style={inputStyle}
          >
            <option value="esm">ES Modules</option>
            <option value="cjs">CommonJS</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: getColor('text-primary') }}>
            Style Framework
          </label>
          <select
            value={options?.styleFramework}
            onChange={(e) => updateOptions?.({ styleFramework: e.target.value as any })}
            style={inputStyle}
          >
            <option value="css">CSS</option>
            <option value="styled-components">Styled Components</option>
            <option value="emotion">Emotion</option>
            <option value="tailwind">Tailwind CSS</option>
          </select>
        </div>
      </div>
    </div>

    {/* Feature Toggles */}
    <div>
      <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
        Include Features
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { key: 'includeTypes', label: 'TypeScript Definitions', desc: 'Full type safety' },
          { key: 'includeStyles', label: 'Default Styles', desc: 'Ready-to-use styling' },
          { key: 'includePapiConfig', label: 'PAPI Setup Script', desc: 'Automated chain setup' },
          { key: 'includeTests', label: 'Test Suite', desc: 'Jest + Testing Library' },
          { key: 'includeStorybook', label: 'Storybook Stories', desc: 'Component documentation' },
          { key: 'minifyOutput', label: 'Minify Output', desc: 'Smaller bundle size' }
        ].map(({ key, label, desc }) => (
          <label 
            key={key}
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${getColor('border')}`,
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="checkbox"
              checked={options?.[key as keyof ExportOptions] as boolean}
              onChange={(e) => updateOptions?.({ [key]: e.target.checked })}
              style={{ marginRight: '12px', marginTop: '2px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: getColor('text-primary') }}>
                {label}
              </div>
              <div style={{ fontSize: '12px', color: getColor('text-secondary'), marginTop: '2px' }}>
                {desc}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>

    {/* Export Button */}
    <div>
      <button
        onClick={onExport}
        disabled={isExporting || !options?.componentName?.trim()}
        style={{
          backgroundColor: isExporting ? getColor('text-secondary') : getColor('primary'),
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '12px',
          cursor: isExporting || !options?.componentName?.trim() ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          width: '100%',
          opacity: isExporting || !options?.componentName?.trim() ? 0.6 : 1,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isExporting ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Exporting...
          </>
        ) : (
          '🚀 Export Component'
        )}
      </button>

      {exportError && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#c62828',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid rgba(244, 67, 54, 0.3)'
        }}>
          ❌ {exportError}
        </div>
      )}
    </div>

    <style>
      {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
    </style>
  </div>
);
