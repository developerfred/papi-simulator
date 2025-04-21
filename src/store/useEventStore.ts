/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useChainStore } from "./useChainStore";
import { useEffect, useState, useMemo, useRef } from "react";
import type { Subscription } from "rxjs";

export interface BlockchainEvent<T = unknown> {
	id: string;
	type: string;
	section: string;
	method: string;
	data: T;
	timestamp: number;
	blockHash: string;
	blockNumber: number;
}

export interface EventSubscription {
	id: string;
	section: string;
	method: string;
	active: boolean;
	lastEvent: BlockchainEvent | null;
	error: Error | null;
	createdAt: number;
}

interface EventState {
	subscriptions: Record<string, EventSubscription>;
	events: BlockchainEvent[];
	maxEvents: number;

	subscribe: (id: string, section: string, method: string) => void;
	unsubscribe: (id: string) => void;
	getSubscription: (id: string) => EventSubscription | null;
	getEvents: (filter?: {
		section?: string;
		method?: string;
	}) => BlockchainEvent[];
	clearEvents: () => void;
	setMaxEvents: (count: number) => void;
	addEvent: (event: BlockchainEvent) => void;
}

// Define interface for TypedApi
interface TypedApi {
	event: Record<string, Record<string, { watch: () => any }>>;
}

const DEFAULT_SUBSCRIPTION: Omit<
	EventSubscription,
	"id" | "section" | "method"
> = {
	active: false,
	lastEvent: null,
	error: null,
	createdAt: Date.now(),
};

export const useEventStore = create<EventState>()(
	devtools(
		(set, get) => ({
			subscriptions: {},
			events: [],
			maxEvents: 100,

			subscribe: (id: string, section: string, method: string) => {
				set((state) => ({
					subscriptions: {
						...state.subscriptions,
						[id]: {
							id,
							section,
							method,
							...DEFAULT_SUBSCRIPTION,
							active: true,
							createdAt: Date.now(),
						},
					},
				}));
			},

			unsubscribe: (id: string) => {
				set((state) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { [id]: _, ...remainingSubscriptions } = state.subscriptions;
					return { subscriptions: remainingSubscriptions };
				});
			},

			getSubscription: (id: string) => {
				return get().subscriptions[id] || null;
			},

			getEvents: (filter?: { section?: string; method?: string }) => {
				const events = get().events;

				if (!filter) return events;

				if (filter.section && filter.method) {
					return events.filter(
						(event) =>
							event.section === filter.section &&
							event.method === filter.method,
					);
				} else if (filter.section) {
					return events.filter((event) => event.section === filter.section);
				} else if (filter.method) {
					return events.filter((event) => event.method === filter.method);
				}

				return events;
			},

			clearEvents: () => {
				set({ events: [] });
			},

			setMaxEvents: (count: number) => {
				set({ maxEvents: count });
			},

			addEvent: (event: BlockchainEvent) => {
				set((state) => {
					const maxEvents = state.maxEvents;
					const updatedEvents = [
						event,
						...(state.maxEvents < state.events.length + 1
							? state.events.slice(0, maxEvents - 1)
							: state.events),
					];

					const subscriptionId = `${event.section}:${event.method}`;
					const subscription = state.subscriptions[subscriptionId];

					if (subscription) {
						return {
							events: updatedEvents,
							subscriptions: {
								...state.subscriptions,
								[subscriptionId]: {
									...subscription,
									lastEvent: event,
								},
							},
						};
					}

					return { events: updatedEvents };
				});
			},
		}),
		{ name: "event-store" },
	),
);

export function useEventSubscription(
	section: string,
	method: string,
	options?: { enabled?: boolean },
) {
	const { enabled = true } = options || {};

	const typedApi = useChainStore((state) => state.typedApi) as TypedApi | null;
	const subscriptionId = useMemo(
		() => `${section}:${method}`,
		[section, method],
	);

	const subscribe = useEventStore((state) => state.subscribe);
	const unsubscribe = useEventStore((state) => state.unsubscribe);
	const getSubscription = useEventStore((state) => state.getSubscription);
	const addEvent = useEventStore((state) => state.addEvent);

	const subscription = getSubscription(subscriptionId);

	const eventSubscriptionRef = useRef<Subscription | null>(null);

	useEffect(() => {
		if (!enabled || !typedApi) return;

		try {
			subscribe(subscriptionId, section, method);

			// Check if the section and method exist before trying to access them
			if (
				typedApi.event &&
				typedApi.event[section] &&
				typedApi.event[section][method] &&
				typeof typedApi.event[section][method].watch === "function"
			) {
				const watchObservable = typedApi.event[section][method].watch();

				eventSubscriptionRef.current = watchObservable.subscribe({
					next: (event: any) => {
						const blockchainEvent: BlockchainEvent = {
							id: `${event.meta.block.hash}:${section}:${method}`,
							type: "event",
							section,
							method,
							data: event.payload,
							timestamp: Date.now(),
							blockHash: event.meta.block.hash,
							blockNumber: event.meta.block.number,
						};

						addEvent(blockchainEvent);
					},
					error: (error: any) => {
						console.error(`Error in ${section}.${method} subscription:`, error);
					},
				});
			} else {
				console.error(`Event ${section}.${method} is not available in the API`);
			}
		} catch (error) {
			console.error(`Failed to subscribe to ${section}.${method}:`, error);
		}

		return () => {
			if (eventSubscriptionRef.current) {
				eventSubscriptionRef.current.unsubscribe();
				eventSubscriptionRef.current = null;
			}
			unsubscribe(subscriptionId);
		};
	}, [
		typedApi,
		section,
		method,
		enabled,
		subscribe,
		unsubscribe,
		addEvent,
		subscriptionId,
	]);

	return subscription;
}

export function useEvents(filter?: { section?: string; method?: string }) {
	const getEvents = useEventStore((state) => state.getEvents);
	const [events, setEvents] = useState<BlockchainEvent[]>([]);

	// Include filter in the dependency array to fix React Hook warning
	const memoizedFilter = useMemo(
		() => filter,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filter?.section, filter?.method, filter],
	);

	useEffect(() => {
		setEvents(getEvents(memoizedFilter));

		const unsubscribe = useEventStore.subscribe((state) => {
			const filteredEvents = memoizedFilter
				? state.events.filter((event) => {
						let match = true;
						if (memoizedFilter.section) {
							match = match && event.section === memoizedFilter.section;
						}
						if (memoizedFilter.method) {
							match = match && event.method === memoizedFilter.method;
						}
						return match;
					})
				: state.events;

			setEvents(filteredEvents);
		});

		return unsubscribe;
	}, [getEvents, memoizedFilter]);

	return useMemo(() => events, [events]);
}
