import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useChainStore } from "@/store/useChainStore";
import { useEvents, useEventSubscription } from "@/store/useEventStore";
import { useFinalizedBlocks, useBestBlocks } from "@/store/useBlockStore";

export interface EventData {
	id: string;
	type: string;
	section: string;
	method: string;
	data: unknown;
	timestamp: number;
	blockHash: string;
	blockNumber: number;
}

export interface BlockInfo {
	hash: string;
	number: number;
	parent?: string; // Modified: made parent optional with ?
	timestamp: number;
}

export interface EventSubscriptionOptions {
	enabled?: boolean;
	filter?: (event: unknown) => boolean;
	limit?: number;
}

export interface EventSubscriptionResult {
	events: EventData[];
	subscription: ReturnType<typeof useEventSubscription>;
	latestEvent: EventData | null;
	isActive: boolean;
}

export function useEventSubscribe(
	section: string,
	method: string,
	options?: EventSubscriptionOptions,
): EventSubscriptionResult {
	const { enabled = true, filter } = options || {};
	const { connectionStatus } = useChainStore();
	const isConnected = connectionStatus.state === "connected";

	const subscription = useEventSubscription(section, method, {
		enabled: enabled && isConnected,
	});

	const allEvents = useEvents({ section, method });

	const filteredEvents = useMemo(() => {
		return filter ? allEvents.filter((event) => filter(event.data)) : allEvents;
	}, [allEvents, filter]);

	const limitedEvents = useMemo(() => {
		return options?.limit
			? filteredEvents.slice(0, options.limit)
			: filteredEvents;
	}, [filteredEvents, options?.limit]);

	return {
		events: limitedEvents,
		subscription,
		latestEvent: filteredEvents[0] || null,
		isActive: subscription?.active || false,
	};
}

export interface MultiEventSubscriptionConfig {
	section: string;
	method: string;
	options?: EventSubscriptionOptions;
}

export interface MultiEventSubscriptionResult {
	events: EventData[];
	isActive: boolean;
}

export function useMultiEventSubscribe(
	subscriptionConfigs: MultiEventSubscriptionConfig[],
	globalOptions?: Omit<EventSubscriptionOptions, "filter">,
): MultiEventSubscriptionResult {
	const { enabled = true, limit } = globalOptions || {};
	const { connectionStatus } = useChainStore();
	const isConnected = connectionStatus.state === "connected";

	// Create an array to store results from each individual subscription
	const subscriptionResults = subscriptionConfigs.reduce<
		EventSubscriptionResult[]
	>((acc, config) => {
		const { section, method, options = {} } = config;
		const localEnabled = enabled && options.enabled !== false;

		// Use the single event subscription hook directly
		acc.push(
			useEventSubscribe(section, method, {
				...options,
				enabled: localEnabled && isConnected,
			}),
		);
		return acc;
	}, []);

	// Combine events from all subscriptions
	const allEvents = useMemo(() => {
		// Flatten all events from all subscriptions
		const combined = subscriptionResults
			.flatMap((result) => result.events)
			// Sort by timestamp (newest first)
			.sort((a, b) => b.timestamp - a.timestamp);

		// Apply global limit if provided
		return limit ? combined.slice(0, limit) : combined;
	}, [subscriptionResults, limit]);

	// Determine if any subscription is active
	const isActive = useMemo(
		() => subscriptionResults.some((result) => result.isActive),
		[subscriptionResults],
	);

	return {
		events: allEvents,
		isActive,
	};
}

export interface EventMonitorResult {
	events: EventData[];
	isLoading: boolean;
	addSubscription: (
		section: string,
		method: string,
		options?: EventSubscriptionOptions,
	) => void;
	removeSubscription: (section: string, method: string) => void;
	clearSubscriptions: () => void;
	isActive: boolean;
}

