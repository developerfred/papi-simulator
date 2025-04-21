import { create } from "zustand";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import {
	from,
	Observable,
	Subject,
	BehaviorSubject,
	of,
	throwError,
	timer,
} from "rxjs";
import {
	switchMap,
	catchError,
	tap,
	shareReplay,
	finalize,
	retry,
} from "rxjs/operators";
import { useState, useEffect, useMemo } from "react";
import type { Network } from "@/lib/types/network";
import { DEFAULT_NETWORK } from "@/lib/constants/networks";

/**
 * Chain client and typed API interfaces
 */
interface ChainClient {
	destroy: () => void;
	getTypedApi: (descriptor: unknown) => TypedApi;
	[key: string]: unknown;
}

interface TypedApi {
	query: Record<string, Record<string, unknown>>;
	[key: string]: unknown;
}

/**
 * Connection result with client and API
 */
interface ConnectionResult {
	client: ChainClient;
	typedApi: TypedApi;
}

/**
 * Chain connection status
 */
export type ConnectionStatus =
	| { state: "disconnected" }
	| { state: "connecting" }
	| { state: "connected" }
	| { state: "error"; error: Error };

/**
 * Chain store state interface
 */
interface ChainState {
	// Connection state
	network: Network;
	connectionStatus: ConnectionStatus;
	client: ChainClient | null;
	typedApi: TypedApi | null;

	// Observables
	connection$: Observable<ConnectionResult> | null;
	networkEvents$: Subject<Network>;
	connectionStatus$: BehaviorSubject<ConnectionStatus>;

	// Actions
	connect: (network: Network) => Observable<void>;
	disconnect: () => void;
	setNetwork: (network: Network) => void;

	// Lazy loading helpers
	getTypedApi: () => Observable<TypedApi>;
	getClient: () => Observable<ChainClient>;
}

// Dynamic import function with caching for descriptors
let descriptorsPromise: Promise<Record<string, unknown>> | null = null;
const getDescriptors = () => {
	if (!descriptorsPromise) {
		descriptorsPromise = import("@polkadot-api/descriptors").catch((err) => {
			// Reset cache on error to allow retrying
			descriptorsPromise = null;
			throw err;
		});
	}
	return descriptorsPromise;
};

/**
 * Create a Polkadot-API client for a network using RxJS
 */
const createChainClient = (network: Network): Observable<ConnectionResult> => {
	if (!network || !network.endpoint || !network.descriptorKey) {
		return throwError(() => new Error("Invalid network configuration"));
	}

	return new Observable<ConnectionResult>((subscriber) => {
		let client: ChainClient | null = null;
		let destroyed = false;

		try {
			// Create provider with compatibility layer
			const provider = withPolkadotSdkCompat(getWsProvider(network.endpoint));

			// Create the client and set up cleanup
			client = createClient(provider) as ChainClient;

			if (!client) {
				throw new Error("Failed to create client");
			}

			// Use cached descriptors import
			const subscription = from(getDescriptors())
				.pipe(
					switchMap((descriptors) => {
						if (destroyed) {
							return throwError(() => new Error("Connection was destroyed"));
						}

						const descriptor = descriptors[network.descriptorKey];

						if (!descriptor) {
							return throwError(
								() =>
									new Error(
										`Descriptor not found for network: ${network.descriptorKey}`,
									),
							);
						}

						try {
							// Create the typed API
							const typedApi = client!.getTypedApi(descriptor) as TypedApi;

							if (!typedApi) {
								return throwError(
									() => new Error("Failed to create typed API"),
								);
							}

							return of({ client, typedApi });
						} catch (err) {
							return throwError(() =>
								err instanceof Error ? err : new Error(String(err)),
							);
						}
					}),
					// Add retry with exponential backoff for WASM loading issues
					retry({
						count: 3,
						delay: (error, retryCount) =>
							timer(Math.min(1000 * 2 ** retryCount, 10000)),
					}),
					catchError((error) => {
						console.error("Failed to create chain client:", error);
						if (client && !destroyed) {
							client.destroy();
							client = null;
						}
						return throwError(() => error);
					}),
				)
				.subscribe({
					next: (value) => {
						if (!destroyed) {
							subscriber.next(value);
							subscriber.complete();
						}
					},
					error: (err) => {
						if (!destroyed) {
							subscriber.error(err);
						}
					},
				});

			// Return cleanup function
			return () => {
				destroyed = true;
				subscription.unsubscribe();
				if (client) {
					client.destroy();
					client = null;
				}
			};
		} catch (err) {
			// Handle synchronous errors during setup
			subscriber.error(err instanceof Error ? err : new Error(String(err)));

			return () => {
				destroyed = true;
				if (client) {
					client.destroy();
					client = null;
				}
			};
		}
	});
};

