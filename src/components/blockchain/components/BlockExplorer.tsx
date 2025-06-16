/* eslint-disable react/display-name, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck
"use client";

import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { Button } from "@/components/ui";
import { formatDistance } from "date-fns";
import { ExternalLink, Clock, Hash, Layers, Activity, Play, Pause, Trash2 } from "lucide-react";
import type { ApiPromise } from "@polkadot/api";
import { buildSubscanUrl } from "@/lib/utils/explorer";


interface UnifiedBlockInfo {
	hash: string;
	number: number;
	timestamp: number;
	parentHash?: string;
	extrinsicsCount?: number;
	eventsCount?: number;
	size?: number;
}

interface Network {
	name: string;
	symbol: string;
	decimals: number;
	explorer: string;
}

interface BlockExplorerProps {
	api: ApiPromise;
	network: Network;
	limit?: number;
}

type TabType = "finalized" | "best";


const TABS = [
	{ key: "finalized" as const, label: "Finalized", icon: Layers },
	{ key: "best" as const, label: "Best", icon: Hash }
] as const;



const useTimeFormatter = () => {
	const cacheRef = useRef<Map<number, string>>(new Map());
	const lastUpdateRef = useRef<number>(0);

	return useCallback((timestamp: number): string => {
		const now = Date.now();

		if (now - lastUpdateRef.current > 1000) {
			cacheRef.current.clear();
			lastUpdateRef.current = now;
		}

		const cached = cacheRef.current.get(timestamp);
		if (cached) return cached;

		try {
			const formatted = formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
			cacheRef.current.set(timestamp, formatted);
			return formatted;
		} catch {
			return "Unknown";
		}
	}, []);
};

const useHashFormatter = () =>
	useCallback((hash: string): string =>
		`${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`,
		[]
	);


const useBlockMonitor = (api: ApiPromise, type: TabType, limit: number) => {
	const [blocks, setBlocks] = useState<UnifiedBlockInfo[]>([]);
	const [isActive, setIsActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const unsubscribeRef = useRef<(() => void) | null>(null);
	const isMountedRef = useRef(true);
	const processedBlocksRef = useRef(new Set<string>());

	
	const processBlockInfo = useCallback(async (header: any) => {
		if (!isMountedRef.current || !api) return;

		try {
			const blockHash = header.hash;
			const blockNumber = header.number.toNumber();
			const blockHashHex = blockHash.toHex();

			
			if (processedBlocksRef.current.has(blockHashHex)) {
				return;
			}
			processedBlocksRef.current.add(blockHashHex);

			const [block, events] = await Promise.all([
				api.rpc.chain.getBlock(blockHash),
				api.query.system?.events?.at ? api.query.system.events.at(blockHash) : Promise.resolve([])
			]);

			const extrinsicsCount = block.block.extrinsics.length;
			const eventsCount = Array.isArray(events) ? events.length : 0;
			const blockSize = JSON.stringify(block.toJSON()).length;

			const blockInfo: UnifiedBlockInfo = {
				hash: blockHashHex,
				number: blockNumber,
				timestamp: Date.now(),
				parentHash: header.parentHash.toHex(),
				extrinsicsCount,
				eventsCount,
				size: blockSize
			};

			if (isMountedRef.current) {
				setBlocks(prev => {
					const newBlocks = [blockInfo, ...prev];
					const uniqueBlocks = newBlocks.filter((block, index, arr) =>
						arr.findIndex(b => b.hash === block.hash) === index
					);
					return uniqueBlocks.slice(0, limit);
				});
			}
		} catch (error) {
			console.error('Erro ao processar bloco:', error);
			if (isMountedRef.current) {
				setError(`Erro ao processar bloco: ${error.message}`);
			}
		}
	}, [api, limit]);

	
	const loadInitialBlocks = useCallback(async () => {
		if (!api || !isMountedRef.current) return;

		setIsLoading(true);
		try {
			const lastHeader = type === "finalized"
				? await api.rpc.chain.getFinalizedHead().then(hash => api.rpc.chain.getHeader(hash))
				: await api.rpc.chain.getHeader();

			if (lastHeader && isMountedRef.current) {
				const promises = [];
				const batchSize = 3; 

				for (let i = 0; i < Math.min(batchSize, lastHeader.number.toNumber() + 1); i++) {
					const blockNumber = lastHeader.number.toNumber() - i;
					if (blockNumber >= 0) {
						promises.push(
							api.rpc.chain.getBlockHash(blockNumber)
								.then(hash => api.rpc.chain.getHeader(hash))
								.then(header => processBlockInfo(header))
								.catch(err => console.warn(`Erro ao carregar bloco ${blockNumber}:`, err))
						);
					}
				}

				await Promise.allSettled(promises);
			}
		} catch (error) {
			console.error('Erro ao carregar blocos iniciais:', error);
			setError(`Erro ao carregar blocos iniciais: ${error.message}`);
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [api, type, processBlockInfo]);

	
	const startMonitoring = useCallback(async () => {
		if (!api || isActive) return;

		try {
			setIsActive(true);
			setError(null);
			processedBlocksRef.current.clear();

			
			await loadInitialBlocks();

			if (!isMountedRef.current) return;

	
			const unsubscribe = type === "finalized"
				? await api.rpc.chain.subscribeFinalizedHeads(processBlockInfo)
				: await api.rpc.chain.subscribeNewHeads(processBlockInfo);

			unsubscribeRef.current = unsubscribe;

		} catch (error) {
			console.error('Erro ao iniciar monitoramento:', error);
			setError(`Erro ao iniciar monitoramento: ${error.message}`);
			setIsActive(false);
		}
	}, [api, type, isActive, loadInitialBlocks, processBlockInfo]);

	
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

	
	const clearBlocks = useCallback(() => {
		setBlocks([]);
		setError(null);
		processedBlocksRef.current.clear();
	}, []);

	
	useEffect(() => {
		if (api && api.isReady && !isActive) {
			startMonitoring();
		}
	}, [api, startMonitoring, isActive]);

	
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			stopMonitoring();
		};
	}, [stopMonitoring]);

	return {
		blocks,
		isActive,
		isLoading,
		error,
		startMonitoring,
		stopMonitoring,
		clearBlocks
	};
};

// UI Components
const TabButton = memo<{
	active: boolean;
	onClick: () => void;
	tab: typeof TABS[number];
}>(({ active, onClick, tab }) => {
	const { icon: Icon, label } = tab;

	return (
		<button
			onClick={onClick}
			className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 
					   flex items-center space-x-2 font-medium shadow-sm hover:shadow-md network-transition
					   ${active
					? 'bg-network-primary text-white border border-network-primary shadow-lg'
					: 'bg-theme-surface text-theme-secondary border border-theme hover:bg-theme-surface-variant hover:border-network-primary/50'
				}`}
		>
			<Icon className="w-3 h-3" />
			<span>{label}</span>
		</button>
	);
});

const StatusIndicator = memo<{
	isActive: boolean;
	isLoading: boolean;
}>(({ isActive, isLoading }) => (
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
));

const StatsCard = memo<{
	value: string | number;
	label: string;
	color: 'primary' | 'blue' | 'purple' | 'green';
}>(({ value, label, color }) => {
	const colorClasses = {
		primary: 'bg-theme-surface border-theme text-theme-primary hover:bg-theme-surface-variant hover:border-network-primary/60',
		blue: 'bg-blue-50/80 dark:bg-blue-900/40 border-blue-200/70 dark:border-blue-600/70 text-blue-600 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 hover:border-blue-300/70 dark:hover:border-blue-500/70',
		purple: 'bg-purple-50/80 dark:bg-purple-900/40 border-purple-200/70 dark:border-purple-600/70 text-purple-600 dark:text-purple-400 hover:bg-purple-100/80 dark:hover:bg-purple-900/60 hover:border-purple-300/70 dark:hover:border-purple-500/70',
		green: 'bg-green-50/80 dark:bg-green-900/40 border-green-200/70 dark:border-green-600/70 text-green-600 dark:text-green-400 hover:bg-green-100/80 dark:hover:bg-green-900/60 hover:border-green-300/70 dark:hover:border-green-500/70'
	};

	return (
		<div className={`rounded-lg p-3 network-transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group border ${colorClasses[color]}`}>
			<div className="text-lg font-bold group-hover:scale-110 transition-transform duration-300">{value}</div>
			<div className="text-xs opacity-90">{label}</div>
		</div>
	);
});

const BlockRow = memo<{
	block: UnifiedBlockInfo;
	network: Network;
}>(({ block, network }) => {
	const formatTime = useTimeFormatter();
	const formatHash = useHashFormatter();

	const computedValues = useMemo(() => ({
		formattedTime: formatTime(block.timestamp),
		shortHash: formatHash(block.hash),
		formattedNumber: block.number.toLocaleString(),
		explorerUrl: buildSubscanUrl(network, 'block', block.number),
		size: block.size ? `${(block.size / 1024).toFixed(1)}KB` : null,
	}), [block, network, formatTime, formatHash]);

	return (
		<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg 
					   bg-theme-surface-variant/50 border border-theme backdrop-blur-sm
					   transition-all duration-300 hover:bg-theme-surface-variant hover:border-network-primary/50 
					   hover:shadow-lg hover:-translate-y-0.5 network-transition group cursor-pointer
					   space-y-3 sm:space-y-0">

			<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
				<Badge variant="outline" className="font-mono text-sm w-fit bg-theme-surface border-theme
													group-hover:bg-network-primary/10 group-hover:border-network-primary/50
													transition-all duration-300 shadow-sm hover:shadow-md">
					#{computedValues.formattedNumber}
				</Badge>

				<div className="flex items-center space-x-2">
					<Hash className="w-3 h-3 text-theme-secondary group-hover:text-theme-primary transition-colors duration-300" />
					<span
						className="font-mono text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-300"
						title={block.hash}
					>
						{computedValues.shortHash}
					</span>
				</div>

				<div className="flex items-center space-x-4 text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
					{block.extrinsicsCount !== undefined && (
						<span>
							<strong className="text-theme-primary group-hover:text-network-primary transition-colors duration-300">
								{block.extrinsicsCount}
							</strong> txs
						</span>
					)}
					{block.eventsCount !== undefined && (
						<span>
							<strong className="text-theme-primary group-hover:text-network-primary transition-colors duration-300">
								{block.eventsCount}
							</strong> events
						</span>
					)}
					{computedValues.size && (
						<span>{computedValues.size}</span>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between sm:justify-end space-x-4">
				<div className="flex items-center space-x-2">
					<Clock className="w-3 h-3 text-theme-secondary group-hover:text-theme-primary transition-colors duration-300" />
					<span className="text-xs whitespace-nowrap text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
						{computedValues.formattedTime}
					</span>
				</div>

				<a
					href={computedValues.explorerUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-lg bg-network-primary/10 text-network-primary border border-network-primary/30
							 hover:bg-network-primary/20 hover:border-network-primary/50 hover:scale-110 active:scale-95
							 transition-all duration-300 shadow-sm hover:shadow-md group/link"
					title="View in explorer"
				>
					<ExternalLink className="w-3 h-3 group-hover/link:rotate-12 transition-transform duration-300" />
				</a>
			</div>
		</div>
	);
}, (prevProps, nextProps) => (
	prevProps.block.hash === nextProps.block.hash &&
	prevProps.block.number === nextProps.block.number &&
	prevProps.block.timestamp === nextProps.block.timestamp
));

const EmptyState = memo<{
	isActive: boolean;
	isLoading: boolean;
}>(({ isActive, isLoading }) => (
	<div className="p-12 text-center">
		<div className="w-16 h-16 mx-auto mb-4 bg-theme-surface-variant rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
			{isLoading ? (
				<div className="w-6 h-6 border-2 border-network-primary border-t-transparent rounded-full animate-spin" />
			) : isActive ? (
				<Activity className="w-8 h-8 text-theme-tertiary animate-pulse" />
			) : (
				<Layers className="w-8 h-8 text-theme-tertiary" />
			)}
		</div>
		<div className="text-theme-primary font-medium mb-2">
			{isLoading ? 'Loading blocks...' : isActive ? 'Waiting for new blocks...' : 'Block monitoring stopped'}
		</div>
		<div className="text-sm text-theme-secondary">
			{isLoading ? 'Fetching initial blocks from the blockchain' :
				isActive ? 'New blocks will appear here automatically' :
					'Click start to begin monitoring blocks'}
		</div>
	</div>
));

const VirtualizedBlockList = memo<{
	blocks: UnifiedBlockInfo[];
	network: Network;
	isActive: boolean;
	isLoading: boolean;
}>(({ blocks, network, isActive, isLoading }) => {
	const containerRef = useRef<HTMLDivElement>(null);

	const blockElements = useMemo(() =>
		blocks.map((block) => (
			<div key={`${block.hash}-${block.number}`} className="mb-3">
				<BlockRow block={block} network={network} />
			</div>
		)),
		[blocks, network]
	);

	if (blocks.length === 0) {
		return <EmptyState isActive={isActive} isLoading={isLoading} />;
	}

	return (
		<div
			ref={containerRef}
			className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2"
		>
			{blockElements}
		</div>
	);
});

const ExplorerLink = memo<{
	network: Network;
	blocksCount: number;
	isLoading?: boolean;
}>(({ network, blocksCount, isLoading = false }) => {
	if (blocksCount === 0 && !isLoading) return null;

	const blocksUrl = buildSubscanUrl(network, 'block', '').replace('/block/', '/blocks');

	return (
		<div className="mt-6 pt-4 border-t border-theme transition-opacity duration-300">
			<a
				href={blocksUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center space-x-2 text-sm text-network-primary 
						 hover:underline transition-all duration-200 hover:scale-105 group"
			>
				<span>View more blocks in {network.name} explorer</span>
				<ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
			</a>
		</div>
	);
});


export default memo(function BlockExplorer({
	api,
	network,
	limit = 10,
}: BlockExplorerProps) {
	const [activeTab, setActiveTab] = useState<TabType>("finalized");
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const {
		blocks,
		isActive,
		isLoading,
		error,
		startMonitoring,
		stopMonitoring,
		clearBlocks
	} = useBlockMonitor(api, activeTab, Math.min(limit, 50));

	
	const handleTabChange = useCallback((tab: TabType) => {
		if (!mountedRef.current || tab === activeTab) return;
		setActiveTab(tab);
		clearBlocks();
	}, [activeTab, clearBlocks]);

	
	const tabButtons = useMemo(() =>
		TABS.map((tab) => (
			<TabButton
				key={tab.key}
				active={activeTab === tab.key}
				onClick={() => handleTabChange(tab.key)}
				tab={tab}
			/>
		)),
		[activeTab, handleTabChange]
	);

	
	const stats = useMemo(() => {
		const totalBlocks = blocks.length;
		const totalTxs = blocks.reduce((sum, block) => sum + (block.extrinsicsCount || 0), 0);
		const totalEvents = blocks.reduce((sum, block) => sum + (block.eventsCount || 0), 0);
		const avgTxsPerBlock = totalBlocks > 0 ? (totalTxs / totalBlocks).toFixed(1) : '0';

		return { totalBlocks, totalTxs, totalEvents, avgTxsPerBlock };
	}, [blocks]);

	return (
		<Card className="overflow-hidden bg-theme-surface border-2 border-theme backdrop-blur-xl shadow-2xl network-transition">
			{/* Header */}
			<div className="p-6 border-b border-theme bg-theme-surface-variant/50 backdrop-blur-lg">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
					<div className="space-y-2">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 rounded-lg bg-network-primary flex items-center justify-center shadow-lg">
								<Layers className="w-5 h-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-theme-primary">
									Block Explorer
								</h2>
								<p className="text-sm text-theme-secondary">
									Real-time blocks on <span className="font-medium text-network-primary">{network.name}</span>
								</p>
							</div>
						</div>
						<NetworkBadge network={network} size="sm" />
					</div>

					<div className="flex items-center space-x-3">
						<StatusIndicator isActive={isActive} isLoading={isLoading} />

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
							onClick={clearBlocks}
							variant="outline"
							size="sm"
							disabled={blocks.length === 0}
							className="transition-all duration-300 hover:scale-105 active:scale-95 
									 hover:bg-red-50/80 dark:hover:bg-red-900/40
									 hover:text-red-500 hover:border-red-300/70 dark:hover:border-red-600/70
									 shadow-lg hover:shadow-xl network-transition"
						>
							<Trash2 className="w-3 h-3" />
						</Button>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-4 p-4 bg-red-50/80 dark:bg-red-900/40 border border-red-200/70 dark:border-red-600/70 rounded-lg backdrop-blur-sm">
						<div className="flex items-center space-x-2">
							<Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
							<span className="text-sm font-medium text-red-700 dark:text-red-300">Error</span>
						</div>
						<p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
					</div>
				)}

				{/* Stats Dashboard */}
				{blocks.length > 0 && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
						<StatsCard value={stats.totalBlocks} label="Blocks" color="primary" />
						<StatsCard value={stats.totalTxs} label="Total TXs" color="blue" />
						<StatsCard value={stats.totalEvents} label="Events" color="purple" />
						<StatsCard value={stats.avgTxsPerBlock} label="Avg TXs/Block" color="green" />
					</div>
				)}

				{/* Tab Controls */}
				<div className="flex items-center justify-between">
					<div className="flex space-x-2">
						{tabButtons}
					</div>

					{blocks.length > 0 && (
						<Badge variant="outline" className="text-xs bg-network-light/50 dark:bg-network-primary/20 text-network-primary border-network-primary/30">
							{blocks.length} of {limit} blocks
						</Badge>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="min-h-[300px]">
				<VirtualizedBlockList
					blocks={blocks}
					network={network}
					isActive={isActive}
					isLoading={isLoading}
				/>

				<ExplorerLink
					network={network}
					blocksCount={blocks.length}
					isLoading={isLoading}
				/>
			</div>
		</Card>
	);
});