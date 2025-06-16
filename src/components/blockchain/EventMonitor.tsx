/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars */
// @ts-nocheck
"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui";
import { Activity, Pause, Play, Trash2, Eye, EyeOff, Filter, AlertCircle } from "lucide-react";
import type { ApiPromise } from "@polkadot/api";
import { buildSubscanUrl } from "@/lib/utils/explorer";

interface ChainEvent {
	id: string;
	section: string;
	method: string;
	data: any[];
	blockNumber: number;
	blockHash: string;
	timestamp: number;
	extrinsicIndex?: number;
	eventIndex: number;
	phase: string;
	topics?: string[];
}

interface Network {
	name: string;
	symbol: string;
	decimals: number;
	explorer: string;
}

interface EventMonitorProps {
	api: ApiPromise;
	network: Network;
	limit?: number;
	userAddress?: string;
}





const useEventMonitor = (api: ApiPromise, limit: number) => {
	const [events, setEvents] = useState<ChainEvent[]>([]);
	const [isActive, setIsActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const unsubscribeRef = useRef<(() => void) | null>(null);
	const isMountedRef = useRef(true);
	const processedBlocksRef = useRef(new Set<string>());

	
	const processBlockEvents = useCallback(async (header: any) => {
		if (!isMountedRef.current || !api) return;

		try {
			const blockHash = header.hash;
			const blockNumber = header.number.toNumber();
			const blockHashHex = blockHash.toHex();

			
			if (processedBlocksRef.current.has(blockHashHex)) {
				return;
			}
			processedBlocksRef.current.add(blockHashHex);

			
			const events = await api.query.system.events.at(blockHash);
			const timestamp = Date.now();

			const newEvents: ChainEvent[] = [];

			events.forEach((record, index) => {
				const { event, phase } = record;

				// Determina o tipo de phase
				let phaseType = 'Unknown';
				if (phase.isApplyExtrinsic) {
					phaseType = `Extrinsic ${phase.asApplyExtrinsic.toNumber()}`;
				} else if (phase.isFinalization) {
					phaseType = 'Finalization';
				} else if (phase.isInitialization) {
					phaseType = 'Initialization';
				}

				const chainEvent: ChainEvent = {
					id: `${blockHashHex}-${index}`,
					section: event.section,
					method: event.method,
					data: event.data.map((d: any) => {
						try {							
							if (d.toString) {
								return d.toString();
							}
							return JSON.stringify(d);
						} catch {
							return String(d);
						}
					}),
					blockNumber,
					blockHash: blockHashHex,
					timestamp,
					extrinsicIndex: phase.isApplyExtrinsic ? phase.asApplyExtrinsic.toNumber() : undefined,
					eventIndex: index,
					phase: phaseType,
					topics: record.topics?.map((t: any) => t.toString()) || []
				};

				newEvents.push(chainEvent);
			});

			if (newEvents.length > 0 && isMountedRef.current) {
				setEvents(prev => {
					const combined = [...newEvents, ...prev];
					return combined.slice(0, limit);
				});
			}

		} catch (error) {
			console.error('Erro ao processar eventos do bloco:', error);
			if (isMountedRef.current) {
				setError(`Erro ao processar eventos: ${error.message}`);
			}
		}
	}, [api, limit]);

	
	const startMonitoring = useCallback(async () => {
		if (!api || isActive) return;

		try {
			setIsActive(true);
			setIsLoading(true);
			setError(null);
			processedBlocksRef.current.clear();

			
			const latestHeader = await api.rpc.chain.getHeader();
			const latestNumber = latestHeader.number.toNumber();

			
			const promises = [];
			for (let i = 0; i < Math.min(5, latestNumber + 1); i++) {
				const blockNumber = latestNumber - i;
				if (blockNumber >= 0) {
					promises.push(
						api.rpc.chain.getBlockHash(blockNumber)
							.then(hash => api.rpc.chain.getHeader(hash))
							.then(header => processBlockEvents(header))
							.catch(err => console.warn(`Erro ao carregar bloco ${blockNumber}:`, err))
					);
				}
			}

			await Promise.allSettled(promises);

			
			const unsubscribe = await api.rpc.chain.subscribeNewHeads(processBlockEvents);
			unsubscribeRef.current = unsubscribe;

		} catch (error) {
			console.error('Erro ao iniciar monitoramento:', error);
			setError(`Erro ao iniciar monitoramento: ${error.message}`);
			setIsActive(false);
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [api, isActive, processBlockEvents]);

	
	const stopMonitoring = useCallback(() => {
		if (unsubscribeRef.current) {
			try {
				unsubscribeRef.current();
			} catch (error) {
				console.warn('Erro ao parar subscription:', error);
			}
			unsubscribeRef.current = null;
		}
		setIsActive(false);
		setIsLoading(false);
		processedBlocksRef.current.clear();
	}, []);

	
	const clearEvents = useCallback(() => {
		setEvents([]);
		setError(null);
		processedBlocksRef.current.clear();
	}, []);

	
	useEffect(() => {
		if (api && api.isReady && !isActive) {
			startMonitoring();
		}
	}, [api, startMonitoring, isActive]);

	// Cleanup
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			stopMonitoring();
		};
	}, [stopMonitoring]);

	return {
		events,
		isActive,
		isLoading,
		error,
		startMonitoring,
		stopMonitoring,
		clearEvents
	};
};


