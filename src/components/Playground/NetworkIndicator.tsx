import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function NetworkIndicator() {
    const { getNetworkColor } = useTheme();

    const getColor = () => {
        return getNetworkColor('primary');
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 opacity-80" style={{
            background: `linear-gradient(90deg, ${getColor()} 0%, rgba(255,255,255,0) 100%)`
        }} />
    );
}
