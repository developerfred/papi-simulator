/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState, useCallback } from "react";


export function useTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('polkadot');

  useEffect(() => {
    if (typeof window === "undefined") return;

    
    const storedTheme = localStorage.getItem("theme");
    const storedNetwork = localStorage.getItem("current-network") || 'polkadot';
    
    setCurrentNetwork(storedNetwork);

    if (storedTheme) {
      const isDark = storedTheme === "dark";
      setIsDarkTheme(isDark);
      applyTheme(isDark, storedNetwork);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
      applyTheme(prefersDark, storedNetwork);
    }

    setIsLoaded(true);

    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkTheme(e.matches);
        applyTheme(e.matches, storedNetwork);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);


  const toggleTheme = useCallback(() => {
    const newIsDark = !isDarkTheme;
    setIsDarkTheme(newIsDark);
    applyTheme(newIsDark, currentNetwork);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  }, [isDarkTheme, currentNetwork]);


  const updateNetwork = useCallback((networkName: string) => {
    setCurrentNetwork(networkName);
    applyTheme(isDarkTheme, networkName);
    localStorage.setItem("current-network", networkName);
  }, [isDarkTheme]);


  const applyTheme = useCallback((isDark: boolean, network: string = 'polkadot') => {
    const root = document.documentElement;
    
    
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    root.setAttribute("data-network", network);
    
    
    if (isDark) {
      
      root.style.setProperty("--background", "#0a0a0f");
      root.style.setProperty("--foreground", "#f4f4f6");
      
      
      root.style.setProperty("--surface", "#1a1a24");
      root.style.setProperty("--surface-variant", "#2d2d3a");
      
      
      root.style.setProperty("--text-primary", "#f4f4f6");
      root.style.setProperty("--text-secondary", "#a1a1aa");
      root.style.setProperty("--text-tertiary", "#71717a");
      
      
      root.style.setProperty("--border", "#303042");
      root.style.setProperty("--divider", "#27272f");
      
      
      root.style.setProperty("--card-bg", "#1c1c24");
      root.style.setProperty("--code-bg", "#2d2d3a");
      root.style.setProperty("--input-bg", "#242433");
      
      
      root.style.setProperty("--success", "#4ade80");
      root.style.setProperty("--error", "#f87171");
      root.style.setProperty("--warning", "#fbbf24");
      root.style.setProperty("--info", "#60a5fa");
      
    } else {
      
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#18181b");
      
      
      root.style.setProperty("--surface", "#f7f7f9");
      root.style.setProperty("--surface-variant", "#eeeef2");
      
      
      root.style.setProperty("--text-primary", "#18181b");
      root.style.setProperty("--text-secondary", "#52525b");
      root.style.setProperty("--text-tertiary", "#71717a");
      
      
      root.style.setProperty("--border", "#e4e4e7");
      root.style.setProperty("--divider", "#f1f1f4");
      
      
      root.style.setProperty("--card-bg", "#ffffff");
      root.style.setProperty("--code-bg", "#f4f4f5");
      root.style.setProperty("--input-bg", "#ffffff");
      
      
      root.style.setProperty("--success", "#22c55e");
      root.style.setProperty("--error", "#ef4444");
      root.style.setProperty("--warning", "#f59e0b");
      root.style.setProperty("--info", "#3b82f6");
    }

    
    const networkColors = getNetworkColors(network);
    root.style.setProperty("--network-primary", networkColors.primary);
    root.style.setProperty("--network-secondary", networkColors.secondary);
    root.style.setProperty("--network-light", networkColors.light);
    root.style.setProperty("--network-dark", networkColors.dark);
    
    
    document.body.className = isDark ? 'dark' : 'light';
    
  }, []);

  const getNetworkColors = (network: string) => {
    const networks: Record<string, {
      primary: string;
      secondary: string;
      light: string;
      dark: string;
    }> = {
      polkadot: {
        primary: "#e6007a",
        secondary: "#bc318f",
        light: "#fae6f2",
        dark: "#9c0054",
      },
      kusama: {
        primary: "#000000",
        secondary: "#333333",
        light: "#f5f5f5",
        dark: "#000000",
      },
      westend: {
        primary: "#46ddd2",
        secondary: "#37b3aa",
        light: "#e0faf8",
        dark: "#2c8c85",
      },
      paseo: {
        primary: "#ff7b00",
        secondary: "#d98a37",
        light: "#fff0e0",
        dark: "#b35600",
      },
      rococo: {
        primary: "#7d42bc",
        secondary: "#6340a8",
        light: "#f0e5ff",
        dark: "#512c7e",
      },
      acala: {
        primary: "#ff4c3b",
        secondary: "#e63946",
        light: "#ffebea",
        dark: "#d62d20",
      },
      moonbeam: {
        primary: "#53cbc8",
        secondary: "#4a9b98",
        light: "#e8f7f6",
        dark: "#3a7b79",
      },
      astar: {
        primary: "#0070f3",
        secondary: "#0051cc",
        light: "#e6f2ff",
        dark: "#003d99",
      },
    };

    return networks[network] || networks.polkadot;
  };

  const hexToRgba = useCallback((hex: string, opacity: number): string => {
    
    hex = hex.replace('#', '');
    
    let r = 0, g = 0, b = 0;
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);


  const getColor = useCallback((colorName: string, opacity: number = 1): string => {
    if (typeof window === "undefined") return '#000000';
    
    const cssVariable = `--${colorName}`;
    const colorValue = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVariable)
      .trim();

    if (!colorValue) return '#000000';
    
    if (opacity === 1) return colorValue;
    return hexToRgba(colorValue, opacity);
  }, [hexToRgba]);


  const getNetworkColor = useCallback((colorType: 'primary' | 'secondary' | 'light' | 'dark' = 'primary', opacity: number = 1): string => {
    return getColor(`network-${colorType}`, opacity);
  }, [getColor]);


  const getSemanticColor = useCallback((type: 'success' | 'error' | 'warning' | 'info', opacity: number = 1): string => {
    return getColor(type, opacity);
  }, [getColor]);


  const getComponentColors = useCallback(() => {
    return {
      
      background: getColor('background'),
      surface: getColor('surface'),
      surfaceVariant: getColor('surface-variant'),
      card: getColor('card-bg'),
      code: getColor('code-bg'),
      input: getColor('input-bg'),
      
      
      textPrimary: getColor('text-primary'),
      textSecondary: getColor('text-secondary'),
      textTertiary: getColor('text-tertiary'),
      
      
      border: getColor('border'),
      divider: getColor('divider'),
      
      
      networkPrimary: getNetworkColor('primary'),
      networkSecondary: getNetworkColor('secondary'),
      networkLight: getNetworkColor('light'),
      networkDark: getNetworkColor('dark'),
            
      success: getSemanticColor('success'),
      error: getSemanticColor('error'),
      warning: getSemanticColor('warning'),
      info: getSemanticColor('info'),
    };
  }, [getColor, getNetworkColor, getSemanticColor]);


  const forceThemeUpdate = useCallback(() => {
    applyTheme(isDarkTheme, currentNetwork);
  }, [isDarkTheme, currentNetwork, applyTheme]);

  const getThemeStyles = useCallback(() => {
    const colors = getComponentColors();
    
    return {
      modal: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.textPrimary,
      },
      card: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.textPrimary,
      },
      button: {
        primary: {
          backgroundColor: colors.networkPrimary,
          color: '#ffffff',
          borderColor: colors.networkPrimary,
        },
        secondary: {
          backgroundColor: 'transparent',
          color: colors.networkPrimary,
          borderColor: colors.networkPrimary,
        },
      },
      input: {
        backgroundColor: colors.input,
        borderColor: colors.border,
        color: colors.textPrimary,
      },
    };
  }, [getComponentColors]);

  return {
    
    isDarkTheme,
    isLoaded,
    currentNetwork,
    
    
    toggleTheme,
    updateNetwork,
    forceThemeUpdate,
    
    
    getColor,
    getNetworkColor,
    getSemanticColor,
    getComponentColors,
    getThemeStyles,
    hexToRgba,
    
    
    themeName: isDarkTheme ? 'dark' : 'light',
    networkColors: getNetworkColors(currentNetwork),
  };
}