export default function EventMonitor({
	api,
	network,
	limit = 50,
	userAddress
}: EventMonitorProps) {
	const [filter, setFilter] = useState<string>("all");
	const [showData, setShowData] = useState(false);
	const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

	const {
		events,
		isActive,
		isLoading,
		error,
		startMonitoring,
		stopMonitoring,
		clearEvents
	} = useEventMonitor(api, limit);

	
	const sections = useMemo(() => {
		const sectionsSet = new Set<string>();
		events.forEach(event => {
			if (event?.section) {
				sectionsSet.add(event.section);
			}
		});
		return Array.from(sectionsSet).sort();
	}, [events]);

	
	const filteredEvents = useMemo(() => {
		if (!events?.length) return [];

		return events.filter(event => {
			if (!event) return false;

			
			if (filter !== "all" && event.section !== filter) {
				return false;
			}

			
			if (userAddress) {
				const eventDataStr = JSON.stringify(event.data).toLowerCase();
				if (!eventDataStr.includes(userAddress.toLowerCase())) {
					return false;
				}
			}

			return true;
		});
	}, [events, filter, userAddress]);

	const stats = useMemo(() => {
		const totalEvents = events.length;
		const uniqueSections = sections.length;
		const filteredCount = filteredEvents.length;
	
		const eventsBySection = events.reduce((acc, event) => {
			acc[event.section] = (acc[event.section] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return { totalEvents, uniqueSections, filteredCount, eventsBySection };
	}, [events, sections.length, filteredEvents.length]);

	
	const formatTimestamp = useCallback((timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}, []);

	const formatData = useCallback((data: any[]) => {
		if (!Array.isArray(data) || data.length === 0) return '-';

		if (!showData) {
			return `${data.length} item${data.length !== 1 ? 's' : ''}`;
		}

		return (
			<div className="space-y-1 max-w-xs">
				{data.slice(0, 3).map((item, index) => (
					<div key={index} className="text-xs bg-theme-surface-variant px-2 py-1 rounded break-all border border-theme">
						{String(item).length > 50 ? `${String(item).slice(0, 50)}...` : String(item)}
					</div>
				))}
				{data.length > 3 && (
					<div className="text-xs text-theme-tertiary">
						+{data.length - 3} more...
					</div>
				)}
			</div>
		);
	}, [showData]);

	
	const getSectionColor = useCallback((section: string): string => {
		const colors = {
			system: 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border-gray-200/70 dark:border-gray-600/70',
			balances: 'bg-green-100/80 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200/70 dark:border-green-600/70',
			staking: 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200/70 dark:border-blue-600/70',
			democracy: 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200/70 dark:border-purple-600/70',
			treasury: 'bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200/70 dark:border-yellow-600/70',
			sudo: 'bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200/70 dark:border-red-600/70',
			utility: 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200/70 dark:border-orange-600/70',
			scheduler: 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-600/70',
			xcmpQueue: 'bg-cyan-100/80 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border-cyan-200/70 dark:border-cyan-600/70',
			polkadotXcm: 'bg-pink-100/80 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 border-pink-200/70 dark:border-pink-600/70',
			parachainSystem: 'bg-teal-100/80 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border-teal-200/70 dark:border-teal-600/70',
		};
		return colors[section as keyof typeof colors] || 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/70 dark:border-slate-600/70';
	}, []);

	return (
		<Card className="overflow-hidden bg-theme-surface border-2 border-theme backdrop-blur-xl shadow-2xl network-transition">
			{/* Header */}
			<div className="p-6 border-b border-theme bg-theme-surface-variant/50 backdrop-blur-lg">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
					<div className="space-y-2">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 rounded-lg bg-network-primary flex items-center justify-center shadow-lg">
								<Activity className="w-5 h-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-theme-primary">
									Event Monitor
								</h2>
								<p className="text-sm text-theme-secondary">
									Real-time blockchain events on <span className="font-medium text-network-primary">{network.name}</span>
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-3">						
						<div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-theme-surface border border-theme backdrop-blur-sm">
							<div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-green-500 animate-pulse shadow-green-500/50 shadow-lg' : 'bg-gray-400'
								}`} />
							<span className="text-xs font-medium text-theme-secondary">
								{isActive ? 'Live' : 'Stopped'}
							</span>
							{isLoading && (
								<div className="w-3 h-3 border border-network-primary border-t-transparent rounded-full animate-spin" />
							)}
						</div>

						
						<Button
							onClick={isActive ? stopMonitoring : startMonitoring}
							variant={isActive ? 'outline' : 'primary'}
							size="sm"
							className="transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl network-transition"
							disabled={!api}
						>
							{isActive ? <Pause className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
							{isActive ? 'Stop' : 'Start'}
						</Button>

						<Button
							onClick={clearEvents}
							variant="outline"
							size="sm"
							disabled={events.length === 0}
							className="transition-all duration-300 hover:scale-105 active:scale-95 
									 hover:bg-red-50/80 dark:hover:bg-red-900/40
									 hover:text-red-500 hover:border-red-300/70 dark:hover:border-red-600/70
									 shadow-lg hover:shadow-xl network-transition"
						>
							<Trash2 className="w-3 h-3" />
						</Button>
					</div>
				</div>

				
				{events.length > 0 && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
						<div className="bg-theme-surface border border-theme rounded-lg p-3 network-transition hover:bg-theme-surface-variant hover:border-network-primary/60 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
							<div className="text-lg font-bold text-theme-primary group-hover:text-network-primary transition-colors duration-300">{stats.totalEvents}</div>
							<div className="text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">Total Events</div>
						</div>
						<div className="bg-blue-50/80 dark:bg-blue-900/40 border border-blue-200/70 dark:border-blue-600/70 rounded-lg p-3 network-transition hover:bg-blue-100/80 dark:hover:bg-blue-900/60 hover:border-blue-300/70 dark:hover:border-blue-500/70 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
							<div className="text-lg font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{stats.filteredCount}</div>
							<div className="text-xs text-blue-600/90 dark:text-blue-400/90 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">Filtered</div>
						</div>
						<div className="bg-purple-50/80 dark:bg-purple-900/40 border border-purple-200/70 dark:border-purple-600/70 rounded-lg p-3 network-transition hover:bg-purple-100/80 dark:hover:bg-purple-900/60 hover:border-purple-300/70 dark:hover:border-purple-500/70 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
							<div className="text-lg font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">{stats.uniqueSections}</div>
							<div className="text-xs text-purple-600/90 dark:text-purple-400/90 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">Sections</div>
						</div>
						<div className="bg-green-50/80 dark:bg-green-900/40 border border-green-200/70 dark:border-green-600/70 rounded-lg p-3 network-transition hover:bg-green-100/80 dark:hover:bg-green-900/60 hover:border-green-300/70 dark:hover:border-green-500/70 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
							<div className="text-lg font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
								{events.length > 0 ? (events.length / stats.uniqueSections || 1).toFixed(1) : '0'}
							</div>
							<div className="text-xs text-green-600/90 dark:text-green-400/90 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">Avg/Section</div>
						</div>
					</div>
				)}

				
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-3">
						
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							className="px-3 py-2 border border-theme rounded-lg text-sm bg-theme-surface text-theme-primary 
									 focus:ring-2 focus:ring-network-primary focus:border-network-primary
									 hover:border-network-primary/60 transition-all duration-300 shadow-sm hover:shadow-md"
						>
							<option value="all">All Sections ({events.length})</option>
							{sections.map(section => (
								<option key={section} value={section}>
									{section} ({stats.eventsBySection[section] || 0})
								</option>
							))}
						</select>

						
						<Button
							onClick={() => setShowData(!showData)}
							variant="outline"
							size="sm"
							className="flex items-center space-x-2 bg-theme-surface border-theme 
									 hover:bg-theme-surface-variant hover:border-network-primary
									 transition-all duration-300 shadow-sm hover:shadow-md network-transition"
						>
							{showData ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
							<span>{showData ? 'Hide' : 'Show'} Data</span>
						</Button>

						{filteredEvents.length !== events.length && (
							<Badge variant="outline" className="bg-network-light/50 dark:bg-network-primary/20 text-network-primary border-network-primary/30 
																 hover:bg-network-light/70 dark:hover:bg-network-primary/30 hover:border-network-primary/50
																 transition-all duration-300 shadow-sm hover:shadow-md network-transition">
								{filteredEvents.length} of {events.length} events
							</Badge>
						)}
					</div>

					{userAddress && (
						<div className="text-xs text-theme-secondary">
							Filtering by address: <code className="bg-theme-surface-variant px-2 py-1 rounded border border-theme font-mono">{userAddress.slice(0, 8)}...</code>
						</div>
					)}
				</div>
			</div>

			
			{error && (
				<div className="p-4 bg-red-50/80 dark:bg-red-900/40 border-b border-red-200/70 dark:border-red-600/70 backdrop-blur-sm">
					<div className="flex items-center space-x-2">
						<AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
						<span className="text-sm font-medium text-red-700 dark:text-red-300">Error</span>
					</div>
					<p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
				</div>
			)}

			
			<div className="max-h-[600px] overflow-y-auto">
				{filteredEvents.length === 0 ? (
					<div className="p-12 text-center">
						<div className="w-16 h-16 mx-auto mb-4 bg-theme-surface-variant rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
							{isLoading ? (
								<div className="w-6 h-6 border-2 border-network-primary border-t-transparent rounded-full animate-spin" />
							) : isActive ? (
								<Activity className="w-8 h-8 text-theme-tertiary animate-pulse" />
							) : (
								<Activity className="w-8 h-8 text-theme-tertiary" />
							)}
						</div>
						<div className="text-theme-primary font-medium mb-2">
							{isLoading ? 'Loading events...' : isActive ? 'Listening for events...' : 'Event monitoring stopped'}
						</div>
						<div className="text-sm text-theme-secondary">
							{isLoading ? 'Fetching recent events from the blockchain' :
								isActive ? 'New events will appear here automatically' :
									'Click start to begin monitoring blockchain events'}
						</div>
						{filter !== 'all' && (
							<div className="text-xs text-theme-tertiary mt-2">
								Currently filtering by: <strong className="text-network-primary">{filter}</strong>
							</div>
						)}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[800px]">
							<thead className="sticky top-0 bg-theme-surface-variant/90 border-b border-theme backdrop-blur-lg">
								<tr>
									<th className="p-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
										Section
									</th>
									<th className="p-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
										Method
									</th>
									<th className="p-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
										Data
									</th>
									<th className="p-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
										Block
									</th>
									<th className="p-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
										Phase
									</th>
									<th className="p-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
										Time
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-theme/50">
								{filteredEvents.map((event, index) => (
									<tr
										key={event.id}
										className="hover:bg-theme-surface-variant/50 transition-all duration-300 network-transition group cursor-pointer"
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<td className="p-3">
											<Badge
												variant="outline"
												size="sm"
												className={`${getSectionColor(event.section)} border font-medium shadow-sm 
														   group-hover:shadow-md transition-all duration-300 hover:scale-105`}
											>
												{event.section}
											</Badge>
										</td>
										<td className="p-3">
											<span className="font-medium text-theme-primary text-sm group-hover:text-network-primary transition-colors duration-300">
												{event.method}
											</span>
										</td>
										<td className="p-3">
											<div className="font-mono text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
												{formatData(event.data)}
											</div>
										</td>
										<td className="p-3">
											<Badge variant="outline" size="sm" className="bg-blue-50/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-600/70 
																						  hover:bg-blue-100/80 dark:hover:bg-blue-900/60 hover:border-blue-300/70 dark:hover:border-blue-500/70
																						  transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md cursor-pointer">
												<a
													href={buildSubscanUrl(network, 'block', event.blockNumber)}
													target="_blank"
													rel="noopener noreferrer"
													className="text-inherit hover:text-inherit"
												>
													#{event.blockNumber}
												</a>
											</Badge>
										</td>
										<td className="p-3">
											<span className="text-xs text-theme-secondary bg-theme-surface-variant px-2 py-1 rounded border border-theme
																		  group-hover:bg-theme-surface group-hover:text-theme-primary group-hover:border-network-primary/50
																		  transition-all duration-300 shadow-sm hover:shadow-md">
												{event.phase}
											</span>
										</td>
										<td className="p-3">
											<span className="text-xs text-theme-tertiary group-hover:text-theme-secondary transition-colors duration-300">
												{formatTimestamp(event.timestamp)}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{events.length >= limit && (
				<div className="p-4 border-t border-theme bg-theme-surface-variant/50 text-center backdrop-blur-sm">
					<span className="text-sm text-theme-secondary">
						Showing latest <strong className="text-theme-primary">{limit}</strong> events • <strong className="text-network-primary">{events.length - filteredEvents.length}</strong> filtered out
					</span>
				</div>
			)}
		</Card>
	);
}