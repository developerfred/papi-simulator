/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useChainStore } from "@/store/useChainStore";
import { useEvents, useEventSubscription } from "@/store/useEventStore";
import { useFinalizedBlocks, useBestBlocks } from "@/store/useBlockStore";

/**
 * Options for event subscription hooks
 */
interface EventSubscriptionOptions {
	enabled?: boolean;
	filter?: (event: any) => boolean;
	limit?: number;
}

/**
 * Hook to subscribe to a specific event type
 */
export function useEventSubscribe(
	section: string,
	method: string,
	options?: EventSubscriptionOptions,
) {
	const { enabled = true, filter } = options || {};
	const { connectionStatus } = useChainStore();
	const isConnected = connectionStatus.state === "connected";

	// Subscribe to the event
	const subscription = useEventSubscription(section, method, {
		enabled: enabled && isConnected,
	});

	// Get all events of this type
	const allEvents = useEvents({ section, method });

	// Apply filter if provided
	const events = filter
		? allEvents.filter((event) => filter(event.data))
		: allEvents;

	// Apply limit if provided
	const limitedEvents = options?.limit
		? events.slice(0, options.limit)
		: events;

	return {
		events: limitedEvents,
		subscription,
		latestEvent: events[0] || null,
		isActive: subscription?.active || false,
	};
}

/**
 * Hook to subscribe to multiple event types
 */
export function useMultiEventSubscribe(
	subscriptions: Array<{
		section: string;
		method: string;
		options?: EventSubscriptionOptions;
	}>,
	globalOptions?: Omit<EventSubscriptionOptions, "filter">,
) {
	const { enabled = true, limit } = globalOptions || {};
	const [allEvents, setAllEvents] = useState<any[]>([]);

	// Individual subscriptions
	const results = subscriptions.map(({ section, method, options }) =>
		useEventSubscribe(section, method, {
			...options,
			enabled: enabled && options?.enabled !== false,
		}),
	);

	// Combine events from all subscriptions
	useEffect(() => {
		const combinedEvents = results.flatMap((result) => result.events);

		// Sort by timestamp (newest first)
		const sortedEvents = combinedEvents.sort(
			(a, b) => b.timestamp - a.timestamp,
		);

		// Apply limit if provided
		const limitedEvents = limit ? sortedEvents.slice(0, limit) : sortedEvents;

		setAllEvents(limitedEvents);
	}, [results, limit]);

	return {
		events: allEvents,
		subscriptions: results,
		isActive: results.some((result) => result.isActive),
	};
}

/**
 * Hook for tracking blocks with advanced features
 */
export function useBlockWatcher(options?: {
	type?: "finalized" | "best" | "both";
	limit?: number;
	onNewBlock?: (block: any) => void;
}) {
	const { type = "finalized", limit, onNewBlock } = options || {};
	const [lastProcessedBlock, setLastProcessedBlock] = useState<string | null>(
		null,
	);

	// Subscribe to blocks based on type
	const finalized =
		type !== "best"
			? useFinalizedBlocks(limit)
			: { blocks: [], lastBlock: null };

	const best =
		type !== "finalized"
			? useBestBlocks(limit)
			: { blocks: [], lastBlock: null };

	// Combine blocks if watching both types
	const blocks =
		type === "both"
			? [...best.blocks, ...finalized.blocks]
					.sort((a, b) => b.number - a.number)
					.filter(
						(block, index, self) =>
							// Remove duplicates by hash
							index === self.findIndex((b) => b.hash === block.hash),
					)
					.slice(0, limit || undefined)
			: type === "best"
				? best.blocks
				: finalized.blocks;

	// Call onNewBlock when a new block is received
	useEffect(() => {
		const lastBlock = type === "best" ? best.lastBlock : finalized.lastBlock;

		if (lastBlock && onNewBlock && lastBlock.hash !== lastProcessedBlock) {
			setLastProcessedBlock(lastBlock.hash);
			onNewBlock(lastBlock);
		}
	}, [
		type,
		best.lastBlock,
		finalized.lastBlock,
		lastProcessedBlock,
		onNewBlock,
	]);

	return {
		blocks,
		lastBlock: type === "best" ? best.lastBlock : finalized.lastBlock,
		isActive: type === "best" ? best.isActive : finalized.isActive,
		error: type === "best" ? best.error : finalized.error,
	};
}

/**
 * Hook to get and monitor chain runtime version
 */
export function useRuntimeVersion() {
	const { typedApi, connectionStatus } = useChainStore();
	const [version, setVersion] = useState<{
		specName?: string;
		implName?: string;
		specVersion?: number;
		implVersion?: number;
		transactionVersion?: number;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Function to fetch runtime version
	const fetchVersion = useCallback(async () => {
		if (!typedApi || connectionStatus.state !== "connected") {
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Use System.Version constant if available
			const systemVersion = await typedApi.constants.System.Version();
			setVersion(systemVersion);
		} catch (err) {
			console.error("Error fetching runtime version:", err);
			setError(err instanceof Error ? err : new Error(String(err)));
		} finally {
			setIsLoading(false);
		}
	}, [typedApi, connectionStatus.state]);

	// Fetch on connection and on block changes to detect runtime upgrades
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
