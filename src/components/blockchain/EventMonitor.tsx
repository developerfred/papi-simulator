/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState,  useCallback, useMemo } from "react";
import {
	useMultiEventSubscribe,	
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
	const [filter, setFilter] = useState<string>("all");

	const connectionStatus = useConnectionStatus();
	const isConnected = connectionStatus?.state === "connected";

	const { events, isSubscribed, error, clear } = useMultiEventSubscribe({
		maxItems: limit * 2,
		network, // Passar network para o hook se necessário
	});

	// Memoizar sections para evitar recálculos desnecessários
	const sections = useMemo(() => {
		if (!events?.length) return new Set<string>();
		const newSections = new Set<string>();
		events.forEach((event) => {
			if (event?.section) {
				newSections.add(event.section);
			}
		});
		return newSections;
	}, [events]);

	// Memoizar eventos filtrados
	const displayEvents = useMemo(() => {
		if (!events?.length) return [];

		const filtered = events.filter((event) => {
			if (!event) return false;
			return filter === "all" || event.section === filter;
		});

		return filtered.slice(0, limit);
	}, [events, filter, limit]);

	const handleClear = useCallback(() => {
		if (clear) {
			clear();
		}
	}, [clear]);

	const handleFilterChange = useCallback((newFilter: string) => {
		setFilter(newFilter);
	}, []);

	// Memoizar badges para evitar re-renderizações
	const sectionBadges = useMemo(() => {
		const badges = [
			<Badge
				key="all"
				variant={filter === "all" ? "default" : "info"}
				onClick={() => handleFilterChange("all")}
				className="cursor-pointer"
			>
				All ({events?.length || 0})
			</Badge>,
		];

		const sortedSections = Array.from(sections).sort();

		sortedSections.forEach((section) => {
			const sectionCount = events?.filter(e => e?.section === section).length || 0;
			badges.push(
				<Badge
					key={section}
					variant={filter === section ? "primary" : "default"}
					onClick={() => handleFilterChange(section)}
					className="cursor-pointer"
				>
					{section} ({sectionCount})
				</Badge>
			);
		});

		return badges;
	}, [sections, filter, events, handleFilterChange]);

	// Helper function para obter variant do badge de subscription
	const getSubscriptionBadgeVariant = useCallback((): BadgeVariant => {
		if (isSubscribed) return "success";
		return "warning";
	}, [isSubscribed]);

	// Helper function para renderizar dados do evento de forma segura
	const renderEventData = useCallback((data: any[]) => {
		if (!Array.isArray(data)) return <span>Invalid data</span>;

		return data.map((d, i) => (
			<div key={i} className="truncate max-w-xs" title={JSON.stringify(d)}>
				{typeof d === 'object' ? JSON.stringify(d) : String(d)}
			</div>
		));
	}, []);

	return (
		<Card>
			<div className="p-4 border-b">
				<div className="flex justify-between items-center mb-2">
					<h2 className="font-semibold text-lg">
						Event Monitor - {network?.name || 'Unknown Network'}
					</h2>
					<div className="flex items-center gap-2">
						<Badge variant={getSubscriptionBadgeVariant()}>
							{isSubscribed ? "Subscribed" : "Not Subscribed"}
						</Badge>
						<button
							type="button"
							onClick={handleClear}
							disabled={!events?.length}
							className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors"
						>
							Clear ({events?.length || 0})
						</button>
					</div>
				</div>

				{/* Status adicional */}
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<span>Connection: {isConnected ? "✅ Connected" : "❌ Disconnected"}</span>
					<span>•</span>
					<span>Events: {displayEvents.length}/{events?.length || 0}</span>
				</div>

				{sections.size > 0 && (
					<div className="flex flex-wrap gap-2 mt-3">
						{sectionBadges}
					</div>
				)}
			</div>

			{/* Error handling melhorado */}
			{error && (
				<div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
					<div className="font-medium">Error occurred:</div>
					<div className="text-sm mt-1">
						{error instanceof Error ? error.message : String(error)}
					</div>
				</div>
			)}

			<div className="overflow-auto max-h-80">
				{!isConnected ? (
					<div className="p-8 text-center text-gray-500">
						<div className="text-lg mb-2">🔌</div>
						<div>Connect to the blockchain to start monitoring events.</div>
						<div className="text-sm mt-2 text-gray-400">
							Network: {network?.name || 'Not selected'}
						</div>
					</div>
				) : displayEvents.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[600px]">
							<thead className="sticky top-0 bg-gray-50">
								<tr>
									<th className="p-3 text-left font-medium text-gray-700 text-sm border-b">
										Section
									</th>
									<th className="p-3 text-left font-medium text-gray-700 text-sm border-b">
										Method
									</th>
									<th className="p-3 text-left font-medium text-gray-700 text-sm border-b">
										Data
									</th>
									<th className="p-3 text-left font-medium text-gray-700 text-sm border-b">
										Block
									</th>
									<th className="p-3 text-left font-medium text-gray-700 text-sm border-b">
										Time
									</th>
								</tr>
							</thead>
							<tbody>
								{displayEvents.map((event, index) => (
									<tr
										key={event?.id || `event-${index}`}
										className="border-t hover:bg-gray-50 transition-colors"
									>
										<td className="p-3">
											<Badge variant="outline" size="sm">
												{event?.section || 'Unknown'}
											</Badge>
										</td>
										<td className="p-3 font-medium">
											{event?.method || 'Unknown'}
										</td>
										<td className="p-3 font-mono text-xs">
											{event?.data ? renderEventData(event.data) : '-'}
										</td>
										<td className="p-3 text-sm text-gray-600">
											{event?.blockNumber ? (
												<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
													#{event.blockNumber}
												</span>
											) : (
												<span className="text-gray-400">-</span>
											)}
										</td>
										<td className="p-3 text-xs text-gray-500">
											{event?.timestamp ? (
												new Date(event.timestamp).toLocaleTimeString()
											) : (
												<span className="text-gray-400">-</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="p-8 text-center text-gray-500">
						<div className="text-4xl mb-4">📡</div>
						<div className="font-medium mb-2">Listening for events...</div>
						<div className="text-sm">
							Events will appear here as they occur on the blockchain.
						</div>
						{filter !== "all" && (
							<div className="text-xs mt-2 text-gray-400">
								Currently filtering by: <strong>{filter}</strong>
							</div>
						)}
					</div>
				)}
			</div>
		</Card>
	);
}