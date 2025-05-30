/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from 'react';

interface ModalTabsProps {
    activeTab: 'config' | 'guide' | 'download';
    onTabChange: (tab: 'config' | 'guide' | 'download') => void;
    getColor: (key: string) => string;
}

const tabs = [
    { id: 'config' as const, label: '⚙️ Configuration' },
    { id: 'guide' as const, label: '📖 Guide' },
    { id: 'download' as const, label: '📦 Download' }
];

export const ModalTabs: React.FC<ModalTabsProps> = ({
    activeTab,
    onTabChange,
    getColor
}) => (
    <div className="modal-tabs">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`modal-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);