/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars  */
// @ts-nocheck
import type React from 'react';
import type { TabProps } from '../types';
import { useThemeHook } from '@/lib/hooks/useTheme';

export const OptionsTab: React.FC<TabProps> = ({
  options,
  updateOptions,
  onExport,
  isExporting,
  exportError,
  inputStyle,
  getColor,
  getNetworkColor
}) => {

  const enhancedInputStyle = {
    ...inputStyle,
    backgroundColor: getColor('background'),
    color: getColor('text-primary'),
    border: `2px solid ${getColor('border')}`,
  };

  const selectStyle = {
    ...enhancedInputStyle,
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${getColor('text-secondary').replace('#', '%23')}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
    appearance: 'none' as const
  };



  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Basic Configuration */}
      <div>
        <h3 style={{
          margin: '0 0 20px',
          color: getColor('text-primary'),
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Basic Configuration
        </h3>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: getColor('text-primary'),
              fontSize: '14px'
            }}>
              Component Name
            </label>
            <input
              type="text"
              value={options?.componentName}
              onChange={(e) => updateOptions?.({ componentName: e.target.value })}
              style={enhancedInputStyle}
              placeholder="e.g., PolkadotBalanceChecker"
              onFocus={(e) => {
                e.target.style.borderColor = getNetworkColor('primary');
                e.target.style.boxShadow = `0 0 0 3px ${getNetworkColor('primary')}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = getColor('border');
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: getColor('text-primary'),
                fontSize: '14px'
              }}>
                Package Manager
              </label>
              <select
                value={options?.packageManager}
                onChange={(e) => updateOptions?.({ packageManager: e.target.value as any })}
                style={selectStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = getNetworkColor('primary');
                  e.target.style.boxShadow = `0 0 0 3px ${getNetworkColor('primary')}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = getColor('border');
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="npm" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>npm</option>
                <option value="yarn" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Yarn</option>
                <option value="pnpm" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>pnpm</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: getColor('text-primary'),
                fontSize: '14px'
              }}>
                Framework
              </label>
              <select
                value={options?.framework}
                onChange={(e) => updateOptions?.({ framework: e.target.value as any })}
                style={selectStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = getNetworkColor('primary');
                  e.target.style.boxShadow = `0 0 0 3px ${getNetworkColor('primary')}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = getColor('border');
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="react" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>React</option>
                <option value="next" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Next.js</option>
                <option value="vite" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Vite</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <h3 style={{
          margin: '0 0 20px',
          color: getColor('text-primary'),
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Advanced Options
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: getColor('text-primary'),
              fontSize: '14px'
            }}>
              Export Format
            </label>
            <select
              value={options?.exportFormat}
              onChange={(e) => updateOptions?.({ exportFormat: e.target.value as any })}
              style={selectStyle}
              onFocus={(e) => {
                e.target.style.borderColor = getNetworkColor('primary');
                e.target.style.boxShadow = `0 0 0 3px ${getNetworkColor('primary')}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = getColor('border');
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="esm" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>ES Modules</option>
              <option value="cjs" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>CommonJS</option>
              <option value="both" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Both</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: getColor('text-primary'),
              fontSize: '14px'
            }}>
              Style Framework
            </label>
            <select
              value={options?.styleFramework}
              onChange={(e) => updateOptions?.({ styleFramework: e.target.value as any })}
              style={selectStyle}
              onFocus={(e) => {
                e.target.style.borderColor = getNetworkColor('primary');
                e.target.style.boxShadow = `0 0 0 3px ${getNetworkColor('primary')}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = getColor('border');
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="css" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>CSS</option>
              <option value="styled-components" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Styled Components</option>
              <option value="emotion" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Emotion</option>
              <option value="tailwind" style={{ backgroundColor: getColor('background'), color: getColor('text-primary') }}>Tailwind CSS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div>
        <h3 style={{
          margin: '0 0 20px',
          color: getColor('text-primary'),
          fontSize: '18px',
          fontWeight: '600'
        }}>
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
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${getColor('border')}`,
                backgroundColor: getColor('surface'),
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor('surface-variant');
                e.currentTarget.style.borderColor = getNetworkColor('primary');
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = getColor('surface');
                e.currentTarget.style.borderColor = getColor('border');
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <input
                type="checkbox"
                checked={options?.[key as keyof ExportOptions] as boolean}
                onChange={(e) => updateOptions?.({ [key]: e.target.checked })}
                style={{
                  marginRight: '12px',
                  marginTop: '2px',
                  width: '16px',
                  height: '16px',
                  accentColor: getNetworkColor('primary')
                }}
              />
              <div>
                <div style={{
                  fontWeight: '600',
                  color: getColor('text-primary'),
                  marginBottom: '4px'
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: getColor('text-secondary'),
                  lineHeight: '1.4'
                }}>
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
            backgroundColor: isExporting || !options?.componentName?.trim()
              ? getColor('text-tertiary')
              : getNetworkColor('primary'),
            color: 'white',
            border: 'none',
            padding: '18px 32px',
            borderRadius: '12px',
            cursor: isExporting || !options?.componentName?.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            width: '100%',
            opacity: isExporting || !options?.componentName?.trim() ? 0.5 : 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: isExporting || !options?.componentName?.trim()
              ? 'none'
              : `0 4px 12px ${getNetworkColor('primary')}40`
          }}
          onMouseEnter={(e) => {
            if (!isExporting && options?.componentName?.trim()) {
              e.currentTarget.style.backgroundColor = getNetworkColor('secondary');
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 20px ${getNetworkColor('primary')}50`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isExporting && options?.componentName?.trim()) {
              e.currentTarget.style.backgroundColor = getNetworkColor('primary');
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${getNetworkColor('primary')}40`;
            }
          }}
        >
          {isExporting ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Exporting...
            </>
          ) : (
            <>
              🚀 Export Component
            </>
          )}
        </button>

        {exportError && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: `${getColor('error')}15`,
            color: getColor('error'),
            borderRadius: '12px',
            fontSize: '14px',
            border: `2px solid ${getColor('error')}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>❌</span>
            <span>{exportError}</span>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
        `}
      </style>
    </div>
  );
};