
export const NETWORK_COLORS: Record<string, {
    primary: string;
    secondary: string;
    light: string;
    dark: string;
}> = {
    
    polkadot: {
        primary: '#E6007A', 
        secondary: '#BC318F',
        light: '#FAE6F2',
        dark: '#9C0054'
    },
    
    westend: {
        primary: '#46DDD2', 
        secondary: '#37B3AA',
        light: '#E0FAF8',
        dark: '#2C8C85'
    },
    paseo: {
        primary: '#FF7B00', 
        secondary: '#D98A37',
        light: '#FFF0E0',
        dark: '#B35600'
    },
    rococo: {
        primary: '#7D42BC', 
        secondary: '#6340A8',
        light: '#F0E5FF',
        dark: '#512C7E'
    }
};


export const SEMANTIC_COLORS: Record<string, {
    light: string;
    dark: string;
}> = {

    background: {
        light: '#FFFFFF',
        dark: '#0F0F14'
    },
    surface: {
        light: '#F7F7F9',
        dark: '#1C1C24'
    },
    surfaceVariant: {
        light: '#EEEEF2',
        dark: '#2D2D3A'
    },

    
    textPrimary: {
        light: '#18181B',
        dark: '#F4F4F6'
    },
    textSecondary: {
        light: '#52525B',
        dark: '#A1A1AA'
    },
    textTertiary: {
        light: '#71717A',
        dark: '#8E8E99'
    },

    
    border: {
        light: '#E4E4E7',
        dark: '#303042'
    },
    divider: {
        light: '#F1F1F4',
        dark: '#27272F'
    },

    
    success: {
        light: '#22C55E',
        dark: '#4ADE80'
    },
    error: {
        light: '#EF4444',
        dark: '#F87171'
    },
    warning: {
        light: '#F59E0B',
        dark: '#FBBF24'
    },
    info: {
        light: '#3B82F6',
        dark: '#60A5FA'
    }
};


export const ELEVATION_LEVELS: Record<string, {
    light: string;
    dark: string;
}> = {
    level0: {
        light: 'none',
        dark: 'none'
    },
    level1: {
        light: '0 1px 3px rgba(0, 0, 0, 0.08)',
        dark: '0 1px 3px rgba(0, 0, 0, 0.25)'
    },
    level2: {
        light: '0 3px 6px rgba(0, 0, 0, 0.12)',
        dark: '0 3px 6px rgba(0, 0, 0, 0.35)'
    },
    level3: {
        light: '0 8px 16px rgba(0, 0, 0, 0.15)',
        dark: '0 8px 16px rgba(0, 0, 0, 0.45)'
    }
};