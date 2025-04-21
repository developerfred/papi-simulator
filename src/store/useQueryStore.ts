import { create } from "zustand";
import { useChainStore } from "./useChainStore";
import { devtools, persist } from "zustand/middleware";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

export type QueryStatus = "idle" | "loading" | "success" | "error";

export interface QueryResult<T> {
	data: T | null;
	status: QueryStatus;
	error: Error | null;
	timestamp: number | null;
}

interface CachedQuery<T> extends QueryResult<T> {
	key: string;
}

interface CacheConfig {
	ttl: number; // Time to live in milliseconds
	maxSize: number; // Maximum size of cache
	timeout: number; // Query timeout in milliseconds
}

interface QueryState {
	queries: Record<string, CachedQuery<unknown>>;
	cacheConfig: CacheConfig;

	executeQuery: <T>(
		key: string,
		queryFn: () => Promise<T>,
		options?: {
			force?: boolean;
			background?: boolean;
			timeout?: number;
		},
	) => Promise<T | null>;
	getQueryResult: <T>(key: string) => QueryResult<T>;
	invalidateQuery: (key: string) => void;
	invalidateAll: () => void;
	setCacheConfig: (config: Partial<CacheConfig>) => void;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
	ttl: 30000, // 30 seconds
	maxSize: 100,
	timeout: 180000, // 3 minutes
};

const activeQueries = new Map<string, Promise<unknown>>();

const safePromise = async <T>(promise: Promise<T>): Promise<T | null> => {
	try {
		return await promise;
	} catch (error) {
		console.error("Promise error caught by safePromise:", error);
		return null;
	}
};

const withTimeout = async <T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string,
): Promise<T> => {
	if (!timeoutMs || timeoutMs <= 0) {
		return promise;
	}

	const timeoutPromise = new Promise<T>((_, reject) => {
		const id = setTimeout(() => {
			reject(new Error(errorMessage));
		}, timeoutMs);

		// Limpamos o timeout quando a promise original for resolvida ou rejeitada
		promise.finally(() => clearTimeout(id));
	});

	return Promise.race([promise, timeoutPromise]);
};


export const useQueryStore = create<QueryState>()(
	persist(
		devtools(
			(set, get) => ({
				queries: {},
				cacheConfig: DEFAULT_CACHE_CONFIG,

				executeQuery: async <T>(
					key: string,
					queryFn: () => Promise<T>,
					options?: {
						force?: boolean;
						background?: boolean;
						timeout?: number;
					},
				): Promise<T | null> => {
					const { force = false, background = false, timeout } = options || {};
					const existingQuery = get().queries[key] as
						| CachedQuery<T>
						| undefined;
					const { ttl, timeout: defaultTimeout } = get().cacheConfig;
					const timeoutMs = timeout || defaultTimeout;

					if (activeQueries.has(key) && !force) {
						try {
							return (await activeQueries.get(key)) as T;
						} catch (err) {
							console.error(`Error from existing query for ${key}:`, err);
						}
					}

					if (
						!force &&
						existingQuery &&
						existingQuery.status === "success" &&
						existingQuery.timestamp &&
						Date.now() - existingQuery.timestamp < ttl
					) {
						return existingQuery.data as T;
					}

					if (!background) {
						set((state) => ({
							queries: {
								...state.queries,
								[key]: {
									key,
									data: existingQuery?.data || null,
									status: "loading",
									error: null,
									timestamp: existingQuery?.timestamp || null,
								},
							},
						}));
					}

					const queryPromise = (async () => {
						try {
							const result = await withTimeout(
								queryFn(),
								timeoutMs,
								`Query timeout for ${key}`,
							);

							set((state) => {
								const { maxSize } = state.cacheConfig;
								const queries = { ...state.queries };
								const queryCount = Object.keys(queries).length;

								if (queryCount >= maxSize) {
									const entries = Object.entries(queries)
										.map(([k, v]) => ({ key: k, timestamp: v.timestamp }))
										.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

									const removeCount = Math.max(1, Math.ceil(maxSize * 0.1));
									entries.slice(0, removeCount).forEach((entry) => {
										delete queries[entry.key];
									});
								}

								queries[key] = {
									key,
									data: result,
									status: "success",
									error: null,
									timestamp: Date.now(),
								};

								return { queries };
							});

							return result;
						} catch (error) {
							console.error(`Query error for ${key}:`, error);

							set((state) => ({
								queries: {
									...state.queries,
									[key]: {
										key,
										data: existingQuery?.data || null,
										status: "error",
										error:
											error instanceof Error ? error : new Error(String(error)),
										timestamp: Date.now(),
									},
								},
							}));

							if (existingQuery?.data) {
								console.warn(
									`Returning stale data for ${key} due to query error`,
								);
								return existingQuery.data as T;
							}

							throw error;
						} finally {
							activeQueries.delete(key);
						}
					})();

					activeQueries.set(key, queryPromise);

					try {
						return await queryPromise;
					} catch (error) {
						console.error(`Query execution final error for ${key}:`, error);
						return null;
					}
				},

				getQueryResult: <T>(key: string): QueryResult<T> => {
					const query = get().queries[key] as CachedQuery<T> | undefined;

					if (!query) {
						return {
							data: null,
							status: "idle",
							error: null,
							timestamp: null,
						};
					}

					return query;
				},

				invalidateQuery: (key: string) => {
					set((state) => {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { [key]: _, ...remainingQueries } = state.queries;
						return { queries: remainingQueries };
					});
				},

				invalidateAll: () => {
					set({ queries: {} });
				},

				setCacheConfig: (config: Partial<CacheConfig>) => {
					set((state) => ({
						cacheConfig: {
							...state.cacheConfig,
							...config,
						},
					}));
				},
			}),
			{ name: "query-store" },
		),
		{
			name: "chain-query-cache",
			partialize: (state) => {
				const filteredQueries: Record<string, CachedQuery<unknown>> = {};

				Object.entries(state.queries).forEach(([key, query]) => {
					if (query.status === "success" && query.data !== null) {
						filteredQueries[key] = query;
					}
				});

				return {
					queries: filteredQueries,
					cacheConfig: state.cacheConfig,
				};
			},
		},
	),
);

