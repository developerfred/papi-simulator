import { NETWORKS } from "@/lib/constants/networks";
import type { Network } from "@/lib/types/network";
import { createClient, type Client } from "polkadot-api";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Subscription } from "rxjs";

export type ConnectionStatus =
	| "disconnected"
	| "connecting"
	| "connected"
	| "error";

export interface Block {
	number: number;
	hash: string;
}

export interface NetworkClient {
	client: Client;
	typedApi: unknown;
	subscriptions: Subscription[];
}

interface PolkadotState {
	currentNetwork: Network;
	connectionStatus: ConnectionStatus;
	connectionError: Error | null;
	clients: Record<string, NetworkClient>;
	latestBlock: Block | null;
	bestBlocks: Block[];

	setCurrentNetwork: (networkId: string) => void;
	connectToNetwork: (networkId: string) => Promise<void>;
	disconnectFromNetwork: (networkId: string) => void;
	disconnectAll: () => void;
	resetState: () => void;
}

// Funções auxiliares para separar a lógica

/**
 * Cria um cliente de rede e configura subscriptions
 */
const createNetworkClient = async (
	network: Network,
): Promise<NetworkClient> => {
	if (!network.endpoint) {
		throw new Error(`Invalid endpoint for network ${network.name}`);
	}

	const provider = withPolkadotSdkCompat(getWsProvider(network.endpoint));

	const client = createClient(provider);

	if (!network.descriptorKey) {
		throw new Error(`Invalid descriptorKey for network ${network.name}`);
	}

	console.log(
		"[PolkadotStore] Importing descriptors for:",
		network.descriptorKey,
	);

	let descriptorModule;
	try {
		descriptorModule = await import("@polkadot-api/descriptors");
	} catch (importError) {
		console.error("[PolkadotStore] Failed to import descriptors:", importError);
		throw new Error(`Failed to load descriptors for ${network.name}`);
	}

	const descriptor = descriptorModule[network.descriptorKey];
	if (!descriptor) {
		throw new Error(`Descriptor for network ${network.name} not found`);
	}

	const typedApi = client.getTypedApi(descriptor);
	const subscriptions: Subscription[] = [];

	return {
		client,
		typedApi,
		subscriptions,
	};
};

/**
 * Configura subscriptions para o cliente
 */
const setupSubscriptions = (
	client: Client,
	onLatestBlock: (block: Block) => void,
	onBestBlocks: (blocks: Block[]) => void,
): Subscription[] => {
	console.log("[PolkadotStore] Setting up block subscriptions");

	const subscriptions: Subscription[] = [];

	const blockSub = client.finalizedBlock$.subscribe({
		next: (block) => {
			onLatestBlock(block);
		},
		error: (err) => {
			console.error(
				"[PolkadotStore] Error in finalizedBlock$ subscription:",
				err,
			);
		},
	});

	const bestBlocksSub = client.bestBlocks$.subscribe({
		next: (blocks) => {
			onBestBlocks(blocks);
		},
		error: (err) => {
			console.error("[PolkadotStore] Error in bestBlocks$ subscription:", err);
		},
	});

	subscriptions.push(blockSub, bestBlocksSub);
	return subscriptions;
};

/**
 * Cleanup de subscriptions
 */
const cleanupSubscriptions = (subscriptions: Subscription[]): void => {
	console.log("[PolkadotStore] Cleaning up subscriptions");
	subscriptions.forEach((subscription) => subscription.unsubscribe());
};

// Store principal
const usePolkadotStore = create<PolkadotState>()(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				currentNetwork: NETWORKS.westend,
				connectionStatus: "disconnected",
				connectionError: null,
				clients: {},
				latestBlock: null,
				bestBlocks: [],

				setCurrentNetwork: (networkId) => {
					console.log("[PolkadotStore] Setting current network:", networkId);
					const network = NETWORKS[networkId] || NETWORKS.westend;
					set({ currentNetwork: network });
					get().connectToNetwork(networkId);
				},

				connectToNetwork: async (networkId) => {
					console.log("[PolkadotStore] Connecting to network:", networkId);
					const network = NETWORKS[networkId] || NETWORKS.westend;

					if (get().clients[networkId]) {
						console.log("[PolkadotStore] Already connected to:", networkId);
						set({ currentNetwork: network });
						return;
					}

					set({ connectionStatus: "connecting", connectionError: null });

					try {
						const networkClient = await createNetworkClient(network);

						// Setup subscriptions
						const subscriptions = setupSubscriptions(
							networkClient.client,
							(block) => set({ latestBlock: block }),
							(blocks) => set({ bestBlocks: blocks }),
						);

						networkClient.subscriptions = subscriptions;

						set((state) => ({
							clients: {
								...state.clients,
								[networkId]: networkClient,
							},
							connectionStatus: "connected",
							currentNetwork: network,
						}));
					} catch (error) {
						console.error(
							"[PolkadotStore] Failed to connect to network:",
							network.name,
							error,
						);
						set({
							connectionStatus: "error",
							connectionError:
								error instanceof Error ? error : new Error(String(error)),
						});
						throw error; // Re-throw to ensure the error is propagated
					}
				},

				disconnectFromNetwork: (networkId) => {
					console.log("[PolkadotStore] Disconnecting from network:", networkId);
					const networkClient = get().clients[networkId];

					if (networkClient) {
						// Cleanup subscriptions
						cleanupSubscriptions(networkClient.subscriptions);

						// Destroy client
						networkClient.client.destroy();

						set((state) => {
							const clients = { ...state.clients };
							delete clients[networkId];

							return {
								clients,
								connectionStatus:
									Object.keys(clients).length > 0
										? "connected"
										: "disconnected",
							};
						});
					}
				},

				disconnectAll: () => {
					console.log("[PolkadotStore] Disconnecting all networks");

					Object.values(get().clients).forEach((networkClient) => {
						cleanupSubscriptions(networkClient.subscriptions);
						networkClient.client.destroy();
					});

					set({
						clients: {},
						connectionStatus: "disconnected",
						latestBlock: null,
						bestBlocks: [],
					});
				},

				resetState: () => {
					console.log("[PolkadotStore] Resetting state");
					get().disconnectAll();
					set({
						currentNetwork: NETWORKS.westend,
						connectionStatus: "disconnected",
						connectionError: null,
						clients: {},
						latestBlock: null,
						bestBlocks: [],
					});
				},
			}),
			{
				name: "polkadot-playground-storage",
				partialize: (state) => ({
					currentNetwork: state.currentNetwork,
				}),
				storage: createJSONStorage(() => localStorage),
			},
		),
	),
);

export default usePolkadotStore;
