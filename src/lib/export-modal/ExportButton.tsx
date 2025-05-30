import type React from 'react';
import { useState } from 'react';
import type { Network } from '@/lib/types/network';
import { ExportModal } from './ExportModal';

export const ExportButton: React.FC<{
  code: string;
  network: Network;
  componentName?: string;
}> = ({ code, network, componentName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary px-5 py-3 text-sm font-semibold"
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