export function useQuery<T>(
	key: string,
	queryFn: () => Promise<T>,
	options?: {
		enabled?: boolean;
		refetchInterval?: number;
		suspense?: boolean;
		timeout?: number;
	},
) {
	const connectionStatus = useChainStore((state) => state.connectionStatus);
	const isConnected = connectionStatus.state === "connected";

	const executeQuery = useQueryStore((state) => state.executeQuery);
	const getQueryResult = useQueryStore((state) => state.getQueryResult);

	const [localError, setLocalError] = useState<Error | null>(null);
	const [isRefetching, setIsRefetching] = useState(false);

	const { enabled = true, refetchInterval, timeout } = options || {};

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const queryFnRef = useRef(queryFn);
	const mountedRef = useRef(true);

	useEffect(() => {
		queryFnRef.current = queryFn;
	}, [queryFn]);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const memoizedKey = useMemo(() => key, [key]);

	const safeSetState = useCallback(
		<S>(
			setter: React.Dispatch<React.SetStateAction<S>>,
			value: React.SetStateAction<S>,
		) => {
			if (mountedRef.current) {
				setter(value);
			}
		},
		[],
	);

	const executeQueryFn = useCallback(
		async (force = false) => {
			if (!isConnected) return null;

			if (force) {
				safeSetState(setIsRefetching, true);
			}

			try {
				return await safePromise(
					executeQuery(memoizedKey, queryFnRef.current, {
						force,
						timeout,
					}),
				);
			} catch (error) {
				console.error(`Unexpected query error (${memoizedKey}):`, error);
				safeSetState(
					setLocalError,
					error instanceof Error ? error : new Error(String(error)),
				);
				return null;
			} finally {
				safeSetState(setIsRefetching, false);
			}
		},
		[memoizedKey, executeQuery, isConnected, timeout, safeSetState],
	);

	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		if (!enabled || !isConnected) return;

		const runQuery = async () => {
			try {
				await executeQueryFn(false);
			} catch (err) {
				console.error("Unexpected error in runQuery:", err);
			}
		};

		runQuery();

		if (refetchInterval && refetchInterval > 0) {
			intervalRef.current = setInterval(() => {
				runQuery();
			}, refetchInterval);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [executeQueryFn, enabled, isConnected, refetchInterval]);

	const result = getQueryResult<T>(memoizedKey);

	const combinedError = result.error || localError;

	const combinedStatus: QueryStatus = isRefetching ? "loading" : result.status;

	const safeRefetch = useCallback(async () => {
		return safePromise(executeQueryFn(true));
	}, [executeQueryFn]);

	return useMemo(
		() => ({
			...result,
			status: combinedStatus,
			error: combinedError,
			refetch: safeRefetch,
		}),
		[result, combinedStatus, combinedError, safeRefetch],
	);
}

export function useStorageQuery<T>(
	path: string,
	params: unknown[] = [],
	options?: {
		enabled?: boolean;
		refetchInterval?: number;
		timeout?: number;
		retryCount?: number;
	},
) {
	const typedApi = useChainStore((state) => state.typedApi);
	const connectionStatus = useChainStore((state) => state.connectionStatus);
	const isConnected = connectionStatus.state === "connected";

	const { retryCount = 2, timeout = 180000 } = options || {};

	const memoizedPath = useMemo(() => path, [path]);
	const paramsString = useMemo(() => JSON.stringify(params), [params]);
	// Include params in dependency array since we're memoizing based on it
	const memoizedParams = useMemo(() => params, [params]);

	const queryKey = useMemo(
		() => `storage:${memoizedPath}:${paramsString}`,
		[memoizedPath, paramsString],
	);

	const queryFn = useCallback(async () => {
		if (!typedApi || !isConnected) {
			throw new Error("Chain not connected");
		}

		const [pallet, storage] = memoizedPath.split(".");

		if (!pallet || !storage) {
			throw new Error(
				`Invalid path: ${memoizedPath}. Expected format: "Pallet.Storage"`,
			);
		}

		if (!typedApi.query?.[pallet]?.[storage]) {
			throw new Error(`Storage not found: ${pallet}.${storage}`);
		}

		const executeWithRetry = async (attempt = 0): Promise<T> => {
			try {
				return (await typedApi.query[pallet][storage].getValue(
					...memoizedParams,
				)) as T;
			} catch (error) {
				console.error(
					`Storage query error (${memoizedPath}) attempt ${attempt}:`,
					error,
				);

				if (attempt < retryCount) {
					const backoff = 1000 * Math.pow(2, attempt);
					console.log(
						`Retrying query ${memoizedPath} in ${backoff}ms (attempt ${attempt + 1}/${retryCount})`,
					);
					await new Promise((resolve) => setTimeout(resolve, backoff));

					return executeWithRetry(attempt + 1);
				}

				throw error;
			}
		};

		return executeWithRetry(0);
	}, [typedApi, isConnected, memoizedPath, memoizedParams, retryCount]);

	return useQuery<T>(queryKey, queryFn, {
		...options,
		timeout,
	});
}
