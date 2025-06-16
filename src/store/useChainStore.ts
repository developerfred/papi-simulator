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
	EMPTY,
} from "rxjs";
import {
	switchMap,
	catchError,
	tap,
	shareReplay,
	finalize,
	retry,
	takeUntil,
} from "rxjs/operators";
import { useState, useEffect, useMemo } from "react";
import type { Network } from "@/lib/types/network";
import { DEFAULT_NETWORK } from "@/lib/constants/networks";


interface ChainClient {
	destroy: () => void;
	getTypedApi: (descriptor: unknown) => TypedApi;
	[key: string]: unknown;
}

interface TypedApi {
	query: Record<string, Record<string, unknown>>;
	[key: string]: unknown;
}


interface ConnectionResult {
	client: ChainClient;
	typedApi: TypedApi;
}


export type ConnectionStatus =
	| { state: "disconnected" }
	| { state: "connecting" }
	| { state: "connected" }
	| { state: "error"; error: Error };


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
	destroy$: Subject<void>; 

	
	connect: (network: Network) => Observable<void>;
	disconnect: () => void;
	setNetwork: (network: Network) => void;

	
	getTypedApi: () => Observable<TypedApi>;
	getClient: () => Observable<ChainClient>;
}


let descriptorsPromise: Promise<Record<string, unknown>> | null = null;
const getDescriptors = () => {
	if (!descriptorsPromise) {
		descriptorsPromise = import("@polkadot-api/descriptors").catch((err) => {			
			descriptorsPromise = null;
			throw err;
		});
	}
	return descriptorsPromise;
};


const isDisjointError = (error: unknown): boolean => {
	if (error instanceof Error) {
		return error.message.includes('ChainHead disjointed') ||
			error.message.includes('DisjointError') ||
			error.name === 'DisjointError';
	}
	return false;
};


