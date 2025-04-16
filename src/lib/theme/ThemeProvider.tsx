'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { NETWORK_COLORS, SEMANTIC_COLORS, ELEVATION_LEVELS } from './themeConstants'

interface ThemeContextType {
    isDarkTheme: boolean;
    toggleTheme: () => void;
    isLoaded: boolean;
    currentNetworkId: string;
    setCurrentNetworkId: (networkId: string) => void;
    getNetworkColor: (colorType: 'primary' | 'secondary' | 'light' | 'dark') => string;
    getColor: (semanticKey: string) => string;
    getElevation: (level: 'level0' | 'level1' | 'level2' | 'level3') => string;
}

const ThemeContext = createContext<ThemeContextType>({
    isDarkTheme: true,
    toggleTheme: () => { },
    isLoaded: false,
    currentNetworkId: 'polkadot',
    setCurrentNetworkId: () => { },
    getNetworkColor: () => '#000000',
    getColor: () => '#000000',
    getElevation: () => 'none',
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: ReactNode;
    initialNetworkId?: string;
}

export function ThemeProvider({ children, initialNetworkId = 'polkadot' }: ThemeProviderProps) {
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [currentNetworkId, setCurrentNetworkId] = useState<string>(initialNetworkId);

    
    const applyTheme = useCallback((isDark: boolean, networkId: string) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-network', networkId);

        const networkColors = NETWORK_COLORS[networkId] || NETWORK_COLORS['polkadot'];
        const root = document.documentElement;

        root.style.setProperty('--network-primary', networkColors.primary);
        root.style.setProperty('--network-secondary', networkColors.secondary);
        root.style.setProperty('--network-light', networkColors.light);
        root.style.setProperty('--network-dark', networkColors.dark);

        Object.entries(SEMANTIC_COLORS).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, isDark ? value.dark : value.light);
        });

        Object.entries(ELEVATION_LEVELS).forEach(([key, value]) => {
            root.style.setProperty(`--elevation-${key}`, isDark ? value.dark : value.light);
        });
    }, []);

    
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedTheme = localStorage.getItem('theme');
        const storedNetwork = localStorage.getItem('currentNetwork');
        const networkToUse = storedNetwork || currentNetworkId;

        if (storedNetwork && storedNetwork !== currentNetworkId) {
            setCurrentNetworkId(storedNetwork);
        }

        if (storedTheme) {
            const isDark = storedTheme === 'dark';
            setIsDarkTheme(isDark);
            applyTheme(isDark, networkToUse);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkTheme(prefersDark);
            applyTheme(prefersDark, networkToUse);
        }

        setIsLoaded(true);

        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setIsDarkTheme(e.matches);
                applyTheme(e.matches, networkToUse);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [currentNetworkId, applyTheme]);

    
    useEffect(() => {
        if (isLoaded) {
            applyTheme(isDarkTheme, currentNetworkId);
            localStorage.setItem('currentNetwork', currentNetworkId);
        }
    }, [currentNetworkId, isLoaded, isDarkTheme, applyTheme]);

    
    const toggleTheme = useCallback(() => {
        const newIsDark = !isDarkTheme;
        setIsDarkTheme(newIsDark);
        applyTheme(newIsDark, currentNetworkId);
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    }, [isDarkTheme, currentNetworkId, applyTheme]);

    
    const getNetworkColor = useCallback((colorType: 'primary' | 'secondary' | 'light' | 'dark'): string => {
        const networkColors = NETWORK_COLORS[currentNetworkId] || NETWORK_COLORS['polkadot'];
        return networkColors[colorType];
    }, [currentNetworkId]);

    const getColor = useCallback((semanticKey: string): string => {
        const colorValue = SEMANTIC_COLORS[semanticKey];
        if (!colorValue) return '#000000';
        return isDarkTheme ? colorValue.dark : colorValue.light;
    }, [isDarkTheme]);

    const getElevation = useCallback((level: 'level0' | 'level1' | 'level2' | 'level3'): string => {
        const elevationValue = ELEVATION_LEVELS[level];
        if (!elevationValue) return 'none';
        return isDarkTheme ? elevationValue.dark : elevationValue.light;
    }, [isDarkTheme]);

    return (
        <ThemeContext.Provider value={{
            isDarkTheme,
            toggleTheme,
            isLoaded,
            currentNetworkId,
            setCurrentNetworkId,
            getNetworkColor,
            getColor,
            getElevation
        }}>
            {children}
        </ThemeContext.Provider>
    );
}