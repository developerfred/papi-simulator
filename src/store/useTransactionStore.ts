import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useChainStore } from "./useChainStore";
import { useState, useEffect, useMemo, useCallback } from "react";

export type TransactionStatus =
	| "idle"
	| "preparing"
	| "signed"
	| "broadcasting"
	| "inBlock"
	| "finalized"
	| "error";

export type TxEvent =
	| { type: "signed"; txHash: string }
	| { type: "broadcasted"; txHash: string }
	| { type: "txBestBlocksState"; txHash: string; found: boolean }
	| {
			type: "finalized";
			txHash: string;
			ok: boolean;
			events: unknown[];
			block: BlockInfo;
	  };

interface BlockInfo {
	hash: string;
	number: number;
	index: number;
}

export interface TransactionResult {
	txHash: string | null;
	status: TransactionStatus;
	error: Error | null;
	events: unknown[];
	blockInfo: {
		blockHash: string | null;
		blockNumber: number | null;
		txIndex: number | null;
	};
	isSuccessful: boolean | null;
	dispatchError: unknown | null;
	timestamp: number | null;
}

interface TrackedTransaction extends TransactionResult {
	id: string;
	metadata?: TransactionMetadata;
}

interface TransactionMetadata {
	title?: string;
	description?: string;
	[key: string]: unknown;
}

export interface TransactionOptions {
	txOptions?: {
		tip?: bigint;
		mortality?: { mortal: boolean; period?: number };
		nonce?: number;
	};
	metadata?: TransactionMetadata;
}

interface TransactionState {
	transactions: Record<string, TrackedTransaction>;
	currentTransactionId: string | null;

	executeTransaction: <T extends unknown[]>(
		id: string,
		txCreator: (...args: T) => unknown,
		args: T,
		signer: unknown,
		options?: TransactionOptions,
	) => Promise<string>;

	getTransaction: (id: string) => TransactionResult | null;
	getAllTransactions: () => TrackedTransaction[];
	clearTransaction: (id: string) => void;
	clearAllTransactions: () => void;
	setCurrentTransaction: (id: string | null) => void;
}

const DEFAULT_TRANSACTION_RESULT: TransactionResult = {
	txHash: null,
	status: "idle",
	error: null,
	events: [],
	blockInfo: {
		blockHash: null,
		blockNumber: null,
		txIndex: null,
	},
	isSuccessful: null,
	dispatchError: null,
	timestamp: null,
};

export const useTransactionStore = create<TransactionState>()(
	persist(
		devtools(
			(set, get) => ({
				transactions: {},
				currentTransactionId: null,

				executeTransaction: async <T extends unknown[]>(
					id: string,
					txCreator: (...args: T) => unknown,
					args: T,
					signer: unknown,
					options?: TransactionOptions,
				): Promise<string> => {
					const { typedApi } = useChainStore.getState();

					if (!typedApi) {
						throw new Error("Chain not connected");
					}

					set((state) => ({
						transactions: {
							...state.transactions,
							[id]: {
								id,
								...DEFAULT_TRANSACTION_RESULT,
								status: "preparing",
								timestamp: Date.now(),
								metadata: options?.metadata,
							},
						},
						currentTransactionId: id,
					}));

					try {
						const tx = txCreator(...args);

						if (!tx) {
							throw new Error("Transaction creation failed");
						}

						return new Promise((resolve, reject) => {
							const timeoutId = setTimeout(() => {
								reject(new Error("Transaction timed out"));

								set((state) => {
									const currentTx = state.transactions[id];
									if (currentTx && currentTx.status !== "finalized") {
										return {
											transactions: {
												...state.transactions,
												[id]: {
													...currentTx,
													status: "error",
													error: new Error("Transaction timed out"),
													timestamp: Date.now(),
												},
											},
										};
									}
									return state;
								});
							}, 60000);

							const subscription = tx
								.signSubmitAndWatch(signer, options?.txOptions)
								.subscribe({
									next: (event: TxEvent) => {
										set((state) => {
											const currentTx = state.transactions[id] || {
												id,
												...DEFAULT_TRANSACTION_RESULT,
												metadata: options?.metadata,
											};

											let updates: Partial<TransactionResult> = {};

											switch (event.type) {
												case "signed":
													updates = {
														status: "signed",
														txHash: event.txHash,
													};
													break;

												case "broadcasted":
													updates = {
														status: "broadcasting",
														txHash: event.txHash,
													};
													break;

												case "txBestBlocksState":
													if (event.found) {
														updates = {
															status: "inBlock",
														};
													}
													break;

												case "finalized":
													clearTimeout(timeoutId);

													updates = {
														status: "finalized",
														txHash: event.txHash,
														events: event.events,
														isSuccessful: event.ok,
														blockInfo: {
															blockHash: event.block.hash,
															blockNumber: event.block.number,
															txIndex: event.block.index,
														},
														timestamp: Date.now(),
													};

													subscription.unsubscribe();

													resolve(id);
													break;
											}

											return {
												transactions: {
													...state.transactions,
													[id]: {
														...currentTx,
														...updates,
													},
												},
											};
										});
									},
									error: (error: Error) => {
										clearTimeout(timeoutId);

										set((state) => {
											const currentTx = state.transactions[id] || {
												id,
												...DEFAULT_TRANSACTION_RESULT,
												metadata: options?.metadata,
											};

											return {
												transactions: {
													...state.transactions,
													[id]: {
														...currentTx,
														status: "error",
														error,
														timestamp: Date.now(),
													},
												},
											};
										});

										reject(error);
									},
								});
						});
					} catch (error) {
						set((state) => {
							const currentTx = state.transactions[id] || {
								id,
								...DEFAULT_TRANSACTION_RESULT,
								metadata: options?.metadata,
							};

							return {
								transactions: {
									...state.transactions,
									[id]: {
										...currentTx,
										status: "error",
										error:
											error instanceof Error ? error : new Error(String(error)),
										timestamp: Date.now(),
									},
								},
							};
						});

						throw error;
					}
				},

				getTransaction: (id: string): TransactionResult | null => {
					const tx = get().transactions[id];
					if (!tx) return null;

					// Return without the ID and metadata fields
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id: txId, metadata, ...result } = tx;
					return result;
				},

				getAllTransactions: () => {
					const transactions = Object.values(get().transactions);

					if (transactions.length <= 1) {
						return transactions;
					}

					return [...transactions].sort(
						(a, b) => (b.timestamp || 0) - (a.timestamp || 0),
					);
				},

				clearTransaction: (id: string) => {
					set((state) => {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { [id]: _, ...remainingTransactions } = state.transactions;

						const currentTransaction =
							state.currentTransactionId === id
								? null
								: state.currentTransactionId;

						return {
							transactions: remainingTransactions,
							currentTransactionId: currentTransaction,
						};
					});
				},

				clearAllTransactions: () => {
					set({
						transactions: {},
						currentTransactionId: null,
					});
				},

				setCurrentTransaction: (id: string | null) => {
					set({ currentTransactionId: id });
				},
			}),
			{ name: "transaction-store" },
		),
		{
			name: "chain-transactions",
			partialize: (state) => {
				const filteredTransactions: Record<string, TrackedTransaction> = {};

				Object.entries(state.transactions).forEach(([key, tx]) => {
					if (tx.status === "finalized") {
						filteredTransactions[key] = tx;
					}
				});

				return {
					transactions: filteredTransactions,
					currentTransactionId: state.currentTransactionId,
				};
			},
		},
	),
);

