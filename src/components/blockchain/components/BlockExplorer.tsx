"use client";

import type React from "react";
import { useState } from "react";
import { useBlockWatcher } from "@/hooks";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { formatDistance } from "date-fns";
import type { BlockInfo } from "@/store/useBlockStore";
import type { Network } from "@/lib/types/network";

export default function BlockExplorer({
	network,
	limit = 5,
}: {
	network: Network;
	limit?: number;
}) {
	const { getColor, getNetworkColor } = useTheme();
	const [activeTab, setActiveTab] = useState<"finalized" | "best">("finalized");

	const { blocks, isActive } = useBlockWatcher({
		type: activeTab,
		limit: limit,
	});

	return (
		<Card
			header={
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<span className="font-medium">Recent Blocks</span>
						<NetworkBadge network={network} size="sm" />
					</div>

					<div className="flex space-x-1">
						<TabButton
							active={activeTab === "finalized"}
							onClick={() => setActiveTab("finalized")}
						>
							Finalized
						</TabButton>
						<TabButton
							active={activeTab === "best"}
							onClick={() => setActiveTab("best")}
						>
							Best
						</TabButton>
					</div>
				</div>
			}
		>
			<div className="space-y-2">
				{blocks.length === 0 ? (
					<div
						className="text-center py-6"
						style={{ color: getColor("textSecondary") }}
					>
						{isActive
							? "Waiting for blocks..."
							: "Block subscription not active"}
					</div>
				) : (
					<>
						{blocks.map((block) => (
							<BlockRow key={block.hash} block={block} network={network} />
						))}
					</>
				)}
			</div>

			{blocks.length > 0 && (
				<div className="mt-4">
					<a
						href={`${network.explorer}/blocks`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm hover:underline"
						style={{ color: getNetworkColor("primary") }}
					>
						View more blocks in explorer →
					</a>
				</div>
			)}
		</Card>
	);
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	const { getNetworkColor, getColor } = useTheme();

	return (
		<button
			onClick={onClick}
			className="px-2 py-1 text-xs rounded transition-colors"
			style={{
				backgroundColor: active
					? getNetworkColor("primary")
					: getColor("surfaceVariant"),
				color: active ? "#FFFFFF" : getColor("textSecondary"),
			}}
		>
			{children}
		</button>
	);
}

function BlockRow({
	block,
	network,
}: {
	block: BlockInfo;
	network: Network;
}) {
	const { getColor, getNetworkColor } = useTheme();

	const formatBlockTime = (timestamp: number): string => {
		try {
			return formatDistance(new Date(timestamp), new Date(), {
				addSuffix: true,
			});
		} catch {
			return "Unknown";
		}
	};

	return (
		<div
			className="flex justify-between items-center p-2 rounded"
			style={{ backgroundColor: getColor("surfaceVariant") }}
		>
			<div className="flex items-center space-x-2">
				<Badge variant="default" className="font-mono">
					#{block.number.toLocaleString()}
				</Badge>
				<span
					className="font-mono text-xs truncate max-w-32"
					style={{ color: getColor("textSecondary") }}
					title={block.hash}
				>
					{block.hash.substring(0, 6)}...
					{block.hash.substring(block.hash.length - 4)}
				</span>
			</div>

			<div className="flex items-center space-x-3">
				<span
					className="text-xs opacity-70"
					style={{ color: getColor("textSecondary") }}
				>
					{formatBlockTime(block.timestamp)}
				</span>

				<a
					href={`${network.explorer}/block/${block.number}`}
					target="_blank"
					rel="noopener noreferrer"
					className="p-1 rounded hover:bg-opacity-80 transition-colors"
					style={{
						backgroundColor: `${getNetworkColor("primary")}20`,
						color: getNetworkColor("primary"),
					}}
					title="View in explorer"
				>
					<ExternalLinkIcon />
				</a>
			</div>
		</div>
	);
}

function ExternalLinkIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" y1="14" x2="21" y2="3" />
		</svg>
	);
}
