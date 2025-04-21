/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	useMultiEventSubscribe,
	type EventData,
} from "@/hooks/useMultiEventSubscribe";
import { useConnectionStatus } from "@/store/useChainStore";
import Card from "@/components/ui/Card";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import type { Network } from "@/lib/types/network";

interface EventMonitorProps {
	network: Network;
	limit?: number;
}

export default function EventMonitor({
	network,
	limit = 10,
}: EventMonitorProps) {
	const [displayEvents, setDisplayEvents] = useState<EventData[]>([]);
	const [filter, setFilter] = useState<string>("all");
	const [sections, setSections] = useState<Set<string>>(new Set());

	const connectionStatus = useConnectionStatus();
	const isConnected = connectionStatus.state === "connected";

	const { events, isSubscribed, error, clear } = useMultiEventSubscribe({
		maxItems: limit * 2,
	});

	useEffect(() => {
		if (!events.length) return;
		const newSections = new Set<string>();
		events.forEach((event) => newSections.add(event.section));
		setSections(newSections);
	}, [events]);

	useEffect(() => {
		const filtered = events.filter(
			(event) => filter === "all" || event.section === filter,
		);
		setDisplayEvents(filtered.slice(0, limit));
	}, [events, filter, limit]);

	const handleClear = useCallback(() => {
		clear();
	}, [clear]);

	const renderSectionBadges = () => {
		const badges = [
			<Badge
				key="all"
				variant={filter === "all" ? "default" : "info"}
				// @ts-ignore
				onClick={() => setFilter("all")}
			>
				All
			</Badge>,
		];

		// biome-ignore lint/complexity/noForEach: <explanation>
		Array.from(sections)
			.sort()
			.forEach((section) => {
				badges.push(
					<Badge
						key={section}
						variant={filter === section ? "primary" : "default"}
						// @ts-ignore
						onClick={() => setFilter(section)}
					>
						{section}
					</Badge>,
				);
			});

		return badges;
	};

	// Helper function to get subscription badge variant
	const getSubscriptionBadgeVariant = (): BadgeVariant => {
		if (isSubscribed) return "success";
		return "warning";
	};

	return (
		<Card>
			<div className="p-4 border-b">
				<div className="flex justify-between items-center">
					<h2 className="font-semibold text-lg">Event Monitor</h2>
					<div className="flex items-center gap-2">
						<Badge variant={getSubscriptionBadgeVariant()}>
							{isSubscribed ? "Subscribed" : "Not Subscribed"}
						</Badge>
						{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
						<button
							onClick={handleClear}
							className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
						>
							Clear
						</button>
					</div>
				</div>
				{sections.size > 0 && (
					<div className="flex flex-wrap gap-2 mt-3">
						{renderSectionBadges()}
					</div>
				)}
			</div>

			{error instanceof Error && (
				<div className="p-4 bg-red-50 text-red-700 border-b">
					Error: {error.message}
				</div>
			)}

			<div className="overflow-auto max-h-80">
				{isConnected ? (
					displayEvents.length > 0 ? (
						<table className="w-full">
							<thead>
								<tr className="bg-gray-50">
									<th className="p-2 text-left font-medium text-gray-500 text-sm">
										Section
									</th>
									<th className="p-2 text-left font-medium text-gray-500 text-sm">
										Method
									</th>
									<th className="p-2 text-left font-medium text-gray-500 text-sm">
										Data
									</th>
									<th className="p-2 text-left font-medium text-gray-500 text-sm">
										Block
									</th>
								</tr>
							</thead>
							<tbody>
								{displayEvents.map((event) => (
									<tr key={event.id} className="border-t hover:bg-gray-50">
										<td className="p-2 font-medium">{event.section}</td>
										<td className="p-2">{event.method}</td>
										<td className="p-2 font-mono text-xs">
											{event.data.map((d, i) => (
												<div key={i} className="truncate max-w-xs">
													{JSON.stringify(d)}
												</div>
											))}
										</td>
										<td className="p-2 text-sm text-gray-500">
											{event.blockNumber ? `#${event.blockNumber}` : "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className="p-8 text-center text-gray-500">
							No events received yet. Events will appear here as they occur on
							the blockchain.
						</div>
					)
				) : (
					<div className="p-8 text-center text-gray-500">
						Connect to the blockchain to start monitoring events.
					</div>
				)}
			</div>
		</Card>
	);
}