export function useEventMonitor(
	globalOptions?: EventSubscriptionOptions,
): EventMonitorResult {
	const [subscriptions, setSubscriptions] = useState<
		MultiEventSubscriptionConfig[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Add a subscription to monitor
	const addSubscription = useCallback(
		(section: string, method: string, options?: EventSubscriptionOptions) => {
			setSubscriptions((prev) => [...prev, { section, method, options }]);
		},
		[],
	);

	// Remove a subscription
	const removeSubscription = useCallback((section: string, method: string) => {
		setSubscriptions((prev) =>
			prev.filter((sub) => !(sub.section === section && sub.method === method)),
		);
	}, []);

	// Clear all subscriptions
	const clearSubscriptions = useCallback(() => {
		setSubscriptions([]);
	}, []);

	// Use our fixed multi-event subscribe hook with the dynamic subscriptions
	const { events, isActive } = useMultiEventSubscribe(
		subscriptions,
		globalOptions,
	);

	// Update loading state
	useEffect(() => {
		if (subscriptions.length > 0 && !isActive) {
			setIsLoading(true);
		} else {
			setIsLoading(false);
		}
	}, [subscriptions.length, isActive]);

	return {
		events,
		isLoading,
		addSubscription,
		removeSubscription,
		clearSubscriptions,
		isActive,
	};
}

export interface BlockWatcherOptions {
	type?: "finalized" | "best" | "both";
	limit?: number;
	onNewBlock?: (block: BlockInfo) => void;
}

export interface BlockWatcherResult {
	blocks: BlockInfo[];
	lastBlock: BlockInfo | null;
	isActive: boolean;
	error: Error | null;
}

export function useBlockWatcher(
	options: BlockWatcherOptions = {},
): BlockWatcherResult {
	const { type = "finalized", limit, onNewBlock } = options;
	const lastProcessedBlockRef = useRef<string | null>(null);

	const finalizedData = useFinalizedBlocks(limit);
	const bestData = useBestBlocks(limit);

	const blocks = useMemo(() => {
		if (type === "finalized") {
			return finalizedData.blocks;
		} else if (type === "best") {
			return bestData.blocks;
		} else {
			return [...bestData.blocks, ...finalizedData.blocks]
				.sort((a, b) => b.number - a.number)
				.filter(
					(block, index, self) =>
						index === self.findIndex((b) => b.hash === block.hash),
				)
				.slice(0, limit || undefined);
		}
	}, [type, bestData.blocks, finalizedData.blocks, limit]);

	const lastBlock = useMemo(
		() => (type === "best" ? bestData.lastBlock : finalizedData.lastBlock),
		[type, bestData.lastBlock, finalizedData.lastBlock],
	);

	const isActive = useMemo(
		() => (type === "best" ? bestData.isActive : finalizedData.isActive),
		[type, bestData.isActive, finalizedData.isActive],
	);

	const error = useMemo(
		() => (type === "best" ? bestData.error : finalizedData.error),
		[type, bestData.error, finalizedData.error],
	);

	useEffect(() => {
		if (
			lastBlock &&
			onNewBlock &&
			lastBlock.hash !== lastProcessedBlockRef.current
		) {
			lastProcessedBlockRef.current = lastBlock.hash;
			// The fix is here: we ensure the lastBlock is compatible with BlockInfo by adding the parent property
			onNewBlock({
				...lastBlock,
				parent: "", // Add empty parent property since it's required by our BlockInfo interface
			});
		}
	}, [lastBlock, onNewBlock]);

	return {
		blocks,
		lastBlock,
		isActive,
		error,
	};
}

export interface RuntimeVersion {
	specName?: string;
	implName?: string;
	specVersion?: number;
	implVersion?: number;
	transactionVersion?: number;
}

export interface RuntimeVersionResult {
	version: RuntimeVersion | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export function useRuntimeVersion(): RuntimeVersionResult {
	const { typedApi, connectionStatus } = useChainStore();
	const [version, setVersion] = useState<RuntimeVersion | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchVersion = useCallback(async () => {
		if (!typedApi || connectionStatus.state !== "connected") {
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Use type assertion to bypass TypeScript error
			// This is safe because we know the property will exist at runtime
			const api = typedApi as any;

			if (typeof api.constants?.System?.Version !== "function") {
				throw new Error("Runtime version method not available");
			}

			const systemVersion = await api.constants.System.Version();
			setVersion(systemVersion);
		} catch (err) {
			console.error("Error fetching runtime version:", err);
			setError(err instanceof Error ? err : new Error(String(err)));
		} finally {
			setIsLoading(false);
		}
	}, [typedApi, connectionStatus.state]);

	const { lastBlock } = useBlockWatcher({
		type: "finalized",
		limit: 1,
	});

	useEffect(() => {
		fetchVersion();
	}, [fetchVersion, lastBlock?.hash]);

	return {
		version,
		isLoading,
		error,
		refetch: fetchVersion,
	};
}