/**
 * Chain connection store with Zustand and RxJS
 */
export const useChainStore = create<ChainState>((set, get) => {
	// Create subjects for network events and connection status
	const networkEvents$ = new Subject<Network>();
	const connectionStatus$ = new BehaviorSubject<ConnectionStatus>({
		state: "disconnected",
	});

	// Create shared connection observable with improved caching
	const connection$ = networkEvents$.pipe(
		tap(() => {
			connectionStatus$.next({ state: "connecting" });
			set({ connectionStatus: { state: "connecting" } });
		}),
		switchMap((network) =>
			createChainClient(network).pipe(
				tap({
					next: () => {
						connectionStatus$.next({ state: "connected" });
						set({ connectionStatus: { state: "connected" } });
					},
					error: (error) => {
						const errorState = {
							state: "error",
							error: error instanceof Error ? error : new Error(String(error)),
						} as const;
						connectionStatus$.next(errorState);
						set({
							client: null,
							typedApi: null,
							connectionStatus: errorState,
						});
					},
				}),
				finalize(() => {
					const currentStatus = connectionStatus$.getValue();
					if (currentStatus.state === "connecting") {
						connectionStatus$.next({ state: "disconnected" });
						set({ connectionStatus: { state: "disconnected" } });
					}
				}),
				catchError((error) => {
					console.error("Connection error:", error);
					return throwError(() => error);
				}),
			),
		),
		// Improved caching strategy for better performance
		shareReplay({ bufferSize: 1, refCount: true }),
	);

	return {
		// Initial state
		network: DEFAULT_NETWORK,
		connectionStatus: { state: "disconnected" },
		client: null,
		typedApi: null,

		// RxJS subjects and observables
		networkEvents$,
		connectionStatus$,
		connection$,

		// Connect to a network
		connect: (network) => {
			const { disconnect } = get();

			// Set the current network
			set({ network });

			// Clean up any existing connections
			disconnect();

			// Emit network event
			networkEvents$.next(network);

			// Create an observable that tracks the connection
			return new Observable<void>((subscriber) => {
				// Subscribe to the shared connection observable
				const subscription = (get().connection$ || of(null)).subscribe({
					next: (result) => {
						if (result) {
							set({
								client: result.client,
								typedApi: result.typedApi,
							});
						}
						subscriber.next();
						subscriber.complete();
					},
					error: (err) => subscriber.error(err),
					complete: () => subscriber.complete(),
				});

				// Return cleanup function
				return () => subscription.unsubscribe();
			});
		},

		// Disconnect from the network
		disconnect: () => {
			const { client } = get();

			if (client) {
				client.destroy();
			}

			set({
				client: null,
				typedApi: null,
				connectionStatus: { state: "disconnected" },
			});

			connectionStatus$.next({ state: "disconnected" });
		},

		// Set the network without connecting
		setNetwork: (network) => {
			set({ network });
		},

		// Lazy loading getters that return observables with improved caching
		getTypedApi: () => {
			const { typedApi, connection$, connect, network } = get();

			if (typedApi) {
				return of(typedApi);
			}

			if (!connection$) {
				// Connect first and then get the typed API
				const connectObservable = connect(network);
				return new Observable<TypedApi>((subscriber) => {
					const subscription = connectObservable.subscribe({
						next: () => {
							const api = get().typedApi;
							if (api) {
								subscriber.next(api);
								subscriber.complete();
							} else {
								subscriber.error(
									new Error("TypedApi not available after connection"),
								);
							}
						},
						error: (err) => subscriber.error(err),
						complete: () => {},
					});

					return () => subscription.unsubscribe();
				});
			}

			return connection$.pipe(
				switchMap((result) => {
					if (result && result.typedApi) {
						return of(result.typedApi);
					}
					return throwError(
						() => new Error("TypedApi not available in connection"),
					);
				}),
			);
		},

		getClient: () => {
			const { client, connection$, connect, network } = get();

			if (client) {
				return of(client);
			}

			if (!connection$) {
				// Connect first and then get the client
				const connectObservable = connect(network);
				return new Observable<ChainClient>((subscriber) => {
					const subscription = connectObservable.subscribe({
						next: () => {
							const currentClient = get().client;
							if (currentClient) {
								subscriber.next(currentClient);
								subscriber.complete();
							} else {
								subscriber.error(
									new Error("Client not available after connection"),
								);
							}
						},
						error: (err) => subscriber.error(err),
						complete: () => {},
					});

					return () => subscription.unsubscribe();
				});
			}

			return connection$.pipe(
				switchMap((result) => {
					if (result && result.client) {
						return of(result.client);
					}
					return throwError(
						() => new Error("Client not available in connection"),
					);
				}),
			);
		},
	};
});

