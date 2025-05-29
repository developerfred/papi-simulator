import React, { useState } from 'react';
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
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: getColor('primary'),
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
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
