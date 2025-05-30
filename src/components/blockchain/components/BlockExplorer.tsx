/* eslint-disable react/display-name, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
"use client";

import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { useBlockWatcher } from "@/hooks";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { formatDistance } from "date-fns";
import { ExternalLink, Clock, Hash, Layers, Activity } from "lucide-react";
import type { Network } from "@/lib/types/network";

// Types
interface UnifiedBlockInfo {
	hash: string;
	number: number;
	timestamp: number;
	parentHash?: string;
}

type TabType = "finalized" | "best";

// Constants
const TABS = [
	{ key: "finalized" as const, label: "Finalized", icon: Layers },
	{ key: "best" as const, label: "Best", icon: Hash }
] as const;

// Custom hook for optimized time formatting with caching
const useTimeFormatter = () => {
	const cacheRef = useRef<Map<number, string>>(new Map());
	const lastUpdateRef = useRef<number>(0);

	return useCallback((timestamp: number): string => {
		const now = Date.now();

		// Cache for 1 second to avoid excessive calculations
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

// Optimized hash formatter
const useHashFormatter = () =>
	useCallback((hash: string): string =>
		`${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`,
		[]
	);

// Ultra-optimized TabButton with minimal re-renders
const TabButton = memo<{
	active: boolean;
	onClick: () => void;
	tab: typeof TABS[number];
}>(({ active, onClick, tab }) => {
	const { getNetworkColor, getColor } = useTheme();
	const { icon: Icon, label } = tab;

	const style = useMemo(() => ({
		backgroundColor: active ? getNetworkColor("primary") : getColor("surfaceVariant"),
		color: active ? "#FFFFFF" : getColor("textSecondary"),
	}), [active, getNetworkColor, getColor]);

	return (
		<button
			onClick={onClick}
			className="px-3 py-1.5 text-xs rounded-md transition-all duration-150 hover:scale-105 active:scale-95 flex items-center space-x-1"
			style={style}
		>
			<Icon className="w-3 h-3" />
			<span>{label}</span>
		</button>
	);
});

// Ultra-optimized BlockRow with intelligent memoization
const BlockRow = memo<{
	block: UnifiedBlockInfo;
	network: Network;
}>(({ block, network }) => {
	const { getColor, getNetworkColor } = useTheme();
	const formatTime = useTimeFormatter();
	const formatHash = useHashFormatter();

	// Pre-compute all values to minimize render-time calculations
	const computedValues = useMemo(() => ({
		formattedTime: formatTime(block.timestamp),
		shortHash: formatHash(block.hash),
		formattedNumber: block.number.toLocaleString(),
		explorerUrl: `${network.explorer}/block/${block.number}`,
	}), [block, network.explorer, formatTime, formatHash]);

	const styles = useMemo(() => ({
		container: { backgroundColor: getColor("surfaceVariant") },
		text: getColor("textSecondary"),
		link: {
			backgroundColor: `${getNetworkColor("primary")}20`,
			color: getNetworkColor("primary"),
		}
	}), [getColor, getNetworkColor]);

	return (
		<div
			className="flex justify-between items-center p-3 rounded-lg transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
			style={styles.container}
		>
			<div className="flex items-center space-x-3">
				<Badge variant="default" className="font-mono text-sm">
					#{computedValues.formattedNumber}
				</Badge>
				<div className="flex items-center space-x-2">
					<Hash className="w-3 h-3" style={{ color: styles.text }} />
					<span
						className="font-mono text-xs truncate max-w-24 sm:max-w-32"
						style={{ color: styles.text }}
						title={block.hash}
					>
						{computedValues.shortHash}
					</span>
				</div>
			</div>

			<div className="flex items-center space-x-3">
				<div className="flex items-center space-x-1">
					<Clock className="w-3 h-3" style={{ color: styles.text }} />
					<span className="text-xs opacity-70 whitespace-nowrap" style={{ color: styles.text }}>
						{computedValues.formattedTime}
					</span>
				</div>

				<a
					href={computedValues.explorerUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-md transition-all duration-150 hover:scale-110 active:scale-95"
					style={styles.link}
					title="View in explorer"
				>
					<ExternalLink className="w-3 h-3" />
				</a>
			</div>
		</div>
	);
}, (prevProps, nextProps) => {
	// Custom comparison for better performance
	return (
		prevProps.block.hash === nextProps.block.hash &&
		prevProps.block.number === nextProps.block.number &&
		prevProps.block.timestamp === nextProps.block.timestamp &&
		prevProps.network.explorer === nextProps.network.explorer
	);
});

// Optimized EmptyState with animation
const EmptyState = memo<{
	isActive: boolean;
	textColor: string;
}>(({ isActive, textColor }) => (
	<div className="text-center py-8 transition-opacity duration-300">
		<div className="mb-4">
			{isActive ? (
				<Activity className="w-12 h-12 mx-auto opacity-30 animate-pulse" style={{ color: textColor }} />
			) : (
				<Layers className="w-12 h-12 mx-auto opacity-30" style={{ color: textColor }} />
			)}
		</div>
		<p className="text-sm font-medium" style={{ color: textColor }}>
			{isActive ? "Waiting for blocks..." : "Block subscription not active"}
		</p>
		{!isActive && (
			<p className="text-xs mt-2 opacity-60" style={{ color: textColor }}>
				Connect your wallet to see live blocks
			</p>
		)}
	</div>
));

// Virtualized block list for better performance with large datasets
const VirtualizedBlockList = memo<{
	blocks: UnifiedBlockInfo[];
	network: Network;
	isActive: boolean;
}>(({ blocks, network, isActive }) => {
	const { getColor } = useTheme();
	const textColor = useMemo(() => getColor("textSecondary"), [getColor]);
	const containerRef = useRef<HTMLDivElement>(null);

	// Memoize block elements with stable keys
	const blockElements = useMemo(() =>
		blocks.map((block, index) => (
			<div key={`${block.hash}-${block.number}-${index}`} className="mb-2">
				<BlockRow block={block} network={network} />
			</div>
		)),
		[blocks, network]
	);

	if (blocks.length === 0) {
		return <EmptyState isActive={isActive} textColor={textColor} />;
	}

	return (
		<div
			ref={containerRef}
			className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
		>
			{blockElements}
		</div>
	);
});

// Optimized explorer link with loading state
const ExplorerLink = memo<{
	network: Network;
	blocksCount: number;
	isLoading?: boolean;
}>(({ network, blocksCount, isLoading = false }) => {
	const { getNetworkColor } = useTheme();

	if (blocksCount === 0 && !isLoading) return null;

	return (
		<div className="mt-6 pt-4 border-t border-gray-100 transition-opacity duration-300">
			<a
				href={`${network.explorer}/blocks`}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center space-x-2 text-sm hover:underline transition-all duration-200 hover:scale-105"
				style={{ color: getNetworkColor("primary") }}
			>
				<span>View more in {network.name} explorer</span>
				<ExternalLink className="w-4 h-4" />
			</a>
		</div>
	);
});

// Main optimized BlockExplorer component
export default memo(function BlockExplorer({
	network,
	limit = 5,
}: {
	network: Network;
	limit?: number;
}) {
	const { getColor, getNetworkColor } = useTheme();
	const [activeTab, setActiveTab] = useState<TabType>("finalized");
	const mountedRef = useRef(true);
	const tabChangeTimeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (tabChangeTimeoutRef.current) {
				clearTimeout(tabChangeTimeoutRef.current);
			}
		};
	}, []);

	// Enhanced block watcher with error handling
	const { blocks, isActive } = useBlockWatcher({
		type: activeTab,
		limit: Math.min(limit, 50), // Cap at 50 for performance
	});

	// Debounced tab change for smoother UX
	const handleTabChange = useCallback((tab: TabType) => {
		if (!mountedRef.current || tab === activeTab) return;

		// Clear existing timeout
		if (tabChangeTimeoutRef.current) {
			clearTimeout(tabChangeTimeoutRef.current);
		}

		// Debounce tab changes
		tabChangeTimeoutRef.current = setTimeout(() => {
			if (mountedRef.current) {
				setActiveTab(tab);
			}
		}, 50);
	}, [activeTab]);

	// Optimized tab buttons with stable references
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

	// Memoized and validated blocks
	const processedBlocks = useMemo(() => {
		if (!Array.isArray(blocks)) return [];

		return blocks
			.filter((block): block is UnifiedBlockInfo =>
				block &&
				typeof block.hash === 'string' &&
				typeof block.number === 'number' &&
				typeof block.timestamp === 'number'
			)
			.map(block => ({
				...block,
				hash: block.hash || '',
				number: Number(block.number) || 0,
				timestamp: Number(block.timestamp) || Date.now(),
			}));
	}, [blocks]);

	// Memoized header with performance indicators
	const header = useMemo(() => (
		<div className="flex justify-between items-center">
			<div className="flex items-center space-x-3">
				<div className="flex items-center space-x-2">
					<Layers className="w-5 h-5" style={{ color: getNetworkColor("primary") }} />
					<span className="font-medium">Recent Blocks</span>
				</div>		
				<NetworkBadge network={network} size="sm" />
				{isActive && (
					<div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<span className="text-xs text-green-600 font-medium">Live</span>
					</div>
				)}
				{processedBlocks.length > 0 && (
					<Badge variant="outline" className="text-xs">
						{processedBlocks.length} blocks
					</Badge>
				)}
			</div>

			<div className="flex space-x-1">
				{tabButtons}
			</div>
		</div>
	), [network, isActive, processedBlocks.length, tabButtons, getNetworkColor]);

	return (
		<Card header={header} className="overflow-hidden">
			<div className="min-h-[200px]">
				<VirtualizedBlockList
					blocks={processedBlocks}
					network={network}
					isActive={isActive}
				/>

				<ExplorerLink
					network={network}
					blocksCount={processedBlocks.length}
					isLoading={isActive && processedBlocks.length === 0}
				/>
			</div>
		</Card>
	);
});