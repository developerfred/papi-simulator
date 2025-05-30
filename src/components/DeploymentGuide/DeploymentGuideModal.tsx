import type React from 'react';
import { useState, useMemo, useCallback } from 'react';
import type { DeploymentConfig, DeploymentGuide } from '@/lib/deployment/types';
import { DeploymentGuideSystem } from '@/lib/deployment/DeploymentGuideSystem';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ModalHeader } from './components/ModalHeader';
import { ModalTabs } from './components/ModalTabs';
import { ConfigurationTab } from './tabs/ConfigurationTab';
import { GuideTab } from './tabs/GuideTab';
import { DownloadTab } from './tabs/DownloadTab';
import { modalStyles } from './styles/modalStyles';
import './styles/modalStyles.css';

interface DeploymentGuideModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly componentName: string;
  readonly packageName: string;
}

type TabType = 'config' | 'guide' | 'download';

const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  componentName,
  packageName
}) => {
  const { getColor } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('config');
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

  const styles = modalStyles(getColor);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={e => e.stopPropagation()}>
        <ModalHeader onClose={onClose} getColor={getColor} />

        <ModalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getColor={getColor}
        />

        <div style={styles.tabContent}>
          {activeTab === 'config' && (
            <ConfigurationTab
              config={config}
              updateConfig={updateConfig}
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

export const DeploymentGuideButton: React.FC<{
  componentName: string;
  packageName: string;
}> = ({ componentName, packageName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
