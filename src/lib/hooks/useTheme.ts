/* eslint-disable  @typescript-eslint/no-unused-vars */

import { useEffect, useState, useCallback, useContext } from "react";
import { ThemeContext } from "@/lib/theme/ThemeProvider"; 


export function useThemeHook() {
  
  const themeContext = useContext(ThemeContext);

  
  const {
    isDarkTheme = false,
    toggleTheme = () => { },
    isLoaded = false,
    currentNetworkId = 'polkadot',
    setCurrentNetworkId = () => { },
    getNetworkColor = () => '#000000',
    getColor = () => '#000000'
  } = themeContext || {};

  
  const applyAdditionalStyles = useCallback((isDark: boolean, network: string) => {
    const root = document.documentElement;


    const additionalStyles = {

      '--custom-card-bg': isDark ? '#1c1c24' : '#ffffff',
      '--custom-code-bg': isDark ? '#2d2d3a' : '#f4f4f5',
      '--custom-input-bg': isDark ? '#242433' : '#ffffff',


      '--custom-gradient-primary': isDark
        ? `linear-gradient(135deg, ${getNetworkColor('primary')}, ${getNetworkColor('secondary')})`
        : `linear-gradient(135deg, ${getNetworkColor('light')}, ${getNetworkColor('primary')})`,
    };

    Object.entries(additionalStyles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [getNetworkColor]);

  
  useEffect(() => {
    if (isLoaded) {
      applyAdditionalStyles(isDarkTheme, currentNetworkId);
    }
  }, [isDarkTheme, currentNetworkId, isLoaded, applyAdditionalStyles]);

  
  const hexToRgba = useCallback((hex: string, opacity: number): string => {
    if (!hex || typeof hex !== 'string') return `rgba(0, 0, 0, ${opacity})`;
    hex = hex.replace('#', '');

    if (![3, 6].includes(hex.length)) return `rgba(0, 0, 0, ${opacity})`;

    let r = 0, g = 0, b = 0;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);


  
  const getCustomColor = useCallback((colorName: string, opacity: number = 1): string => {
    if (typeof window === "undefined") return '#000000';

    const cssVariable = `--custom-${colorName}`;
    const colorValue = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVariable)
      .trim();

    if (!colorValue) return '#000000';

    if (opacity === 1) return colorValue;
    return hexToRgba(colorValue, opacity);
  }, [hexToRgba]);

  
  const getNetworkColorWithOpacity = useCallback((
    colorType: 'primary' | 'secondary' | 'light' | 'dark' = 'primary',
    opacity: number = 1
  ): string => {
    const color = getNetworkColor(colorType);
    if (opacity === 1) return color;
    return hexToRgba(color, opacity);
  }, [getNetworkColor, hexToRgba]);

  
  const getSemanticColorWithOpacity = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    opacity: number = 1
  ): string => {
    const color = getColor(type);
    if (opacity === 1) return color;
    return hexToRgba(color, opacity);
  }, [getColor, hexToRgba]);

  
  const getComponentColors = useCallback(() => {
    return {
      background: getColor('background'),
      surface: getColor('surface'),
      textPrimary: getColor('text-primary'),
      textSecondary: getColor('text-secondary'),
      border: getColor('border'),

      
      customCard: getCustomColor('card-bg'),
      customCode: getCustomColor('code-bg'),
      customInput: getCustomColor('input-bg'),

      
      networkPrimary: getNetworkColor('primary'),
      networkSecondary: getNetworkColor('secondary'),
      networkLight: getNetworkColor('light'),
      networkDark: getNetworkColor('dark'),

      // Cores semânticas
      success: getColor('success'),
      error: getColor('error'),
      warning: getColor('warning'),
      info: getColor('info'),
    };
  }, [getColor, getCustomColor, getNetworkColor]);

  
  const getThemeStyles = useCallback(() => {
    const colors = getComponentColors();

    return {
      modal: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.textPrimary,
      },
      card: {
        backgroundColor: colors.customCard,
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
        backgroundColor: colors.customInput,
        borderColor: colors.border,
        color: colors.textPrimary,
      },
    };
  }, [getComponentColors]);

  
  const updateNetwork = useCallback((networkName: string) => {
    setCurrentNetworkId(networkName);
  }, [setCurrentNetworkId]);

  return {
  
    isDarkTheme,
    isLoaded,
    currentNetwork: currentNetworkId,

  
    toggleTheme,
    updateNetwork,

  
    getColor,
    getNetworkColor: getNetworkColorWithOpacity,
    getSemanticColor: getSemanticColorWithOpacity,
    getCustomColor,
    getComponentColors,
    getThemeStyles,
    hexToRgba,

    
    themeName: isDarkTheme ? 'dark' : 'light',
    networkColors: {
      primary: getNetworkColor('primary'),
      secondary: getNetworkColor('secondary'),
      light: getNetworkColor('light'),
      dark: getNetworkColor('dark'),
    },
  };
}