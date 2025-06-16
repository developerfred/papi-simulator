/* eslint-disable  @typescript-eslint/no-unused-vars*/
interface Network {
    name: string;
    symbol: string;
    decimals: number;
    explorer?: string;
    rpcUrl?: string;
    endpoint?: string;
}

type UrlType = 'block' | 'extrinsic' | 'account' | 'runtime';


const SUBSCAN_DOMAIN = 'subscan.io';
const DEFAULT_NETWORK = 'polkadot';
const DEFAULT_FALLBACK_URL = `https://${DEFAULT_NETWORK}.${SUBSCAN_DOMAIN}`;


const URL_PATHS: Record<UrlType, { singular: string; plural: string }> = {
    block: { singular: 'block', plural: 'blocks' },
    extrinsic: { singular: 'extrinsic', plural: 'extrinsics' },
    account: { singular: 'account', plural: '' },
    runtime: { singular: '', plural: '' }
} as const;


const isValidExplorerUrl = (explorerUrl?: string): explorerUrl is string => {
    return Boolean(
        explorerUrl?.trim() &&
        explorerUrl !== 'undefined' &&
        explorerUrl !== 'null'
    );
};


const normalizeNetworkName = (name?: string): string =>
    name?.toLowerCase().replace(/\s+/g, '-') || DEFAULT_NETWORK;


const extractNetworkFromUrl = (url: string, fallbackName?: string): string => {
    try {
        const { hostname } = new URL(url);
        return hostname.split('.')[0] || normalizeNetworkName(fallbackName);
    } catch {
        return normalizeNetworkName(fallbackName);
    }
};


const buildUrlPath = (type: UrlType, identifier?: string | number): string => {
    const { singular, plural } = URL_PATHS[type];

    if (!identifier) {
        return plural ? `/${plural}` : '';
    }

    return singular ? `/${singular}/${identifier}` : '';
};


const createFallbackUrl = (
    networkName: string,
    type: UrlType,
    identifier?: string | number
): string => {
    const baseUrl = `https://${networkName}.${SUBSCAN_DOMAIN}`;
    return `${baseUrl}${buildUrlPath(type, identifier)}`;
};


const resolveBaseUrl = (network: Network): string => {
    if (!isValidExplorerUrl(network.explorer)) {
        console.debug('Using fallback explorer URL for network:', network.name, 'explorer was:', network.explorer);
        return `https://${normalizeNetworkName(network.name)}.${SUBSCAN_DOMAIN}`;
    }

    const baseUrl = network.explorer.replace(/\/$/, '');

    if (!baseUrl.includes(SUBSCAN_DOMAIN)) {
        console.debug('Explorer URL is not a Subscan URL, creating fallback:', baseUrl);
        const networkName = extractNetworkFromUrl(baseUrl, network.name);
        return `https://${networkName}.${SUBSCAN_DOMAIN}`;
    }

    return baseUrl;
};

/**
 * Builds Subscan URL for different resource types
 * 
 * @param network - Network configuration object
 * @param type - Type of resource to link to
 * @param identifier - Optional identifier for the resource
 * @returns Complete Subscan URL
 */
export const buildSubscanUrl = (
    network: Network | null | undefined,
    type: UrlType,
    identifier?: string | number
): string => {    
    if (!network) {
        console.warn('Network object is null or undefined');
        return `${DEFAULT_FALLBACK_URL}${buildUrlPath(type, identifier)}`;
    }

    const baseUrl = resolveBaseUrl(network);
    return `${baseUrl}${buildUrlPath(type, identifier)}`;
};