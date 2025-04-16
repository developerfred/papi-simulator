'use client'

import React, { useState, ReactNode } from 'react'
import { useTheme } from '@/lib/theme/ThemeProvider'

interface Tab {
    id: string;
    label: ReactNode;
    content: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultTabId?: string;
    onTabChange?: (tabId: string) => void;
    variant?: 'default' | 'boxed' | 'pills';
    networkColored?: boolean;
    className?: string;
    contentClassName?: string;
}

export default function Tabs({
    tabs,
    defaultTabId,
    onTabChange,
    variant = 'default',
    networkColored = true,
    className = '',
    contentClassName = ''
}: TabsProps) {
    const { getColor, getNetworkColor } = useTheme();
    const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || tabs[0]?.id || '');

    const handleTabClick = (tabId: string) => {
        setActiveTabId(tabId);
        onTabChange?.(tabId);
    };

    // Get tab header styles based on variant
    const getTabHeaderStyles = () => {
        switch (variant) {
            case 'boxed':
                return {
                    container: {
                        backgroundColor: getColor('surfaceVariant'),
                        padding: '4px',
                        borderRadius: '8px'
                    },
                    tab: (isActive: boolean) => ({
                        backgroundColor: isActive ? getColor('surface') : 'transparent',
                        color: isActive
                            ? (networkColored ? getNetworkColor('primary') : getColor('textPrimary'))
                            : getColor('textSecondary'),
                        borderRadius: '6px',
                        fontWeight: isActive ? 500 : 400
                    })
                };
            case 'pills':
                return {
                    container: {},
                    tab: (isActive: boolean) => ({
                        backgroundColor: isActive
                            ? (networkColored ? getNetworkColor('primary') : getColor('info'))
                            : 'transparent',
                        color: isActive ? '#FFFFFF' : getColor('textSecondary'),
                        borderRadius: '9999px',
                        fontWeight: isActive ? 500 : 400,
                        padding: '4px 12px'
                    })
                };
            default: // Underlined tabs
                return {
                    container: {
                        borderBottom: `1px solid ${getColor('border')}`
                    },
                    tab: (isActive: boolean) => ({
                        color: isActive
                            ? (networkColored ? getNetworkColor('primary') : getColor('textPrimary'))
                            : getColor('textSecondary'),
                        borderBottom: isActive
                            ? `2px solid ${networkColored ? getNetworkColor('primary') : getColor('info')}`
                            : 'none',
                        marginBottom: '-1px',
                        fontWeight: isActive ? 500 : 400
                    })
                };
        }
    };

    const headerStyles = getTabHeaderStyles();
    const activeTab = tabs.find(tab => tab.id === activeTabId);

    return (
        <div className={`${className}`}>
            <div
                className="flex space-x-1 mb-4"
                style={headerStyles.container}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`
              py-2 px-4 text-sm transition-colors
              ${variant !== 'pills' ? 'flex-1 text-center' : ''}
            `}
                        style={headerStyles.tab(tab.id === activeTabId)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={`tab-content ${contentClassName}`}>
                {activeTab?.content}
            </div>
        </div>
    );
}