export function useTransaction(id: string) {
	const getTransaction = useTransactionStore((state) => state.getTransaction);
	const executeTransaction = useTransactionStore(
		(state) => state.executeTransaction,
	);
	const clearTransaction = useTransactionStore(
		(state) => state.clearTransaction,
	);
	const setCurrentTransaction = useTransactionStore(
		(state) => state.setCurrentTransaction,
	);

	const [transactionState, setTransactionState] = useState<TransactionResult>(
		() => getTransaction(id) || DEFAULT_TRANSACTION_RESULT,
	);

	useEffect(() => {
		setTransactionState(getTransaction(id) || DEFAULT_TRANSACTION_RESULT);

		const unsubscribe = useTransactionStore.subscribe(
			(state) => state.transactions[id],
			(transaction) => {
				if (transaction) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id: txId, metadata, ...result } = transaction;
					setTransactionState(result);
				} else {
					setTransactionState(DEFAULT_TRANSACTION_RESULT);
				}
			},
		);

		return unsubscribe;
	}, [id, getTransaction]);

	const execute = useCallback(
		<T extends unknown[]>(
			txCreator: (...args: T) => unknown,
			args: T,
			signer: unknown,
			options?: TransactionOptions,
		) => {
			setCurrentTransaction(id);
			return executeTransaction(id, txCreator, args, signer, options);
		},
		[id, executeTransaction, setCurrentTransaction],
	);

	const clear = useCallback(() => {
		clearTransaction(id);
	}, [id, clearTransaction]);

	const isIdle = transactionState.status === "idle";
	const isPending = ["preparing", "signed", "broadcasting", "inBlock"].includes(
		transactionState.status,
	);
	const isFinalized = transactionState.status === "finalized";
	const isError = transactionState.status === "error";

	return useMemo(
		() => ({
			transaction: transactionState,
			execute,
			clear,
			isIdle,
			isPending,
			isFinalized,
			isError,
		}),
		[transactionState, execute, clear, isIdle, isPending, isFinalized, isError],
	);
}

export function useCurrentTransaction() {
	const currentTransactionId = useTransactionStore(
		(state) => state.currentTransactionId,
	);
	const getTransaction = useTransactionStore((state) => state.getTransaction);

	const [transaction, setTransaction] = useState<TransactionResult | null>(
		() => (currentTransactionId ? getTransaction(currentTransactionId) : null),
	);

	useEffect(() => {
		const updateTransaction = () => {
			const id = useTransactionStore.getState().currentTransactionId;
			setTransaction(id ? getTransaction(id) : null);
		};

		updateTransaction();

		const unsubscribe = useTransactionStore.subscribe(
			(state) => ({
				id: state.currentTransactionId,
				tx: state.currentTransactionId
					? state.transactions[state.currentTransactionId]
					: null,
			}),
			(current) => {
				if (current.tx) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id: txId, metadata, ...result } = current.tx;
					setTransaction(result);
				} else {
					setTransaction(null);
				}
			},
		);

		return unsubscribe;
	}, [getTransaction]);

	return useMemo(() => transaction, [transaction]);
}

export function useTransactionMonitor(ids: string[] = []) {
	const getAllTransactions = useTransactionStore(
		(state) => state.getAllTransactions,
	);

	const [transactions, setTransactions] = useState<TrackedTransaction[]>([]);

	const memoizedIds = useMemo(() => ids, [ids]);

	useEffect(() => {
		const updateTransactions = () => {
			const allTransactions = getAllTransactions();

			if (memoizedIds.length > 0) {
				const filteredTransactions = allTransactions.filter((tx) =>
					memoizedIds.includes(tx.id),
				);
				setTransactions(filteredTransactions);
			} else {
				setTransactions(allTransactions);
			}
		};

		updateTransactions();

		const unsubscribe = useTransactionStore.subscribe(
			(state) => state.transactions,
			() => updateTransactions(),
		);

		return unsubscribe;
	}, [getAllTransactions, memoizedIds]);

	return useMemo(() => transactions, [transactions]);
}
