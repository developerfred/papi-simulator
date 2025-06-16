/* eslint-disable  @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import type { TransactionPreset } from "../types/transaction.types";

export const XCM_DESTINATIONS = {
    
    polkadot: { paraId: 0, name: 'Polkadot Relay', symbol: 'DOT', network: 'polkadot' },
    kusama: { paraId: 0, name: 'Kusama Relay', symbol: 'KSM', network: 'kusama' },
    paseo: { paraId: 0, name: 'Paseo Testnet', symbol: 'PAS', network: 'paseo' },
    westend: { paraId: 0, name: 'Westend Testnet', symbol: 'WND', network: 'westend' },

    
    polkadot_asset_hub: { paraId: 1000, name: 'Polkadot Asset Hub', symbol: 'DOT', network: 'polkadot' },
    polkadot_collectives: { paraId: 1001, name: 'Polkadot Collectives', symbol: 'DOT', network: 'polkadot' },
    polkadot_bridge_hub: { paraId: 1002, name: 'Polkadot Bridge Hub', symbol: 'DOT', network: 'polkadot' },
    polkadot_people: { paraId: 1004, name: 'Polkadot People Chain', symbol: 'DOT', network: 'polkadot' },
    polkadot_coretime: { paraId: 1005, name: 'Polkadot Coretime Chain', symbol: 'DOT', network: 'polkadot' },

    
    kusama_asset_hub: { paraId: 1000, name: 'Kusama Asset Hub', symbol: 'KSM', network: 'kusama' },
    kusama_bridge_hub: { paraId: 1002, name: 'Kusama Bridge Hub', symbol: 'KSM', network: 'kusama' },
    kusama_people: { paraId: 1004, name: 'Kusama People Chain', symbol: 'KSM', network: 'kusama' },
    kusama_coretime: { paraId: 1005, name: 'Kusama Coretime Chain', symbol: 'KSM', network: 'kusama' },
    encointer: { paraId: 1001, name: 'Encointer', symbol: 'KSM', network: 'kusama' },

    
    paseo_asset_hub: { paraId: 1000, name: 'Paseo Asset Hub', symbol: 'PAS', network: 'paseo' },
    paseo_bridge_hub: { paraId: 1002, name: 'Paseo Bridge Hub', symbol: 'PAS', network: 'paseo' },
    paseo_people: { paraId: 1004, name: 'Paseo People Chain', symbol: 'PAS', network: 'paseo' },
    paseo_coretime: { paraId: 1005, name: 'Paseo Coretime Chain', symbol: 'PAS', network: 'paseo' },

    
    westend_asset_hub: { paraId: 1000, name: 'Westend Asset Hub', symbol: 'WND', network: 'westend' },
    westend_bridge_hub: { paraId: 1002, name: 'Westend Bridge Hub', symbol: 'WND', network: 'westend' },
    westend_people: { paraId: 1004, name: 'Westend People Chain', symbol: 'WND', network: 'westend' },
    westend_coretime: { paraId: 1005, name: 'Westend Coretime Chain', symbol: 'WND', network: 'westend' },
    westend_collectives: { paraId: 1001, name: 'Westend Collectives', symbol: 'WND', network: 'westend' },

    
    acala: { paraId: 2000, name: 'Acala', symbol: 'ACA', network: 'polkadot' },
    moonbeam: { paraId: 2004, name: 'Moonbeam', symbol: 'GLMR', network: 'polkadot' },
    astar: { paraId: 2006, name: 'Astar', symbol: 'ASTR', network: 'polkadot' },
    parallel: { paraId: 2012, name: 'Parallel', symbol: 'PARA', network: 'polkadot' },
    nodle: { paraId: 2026, name: 'Nodle', symbol: 'NODL', network: 'polkadot' },
    bifrost_polkadot: { paraId: 2030, name: 'Bifrost', symbol: 'BNC', network: 'polkadot' },
    centrifuge: { paraId: 2031, name: 'Centrifuge', symbol: 'CFG', network: 'polkadot' },
    interlay: { paraId: 2032, name: 'Interlay', symbol: 'INTR', network: 'polkadot' },
    hydradx: { paraId: 2034, name: 'HydraDX', symbol: 'HDX', network: 'polkadot' },
    phala: { paraId: 2035, name: 'Phala Network', symbol: 'PHA', network: 'polkadot' },
    unique: { paraId: 2037, name: 'Unique Network', symbol: 'UNQ', network: 'polkadot' },

    
    karura: { paraId: 2000, name: 'Karura', symbol: 'KAR', network: 'kusama' },
    bifrost_kusama: { paraId: 2001, name: 'Bifrost', symbol: 'BNC', network: 'kusama' },
    khala: { paraId: 2004, name: 'Khala Network', symbol: 'PHA', network: 'kusama' },
    shiden: { paraId: 2007, name: 'Shiden', symbol: 'SDN', network: 'kusama' },
    moonriver: { paraId: 2023, name: 'Moonriver', symbol: 'MOVR', network: 'kusama' },
    picasso: { paraId: 2087, name: 'Picasso', symbol: 'PICA', network: 'kusama' },
    altair: { paraId: 2088, name: 'Altair', symbol: 'AIR', network: 'kusama' },
    basilisk: { paraId: 2090, name: 'Basilisk', symbol: 'BSX', network: 'kusama' },
    kintsugi: { paraId: 2092, name: 'Kintsugi', symbol: 'KINT', network: 'kusama' },
    quartz: { paraId: 2095, name: 'Quartz', symbol: 'QTZ', network: 'kusama' },

    
    ajuna_paseo: { paraId: 2000, name: 'Ajuna (Paseo)', symbol: 'AJUN', network: 'paseo' },
    amplitude_paseo: { paraId: 2124, name: 'Amplitude (Paseo)', symbol: 'AMPE', network: 'paseo' },
    aventus_paseo: { paraId: 2056, name: 'Aventus (Paseo)', symbol: 'AVT', network: 'paseo' },
    bajun_paseo: { paraId: 2119, name: 'Bajun (Paseo)', symbol: 'BAJU', network: 'paseo' },
    bifrost_paseo: { paraId: 2030, name: 'Bifrost (Paseo)', symbol: 'BNC', network: 'paseo' },
    darwinia_koi: { paraId: 2105, name: 'Darwinia Koi', symbol: 'KTON', network: 'paseo' },
    frequency: { paraId: 4000, name: 'Frequency', symbol: 'FRQCY', network: 'paseo' },
    hyperbridge: { paraId: 4374, name: 'Hyperbridge', symbol: 'HYP', network: 'paseo' },
    integritee_paseo: { paraId: 3002, name: 'Integritee', symbol: 'TEER', network: 'paseo' },
    kilt_paseo: { paraId: 2000, name: 'KILT (Paseo)', symbol: 'KILT', network: 'paseo' },
    laos_sigma: { paraId: 3369, name: 'Laos Sigma', symbol: 'LAOS', network: 'paseo' },
    muse: { paraId: 3369, name: 'Muse', symbol: 'MUSE', network: 'paseo' },
    myriad_social: { paraId: 4002, name: 'Myriad Social', symbol: 'MYRIA', network: 'paseo' },
    niskala: { paraId: 3888, name: 'Niskala', symbol: 'NISK', network: 'paseo' },
    nodle_paradis: { paraId: 3888, name: 'Nodle Paradis', symbol: 'NODL', network: 'paseo' },
    pop_network: { paraId: 4001, name: 'POP Network', symbol: 'POP', network: 'paseo' },
    regionx_cocos: { paraId: 4019, name: 'RegionX Cocos', symbol: 'COCOS', network: 'paseo' },
    xcavate: { paraId: 2021, name: 'Xcavate', symbol: 'XCAV', network: 'paseo' },
    zeitgeist_battery: { paraId: 2101, name: 'Zeitgeist Battery Station', symbol: 'ZTG', network: 'paseo' },
} as const;


const NETWORK_PATTERNS = {
    polkadot: [
        'polkadot', 'dot', 'polkadot relay', 'polkadot-relay',
        'polkadot mainnet', 'polkadot-mainnet'
    ],
    kusama: [
        'kusama', 'ksm', 'kusama relay', 'kusama-relay',
        'kusama canary', 'kusama-canary'
    ],
    paseo: [
        'paseo', 'pas', 'paseo testnet', 'paseo-testnet',
        'paseo network', 'paseo-network', 'paseo test'
    ],
    westend: [
        'westend', 'wnd', 'westend testnet', 'westend-testnet',
        'westend test', 'westend-test'
    ]
};


export const detectNetworkType = (networkName: string, networkSymbol?: string, relay?: string): string => {
    if (!networkName && !networkSymbol && !relay) {
        console.warn('⚠️ No network information provided');
        return 'unknown';
    }

    const searchTerms = [
        networkName?.toLowerCase().trim(),
        networkSymbol?.toLowerCase().trim(),
        relay?.toLowerCase().trim()
    ].filter(Boolean);

    console.log(`🔍 Detecting network type from terms:`, searchTerms);

    
    for (const [networkType, patterns] of Object.entries(NETWORK_PATTERNS)) {
        for (const term of searchTerms) {
            
            if (patterns.includes(term)) {
                console.log(`✅ Exact match found: ${networkType} from "${term}"`);
                return networkType;
            }

            
            if (patterns.some(pattern => term.includes(pattern))) {
                console.log(`🎯 Pattern match found: ${networkType} from "${term}"`);
                return networkType;
            }
        }
    }

    
    if (networkSymbol === 'PAS') return 'paseo';
    if (networkSymbol === 'DOT') return 'polkadot';
    if (networkSymbol === 'KSM') return 'kusama';
    if (networkSymbol === 'WND') return 'westend';

    
    if (networkName?.toLowerCase().includes('paseo')) return 'paseo';
    if (networkName?.toLowerCase().includes('polkadot')) return 'polkadot';
    if (networkName?.toLowerCase().includes('kusama')) return 'kusama';
    if (networkName?.toLowerCase().includes('westend')) return 'westend';

    console.warn(`❌ Unable to detect network type for: name="${networkName}", symbol="${networkSymbol}", relay="${relay}"`);
    return 'unknown';
};


export const getDestinationsByNetwork = (network: any) => {
    console.log(`🔍 Getting destinations for network:`, {
        name: network?.name,
        symbol: network?.symbol,
        relay: network?.relay,
        networkType: network?.networkType
    });

    
    const networkType = network?.networkType || detectNetworkType(network?.name, network?.symbol, network?.relay);

    if (networkType === 'unknown') {
        console.error(`❌ Cannot determine network type for network:`, network);
        return {};
    }

    console.log(`📍 Using network type: ${networkType}`);

    
    const destinations = Object.entries(XCM_DESTINATIONS)
        .filter(([_, dest]) => dest.network === networkType)
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

    console.log(`✅ Found ${Object.keys(destinations).length} destinations for ${networkType}:`, Object.keys(destinations));

    
    const invalidDestinations = Object.entries(destinations)
        .filter(([_, dest]) => dest.network !== networkType);

    if (invalidDestinations.length > 0) {
        console.error(`🚨 ERRO: Destinos inválidos encontrados para ${networkType}:`, invalidDestinations);    
        invalidDestinations.forEach(([key]) => delete destinations[key]);
    }

    return destinations;
};


export const getSystemParachains = (network: any) => {
    const networkType = network?.networkType || detectNetworkType(network?.name, network?.symbol, network?.relay);
    const networkDestinations = getDestinationsByNetwork(network);


    const systemParachainPatterns = {
        polkadot: ['polkadot_asset_hub', 'polkadot_bridge_hub', 'polkadot_people', 'polkadot_coretime', 'polkadot_collectives'],
        kusama: ['kusama_asset_hub', 'kusama_bridge_hub', 'kusama_people', 'kusama_coretime', 'encointer'],
        paseo: ['paseo_asset_hub', 'paseo_bridge_hub', 'paseo_people', 'paseo_coretime'],
        westend: ['westend_asset_hub', 'westend_bridge_hub', 'westend_people', 'westend_coretime', 'westend_collectives']
    };

    const allowedSystemChains = systemParachainPatterns[networkType] || [];

    const systemParachains = Object.entries(networkDestinations)
        .filter(([key, dest]) => {

            const isSystemChain = allowedSystemChains.includes(key);
            const isCorrectNetwork = dest.network === networkType;

            return isSystemChain && isCorrectNetwork;
        })
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

    console.log(`🏛️ System parachains for ${networkType}:`, Object.keys(systemParachains));
    return systemParachains;
};


export const getParachains = (network: any) => {
    const networkType = network?.networkType || detectNetworkType(network?.name, network?.symbol, network?.relay);
    const networkDestinations = getDestinationsByNetwork(network);
    const systemParachains = getSystemParachains(network);

    const parachains = Object.entries(networkDestinations)
        .filter(([key, dest]) => {
            const isNotRelay = dest.paraId > 0;
            const isNotSystemChain = !systemParachains.hasOwnProperty(key);
            const isCorrectNetwork = dest.network === networkType;

            return isNotRelay && isNotSystemChain && isCorrectNetwork;
        })
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

    console.log(`⛓️ Regular parachains for ${networkType}:`, Object.keys(parachains));
    return parachains;
};


export const XCM_NETWORK_CONFIG = {
    polkadot: {
        version: 'V4',
        supportedMethods: ['reserveTransferAssets', 'limitedReserveTransferAssets', 'teleportAssets'],
        defaultWeightLimit: 'Unlimited',
        maxMessageSize: 102400,
        fullySupported: true,
        xcmEnabled: true,
        crossNetworkEnabled: false,
    },
    kusama: {
        version: 'V4',
        supportedMethods: ['reserveTransferAssets', 'limitedReserveTransferAssets', 'teleportAssets'],
        defaultWeightLimit: 'Unlimited',
        maxMessageSize: 102400,
        fullySupported: true,
        xcmEnabled: true,
        crossNetworkEnabled: false,
    },
    paseo: {
        version: 'V4',
        supportedMethods: ['teleportAssets', 'limitedTeleportAssets'],
        defaultWeightLimit: 'Limited',
        maxMessageSize: 51200,
        isTestnet: true,
        fullySupported: true,
        xcmEnabled: true,
        crossNetworkEnabled: false,
        strictFiltering: true, 
        allowedDestinations: [
            'paseo',
            'paseo_asset_hub',
            'paseo_bridge_hub',
            'paseo_people',
            'paseo_coretime'
        ],
        limitations: [
            'Limited parachain ecosystem',
            'Teleport mainly between system parachains and trusted chains',
            'Reserve transfers may not work reliably between arbitrary parachains',
            'Trust relationships must be explicitly configured',
            'HRMP channels need manual setup between parachains',
            'Testing environment - expect occasional instability'
        ],
        supportedRoutes: [
            'Paseo Relay <-> Paseo Asset Hub (teleport)',
            'Paseo Relay <-> Paseo Bridge Hub (teleport)',
            'Paseo Asset Hub <-> Paseo Bridge Hub (HRMP + trust config)',
            'Limited support for custom parachains with proper trust setup'
        ],
        notes: [
            'XcmPaymentApi and DryRunApi recently added',
            'Follows Polkadot releases for stability',
            'HRMP channels can be established but require configuration',
            'Focus on parachain development rather than XCM ecosystem testing'
        ]
    },
    westend: {
        version: 'V4',
        supportedMethods: ['teleportAssets', 'reserveTransferAssets'],
        defaultWeightLimit: 'Unlimited',
        maxMessageSize: 102400,
        isTestnet: true,
        fullySupported: false,
        xcmEnabled: true,
        crossNetworkEnabled: false,
        strictFiltering: true,
        allowedDestinations: [
            'westend',
            'westend_asset_hub',
            'westend_bridge_hub',
            'westend_people',
            'westend_coretime',
            'westend_collectives'
        ],
        limitations: [
            'Testing network - features may be unstable',
            'Limited parachain ecosystem',
            'Mainly for protocol testing'
        ]
    }
} as const;


export const getAvailableXcmDestinations = (network: any) => {
    const networkType = network?.networkType || detectNetworkType(network?.name, network?.symbol, network?.relay);
    const config = XCM_NETWORK_CONFIG[networkType as keyof typeof XCM_NETWORK_CONFIG];

    console.log(`🎯 Getting available XCM destinations for ${networkType}:`, {
        xcmEnabled: config?.xcmEnabled,
        strictFiltering: config?.strictFiltering
    });

    if (!config?.xcmEnabled) {
        console.warn(`❌ XCM not enabled for ${networkType}`);
        return {};
    }

    
    const networkDestinations = getDestinationsByNetwork(network);

    
    if (config.strictFiltering && config.allowedDestinations) {
        const filteredDestinations = Object.entries(networkDestinations)
            .filter(([key, dest]) => {
                const isAllowed = config.allowedDestinations!.includes(key);
                const isCorrectNetwork = dest.network === networkType;

                if (!isAllowed) {
                    console.log(`🚫 Destination ${key} not in allowed list for ${networkType}`);
                }
                if (!isCorrectNetwork) {
                    console.error(`🚨 ERRO: Destination ${key} has wrong network ${dest.network}, expected ${networkType}`);
                }

                return isAllowed && isCorrectNetwork;
            })
            .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

        console.log(`🔄 Filtered destinations for ${networkType}:`, Object.keys(filteredDestinations));
        return filteredDestinations;
    }

    
    const validatedDestinations = Object.entries(networkDestinations)
        .filter(([key, dest]) => {
            const isCorrectNetwork = dest.network === networkType;
            if (!isCorrectNetwork) {
                console.error(`🚨 ERRO: Destination ${key} has wrong network ${dest.network}, expected ${networkType}`);
            }
            return isCorrectNetwork;
        })
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

    console.log(`✅ Validated destinations for ${networkType}:`, Object.keys(validatedDestinations));
    return validatedDestinations;
};


export const isXcmTransactionSupported = (sourceNetwork: any, destNetwork: string, method: string) => {
    const sourceNetworkType = sourceNetwork?.networkType || detectNetworkType(sourceNetwork?.name, sourceNetwork?.symbol, sourceNetwork?.relay);
    const sourceConfig = XCM_NETWORK_CONFIG[sourceNetworkType as keyof typeof XCM_NETWORK_CONFIG];

    if (!sourceConfig?.xcmEnabled) {
        return {
            supported: false,
            reason: `XCM not enabled on ${sourceNetworkType} network`
        };
    }

    if (!sourceConfig.supportedMethods.includes(method)) {
        return {
            supported: false,
            reason: `Method ${method} not supported on ${sourceNetworkType}. Supported methods: ${sourceConfig.supportedMethods.join(', ')}`
        };
    }

    
    if (sourceConfig.strictFiltering && sourceConfig.allowedDestinations) {
        const isDestinationAllowed = sourceConfig.allowedDestinations.some(allowed =>
            destNetwork.includes(allowed) || allowed === destNetwork
        );

        if (!isDestinationAllowed) {
            return {
                supported: false,
                reason: `Destination ${destNetwork} not allowed on ${sourceNetworkType}. Allowed destinations: ${sourceConfig.allowedDestinations.join(', ')}`
            };
        }
    }

    
    const destNetworkInfo = Object.entries(XCM_DESTINATIONS)
        .find(([key, _]) => key === destNetwork || key.includes(destNetwork));

    if (destNetworkInfo && destNetworkInfo[1].network !== sourceNetworkType) {
        return {
            supported: false,
            reason: `Cross-network transfers not supported. Source: ${sourceNetworkType}, Destination: ${destNetworkInfo[1].network}`
        };
    }

    
    if (sourceNetworkType === 'paseo') {
        if (method === 'reserveTransferAssets') {
            return {
                supported: false,
                reason: 'Reserve transfers may not work reliably on Paseo testnet. Use teleport instead.'
            };
        }
    }

    return { supported: true, reason: null };
};


export const validateXcmConfiguration = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔍 Validating XCM configuration...');

    
    Object.entries(XCM_DESTINATIONS).forEach(([key, dest]) => {    
        if (key.includes('polkadot_') && dest.network !== 'polkadot') {
            errors.push(`${key} has incorrect network: ${dest.network}, expected: polkadot`);
        }
        if (key.includes('kusama_') && dest.network !== 'kusama') {
            errors.push(`${key} has incorrect network: ${dest.network}, expected: kusama`);
        }
        if (key.includes('paseo_') && dest.network !== 'paseo') {
            errors.push(`${key} has incorrect network: ${dest.network}, expected: paseo`);
        }
        if (key.includes('westend_') && dest.network !== 'westend') {
            errors.push(`${key} has incorrect network: ${dest.network}, expected: westend`);
        }
    });

    
    Object.entries(XCM_NETWORK_CONFIG).forEach(([networkType, config]) => {
        if (config.strictFiltering && !config.allowedDestinations) {
            warnings.push(`${networkType} has strict filtering enabled but no allowed destinations defined`);
        }
    });

    if (errors.length > 0) {
        console.error('❌ Configuration errors found:', errors);
    }
    if (warnings.length > 0) {
        console.warn('⚠️ Configuration warnings:', warnings);
    }
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ XCM configuration validation passed');
    }

    return { errors, warnings };
};


export const debugNetworkDetection = (network: any) => {
    console.group(`🔍 Debug Network Detection`);
    console.log('Input:', { name: network?.name, symbol: network?.symbol, relay: network?.relay });

    const detected = detectNetworkType(network?.name, network?.symbol, network?.relay);
    console.log('Detected Type:', detected);

    const destinations = getDestinationsByNetwork(network);
    console.log('Available Destinations:', Object.keys(destinations));

    const xcmDestinations = getAvailableXcmDestinations(network);
    console.log('XCM Destinations:', Object.keys(xcmDestinations));

    const xcmSupport = getXcmSupport(network);
    console.log('XCM Support:', xcmSupport);

    // Validar se há destinos de outras redes
    const crossNetworkDestinations = Object.entries(destinations)
        .filter(([_, dest]) => dest.network !== detected);

    if (crossNetworkDestinations.length > 0) {
        console.error('🚨 Cross-network destinations found:', crossNetworkDestinations);
    }

    console.groupEnd();

    return {
        detected,
        destinations: Object.keys(destinations),
        xcmDestinations: Object.keys(xcmDestinations),
        xcmSupport,
        crossNetworkDestinations: crossNetworkDestinations.length
    };
};


export const XCM_ASSETS = {
    native: { assetId: 'Native', symbol: 'Native Token', description: 'Native chain token', decimals: 10 },
    polkadot: {
        dot: { assetId: 'Native', symbol: 'DOT', description: 'Polkadot native token', decimals: 10 },
        usdt: { assetId: '1984', symbol: 'USDT', description: 'Tether USD', decimals: 6 },
        usdc: { assetId: '1337', symbol: 'USDC', description: 'USD Coin', decimals: 6 },
        aca: { assetId: '2000', symbol: 'ACA', description: 'Acala token', decimals: 12 },
        glmr: { assetId: '2004', symbol: 'GLMR', description: 'Moonbeam token', decimals: 18 },
        astr: { assetId: '2006', symbol: 'ASTR', description: 'Astar token', decimals: 18 },
        hdx: { assetId: '2034', symbol: 'HDX', description: 'HydraDX token', decimals: 12 },
        pha: { assetId: '2035', symbol: 'PHA', description: 'Phala token', decimals: 12 },
    },

    kusama: {
        ksm: { assetId: 'Native', symbol: 'KSM', description: 'Kusama native token', decimals: 12 },
        kar: { assetId: '2000', symbol: 'KAR', description: 'Karura token', decimals: 12 },
        movr: { assetId: '2023', symbol: 'MOVR', description: 'Moonriver token', decimals: 18 },
        sdn: { assetId: '2007', symbol: 'SDN', description: 'Shiden token', decimals: 18 },
        bnc: { assetId: '2001', symbol: 'BNC', description: 'Bifrost token', decimals: 12 },
        bsx: { assetId: '2090', symbol: 'BSX', description: 'Basilisk token', decimals: 12 },
        kint: { assetId: '2092', symbol: 'KINT', description: 'Kintsugi token', decimals: 12 },
    },

    paseo: {
        pas: { assetId: 'Native', symbol: 'PAS', description: 'Paseo testnet token', decimals: 10 },
        ajun: { assetId: '2000', symbol: 'AJUN', description: 'Ajuna testnet token', decimals: 12 },
        ampe: { assetId: '2124', symbol: 'AMPE', description: 'Amplitude testnet token', decimals: 12 },
        avt: { assetId: '2056', symbol: 'AVT', description: 'Aventus testnet token', decimals: 18 },
        frqcy: { assetId: '4000', symbol: 'FRQCY', description: 'Frequency testnet token', decimals: 12 },
        teer: { assetId: '3002', symbol: 'TEER', description: 'Integritee testnet token', decimals: 12 },
        laos: { assetId: '3369', symbol: 'LAOS', description: 'Laos testnet token', decimals: 12 },
        pop: { assetId: '4001', symbol: 'POP', description: 'POP Network testnet token', decimals: 12 },
        ztg: { assetId: '2101', symbol: 'ZTG', description: 'Zeitgeist testnet token', decimals: 10 },
    },

    westend: {
        wnd: { assetId: 'Native', symbol: 'WND', description: 'Westend testnet token', decimals: 12 },
    }
} as const;

export const getCompatiblePallets = (api: ApiPromise, palletName: string) => {
    const variants = [
        palletName,
        palletName.toLowerCase(),
        palletName.replace(/([a-z])([A-Z])/g, '$1$2'),
        palletName.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1)
    ];

    const uniqueVariants = [...new Set(variants)];

    for (const variant of uniqueVariants) {
        if (api.tx[variant]) {
            return variant;
        }
    }

    return null;
};

const getActualPallet = (api: ApiPromise, pallet: string) => {
    const palletVariants: Record<string, string[]> = {
        xcmPallet: ['xcmPallet', 'polkadotXcm', 'xTokens', 'xtokens'],
        xcmpQueue: ['xcmpQueue', 'cumulusXcm'],
        hrmp: ['hrmp']
    };

    const variants = palletVariants[pallet] || [pallet];

    for (const variant of variants) {
        const found = api.tx[variant];
        if (found) {
            return found;
        }
    }

    return getCompatiblePallets(api, pallet) || null;
};

export const getAssetsByNetwork = (network: keyof typeof XCM_ASSETS) => {
    return XCM_ASSETS[network] || {};
};

export const getTransactionPresetsByNetwork = (network: any) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    return TRANSACTION_PRESETS.filter(preset =>
        !preset.supportedNetworks || preset.supportedNetworks.includes(networkType)
    );
};

export const isTestnet = (network: any) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    const config = XCM_NETWORK_CONFIG[networkType as keyof typeof XCM_NETWORK_CONFIG];
    return config?.isTestnet || false;
};


export const getXcmSupport = (network: any) => {
    const networkType = network?.networkType || detectNetworkType(network?.name, network?.symbol, network?.relay);
    const config = XCM_NETWORK_CONFIG[networkType as keyof typeof XCM_NETWORK_CONFIG];

    console.log(`🔧 XCM Support for ${networkType}:`, {
        enabled: config?.xcmEnabled || false,
        fullySupported: config?.fullySupported || false,
        supportedMethods: config?.supportedMethods || [],
        limitations: config?.limitations || [],
        strictFiltering: config?.strictFiltering || false,
        crossNetworkEnabled: config?.crossNetworkEnabled || false
    });

    return {
        enabled: config?.xcmEnabled || false,
        fullySupported: config?.fullySupported || false,
        supportedMethods: config?.supportedMethods || [],
        limitations: config?.limitations || [],
        supportedRoutes: config?.supportedRoutes || [],
        strictFiltering: config?.strictFiltering || false,
        crossNetworkEnabled: config?.crossNetworkEnabled || false,
        allowedDestinations: config?.allowedDestinations || []
    };
};


export const getSafeXcmDestinations = (sourceNetwork: any, includeCurrentChain: boolean = false) => {
    const sourceNetworkType = sourceNetwork?.networkType || detectNetworkType(sourceNetwork?.name, sourceNetwork?.symbol, sourceNetwork?.relay);
    const availableDestinations = getAvailableXcmDestinations(sourceNetwork);

    console.log(`🛡️ Getting safe XCM destinations for ${sourceNetworkType}`);


    const safeDestinations = Object.entries(availableDestinations)
        .filter(([key, dest]) => {

            const isSameNetwork = dest.network === sourceNetworkType;

            
            const isCurrentChain = key === sourceNetworkType;
            const shouldInclude = includeCurrentChain || !isCurrentChain;

            return isSameNetwork && shouldInclude;
        })
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

    console.log(`✅ Safe destinations for ${sourceNetworkType}:`, Object.keys(safeDestinations));
    return safeDestinations;
};


export const validateXcmTransfer = (sourceNetwork: any, destinationKey: string, method: string) => {
    const sourceNetworkType = sourceNetwork?.networkType || detectNetworkType(sourceNetwork?.name, sourceNetwork?.symbol, sourceNetwork?.relay);


    const destinationInfo = XCM_DESTINATIONS[destinationKey as keyof typeof XCM_DESTINATIONS];

    if (!destinationInfo) {
        return {
            valid: false,
            error: `Destination ${destinationKey} not found`,
            code: 'DESTINATION_NOT_FOUND'
        };
    }


    if (destinationInfo.network !== sourceNetworkType) {
        return {
            valid: false,
            error: `Cross-network transfer not allowed. Source: ${sourceNetworkType}, Destination: ${destinationInfo.network}`,
            code: 'CROSS_NETWORK_NOT_ALLOWED'
        };
    }

    
    const methodSupport = isXcmTransactionSupported(sourceNetwork, destinationKey, method);
    if (!methodSupport.supported) {
        return {
            valid: false,
            error: methodSupport.reason,
            code: 'METHOD_NOT_SUPPORTED'
        };
    }

    return {
        valid: true,
        destinationInfo,
        sourceNetworkType
    };
};


export const suggestXcmMethods = (sourceNetwork: any, destinationKey: string) => {
    const validation = validateXcmTransfer(sourceNetwork, destinationKey, '');

    if (!validation.valid) {
        return {
            suggested: [],
            error: validation.error
        };
    }

    const sourceNetworkType = validation.sourceNetworkType;
    const config = XCM_NETWORK_CONFIG[sourceNetworkType as keyof typeof XCM_NETWORK_CONFIG];
    const destinationInfo = validation.destinationInfo!;

    const suggestions = [];

    
    for (const method of config.supportedMethods) {
        const methodValidation = isXcmTransactionSupported(sourceNetwork, destinationKey, method);

        if (methodValidation.supported) {
            let recommendation = '';
            let priority = 0;

            
            if (method === 'teleportAssets') {
                if (destinationInfo.paraId <= 1005) { 
                    recommendation = 'Recommended for system parachains (fastest and cheapest)';
                    priority = 3;
                } else {
                    recommendation = 'Only for trusted parachains with teleport relationships';
                    priority = 1;
                }
            } else if (method === 'reserveTransferAssets') {
                recommendation = 'Standard method for most parachain transfers';
                priority = 2;
            } else if (method === 'limitedTeleportAssets') {
                recommendation = 'Teleport with weight limits (safer)';
                priority = 3;
            } else if (method === 'limitedReserveTransferAssets') {
                recommendation = 'Reserve transfer with weight limits (safer)';
                priority = 2;
            }

            suggestions.push({
                method,
                recommendation,
                priority,
                suitable: priority >= 2
            });
        }
    }

    
    suggestions.sort((a, b) => b.priority - a.priority);

    return {
        suggested: suggestions,
        error: null
    };
};

export const STEP_STATUS_CLASSES = {
    completed: 'bg-green-500 dark:bg-green-600 text-white',
    active: 'bg-blue-500 dark:bg-blue-600 text-white',
    error: 'bg-red-500 dark:bg-red-600 text-white',
    pending: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
} as const;

export const TX_STATUS_CONFIG = {
    finalized: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        label: 'Finalized',
        border: 'border-green-200 dark:border-green-800'
    },
    inBlock: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        label: 'In Block',
        border: 'border-yellow-200 dark:border-yellow-800'
    },
    error: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        label: 'Error',
        border: 'border-red-200 dark:border-red-800'
    },
    broadcasting: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-300',
        label: 'Broadcasting',
        border: 'border-purple-200 dark:border-purple-800'
    },
    ready: {
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-800 dark:text-cyan-300',
        label: 'Ready',
        border: 'border-cyan-200 dark:border-cyan-800'
    },
    default: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        label: 'Processing',
        border: 'border-blue-200 dark:border-blue-800'
    }
} as const;

export const TRANSACTION_PRESETS: TransactionPreset[] = [
    {
        id: 'balance_transfer',
        name: 'Transfer Tokens',
        description: 'Send tokens to another address on the same chain',
        pallet: 'balances',
        call: 'transferKeepAlive',
        args: [
            { name: 'dest', type: 'AccountId', description: 'Destination address', required: true },
            { name: 'value', type: 'Balance', description: 'Amount to transfer', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'balance_transfer_allow_death',
        name: 'Transfer All Tokens',
        description: 'Send tokens allowing account closure',
        pallet: 'balances',
        call: 'transferAllowDeath',
        args: [
            { name: 'dest', type: 'AccountId', description: 'Destination address', required: true },
            { name: 'value', type: 'Balance', description: 'Amount to transfer', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'xcm_reserve_transfer',
        name: 'XCM Reserve Transfer',
        description: 'Transfer assets via XCM using reserve transfer',
        pallet: 'xcmPallet',
        call: 'reserveTransferAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to transfer', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index (usually 0)', required: true, defaultValue: '0' }
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'Reserve transfers may not work reliably on Paseo testnet',
            westend: 'Limited reserve transfer support on Westend'
        }
    },
    {
        id: 'xcm_teleport',
        name: 'XCM Teleport (V4)',
        description: 'Teleport assets via XCM V4 (trusted chains only)',
        pallet: 'xcmPallet',
        call: 'teleportAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to teleport', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index (usually 0)', required: true, defaultValue: '0' }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend'],
        limitations: {
            paseo: 'Limited to system parachains and specific routes',
            westend: 'Limited to system parachains'
        }
    },
    {
        id: 'xcm_limited_reserve_transfer',
        name: 'XCM Limited Reserve Transfer',
        description: 'Reserve transfer with weight/fee limits',
        pallet: 'xcmPallet',
        call: 'limitedReserveTransferAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to transfer', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index', required: true, defaultValue: '0' },
            { name: 'weightLimit', type: 'XcmWeightLimit', description: 'Weight limit', required: true, defaultValue: 'Unlimited' }
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'Limited reserve transfer support on Paseo testnet',
            westend: 'Limited reserve transfer support on Westend'
        }
    },
    {
        id: 'xcm_limited_teleport',
        name: 'XCM Limited Teleport',
        description: 'Teleport assets with weight/fee limits',
        pallet: 'xcmPallet',
        call: 'limitedTeleportAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to teleport', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index', required: true, defaultValue: '0' },
            { name: 'weightLimit', type: 'XcmWeightLimit', description: 'Weight limit', required: true, defaultValue: 'Unlimited' }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend'],
        limitations: {
            paseo: 'Limited to specific system parachain routes',
            westend: 'Limited to system parachains'
        }
    },
    
    {
        id: 'xcmp_queue_send',
        name: 'XCMP Queue Send',
        description: 'Send XCM message via XCMP queue',
        pallet: 'xcmpQueue',
        call: 'sendXcmMessage',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'message', type: 'XcmMessage', description: 'XCM message', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'XCMP functionality may be limited or unavailable',
            westend: 'XCMP functionality may be limited'
        }
    },
    {
        id: 'custom',
        name: 'Custom Transaction',
        description: 'Build a custom transaction',
        pallet: '',
        call: '',
        args: [],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    }
];


export const UI_THEME_CONFIG = {
    card: {
        background: 'bg-white dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        shadow: 'shadow-sm dark:shadow-gray-900/20',
        hover: 'hover:bg-gray-50 dark:hover:bg-gray-700'
    },
    input: {
        background: 'bg-white dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-600',
        text: 'text-gray-900 dark:text-gray-100',
        placeholder: 'placeholder-gray-500 dark:placeholder-gray-400',
        focus: 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
    },
    button: {
        primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
        danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
    }
} as const;