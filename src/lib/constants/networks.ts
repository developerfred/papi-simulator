/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Network } from "../types/network";


/**
 * Centralized configuration for all supported networks
 */
export const NETWORKS: Record<string, Network> = {
	westend: {
		id: "westend",
		name: "Westend",
		endpoint: "wss://westend-rpc.polkadot.io",
		faucet: "https://faucet.polkadot.io/?tab=westend",
		explorer: "https://westend.subscan.io/",
		isTest: true,
		tokenSymbol: "WND",
		tokenDecimals: 12,
		descriptorKey: "wnd",
		chainSpecPath: "westend2",
		networkType: "westend",
		xcmConfig: {
			version: 'V4',
			supportedMethods: ['teleportAssets', 'reserveTransferAssets'],
			defaultWeightLimit: 'Unlimited',
			maxMessageSize: 102400,
			fullySupported: false,
			xcmEnabled: true,
			limitations: [
				'Testing network - features may be unstable',
				'Limited parachain ecosystem',
				'Mainly for protocol testing'
			]
		}
	},
	paseo: {
		id: "paseo",
		name: "Paseo",
		endpoint: "wss://pas-rpc.stakeworld.io",
		faucet: "https://faucet.polkadot.io/?tab=paseo",
		explorer: "https://paseo.subscan.io/",
		isTest: true,
		tokenSymbol: "PAS",
		tokenDecimals: 10,
		descriptorKey: "paseo",
		chainSpecPath: "paseo",
		networkType: "paseo",
		xcmConfig: {
			version: 'V4',
			supportedMethods: ['teleportAssets', 'limitedTeleportAssets'],
			defaultWeightLimit: 'Limited',
			maxMessageSize: 51200,
			fullySupported: false,
			xcmEnabled: true,
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
		systemParachains: [
			{ paraId: 1000, name: 'Paseo Asset Hub', symbol: 'PAS' },
			{ paraId: 1002, name: 'Paseo Bridge Hub', symbol: 'PAS' },
			{ paraId: 1004, name: 'Paseo People Chain', symbol: 'PAS' },
			{ paraId: 1005, name: 'Paseo Coretime Chain', symbol: 'PAS' }
		],
		supportedParachains: [
			{ paraId: 2000, name: 'Ajuna (Paseo)', symbol: 'AJUN' },
			{ paraId: 2124, name: 'Amplitude (Paseo)', symbol: 'AMPE' },
			{ paraId: 2056, name: 'Aventus (Paseo)', symbol: 'AVT' },
			{ paraId: 2119, name: 'Bajun (Paseo)', symbol: 'BAJU' },
			{ paraId: 2030, name: 'Bifrost (Paseo)', symbol: 'BNC' },
			{ paraId: 2105, name: 'Darwinia Koi', symbol: 'KTON' },
			{ paraId: 4000, name: 'Frequency', symbol: 'FRQCY' },
			{ paraId: 4374, name: 'Hyperbridge', symbol: 'HYP' },
			{ paraId: 3002, name: 'Integritee', symbol: 'TEER' },
			{ paraId: 2000, name: 'KILT (Paseo)', symbol: 'KILT' },
			{ paraId: 3369, name: 'Laos Sigma', symbol: 'LAOS' },
			{ paraId: 3369, name: 'Muse', symbol: 'MUSE' },
			{ paraId: 4002, name: 'Myriad Social', symbol: 'MYRIA' },
			{ paraId: 3888, name: 'Niskala', symbol: 'NISK' },
			{ paraId: 3888, name: 'Nodle Paradis', symbol: 'NODL' },
			{ paraId: 4001, name: 'POP Network', symbol: 'POP' },
			{ paraId: 4019, name: 'RegionX Cocos', symbol: 'COCOS' },
			{ paraId: 2021, name: 'Xcavate', symbol: 'XCAV' },
			{ paraId: 2101, name: 'Zeitgeist Battery Station', symbol: 'ZTG' }
		]
	},
	polkadot: {
		id: "polkadot",
		name: "Polkadot",
		endpoint: "wss://rpc.polkadot.io",
		faucet: "https://faucet.polkadot.io/",
		explorer: "https://polkadot.subscan.io/",
		isTest: false,
		tokenSymbol: "DOT",
		tokenDecimals: 10,
		descriptorKey: "dot",
		chainSpecPath: "polkadot",
		networkType: "polkadot",
		xcmConfig: {
			version: 'V4',
			supportedMethods: ['reserveTransferAssets', 'limitedReserveTransferAssets', 'teleportAssets'],
			defaultWeightLimit: 'Unlimited',
			maxMessageSize: 102400,
			fullySupported: true,
			xcmEnabled: true
		},
		systemParachains: [
			{ paraId: 1000, name: 'Polkadot Asset Hub', symbol: 'DOT' },
			{ paraId: 1001, name: 'Polkadot Collectives', symbol: 'DOT' },
			{ paraId: 1002, name: 'Polkadot Bridge Hub', symbol: 'DOT' },
			{ paraId: 1004, name: 'Polkadot People Chain', symbol: 'DOT' },
			{ paraId: 1005, name: 'Polkadot Coretime Chain', symbol: 'DOT' }
		],
		supportedParachains: [
			{ paraId: 2000, name: 'Acala', symbol: 'ACA' },
			{ paraId: 2004, name: 'Moonbeam', symbol: 'GLMR' },
			{ paraId: 2006, name: 'Astar', symbol: 'ASTR' },
			{ paraId: 2012, name: 'Parallel', symbol: 'PARA' },
			{ paraId: 2026, name: 'Nodle', symbol: 'NODL' },
			{ paraId: 2030, name: 'Bifrost', symbol: 'BNC' },
			{ paraId: 2031, name: 'Centrifuge', symbol: 'CFG' },
			{ paraId: 2032, name: 'Interlay', symbol: 'INTR' },
			{ paraId: 2034, name: 'HydraDX', symbol: 'HDX' },
			{ paraId: 2035, name: 'Phala Network', symbol: 'PHA' },
			{ paraId: 2037, name: 'Unique Network', symbol: 'UNQ' }
		]
	},
	kusama: {
		id: "kusama",
		name: "Kusama",
		endpoint: "wss://kusama-rpc.polkadot.io",
		faucet: "https://faucet.polkadot.io/?tab=kusama",
		explorer: "https://kusama.subscan.io/",
		isTest: false,
		tokenSymbol: "KSM",
		tokenDecimals: 12,
		descriptorKey: "ksm",
		chainSpecPath: "kusama",
		networkType: "kusama",
		xcmConfig: {
			version: 'V4',
			supportedMethods: ['reserveTransferAssets', 'limitedReserveTransferAssets', 'teleportAssets'],
			defaultWeightLimit: 'Unlimited',
			maxMessageSize: 102400,
			fullySupported: true,
			xcmEnabled: true
		},
		systemParachains: [
			{ paraId: 1000, name: 'Kusama Asset Hub', symbol: 'KSM' },
			{ paraId: 1002, name: 'Kusama Bridge Hub', symbol: 'KSM' },
			{ paraId: 1004, name: 'Kusama People Chain', symbol: 'KSM' },
			{ paraId: 1005, name: 'Kusama Coretime Chain', symbol: 'KSM' },
			{ paraId: 1001, name: 'Encointer', symbol: 'KSM' }
		],
		supportedParachains: [
			{ paraId: 2000, name: 'Karura', symbol: 'KAR' },
			{ paraId: 2001, name: 'Bifrost', symbol: 'BNC' },
			{ paraId: 2004, name: 'Khala Network', symbol: 'PHA' },
			{ paraId: 2007, name: 'Shiden', symbol: 'SDN' },
			{ paraId: 2023, name: 'Moonriver', symbol: 'MOVR' },
			{ paraId: 2087, name: 'Picasso', symbol: 'PICA' },
			{ paraId: 2088, name: 'Altair', symbol: 'AIR' },
			{ paraId: 2090, name: 'Basilisk', symbol: 'BSX' },
			{ paraId: 2092, name: 'Kintsugi', symbol: 'KINT' },
			{ paraId: 2095, name: 'Quartz', symbol: 'QTZ' }
		]
	}
};

/**
 * Network patterns for enhanced detection
 */
export const NETWORK_PATTERNS = {
	polkadot: ['polkadot', 'dot', 'polkadot relay', 'polkadot-relay'],
	kusama: ['kusama', 'ksm', 'kusama relay', 'kusama-relay'],
	paseo: ['paseo', 'pas', 'paseo testnet', 'paseo-testnet', 'paseo network', 'paseo-network'],
	westend: ['westend', 'wnd', 'westend testnet', 'westend-testnet']
};

/**
 * Enhanced network detection function
 */
export const detectNetworkType = (networkName?: string, networkSymbol?: string, relay?: string): string => {
	if (!networkName && !networkSymbol && !relay) return 'unknown';

	const searchTerms = [
		networkName?.toLowerCase(),
		networkSymbol?.toLowerCase(),
		relay?.toLowerCase()
	].filter(Boolean);

	
	for (const [networkType, patterns] of Object.entries(NETWORK_PATTERNS)) {
		for (const term of searchTerms) {
			if (patterns.some(pattern => term.includes(pattern))) {
				console.log(`🎯 Detected network: ${networkType} from "${term}"`);
				return networkType;
			}
		}
	}

	// Fallback checks
	if (networkSymbol === 'PAS' || networkName?.includes('Paseo')) return 'paseo';
	if (networkSymbol === 'DOT' || networkName?.includes('Polkadot')) return 'polkadot';
	if (networkSymbol === 'KSM' || networkName?.includes('Kusama')) return 'kusama';
	if (networkSymbol === 'WND' || networkName?.includes('Westend')) return 'westend';

	console.warn(`⚠️ Unknown network type for: name="${networkName}", symbol="${networkSymbol}", relay="${relay}"`);
	return 'unknown';
};

/**
 * Get network by ID with fallback
 */
export const getNetworkById = (id: string): Network | undefined => {
	return NETWORKS[id];
};

/**
 * Get network by type (for compatibility with existing code)
 */
export const getNetworkByType = (type: string): Network | undefined => {
	return Object.values(NETWORKS).find(network => network.networkType === type);
};

/**
 * Check if network supports XCM
 */
export const isXcmEnabled = (networkId: string): boolean => {
	const network = NETWORKS[networkId];
	return network?.xcmConfig?.xcmEnabled || false;
};

/**
 * Get XCM limitations for a network
 */
export const getXcmLimitations = (networkId: string): string[] => {
	const network = NETWORKS[networkId];
	return network?.xcmConfig?.limitations || [];
};

/**
 * Get system parachains for a network
 */
export const getSystemParachains = (networkId: string) => {
	const network = NETWORKS[networkId];
	return network?.systemParachains || [];
};

/**
 * Get supported parachains for a network
 */
export const getSupportedParachains = (networkId: string) => {
	const network = NETWORKS[networkId];
	return network?.supportedParachains || [];
};

/**
 * Check if a parachain is supported on a network
 */
export const isParachainSupported = (networkId: string, paraId: number): boolean => {
	const network = NETWORKS[networkId];
	if (!network) return false;

	const allParachains = [
		...(network.systemParachains || []),
		...(network.supportedParachains || [])
	];

	return allParachains.some(para => para.paraId === paraId);
};

/**
 * List of test networks for easier filtering
 */
export const TEST_NETWORKS = Object.values(NETWORKS).filter(
	(network) => network.isTest,
);

/**
 * List of production networks
 */
export const PRODUCTION_NETWORKS = Object.values(NETWORKS).filter(
	(network) => !network.isTest,
);

/**
 * Default network to use in the playground (Paseo for testing)
 */
export const DEFAULT_NETWORK = NETWORKS.paseo;

/**
 * Network health check endpoints (optional)
 */
export const NETWORK_HEALTH_ENDPOINTS = {
	polkadot: "https://polkadot.api.subscan.io/api/scan/metadata",
	kusama: "https://kusama.api.subscan.io/api/scan/metadata",
	paseo: "https://paseo.api.subscan.io/api/scan/metadata",
	westend: "https://westend.api.subscan.io/api/scan/metadata"
};

/**
 * RPC endpoint alternatives for redundancy
 */
export const RPC_ENDPOINTS = {
	polkadot: [
		"wss://rpc.polkadot.io",
		"wss://polkadot-rpc.dwellir.com",
		"wss://polkadot.public.curie.radiumblock.co/ws"
	],
	kusama: [
		"wss://kusama-rpc.polkadot.io",
		"wss://kusama-rpc.dwellir.com",
		"wss://kusama.public.curie.radiumblock.co/ws"
	],
	paseo: [
		"wss://pas-rpc.stakeworld.io",
		"wss://paseo.rpc.amforc.com",
		"wss://rpc.ibp.network/paseo"
	],
	westend: [
		"wss://westend-rpc.polkadot.io",
		"wss://westend-rpc.dwellir.com"
	]
};