/**
 * Hook to use RxJS observables in React with performance optimizations
 */
export const useObservable = <T>(
	observable$: Observable<T> | null,
	initialValue: T,
) => {
	const [value, setValue] = useState<T>(initialValue);

	useEffect(() => {
		if (!observable$) return;

		const subscription = observable$.subscribe({
			next: (val) => setValue(val),
			error: (err) => console.error("Observable error:", err),
		});

		return () => subscription.unsubscribe();
	}, [observable$]);

	return value;
};

/**
 * Memoized connection status hook to prevent unnecessary renders
 */
export const useConnectionStatus = () => {
	const connectionStatus$ = useChainStore((state) => state.connectionStatus$);
	const fallbackStatus = useChainStore((state) => state.connectionStatus);

	return useObservable(connectionStatus$, fallbackStatus);
};

/**
 * API hook result interface
 */
interface ApiHookResult {
	api: TypedApi | null;
	loading: boolean;
	error: Error | null;
}

/**
 * Optimized hook for typed API access
 */
export const useTypedApi = (): ApiHookResult => {
	const [api, setApi] = useState<TypedApi | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Use selectors to minimize re-renders
	const getTypedApi = useChainStore((state) => state.getTypedApi);
	const currentApi = useChainStore((state) => state.typedApi);

	useEffect(() => {
		if (currentApi) {
			setApi(currentApi);
			setLoading(false);
			setError(null);
			return;
		}

		// Otherwise, get via observable
		setLoading(true);

		const subscription = getTypedApi().subscribe({
			next: (typedApi) => {
				setApi(typedApi);
				setLoading(false);
				setError(null);
			},
			error: (err) => {
				setError(err instanceof Error ? err : new Error(String(err)));
				setLoading(false);
			},
		});

		return () => subscription.unsubscribe();
	}, [getTypedApi, currentApi]);

	// Return memoized result to prevent unnecessary re-renders
	return useMemo(() => ({ api, loading, error }), [api, loading, error]);
};

/**
 * Client hook result interface
 */
interface ClientHookResult {
	client: ChainClient | null;
	loading: boolean;
	error: Error | null;
}

/**
 * Optimized hook for chain client with memoization
 */
export const useChainClient = (): ClientHookResult => {
	const [client, setClient] = useState<ChainClient | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const getClient = useChainStore((state) => state.getClient);
	const currentClient = useChainStore((state) => state.client);

	useEffect(() => {
		if (currentClient) {
			setClient(currentClient);
			setLoading(false);
			setError(null);
			return;
		}

		setLoading(true);

		const subscription = getClient().subscribe({
			next: (clientInstance) => {
				setClient(clientInstance);
				setLoading(false);
				setError(null);
			},
			error: (err) => {
				setError(err instanceof Error ? err : new Error(String(err)));
				setLoading(false);
			},
		});

		return () => subscription.unsubscribe();
	}, [getClient, currentClient]);

	// Return memoized result
	return useMemo(() => ({ client, loading, error }), [client, loading, error]);
};
