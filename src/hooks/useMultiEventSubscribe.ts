import { useState, useEffect, useRef } from "react";
import { useTypedApi } from "@/store/useChainStore";

/**
 * Interface for blockchain events
 */
export interface EventData {
	id: string;
	section: string;
	method: string;
	timestamp: number;
	data: unknown[];
	blockNumber?: number;
	blockHash?: string;
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

interface TypedApi {
	events?: ApiEventsSubscription;
}

export function useMultiEventSubscribe(options: SubscriptionOptions = {}) {
	const { api, loading: apiLoading } = useTypedApi() as {
		api: TypedApi | null;
		loading: boolean;
	};
	const [events, setEvents] = useState<EventData[]>([]);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const optionsRef = useRef(options);
	const eventsRef = useRef<EventData[]>([]);
	const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	useEffect(() => {
		eventsRef.current = events;
	}, [events]);

	useEffect(() => {
		if (apiLoading || !api || !api.events) return;

		if (subscriptionRef.current) return;

		let isMounted = true;

		const setupSubscription = async () => {
			try {
				setError(null);

				// Create subscription
				// We've already checked that api.events exists above, but TypeScript
				// needs an additional check here to be certain
				const apiEvents = api.events;
				if (!apiEvents) {
					throw new Error("API events not available");
				}

				subscriptionRef.current = apiEvents.subscribe((records) => {
					if (!isMounted) return;

					const newEvents: EventData[] = [];

					records.forEach((record, index) => {
						const { section, method, data } = record.event;

						if (
							(optionsRef.current.sections &&
								!optionsRef.current.sections.includes(section)) ||
							(optionsRef.current.methods &&
								!optionsRef.current.methods.includes(method))
						) {
							return;
						}

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

					setEvents((currentEvents) => {
						const combined = [...newEvents, ...currentEvents];
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
	}, [api, apiLoading]);

	return {
		events,
		isSubscribed,
		error,
		clear: () => setEvents([]),
	};
}