const createChainClient = (network: Network, destroy$: Observable<void>): Observable<ConnectionResult> => {
	if (!network || !network.endpoint || !network.descriptorKey) {
		return throwError(() => new Error("Invalid network configuration"));
	}

	return new Observable<ConnectionResult>((subscriber) => {
		let client: ChainClient | null = null;
		let destroyed = false;

		try {
			const provider = withPolkadotSdkCompat(getWsProvider(network.endpoint));

			client = createClient(provider) as unknown as ChainClient;

			if (!client) {
				throw new Error("Failed to create client");
			}
			
			const subscription = from(getDescriptors())
				.pipe(
					takeUntil(destroy$), 
					switchMap((descriptors) => {
						if (destroyed) {
							return EMPTY; 
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
					
					retry({
						count: 3,
						delay: (error, retryCount) => {					
							if (isDisjointError(error)) {
								return throwError(() => error);
							}
							return timer(Math.min(1000 * 2 ** retryCount, 10000));
						},
					}),
					catchError((error) => {
						
						if (isDisjointError(error)) {
							console.warn("ChainHead disjointed, this is expected during reconnection:", error.message);
							return EMPTY; 
						}

						console.error("Failed to create chain client:", error);
						if (client && !destroyed) {
							try {
								client.destroy();
							} catch (destroyError) {
								console.warn("Error destroying client:", destroyError);
							}
							client = null;
						}
						return throwError(() => error);
					}),
				)
				.subscribe({
					next: (value) => {
						if (!destroyed && value.client) {
							subscriber.next({
								client: value.client,
								typedApi: value.typedApi,
							});
							subscriber.complete();
						}
					},
					error: (err) => {
						if (!destroyed && !isDisjointError(err)) {
							subscriber.error(err);
						}
					},
					complete: () => {
						if (!destroyed) {
							subscriber.complete();
						}
					},
				});
			
			return () => {
				destroyed = true;
				subscription.unsubscribe();
				if (client) {
					try {
						client.destroy();
					} catch (destroyError) {						
						if (!isDisjointError(destroyError)) {
							console.warn("Error destroying client during cleanup:", destroyError);
						}
					}
					client = null;
				}
			};
		} catch (err) {			
			const error = err instanceof Error ? err : new Error(String(err));
			if (!isDisjointError(error)) {
				subscriber.error(error);
			}

			return () => {
				destroyed = true;
				if (client) {
					try {
						client.destroy();
					} catch (destroyError) {
						if (!isDisjointError(destroyError)) {
							console.warn("Error destroying client in sync error handler:", destroyError);
						}
					}
					client = null;
				}
			};
		}
	});
};


export const useChainStore = create<ChainState>((set, get) => {	
	const networkEvents$ = new Subject<Network>();
	const connectionStatus$ = new BehaviorSubject<ConnectionStatus>({
		state: "disconnected",
	});
	const destroy$ = new Subject<void>(); 

	
	if (typeof window !== 'undefined') {
		const originalHandler = window.onunhandledrejection;
		window.onunhandledrejection = (event) => {
			if (isDisjointError(event.reason)) {
				console.warn("Handled disjoint error:", event.reason?.message || event.reason);
				event.preventDefault(); 
				return;
			}
			
			if (originalHandler) {
				originalHandler.call(window, event);
			}
		};
	}

	
	const connection$ = networkEvents$.pipe(
		tap(() => {
			connectionStatus$.next({ state: "connecting" });
			set({ connectionStatus: { state: "connecting" } });
		}),
		switchMap((network) =>
			createChainClient(network, destroy$).pipe(
				tap({
					next: () => {
						connectionStatus$.next({ state: "connected" });
						set({ connectionStatus: { state: "connected" } });
					},
					error: (error) => {
						
						if (!isDisjointError(error)) {
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
						}
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
					
					if (isDisjointError(error)) {
						console.warn("Connection disjoint error handled:", error.message);
						return EMPTY; 
					}
					console.error("Connection error:", error);
					return throwError(() => error);
				}),
			),
		),
		
		shareReplay({ bufferSize: 1, refCount: true }),
		takeUntil(destroy$), 
	);

	return {
		
		network: DEFAULT_NETWORK,
		connectionStatus: { state: "disconnected" },
		client: null,
		typedApi: null,

		
		networkEvents$,
		connectionStatus$,
		connection$,
		destroy$,

		
		connect: (network) => {
			const { disconnect } = get();
			set({ network });			
			disconnect();

			networkEvents$.next(network);
			
			return new Observable<void>((subscriber) => {			
				const subscription = (
					get().connection$ || of<ConnectionResult | null>(null)
				)
					.pipe(
						takeUntil(destroy$),
						catchError((error) => {
							if (isDisjointError(error)) {
								console.warn("Connect disjoint error handled:", error.message);
								return EMPTY;
							}
							return throwError(() => error);
						})
					)
					.subscribe({
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
						error: (err) => {
							if (!isDisjointError(err)) {
								subscriber.error(err);
							}
						},
						complete: () => subscriber.complete(),
					});
				
				return () => subscription.unsubscribe();
			});
		},

		
		disconnect: () => {
			const { client } = get();

			
			destroy$.next();

			if (client) {
				try {
					client.destroy();
				} catch (error) {
					if (!isDisjointError(error)) {
						console.warn("Error during disconnect:", error);
					}
				}
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

		// Lazy loading getters that return observables with improved error handling
		getTypedApi: () => {
			const { typedApi, connection$, connect, network } = get();

			if (typedApi) {
				return of(typedApi);
			}

			if (!connection$) {
				// Connect first and then get the typed API
				const connectObservable = connect(network);
				return new Observable<TypedApi>((subscriber) => {
					const subscription = connectObservable
						.pipe(
							takeUntil(destroy$),
							catchError((error) => {
								if (isDisjointError(error)) {
									console.warn("getTypedApi disjoint error handled:", error.message);
									return EMPTY;
								}
								return throwError(() => error);
							})
						)
						.subscribe({
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
							error: (err) => {
								if (!isDisjointError(err)) {
									subscriber.error(err);
								}
							},
							complete: () => { },
						});

					return () => subscription.unsubscribe();
				});
			}

			return connection$.pipe(
				takeUntil(destroy$),
				switchMap((result) => {
					if (result && result.typedApi) {
						return of(result.typedApi);
					}
					return throwError(
						() => new Error("TypedApi not available in connection"),
					);
				}),
				catchError((error) => {
					if (isDisjointError(error)) {
						console.warn("getTypedApi connection disjoint error handled:", error.message);
						return EMPTY;
					}
					return throwError(() => error);
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
					const subscription = connectObservable
						.pipe(
							takeUntil(destroy$),
							catchError((error) => {
								if (isDisjointError(error)) {
									console.warn("getClient disjoint error handled:", error.message);
									return EMPTY;
								}
								return throwError(() => error);
							})
						)
						.subscribe({
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
							error: (err) => {
								if (!isDisjointError(err)) {
									subscriber.error(err);
								}
							},
							complete: () => { },
						});

					return () => subscription.unsubscribe();
				});
			}

			return connection$.pipe(
				takeUntil(destroy$),
				switchMap((result) => {
					if (result && result.client) {
						return of(result.client);
					}
					return throwError(
						() => new Error("Client not available in connection"),
					);
				}),
				catchError((error) => {
					if (isDisjointError(error)) {
						console.warn("getClient connection disjoint error handled:", error.message);
						return EMPTY;
					}
					return throwError(() => error);
				}),
			);
		},
	};
});


export const useObservable = <T>(
	observable$: Observable<T> | null,
	initialValue: T,
) => {
	const [value, setValue] = useState<T>(initialValue);

	useEffect(() => {
		if (!observable$) return;

		const subscription = observable$.subscribe({
			next: (val) => setValue(val),
			error: (err) => {
				if (!isDisjointError(err)) {
					console.error("Observable error:", err);
				}
			},
		});

		return () => subscription.unsubscribe();
	}, [observable$]);

	return value;
};


export const useConnectionStatus = () => {
	const connectionStatus$ = useChainStore((state) => state.connectionStatus$);
	const fallbackStatus = useChainStore((state) => state.connectionStatus);

	return useObservable(connectionStatus$, fallbackStatus);
};


interface ApiHookResult {
	api: TypedApi | null;
	loading: boolean;
	error: Error | null;
}


export const useTypedApi = (): ApiHookResult => {
	const [api, setApi] = useState<TypedApi | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	
	const getTypedApi = useChainStore((state) => state.getTypedApi);
	const currentApi = useChainStore((state) => state.typedApi);

	useEffect(() => {
		if (currentApi) {
			setApi(currentApi);
			setLoading(false);
			setError(null);
			return;
		}

		
		setLoading(true);

		const subscription = getTypedApi().subscribe({
			next: (typedApi) => {
				setApi(typedApi);
				setLoading(false);
				setError(null);
			},
			error: (err) => {
				if (!isDisjointError(err)) {
					setError(err instanceof Error ? err : new Error(String(err)));
					setLoading(false);
				}
			},
		});

		return () => subscription.unsubscribe();
	}, [getTypedApi, currentApi]);

	
	return useMemo(() => ({ api, loading, error }), [api, loading, error]);
};


interface ClientHookResult {
	client: ChainClient | null;
	loading: boolean;
	error: Error | null;
}


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
				if (!isDisjointError(err)) {
					setError(err instanceof Error ? err : new Error(String(err)));
					setLoading(false);
				}
			},
		});

		return () => subscription.unsubscribe();
	}, [getClient, currentClient]);
	
	return useMemo(() => ({ client, loading, error }), [client, loading, error]);
};