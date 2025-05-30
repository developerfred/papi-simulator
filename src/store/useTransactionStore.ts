/* eslint-disable @typescript-eslint/no-explicit-any,  @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment  */
// @ts-nocheck
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { useChainStore } from "./useChainStore";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import type { ISubmittableResult } from "@polkadot/types/types";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { SignerOptions } from "@polkadot/api/types";
import { BN } from "@polkadot/util";
import type { u32 } from "@polkadot/types";
import type { BlockNumber } from "@polkadot/types/interfaces";

export type TransactionStatus =
	| "idle"
	| "preparing"
	| "signed"
	| "broadcasting"
	| "inBlock"
	| "finalized"
	| "error";

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
		era?: number;
		nonce?: number;
	};
	metadata?: TransactionMetadata;
}

interface TransactionState {
	transactions: Record<string, TrackedTransaction>;
	currentTransactionId: string | null;

	executeTransaction: <T extends unknown[]>(
		id: string,
		txCreator: (...args: T) => SubmittableExtrinsic<"promise">,
		args: T,
		signer: KeyringPair,
		options?: TransactionOptions
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
	subscribeWithSelector(
		persist(
			devtools(
				(set, get) => ({
					transactions: {},
					currentTransactionId: null,

					executeTransaction: async <T extends unknown[]>(
						id: string,
						txCreator: (...args: T) => SubmittableExtrinsic<"promise">,
						args: T,
						signer: KeyringPair,
						options?: TransactionOptions
					): Promise<string> => {
						const { typedApi } = useChainStore.getState();

						if (!typedApi) {
							throw new Error("Chain not connected");
						}

						const api = typedApi as unknown as import("@polkadot/api").ApiPromise;

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

							return new Promise<string>((resolve, reject) => {
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

								const signerOptions: Partial<SignerOptions> = {};

								(async () => {
									try {
										if (options?.txOptions) {
											const { nonce, tip, era } = options.txOptions;

											if (nonce !== undefined) {
												signerOptions.nonce = new BN(nonce);
											}
											if (tip !== undefined) {
												signerOptions.tip = tip;
											}
											if (era !== undefined) {
												const blockNumber = await api.query.system.number() as unknown as BlockNumber;
												if (!blockNumber || typeof blockNumber.toNumber !== "function") {
													throw new Error("Invalid block number received");
												}
												const currentBlockNumber = blockNumber.toNumber();
												const { GenericExtrinsicEra } = await import("@polkadot/types");
												// @ts-nocheck
												const extrinsicEra = new GenericExtrinsicEra(api.registry, {
													current: currentBlockNumber,
													period: era,
												});

												signerOptions.era = api.registry.createType(
													"ExtrinsicEra",
													extrinsicEra.toU8a()
												);
											}
										}

										const unsubscribe = await tx.signAndSend(
											signer,
											signerOptions,
											(result: ISubmittableResult) => {
												const currentTx = get().transactions[id] || {
													id,
													...DEFAULT_TRANSACTION_RESULT,
													metadata: options?.metadata,
												};

												let updates: Partial<TransactionResult> = {};

												if (result.status.isReady) {
													updates = {
														status: "signed",
														txHash: result.txHash?.toString(),
													};
												}

												if (result.status.isBroadcast) {
													updates = {
														status: "broadcasting",
														txHash: result.txHash?.toString(),
													};
												}

												if (result.status.isInBlock) {
													updates = {
														status: "inBlock",
														txHash: result.txHash?.toString(),
														events: result.events,
														blockInfo: {
															blockHash: result.status.asInBlock.toString(),
															blockNumber: null,
															txIndex: null,
														},
													};
												}


												if (result.status.isFinalized) {
													clearTimeout(timeoutId);
													const finalized = result.status.asFinalized;

													updates = {
														status: "finalized",
														txHash: finalized.toString(),
														events: result.events,
														isSuccessful: !result.dispatchError,
														blockInfo: {
															blockHash: finalized.toString(),
															blockNumber: null,
															txIndex: null,
														},
														timestamp: Date.now(),
													};

													unsubscribe();
													resolve(id);
												}

												if (result.isError) {
													updates = {
														status: "error",
														error: new Error(
															result.dispatchError?.toString() ??
																"Unknown error",
														),
														timestamp: Date.now(),
													};
												}

												set((state) => ({
													transactions: {
														...state.transactions,
														[id]: {
															...currentTx,
															...updates,
														},
													},
												}));
											},
										);
									} catch (error) {
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
														error:
															error instanceof Error
																? error
																: new Error(String(error)),
														timestamp: Date.now(),
													},
												},
											};
										});
										reject(error);
									}
								})();
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
												error instanceof Error
													? error
													: new Error(String(error)),
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
						return tx ? (({ id: _id, metadata, ...rest }) => rest)(tx) : null;
					},

					getAllTransactions: () => {
						const transactions = Object.values(get().transactions);
						return [...transactions].sort(
							(a, b) => (b.timestamp || 0) - (a.timestamp || 0),
						);
					},

					clearTransaction: (id: string) => {
						set((state) => {
							const { [id]: _, ...remaining } = state.transactions;
							return {
								transactions: remaining,
								currentTransactionId:
									state.currentTransactionId === id
										? null
										: state.currentTransactionId,
							};
						});
					},

					clearAllTransactions: () => {
						set({ transactions: {}, currentTransactionId: null });
					},

					setCurrentTransaction: (id: string | null) => {
						set({ currentTransactionId: id });
					},
				}),
				{ name: "transaction-store" },
			),
			{
				name: "chain-transactions",
				partialize: (state: { transactions: { [s: string]: unknown; } | ArrayLike<unknown>; currentTransactionId: any; }) => ({
					transactions: Object.fromEntries(
						Object.entries(state.transactions).filter(
							// @ts-ignore
							([_, tx]) => tx.status === "finalized",
						),
					),
					currentTransactionId: state.currentTransactionId,
				}),
			},
		),
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

		const unsubscribe = useTransactionStore.subscribe((state) => {
			const transaction = state.transactions[id];
			if (transaction) {
				const { id: txId, metadata, ...result } = transaction;
				setTransactionState(result);
			} else {
				setTransactionState(DEFAULT_TRANSACTION_RESULT);
			}
		});

		return unsubscribe;
	}, [id, getTransaction]);

	const execute = useCallback(
		<T extends unknown[]>(
			txCreator: (
				...args: T
			) => SubmittableExtrinsic<"promise", ISubmittableResult>,
			args: T,
			signer: KeyringPair,
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
