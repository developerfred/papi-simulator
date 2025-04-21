import { useState, useEffect, useRef } from "react";
import { useTypedApi } from "@/store/useChainStore";

/**
 * Interface for blockchain events
 */
export interface EventData {
	id: string; // Unique ID for the event
	section: string; // Section (module) that emitted the event
	method: string; // Method name
	timestamp: number; // When the event was received
	data: unknown[]; // Event data (using unknown for type safety)
	blockNumber?: number; // Optional block number
	blockHash?: string; // Optional block hash
}

/**
 * Options for event subscription
 */
interface SubscriptionOptions {
	sections?: string[]; // Filter by sections
	methods?: string[]; // Filter by methods
	maxItems?: number; // Maximum number of events to keep
}

/**
 * Define an interface for the API events subscription
 */
interface ApiEventsSubscription {
	subscribe: (
		callback: (
			records: Array<{
				event: {
					section: string;
					method: string;
					data: {
						toArray: () => unknown[];
					};
				};
				blockNumber?: number;
				blockHash?: string;
			}>,
		) => void,
	) => {
		unsubscribe: () => void;
	};
}

/**
 * Define an interface for the TypedApi
 */
interface TypedApi {
	events?: ApiEventsSubscription;
}

/**
 * Hook to subscribe to chain events with proper cleanup and memory management
 */
export function useMultiEventSubscribe(options: SubscriptionOptions = {}) {
	const { api, loading: apiLoading } = useTypedApi() as {
		api: TypedApi | null;
		loading: boolean;
	};
	const [events, setEvents] = useState<EventData[]>([]);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Use refs to prevent dependency changes triggering re-subscriptions
	const optionsRef = useRef(options);
	const eventsRef = useRef<EventData[]>([]);
	const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

	// Update refs when options change (without triggering effect)
	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	// Update ref when events change (without triggering effect)
	useEffect(() => {
		eventsRef.current = events;
	}, [events]);

	// Setup subscription when API is ready
	useEffect(() => {
		// Don't proceed if API is not ready
		if (apiLoading || !api || !api.events) return;

		// Prevent multiple subscriptions
		if (subscriptionRef.current) return;

		let isMounted = true;

		const setupSubscription = async () => {
			try {
				setError(null);

				// Create subscription
				subscriptionRef.current = api.events.subscribe((records) => {
					if (!isMounted) return;

					const newEvents: EventData[] = [];

					// Process events
					records.forEach((record, index) => {
						const { section, method, data } = record.event;

						// Apply filters if specified
						if (
							(optionsRef.current.sections &&
								!optionsRef.current.sections.includes(section)) ||
							(optionsRef.current.methods &&
								!optionsRef.current.methods.includes(method))
						) {
							return;
						}

						// Create event object
						const eventData: EventData = {
							id: `${Date.now()}-${index}`,
							section,
							method,
							data: data.toArray(),
							timestamp: Date.now(),
							blockNumber: record.blockNumber,
							blockHash: record.blockHash,
						};

						newEvents.push(eventData);
					});

					if (newEvents.length === 0 || !isMounted) return;

					// Update events using functional update pattern to avoid stale state
					setEvents((currentEvents) => {
						const combined = [...newEvents, ...currentEvents];
						// Apply limit if specified
						return optionsRef.current.maxItems
							? combined.slice(0, optionsRef.current.maxItems)
							: combined;
					});
				});

				if (isMounted) {
					setIsSubscribed(true);
				}
			} catch (err) {
				console.error("Error subscribing to events:", err);
				if (isMounted) {
					setError(err instanceof Error ? err : new Error(String(err)));
					setIsSubscribed(false);
				}
			}
		};

		setupSubscription();

		// Cleanup subscription on unmount
		return () => {
			isMounted = false;

			if (subscriptionRef.current) {
				try {
					subscriptionRef.current.unsubscribe();
					subscriptionRef.current = null;
				} catch (err) {
					console.error("Error unsubscribing from events:", err);
				}
			}
		};
	}, [api, apiLoading]); // Only depend on API availability

	return {
		events,
		isSubscribed,
		error,
		clear: () => setEvents([]),
	};
}
