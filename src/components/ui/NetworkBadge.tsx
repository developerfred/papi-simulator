'use client'

import React from 'react'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { Network } from '@/lib/types/network'

interface NetworkBadgeProps {
    network: Network;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    showIcon?: boolean;
    className?: string;
}

export default function NetworkBadge({
    network,
    size = 'md',
    showName = true,
    showIcon = true,
    className = ''
}: NetworkBadgeProps) {
    const { getNetworkColor } = useTheme();

    
    const sizeClasses = {
        sm: {
            container: 'text-xs',
            icon: 'w-2 h-2 mr-1',
            padding: showName ? 'px-1.5 py-0.5' : 'p-1'
        },
        md: {
            container: 'text-sm',
            icon: 'w-3 h-3 mr-1.5',
            padding: showName ? 'px-2 py-1' : 'p-1.5'
        },
        lg: {
            container: 'text-base',
            icon: 'w-4 h-4 mr-2',
            padding: showName ? 'px-3 py-1.5' : 'p-2'
        }
    };

    
    const badgeStyle = {
        backgroundColor: getNetworkColor('primary'),
        color: '#FFFFFF'
    };

    return (
        <div
            className={`
        inline-flex items-center font-medium rounded-full ${sizeClasses[size].padding} ${sizeClasses[size].container} ${className}
      `}
            style={badgeStyle}
        >
            {showIcon && (
                <span className={`rounded-full bg-white ${sizeClasses[size].icon}`}></span>
            )}
            {showName && network.name}
        </div>
    );
}