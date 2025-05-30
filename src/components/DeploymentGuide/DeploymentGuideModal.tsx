
/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { useState, useMemo, useCallback } from 'react';
import type { DeploymentConfig, DeploymentGuide } from '@/lib/deployment/types';
import { DeploymentGuideSystem } from '@/lib/deployment/DeploymentGuideSystem';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface DeploymentGuideModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly componentName: string;
  readonly packageName: string;
}

const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  componentName,
  packageName
}) => {
  const { getColor } = useTheme();
  const [config, setConfig] = useState<DeploymentConfig>({
    framework: 'next',
    target: 'vercel',
    componentName,
    packageName,
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    nodeVersion: '18',
    environmentVariables: []
  });

  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'download'>('config');

  const guide = useMemo(() => 
    DeploymentGuideSystem.generate(config), [config]
  );

  const updateConfig = useCallback((updates: Partial<DeploymentConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const downloadFile = useCallback((filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    const zip = DeploymentGuideSystem.generateZip(guide);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}-deployment-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [guide, componentName]);

  if (!isOpen) return null;

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: getColor('surface'),
    borderRadius: '16px',
    maxWidth: '900px',
    maxHeight: '85vh',
    width: '95%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${getColor('border')}`,
    backgroundColor: getColor('surface'),
    color: getColor('text-primary'),
    fontSize: '14px'
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: active ? getColor('primary') : 'transparent',
    color: active ? 'white' : getColor('text-secondary'),
    cursor: 'pointer',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${getColor('border')}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: getColor('text-primary') }}>
              🚀 Deployment Guide
            </h2>
            <p style={{ margin: '4px 0 0', color: getColor('text-secondary'), fontSize: '14px' }}>
              Generate production-ready deployment configuration
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: getColor('text-secondary')
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          padding: '16px 20px 0',
          borderBottom: `1px solid ${getColor('border')}`,
          gap: '8px'
        }}>
          {(['config', 'guide', 'download'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={tabStyle(activeTab === tab)}
            >
              {tab === 'config' && '⚙️ Configuration'}
              {tab === 'guide' && '📖 Guide'}
              {tab === 'download' && '📦 Download'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
          {activeTab === 'config' && (
            <ConfigurationTab 
              config={config}
              updateConfig={updateConfig}
              inputStyle={inputStyle}
              getColor={getColor}
            />
          )}

          {activeTab === 'guide' && (
            <GuideTab 
              guide={guide}
              getColor={getColor}
            />
          )}

          {activeTab === 'download' && (
            <DownloadTab 
              guide={guide}
              onDownloadFile={downloadFile}
              onDownloadAll={downloadAll}
              getColor={getColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Configuration Tab Component
const ConfigurationTab: React.FC<{
  config: DeploymentConfig;
  updateConfig: (updates: Partial<DeploymentConfig>) => void;
  inputStyle: React.CSSProperties;
  getColor: (key: string) => string;
}> = ({ config, updateConfig, inputStyle, getColor }) => (
  <div style={{ display: 'grid', gap: '20px' }}>
    <div>
      <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
        Framework & Platform
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Framework
          </label>
          <select
            value={config.framework}
            onChange={e => updateConfig({ framework: e.target.value as any })}
            style={inputStyle}
          >
            <option value="next">Next.js</option>
            <option value="vite">Vite</option>
            <option value="create-react-app">Create React App</option>
            <option value="remix">Remix</option>
            <option value="gatsby">Gatsby</option>
            <option value="react">React</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Deployment Target
          </label>
          <select
            value={config.target}
            onChange={e => updateConfig({ target: e.target.value as any })}
            style={inputStyle}
          >
            <option value="vercel">Vercel</option>
            <option value="netlify">Netlify</option>
            <option value="github-pages">GitHub Pages</option>
            <option value="aws-amplify">AWS Amplify</option>
            <option value="firebase">Firebase</option>
            <option value="docker">Docker</option>
          </select>
        </div>
      </div>
    </div>

    <div>
      <h3 style={{ margin: '0 0 16px', color: getColor('text-primary') }}>
        Build Configuration
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Build Command
          </label>
          <input
            type="text"
            value={config.buildCommand}
            onChange={e => updateConfig({ buildCommand: e.target.value })}
            style={inputStyle}
            placeholder="npm run build"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Output Directory
            </label>
            <input
              type="text"
              value={config.outputDirectory}
              onChange={e => updateConfig({ outputDirectory: e.target.value })}
              style={inputStyle}
              placeholder="dist"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Node.js Version
            </label>
            <select
              value={config.nodeVersion}
              onChange={e => updateConfig({ nodeVersion: e.target.value })}
              style={inputStyle}
            >
              <option value="18">Node.js 18</option>
              <option value="20">Node.js 20</option>
              <option value="21">Node.js 21</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Guide Tab Component
const GuideTab: React.FC<{
  guide: DeploymentGuide;
  getColor: (key: string) => string;
}> = ({ guide, getColor }) => {
  const [selectedFile, setSelectedFile] = useState<string>('deployment');

  interface FileEntry {
    name: string;
    content: string;
  }

  const files: { [key: string]: FileEntry } = {
    deployment: { name: 'Deployment Steps', content: guide.deploymentSteps.join('\n') },
    ...Object.fromEntries(
      guide.configFiles.map(f => [
        f.path.replace(/[^a-zA-Z0-9]/g, '_'),
        { name: f.path, content: f.content }
      ])
    )
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ margin: '0 0 12px', color: getColor('text-primary') }}>
          {guide.title}
        </h3>
        <p style={{ margin: 0, color: getColor('text-secondary'), fontSize: '14px' }}>
          {guide.description}
        </p>
      </div>

      {/* File Selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Object.entries(files).map(([key, file]) => (
          <button
            key={key}
            onClick={() => setSelectedFile(key)}
            style={{
              padding: '6px 12px',
              border: `1px solid ${getColor('border')}`,
              backgroundColor: selectedFile === key ? getColor('primary') : getColor('surface'),
              color: selectedFile === key ? 'white' : getColor('text-primary'),
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* File Content */}
      <div style={{
        border: `1px solid ${getColor('border')}`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '8px 12px',
          backgroundColor: getColor('surface-variant'),
          borderBottom: `1px solid ${getColor('border')}`,
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {files[selectedFile]?.name}
        </div>
        <pre style={{
          margin: 0,
          padding: '16px',
          fontSize: '12px',
          lineHeight: '1.4',
          overflow: 'auto',
          maxHeight: '300px',
          fontFamily: 'ui-monospace, monospace',
          backgroundColor: getColor('surface')
        }}>
          <code>{files[selectedFile]?.content}</code>
        </pre>
      </div>

      {/* Troubleshooting */}
      {guide.troubleshooting.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 8px', color: getColor('text-primary') }}>
            🔧 Troubleshooting
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {guide.troubleshooting.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  backgroundColor: getColor('surface-variant'),
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {item.issue}
                </div>
                <div style={{ color: getColor('text-secondary') }}>
                  {item.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const DownloadTab: React.FC<{
  guide: DeploymentGuide;
  onDownloadFile: (filename: string, content: string) => void;
  onDownloadAll: () => void;
  getColor: (key: string) => string;
}> = ({ guide, onDownloadFile, onDownloadAll, getColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {/* Download All */}
    <div style={{
      padding: '16px',
      backgroundColor: getColor('surface-variant'),
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h3 className="text-theme-primary font-semibold text-xl mb-3 m-0">
        📦 Complete Package
      </h3>
      <p className="text-theme-secondary text-sm mb-6 m-0 max-w-sm mx-auto leading-relaxed">
        Download all files and configuration in one package
      </p>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={onDownloadAll}
        className="btn-primary network-transition inline-flex items-center gap-3 px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl"
      >
        📦 Download Complete Package
      </button>
    </div>

    {/* Individual Files */}
    <div>
      <h3 className="text-theme-primary font-semibold text-xl m-0">
        📄 Individual Files
      </h3>
      <div style={{ display: 'grid', gap: '8px' }}>
        {[
          ...guide.configFiles,
          { path: 'DEPLOYMENT.md', content: DeploymentGuideSystem['formatGuideAsMarkdown'](guide), description: 'Complete deployment guide' }
        ].map((file, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            className="group relative overflow-hidden rounded-lg border border-theme bg-theme-surface network-transition hover:border-network-primary hover:shadow-md"
          >
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{file.path}</div>
              <div style={{ fontSize: '12px', color: getColor('text-secondary') }}>
                {file.description}
              </div>
            </div>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              onClick={() => onDownloadFile(file.path, file.content)}
              className="btn-outline flex-shrink-0 px-4 py-2 text-sm font-medium network-transition"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Setup */}
    <div style={{
      padding: '16px',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(33, 150, 243, 0.3)'
    }}>
      <h4 style={{ margin: '0 0 8px', color: '#1976d2' }}>🚀 Quick Setup</h4>
      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
        <li>Download the complete package</li>
        <li>Extract files to your project</li>
        <li>Follow the deployment steps in DEPLOYMENT.md</li>
        <li>Configure environment variables</li>
        <li>Deploy to your chosen platform</li>
      </ol>
    </div>
  </div>
);

// Export button component
export const DeploymentGuideButton: React.FC<{
  componentName: string;
  packageName: string;
}> = ({ componentName, packageName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getColor } = useTheme();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: getColor('primary'),
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        🚀 Deployment Guide
      </button>

      <DeploymentGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        componentName={componentName}
        packageName={packageName}
      />
    </>
  );
};

export { DeploymentGuideModal, DeploymentGuideSystem };
export type { DeploymentConfig, DeploymentGuide };