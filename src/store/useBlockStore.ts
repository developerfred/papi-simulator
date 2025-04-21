import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useEffect, useState } from "react";

/**
 * Block information interface
 */
export interface BlockInfo {
	hash: string;
	number: number;
	parentHash: string;
	timestamp: number; // Time when block was received
	extrinsics?: string[]; // Optional extrinsics list
}

/**
 * Block subscription status
 */
export type BlockSubscription = {
	active: boolean;
	type: "finalized" | "best";
	lastBlock: BlockInfo | null;
	error: Error | null;
};

/**
 * Define an interface for the client subscription methods
 */
interface BlockClient {
	finalizedBlock$: {
		subscribe: (observer: {
			next: (block: { hash: string; number: number; parent: string }) => void;
			error: (error: unknown) => void;
		}) => { unsubscribe: () => void };
	};
	bestBlocks$: {
		subscribe: (observer: {
			next: (
				blocks: Array<{ hash: string; number: number; parent: string }>,
			) => void;
			error: (error: unknown) => void;
		}) => { unsubscribe: () => void };
	};
}

/**
 * Block store state
 */
interface BlockState {
	// Block tracking
	finalizedBlocks: BlockInfo[];
	bestBlocks: BlockInfo[];
	maxBlocks: number;

	// Subscriptions
	finalizedSubscription: BlockSubscription;
	bestSubscription: BlockSubscription;

	// Subscription references (for cleanup)
	subscriptions: {
		finalized?: { unsubscribe: () => void };
		best?: { unsubscribe: () => void };
	};

	// Actions
	startSubscriptions: (client: BlockClient) => void;
	stopSubscriptions: () => void;
	getBlock: (hashOrNumber: string | number) => BlockInfo | null;
	getFinalizedBlocks: (limit?: number) => BlockInfo[];
	getBestBlocks: (limit?: number) => BlockInfo[];
	setMaxBlocks: (count: number) => void;
	clearBlocks: () => void;
}

/**
 * Store to manage blockchain block subscriptions
 */
