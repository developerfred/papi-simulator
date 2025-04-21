import { useCallback, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useChainStore } from "@/store/useChainStore";
import { Subject, BehaviorSubject, from, of, timer, EMPTY } from "rxjs";
import {
	switchMap,
	tap,
	catchError,
	finalize,
	timeout,
	retry,
} from "rxjs/operators";

export type TransactionStatus =
	| "idle"
	| "preparing"
	| "signed"
	| "broadcasting"
	| "inBlock"
	| "finalized"
	| "error";

interface BlockInfo {
	blockHash?: string;
	blockNumber?: number;
}

interface Transaction {
	txHash?: string;
	status: TransactionStatus;
	error?: Error;
	blockInfo: BlockInfo;
	metadata?: Record<string, unknown>;
}

// For type safety in the transaction creator function
export interface TypedApi {
	tx: Record<string, Record<string, unknown>>;
	query: Record<string, Record<string, unknown>>;
}

// Signer interface (simplified)
export interface Signer {
	address: string;
	sign?: (data: Uint8Array) => Promise<Uint8Array>;
}

// Transaction options
export interface TransactionOptions {
	metadata?: Record<string, unknown>;
	timeout?: number;
	retries?: number;
}

const DEFAULT_TRANSACTION: Transaction = {
	status: "idle",
	blockInfo: {},
};

export const useChainTx = () => {
	const [id] = useState(() => nanoid());
	const [transaction, setTransaction] =
		useState<Transaction>(DEFAULT_TRANSACTION);

	// RxJS subjects with proper typing
	const [transactionSubject] = useState(
		() => new BehaviorSubject<Transaction>(DEFAULT_TRANSACTION),
	);

	const [executionSubject] = useState(
		() =>
			new Subject<{
				txCreator: (api: TypedApi) => unknown;
				args: unknown[];
				signer: Signer;
				options?: TransactionOptions;
			}>(),
	);

	const typedApi = useChainStore((state) => state.typedApi);
	const getTypedApi = useChainStore((state) => state.getTypedApi);

	useEffect(() => {
		const subscription = transactionSubject.subscribe((tx) => {
			setTransaction(tx);
		});

		return () => subscription.unsubscribe();
	}, [transactionSubject]);

	useEffect(() => {
		const subscription = executionSubject
			.pipe(
				tap(() => {
					transactionSubject.next({
						...transactionSubject.getValue(),
						status: "preparing",
					});
				}),

				switchMap(({ txCreator, options }) => {
					if (typedApi) {
						// Cast typedApi to match the expected TypedApi interface
						const safeApi = typedApi as unknown as TypedApi;
						return of({ txCreator, options, api: safeApi });
					}

					return getTypedApi().pipe(
						timeout(10000),
						retry({ count: 2, delay: 1000 }),
						switchMap((api) => {
							if (!api) {
								throw new Error("API not available");
							}
							// Cast api to match the expected TypedApi interface
							const safeApi = api as unknown as TypedApi;
							return of({ txCreator, options, api: safeApi });
						}),
					);
				}),

				switchMap(({ txCreator, options, api }) => {
					try {
						const tx = txCreator(api);

						if (!tx) {
							throw new Error("Failed to create transaction");
						}

						return from(
							new Promise<Transaction>(async (resolve, reject) => {
								try {
									transactionSubject.next({
										...transactionSubject.getValue(),
										status: "signed",
										metadata: options?.metadata,
									});

									transactionSubject.next({
										...transactionSubject.getValue(),
										status: "broadcasting",
									});

									const txHash = `0x${nanoid(64)}`;

									await timer(300).toPromise();
									transactionSubject.next({
										...transactionSubject.getValue(),
										txHash,
										status: "broadcasting",
									});

									await timer(1000).toPromise();
									transactionSubject.next({
										...transactionSubject.getValue(),
										status: "inBlock",
										blockInfo: {
											blockHash: `0x${nanoid(64)}`,
											blockNumber: Math.floor(Math.random() * 10000000),
										},
									});

									await timer(2000).toPromise();
									const finalState = {
										...transactionSubject.getValue(),
										status: "finalized" as const,
									};
									transactionSubject.next(finalState);
									resolve(finalState);
								} catch (error) {
									reject(error);
								}
							}),
						);
					} catch (error) {
						return of(error);
					}
				}),

				catchError((error) => {
					console.error("Transaction error:", error);
					transactionSubject.next({
						...transactionSubject.getValue(),
						status: "error",
						error: error instanceof Error ? error : new Error(String(error)),
					});
					return EMPTY;
				}),

				finalize(() => {
					// Cleanup logic could go here if needed
				}),
			)
			.subscribe();

		return () => subscription.unsubscribe();
	}, [executionSubject, transactionSubject, typedApi, getTypedApi]);

	const execute = useCallback(
		(
			txCreator: (api: TypedApi) => unknown,
			args: unknown[] = [],
			signer: Signer,
			options?: TransactionOptions,
		) => {
			transactionSubject.next({
				...transactionSubject.getValue(),
				error: undefined,
			});

			executionSubject.next({ txCreator, args, signer, options });

			return transactionSubject.asObservable();
		},
		[executionSubject, transactionSubject],
	);

	const clear = useCallback(() => {
		transactionSubject.next(DEFAULT_TRANSACTION);
	}, [transactionSubject]);

	return {
		id,
		transaction,
		execute,
		clear,
		isIdle: transaction.status === "idle",
		isPreparing: transaction.status === "preparing",
		isSigned: transaction.status === "signed",
		isBroadcasting: transaction.status === "broadcasting",
		isInBlock: transaction.status === "inBlock",
		isFinalized: transaction.status === "finalized",
		isError: transaction.status === "error",
		transaction$: transactionSubject.asObservable(),
	};
};

export interface TransactionDetails {
	id: string;
	status: TransactionStatus;
	txHash?: string;
}

export const useTransactionMonitor = () => {
	const [transactions, setTransactions] = useState<TransactionDetails[]>([]);

	return {
		transactions,
		pendingCount: transactions.filter((tx) =>
			["preparing", "signed", "broadcasting", "inBlock"].includes(tx.status),
		).length,
		hasErrors: transactions.some((tx) => tx.status === "error"),
		trackTransaction: (transaction: TransactionDetails) => {
			setTransactions((prev) => [...prev, transaction]);
		},
		removeTransaction: (id: string) => {
			setTransactions((prev) => prev.filter((tx) => tx.id !== id));
		},
	};
};
