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
	},
	paseo: {
		id: "paseo",
		name: "Paseo",
		endpoint: "wss://paseo-rpc.polkadot.io",
		faucet: "https://faucet.polkadot.io/?tab=paseo",
		explorer: "https://paseo.subscan.io/",
		isTest: true,
		tokenSymbol: "PSO",
		tokenDecimals: 10,
		descriptorKey: "paseo",
		chainSpecPath: "paseo",
	},
	rococo: {
		id: "rococo",
		name: "Rococo",
		endpoint: "wss://rococo-rpc.polkadot.io",
		faucet: "https://faucet.polkadot.io/?tab=rococo",
		explorer: "https://rococo.subscan.io/",
		isTest: true,
		tokenSymbol: "ROC",
		tokenDecimals: 12,
		descriptorKey: "roc",
		chainSpecPath: "rococo_v2_2",
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
	},
};

/**
 * List of test networks for easier filtering
 */
export const TEST_NETWORKS = Object.values(NETWORKS).filter(
	(network) => network.isTest,
);

/**
 * Default network to use in the playground
 */
export const DEFAULT_NETWORK = NETWORKS.westend;
