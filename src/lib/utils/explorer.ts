interface Network {
    name: string;
    symbol: string;
    decimals: number;
    explorer?: string; // Opcional para evitar erros
    rpcUrl?: string;
    endpoint?: string;
}

export const buildSubscanUrl = (
    network: Network,
    type: 'block' | 'extrinsic' | 'account' | 'runtime',
    identifier?: string | number
): string => {
    // Verificação de segurança inicial
    if (!network) {
        console.warn('Network object is null or undefined');
        return `https://polkadot.subscan.io/${type}${identifier ? `/${identifier}` : ''}`;
    }

    // Validação robusta do explorer URL
    const explorerUrl = network.explorer;

    // Verifica se o explorer URL é válido
    if (!explorerUrl ||
        typeof explorerUrl !== 'string' ||
        explorerUrl.trim() === '' ||
        explorerUrl === 'undefined' ||
        explorerUrl === 'null') {

        console.debug('Using fallback explorer URL for network:', network.name, 'explorer was:', explorerUrl);

        // Fallback usando o nome da rede
        const networkName = network.name?.toLowerCase()?.replace(/\s+/g, '-') || 'polkadot';
        const fallbackUrl = `https://${networkName}.subscan.io`;

        // Retorna URL baseado no tipo
        switch (type) {
            case 'block':
                return identifier ? `${fallbackUrl}/block/${identifier}` : `${fallbackUrl}/blocks`;
            case 'extrinsic':
                return identifier ? `${fallbackUrl}/extrinsic/${identifier}` : `${fallbackUrl}/extrinsics`;
            case 'account':
                return identifier ? `${fallbackUrl}/account/${identifier}` : fallbackUrl;
            case 'runtime':
                return fallbackUrl;
            default:
                return fallbackUrl;
        }
    }

    // Remove barra final do URL base
    const baseUrl = explorerUrl.replace(/\/$/, '');

    // Verifica se é um URL válido do Subscan
    if (!baseUrl.includes('subscan.io')) {
        console.debug('Explorer URL is not a Subscan URL, creating fallback:', baseUrl);

        // Tenta extrair o nome da rede do URL ou usa o nome da rede
        let networkName = 'polkadot';

        try {
            const urlObj = new URL(baseUrl);
            const subdomain = urlObj.hostname.split('.')[0];
            networkName = subdomain || network.name?.toLowerCase()?.replace(/\s+/g, '-') || 'polkadot';
        } catch {
            networkName = network.name?.toLowerCase()?.replace(/\s+/g, '-') || 'polkadot';
        }

        const fallbackUrl = `https://${networkName}.subscan.io`;

        // Retorna URL baseado no tipo
        switch (type) {
            case 'block':
                return identifier ? `${fallbackUrl}/block/${identifier}` : `${fallbackUrl}/blocks`;
            case 'extrinsic':
                return identifier ? `${fallbackUrl}/extrinsic/${identifier}` : `${fallbackUrl}/extrinsics`;
            case 'account':
                return identifier ? `${fallbackUrl}/account/${identifier}` : fallbackUrl;
            case 'runtime':
                return fallbackUrl;
            default:
                return fallbackUrl;
        }
    }

    // URL válido do Subscan - constrói o URL final
    switch (type) {
        case 'block':
            return identifier ? `${baseUrl}/block/${identifier}` : `${baseUrl}/blocks`;
        case 'extrinsic':
            return identifier ? `${baseUrl}/extrinsic/${identifier}` : `${baseUrl}/extrinsics`;
        case 'account':
            return identifier ? `${baseUrl}/account/${identifier}` : baseUrl;
        case 'runtime':
            return baseUrl;
        default:
            return baseUrl;
    }
};