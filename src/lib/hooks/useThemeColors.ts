import { useMemo } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

export function useThemeColors() {
    const { isDarkTheme, getColor, getNetworkColor } = useTheme();

    return useMemo(() => {
        return {
            // Network colors
            networkPrimary: getNetworkColor('primary'),
            networkSecondary: getNetworkColor('secondary'),
            networkLight: getNetworkColor('light'),
            networkDark: getNetworkColor('dark'),

            // Common UI colors
            text: getColor('textPrimary'),
            textSecondary: getColor('textSecondary'),
            textTertiary: getColor('textTertiary'),

            background: getColor('background'),
            surface: getColor('surface'),
            surfaceVariant: getColor('surfaceVariant'),

            border: getColor('border'),
            divider: getColor('divider'),

            // Status colors
            success: getColor('success'),
            error: getColor('error'),
            warning: getColor('warning'),
            info: getColor('info'),

            // Helper functions
            getButtonColors: (variant: string, isNetworkColored: boolean = true) => {
                switch (variant) {
                    case 'primary':
                        return {
                            background: isNetworkColored ? getNetworkColor('primary') : getColor('info'),
                            text: '#FFFFFF',
                            hover: isNetworkColored ? getNetworkColor('secondary') : undefined,
                        };
                    case 'secondary':
                        return {
                            background: getColor('surfaceVariant'),
                            text: getColor('textPrimary'),
                            hover: undefined,
                        };
                    case 'outline':
                        return {
                            background: 'transparent',
                            text: isNetworkColored ? getNetworkColor('primary') : getColor('textPrimary'),
                            border: isNetworkColored ? getNetworkColor('primary') : getColor('border'),
                        };
                    case 'ghost':
                        return {
                            background: 'transparent',
                            text: isNetworkColored ? getNetworkColor('primary') : getColor('textPrimary'),
                        };
                    case 'danger':
                        return {
                            background: getColor('error'),
                            text: '#FFFFFF',
                        };
                    default:
                        return {};
                }
            },

            // Helper for common element states
            getStateColor: (state: 'hover' | 'active' | 'focus' | 'disabled') => {
                switch (state) {
                    case 'hover':
                        return isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                    case 'active':
                        return isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
                    case 'focus':
                        return getNetworkColor('primary') + '40'; // 25% opacity
                    case 'disabled':
                        return isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                }
            }
        };
    }, [isDarkTheme, getColor, getNetworkColor]);
}