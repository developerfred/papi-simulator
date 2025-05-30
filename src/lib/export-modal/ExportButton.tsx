import type React from 'react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { Network } from '@/lib/types/network';
import { ExportModal } from './ExportModal';

export const ExportButton: React.FC<{
  code: string;
  network: Network;
  componentName?: string;
}> = ({ code, network, componentName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getColor } = useTheme();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: getColor('network-primary'),
          color: 'white',
          border: `1px solid ${getColor('network-primary')}`,
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap' as const,
          height: '28px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = getColor('network-secondary');
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${getColor('network-primary')}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = getColor('network-primary');
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        📦 Export Component
      </button>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        code={code}
        network={network}
        componentName={componentName}
      />
    </>
  );
};