export const useBlockStore = create<BlockState>()(
	devtools(
		(set, get) => ({
			// Initial state
			finalizedBlocks: [],
			bestBlocks: [],
			maxBlocks: 50,
			subscriptions: {},

			finalizedSubscription: {
				active: false,
				type: "finalized",
				lastBlock: null,
				error: null,
			},

			bestSubscription: {
				active: false,
				type: "best",
				lastBlock: null,
				error: null,
			},

			// Start block subscriptions
			startSubscriptions: (client) => {
				if (!client) return;

				// Clean up any existing subscriptions first
				get().stopSubscriptions();

				// Finalized block subscription
				const finalizedSub = client.finalizedBlock$.subscribe({
					next: (block) => {
						const blockInfo: BlockInfo = {
							hash: block.hash,
							number: block.number,
							parentHash: block.parent,
							timestamp: Date.now(),
						};

						set((state) => {
							// Add to the front of the array and limit size
							const updatedBlocks = [blockInfo, ...state.finalizedBlocks].slice(
								0,
								state.maxBlocks,
							);

							return {
								finalizedBlocks: updatedBlocks,
								finalizedSubscription: {
									...state.finalizedSubscription,
									active: true,
									lastBlock: blockInfo,
									error: null,
								},
							};
						});
					},
					error: (error) => {
						console.error("Error in finalized block subscription:", error);
						set((state) => ({
							finalizedSubscription: {
								...state.finalizedSubscription,
								error:
									error instanceof Error ? error : new Error(String(error)),
							},
						}));
					},
				});

				// Best blocks subscription
				const bestSub = client.bestBlocks$.subscribe({
					next: (blocks) => {
						const bestBlock = blocks[0]; // First block is the best block

						if (!bestBlock) return;

						const blockInfo: BlockInfo = {
							hash: bestBlock.hash,
							number: bestBlock.number,
							parentHash: bestBlock.parent,
							timestamp: Date.now(),
						};

						set((state) => {
							// Only add if not already in list (by hash)
							if (state.bestBlocks.some((b) => b.hash === blockInfo.hash)) {
								return state;
							}

							// Add to the front of the array and limit size
							const updatedBlocks = [blockInfo, ...state.bestBlocks].slice(
								0,
								state.maxBlocks,
							);

							return {
								bestBlocks: updatedBlocks,
								bestSubscription: {
									...state.bestSubscription,
									active: true,
									lastBlock: blockInfo,
									error: null,
								},
							};
						});
					},
					error: (error) => {
						console.error("Error in best block subscription:", error);
						set((state) => ({
							bestSubscription: {
								...state.bestSubscription,
								error:
									error instanceof Error ? error : new Error(String(error)),
							},
						}));
					},
				});

				// Store subscriptions in state for cleanup
				set((state) => ({
					subscriptions: {
						finalized: finalizedSub,
						best: bestSub,
					},
					finalizedSubscription: {
						...state.finalizedSubscription,
						active: true,
					},
					bestSubscription: {
						...state.bestSubscription,
						active: true,
					},
				}));
			},

			// Stop block subscriptions
			stopSubscriptions: () => {
				const { subscriptions } = get();

				// Unsubscribe from all active subscriptions
				if (subscriptions.finalized) {
					subscriptions.finalized.unsubscribe();
				}

				if (subscriptions.best) {
					subscriptions.best.unsubscribe();
				}

				set({
					subscriptions: {},
					finalizedSubscription: {
						active: false,
						type: "finalized",
						lastBlock: null,
						error: null,
					},
					bestSubscription: {
						active: false,
						type: "best",
						lastBlock: null,
						error: null,
					},
				});
			},

			// Get a block by hash or number
			getBlock: (hashOrNumber: string | number) => {
				const { finalizedBlocks, bestBlocks } = get();
				const allBlocks = [...finalizedBlocks, ...bestBlocks];

				if (typeof hashOrNumber === "string") {
					// Search by hash
					return allBlocks.find((block) => block.hash === hashOrNumber) || null;
				} else {
					// Search by number
					return (
						allBlocks.find((block) => block.number === hashOrNumber) || null
					);
				}
			},

			// Get finalized blocks with limit
			getFinalizedBlocks: (limit?: number) => {
				const { finalizedBlocks, maxBlocks } = get();
				const actualLimit = limit || maxBlocks;
				return finalizedBlocks.slice(0, actualLimit);
			},

			// Get best blocks with limit
			getBestBlocks: (limit?: number) => {
				const { bestBlocks, maxBlocks } = get();
				const actualLimit = limit || maxBlocks;
				return bestBlocks.slice(0, actualLimit);
			},

			// Set max blocks to keep
			setMaxBlocks: (count: number) => {
				set((state) => {
					// Update max and trim existing arrays
					return {
						maxBlocks: count,
						finalizedBlocks: state.finalizedBlocks.slice(0, count),
						bestBlocks: state.bestBlocks.slice(0, count),
					};
				});
			},

			// Clear all blocks
			clearBlocks: () => {
				set({
					finalizedBlocks: [],
					bestBlocks: [],
				});
			},
		}),
		{ name: "block-store" },
	),
);

/**
 * Hook to subscribe to finalized blocks
 */
export function useFinalizedBlocks(limit?: number) {
	const { getFinalizedBlocks, finalizedSubscription } = useBlockStore();
	const [blocks, setBlocks] = useState<BlockInfo[]>([]);

	// Subscribe to updates
	useEffect(() => {
		// Initial blocks
		setBlocks(getFinalizedBlocks(limit));

		// Subscribe to updates
		const unsubscribe = useBlockStore.subscribe(
			(state) => state.finalizedBlocks,
			() => {
				setBlocks(getFinalizedBlocks(limit));
			},
		);

		return unsubscribe;
	}, [getFinalizedBlocks, limit]);

	return {
		blocks,
		lastBlock: finalizedSubscription.lastBlock,
		isActive: finalizedSubscription.active,
		error: finalizedSubscription.error,
	};
}

/**
 * Hook to subscribe to best blocks
 */
export function useBestBlocks(limit?: number) {
	const { getBestBlocks, bestSubscription } = useBlockStore();
	const [blocks, setBlocks] = useState<BlockInfo[]>([]);

	// Subscribe to updates
	useEffect(() => {
		// Initial blocks
		setBlocks(getBestBlocks(limit));

		// Subscribe to updates
		const unsubscribe = useBlockStore.subscribe(
			(state) => state.bestBlocks,
			() => {
				setBlocks(getBestBlocks(limit));
			},
		);

		return unsubscribe;
	}, [getBestBlocks, limit]);

	return {
		blocks,
		lastBlock: bestSubscription.lastBlock,
		isActive: bestSubscription.active,
		error: bestSubscription.error,
	};
}
