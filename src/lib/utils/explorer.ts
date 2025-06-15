interface Network {
    name: string;
    symbol: string;
    decimals: number;
    explorer: string;
    rpcUrl?: string;
    endpoint?: string;
}

export const buildSubscanUrl = (network: Network, type: 'block' | 'runtime', identifier?: string | number): string => {
    const baseUrl = network.explorer?.replace(/\/$/, '') || '';

    if (!baseUrl || !baseUrl.includes('subscan.io')) {
        const networkName = network.name?.toLowerCase() || 'polkadot';
        const fallbackUrl = `https://${networkName}.subscan.io`;
        return type === 'runtime' ? fallbackUrl : `${fallbackUrl}/block/${identifier}`;
    }

    return type === 'runtime' ? baseUrl : `${baseUrl}/block/${identifier}`;
};
