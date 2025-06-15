/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import type React from "react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { Button } from "@/components/ui";
import {
	Activity,
	RefreshCw,
	Wifi,
	WifiOff,
	AlertCircle,
	CheckCircle,
	Clock,
	Database,
	Code,
	Globe,
	Eye,
	EyeOff,
	ExternalLink
} from "lucide-react";
import type { ApiPromise } from "@polkadot/api";
import { buildSubscanUrl } from "@/lib/utils/explorer";

// Types
interface Network {
	name: string;
	symbol: string;
	decimals: number;
	explorer: string;
	rpcUrl?: string;
	endpoint?: string;
}

interface ChainStatusProps {
	api: ApiPromise;
	network: Network;
}

interface ChainInfo {
	blockNumber: number | null;
	blockHash: string | null;
	finalizedNumber: number | null;
	finalizedHash: string | null;
	version: {
		specName: string;
		specVersion: number;
		implName: string;
		implVersion: number;
		transactionVersion: number;
		stateVersion: number;
	} | null;
	peers: number | null;
	health: {
		isSyncing: boolean;
		shouldHavePeers: boolean;
		peers: number;
	} | null;
}




const useChainInfo = (api: ApiPromise, network: Network) => {
	const [chainInfo, setChainInfo] = useState<ChainInfo>({
		blockNumber: null,
		blockHash: null,
		finalizedNumber: null,
		finalizedHash: null,
		version: null,
		peers: null,
		health: null
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isMountedRef = useRef(true);
	const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const unsubscribeRef = useRef<(() => void) | null>(null);

	// Fetch chain information
	const fetchChainInfo = useCallback(async () => {
		if (!api || !api.isReady) {
			setChainInfo({
				blockNumber: null,
				blockHash: null,
				finalizedNumber: null,
				finalizedHash: null,
				version: null,
				peers: null,
				health: null
			});
			return;
		}

		setIsLoading(true);
		setError(null);

		try {			
			const [
				header,
				finalizedHead,
				version,
				health
			] = await Promise.all([
				Promise.race([
					api.rpc.chain.getHeader(),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Header timeout')), 5000))
				]),
				Promise.race([
					api.rpc.chain.getFinalizedHead().then(hash => api.rpc.chain.getHeader(hash)),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Finalized timeout')), 5000))
				]),
				Promise.race([
					api.rpc.state.getRuntimeVersion(),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Version timeout')), 5000))
				]),
				Promise.race([
					api.rpc.system?.health ? api.rpc.system.health() : Promise.resolve(null),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Health timeout')), 3000))
				]).catch(() => null) // Health is optional
			]);

			if (!isMountedRef.current) return;

			const newChainInfo: ChainInfo = {
				blockNumber: header ? header.number.toNumber() : null,
				blockHash: header ? header.hash.toHex() : null,
				finalizedNumber: finalizedHead ? finalizedHead.number.toNumber() : null,
				finalizedHash: finalizedHead ? finalizedHead.hash.toHex() : null,
				version: version ? {
					specName: version.specName.toString(),
					specVersion: version.specVersion.toNumber(),
					implName: version.implName.toString(),
					implVersion: version.implVersion.toNumber(),
					transactionVersion: version.transactionVersion.toNumber(),
					stateVersion: version.stateVersion?.toNumber() || 0
				} : null,
				peers: health?.peers || null,
				health: health ? {
					isSyncing: health.isSyncing.isTrue,
					shouldHavePeers: health.shouldHavePeers.isTrue,
					peers: health.peers.toNumber()
				} : null
			};

			setChainInfo(newChainInfo);

		} catch (error) {
			console.error('Error fetching chain info:', error);
			if (isMountedRef.current) {
				setError(error instanceof Error ? error.message : 'Failed to fetch chain information');
			}
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [api]);

	
	const startUpdates = useCallback(async () => {
		if (!api || !api.isReady) return;

		try {
			
			const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
				if (!isMountedRef.current) return;

				setChainInfo(prev => ({
					...prev,
					blockNumber: header.number.toNumber(),
					blockHash: header.hash.toHex()
				}));
			});

			unsubscribeRef.current = unsubscribe;
			
			updateIntervalRef.current = setInterval(() => {
				if (isMountedRef.current && api.isReady) {
					api.rpc.chain.getFinalizedHead()
						.then(hash => api.rpc.chain.getHeader(hash))
						.then(header => {
							if (isMountedRef.current) {
								setChainInfo(prev => ({
									...prev,
									finalizedNumber: header.number.toNumber(),
									finalizedHash: header.hash.toHex()
								}));
							}
						})
						.catch(err => console.warn('Error updating finalized head:', err));
				}
			}, 12000); // Update finalized every 12 seconds

		} catch (error) {
			console.error('Error starting chain updates:', error);
		}
	}, [api]);

	
	const stopUpdates = useCallback(() => {
		if (unsubscribeRef.current) {
			try {
				unsubscribeRef.current();
			} catch (error) {
				console.warn('Error unsubscribing:', error);
			}
			unsubscribeRef.current = null;
		}

		if (updateIntervalRef.current) {
			clearInterval(updateIntervalRef.current);
			updateIntervalRef.current = null;
		}
	}, []);

	
	useEffect(() => {
		isMountedRef.current = true;

		if (api && api.isReady) {
			fetchChainInfo().then(() => {
				if (isMountedRef.current) {
					startUpdates();
				}
			});
		}

		return () => {
			isMountedRef.current = false;
			stopUpdates();
		};
	}, [api, fetchChainInfo, startUpdates, stopUpdates]);

	return {
		chainInfo,
		isLoading,
		error,
		refetch: fetchChainInfo
	};
};


const ConnectionStatus = ({ isConnected, isLoading, error }: {
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
}) => {
	if (error) {
		return (
			<Badge variant="outline" className="bg-red-50/80 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200/70 dark:border-red-600/70">
				<AlertCircle className="w-3 h-3 mr-1" />
				Error
			</Badge>
		);
	}

	if (isLoading) {
		return (
			<Badge variant="outline" className="bg-yellow-50/80 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200/70 dark:border-yellow-600/70">
				<RefreshCw className="w-3 h-3 mr-1 animate-spin" />
				Loading
			</Badge>
		);
	}

	if (isConnected) {
		return (
			<Badge variant="outline" className="bg-green-50/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200/70 dark:border-green-600/70">
				<CheckCircle className="w-3 h-3 mr-1" />
				Connected
			</Badge>
		);
	}

	return (
		<Badge variant="outline" className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/70 dark:border-gray-600/70">
			<WifiOff className="w-3 h-3 mr-1" />
			Disconnected
		</Badge>
	);
};

const InfoRow = ({
	label,
	value,
	icon,
	isLink = false,
	linkUrl,
	className = ""
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	isLink?: boolean;
	linkUrl?: string;
	className?: string;
}) => (
	<div className={`flex justify-between items-center ${className}`}>
		<div className="flex items-center space-x-2">
			<span className="text-theme-tertiary">{icon}</span>
			<span className="text-sm text-theme-secondary">{label}</span>
		</div>
		{isLink && linkUrl ? (
			<a
				href={linkUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="font-mono text-sm text-network-primary hover:underline flex items-center space-x-1 transition-colors duration-200 hover:text-network-secondary"
			>
				<span>{value}</span>
				<ExternalLink className="w-3 h-3" />
			</a>
		) : (
			<span className="font-mono text-sm text-theme-primary">{value}</span>
		)}
	</div>
);

const StatsCard = ({
	label,
	value,
	sublabel,
	icon,
	color = 'primary',
	isLink = false,
	linkUrl
}: {
	label: string;
	value: string | number;
	sublabel?: string;
	icon: React.ReactNode;
	color?: 'primary' | 'success' | 'warning' | 'info';
	isLink?: boolean;
	linkUrl?: string;
}) => {
	const colorClasses = {
		primary: 'bg-theme-surface border-theme hover:bg-theme-surface-variant hover:border-network-primary/50',
		success: 'bg-green-50/80 dark:bg-green-900/40 border-green-200/70 dark:border-green-600/70 hover:bg-green-100/80 dark:hover:bg-green-900/60',
		warning: 'bg-yellow-50/80 dark:bg-yellow-900/40 border-yellow-200/70 dark:border-yellow-600/70 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/60',
		info: 'bg-blue-50/80 dark:bg-blue-900/40 border-blue-200/70 dark:border-blue-600/70 hover:bg-blue-100/80 dark:hover:bg-blue-900/60'
	};

	const content = (
		<div className={`rounded-lg p-3 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group ${colorClasses[color]}`}>
			<div className="flex items-center space-x-2 mb-1">
				<div className="text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
					{icon}
				</div>
				<span className="text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
					{label}
				</span>
			</div>
			<div className="font-mono text-sm font-semibold text-theme-primary group-hover:text-network-primary transition-colors duration-300">
				{value}
			</div>
			{sublabel && (
				<div className="text-xs text-theme-tertiary mt-1">{sublabel}</div>
			)}
		</div>
	);

	if (isLink && linkUrl) {
		return (
			<a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
				{content}
			</a>
		);
	}

	return content;
};

// Main Component
export default function ChainStatus({ api, network }: ChainStatusProps) {
	const [showDetails, setShowDetails] = useState(false);
	const { chainInfo, isLoading, error, refetch } = useChainInfo(api, network);

	const isConnected = useMemo(() =>
		api && api.isReady && chainInfo.blockNumber !== null,
		[api, chainInfo.blockNumber]
	);

	// Calculate sync status
	const syncStatus = useMemo(() => {
		if (!chainInfo.blockNumber || !chainInfo.finalizedNumber) return null;

		const diff = chainInfo.blockNumber - chainInfo.finalizedNumber;
		return {
			difference: diff,
			isHealthy: diff <= 5 
		};
	}, [chainInfo.blockNumber, chainInfo.finalizedNumber]);

	const endpoint = network.rpcUrl || network.endpoint || 'Unknown';

	return (
		<Card className="overflow-hidden bg-theme-surface border-2 border-theme backdrop-blur-xl shadow-2xl network-transition">			
			<div className="p-6 border-b border-theme bg-theme-surface-variant/50 backdrop-blur-lg">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 rounded-lg bg-network-primary flex items-center justify-center shadow-lg">
							<Activity className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-theme-primary">
								Chain Status
							</h2>
							<p className="text-sm text-theme-secondary">
								Network health for <span className="font-medium text-network-primary">{network.name}</span>
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-3">
						<NetworkBadge network={network} size="sm" />
						<ConnectionStatus isConnected={isConnected} isLoading={isLoading} error={error} />
						<Button
							onClick={refetch}
							variant="outline"
							size="sm"
							disabled={isLoading}
							className="transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl network-transition"
						>
							<RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
					</div>
				</div>
				
				{isConnected && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<StatsCard
							label="Current Block"
							value={chainInfo.blockNumber?.toLocaleString() || 'N/A'}
							icon={<Database className="w-4 h-4" />}
							color="primary"
							isLink={!!chainInfo.blockNumber}
							linkUrl={chainInfo.blockNumber ? buildSubscanUrl(network, 'block', chainInfo.blockNumber) : undefined}
						/>
						<StatsCard
							label="Finalized Block"
							value={chainInfo.finalizedNumber?.toLocaleString() || 'N/A'}
							icon={<CheckCircle className="w-4 h-4" />}
							color="success"
							isLink={!!chainInfo.finalizedNumber}
							linkUrl={chainInfo.finalizedNumber ? buildSubscanUrl(network, 'block', chainInfo.finalizedNumber) : undefined}
						/>
						<StatsCard
							label="Sync Status"
							value={syncStatus ? `${syncStatus.difference} behind` : 'N/A'}
							sublabel={syncStatus?.isHealthy ? 'Healthy' : 'Syncing'}
							icon={<Wifi className="w-4 h-4" />}
							color={syncStatus?.isHealthy ? 'success' : 'warning'}
						/>
						<StatsCard
							label="Runtime"
							value={chainInfo.version ? `v${chainInfo.version.specVersion}` : 'N/A'}
							sublabel={chainInfo.version?.specName || 'Unknown'}
							icon={<Code className="w-4 h-4" />}
							color="info"
						/>
					</div>
				)}
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

			
			<div className="p-6">
				{isConnected ? (
					<div className="space-y-4">
						<div className="space-y-3">
							<InfoRow
								label="Network Endpoint"
								value={endpoint.length > 40 ? `${endpoint.slice(0, 40)}...` : endpoint}
								icon={<Globe className="w-4 h-4" />}
							/>

							{chainInfo.health && (
								<InfoRow
									label="Network Peers"
									value={chainInfo.health.peers}
									icon={<Activity className="w-4 h-4" />}
								/>
							)}
						</div>

						{/* Toggle Details */}
						<div className="pt-4 border-t border-theme">
							<Button
								onClick={() => setShowDetails(!showDetails)}
								variant="outline"
								size="sm"
								className="w-full flex items-center justify-center space-x-2"
							>
								{showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								<span>{showDetails ? 'Hide' : 'Show'} Technical Details</span>
							</Button>
						</div>
						
						{showDetails && chainInfo.version && (
							<div className="pt-4 space-y-3 border-t border-theme">
								<InfoRow
									label="Spec Name"
									value={chainInfo.version.specName}
									icon={<Code className="w-4 h-4" />}
								/>
								<InfoRow
									label="Implementation"
									value={`${chainInfo.version.implName} v${chainInfo.version.implVersion}`}
									icon={<Code className="w-4 h-4" />}
								/>
								<InfoRow
									label="Transaction Version"
									value={chainInfo.version.transactionVersion}
									icon={<Database className="w-4 h-4" />}
								/>
								<InfoRow
									label="State Version"
									value={chainInfo.version.stateVersion}
									icon={<Database className="w-4 h-4" />}
								/>
								{chainInfo.blockHash && (
									<div className="space-y-2">
										<div className="text-sm text-theme-secondary">Block Hash:</div>
										<div className="font-mono text-xs bg-theme-surface-variant p-2 rounded border border-theme break-all">
											{chainInfo.blockHash}
										</div>
									</div>
								)}
							</div>
						)}

						
						<div className="pt-4 border-t border-theme">
							<a
								href={buildSubscanUrl(network, 'runtime')}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center space-x-2 text-sm text-network-primary 
										 hover:underline transition-all duration-200 hover:scale-105 group"
							>
								<span>View in {network.name} explorer</span>
								<ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
							</a>
						</div>
					</div>
				) : (
					<div className="p-8 text-center">
						<div className="w-16 h-16 mx-auto mb-4 bg-theme-surface-variant rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
							{isLoading ? (
								<RefreshCw className="w-6 h-6 text-network-primary animate-spin" />
							) : (
								<WifiOff className="w-8 h-8 text-theme-tertiary" />
							)}
						</div>
						<div className="text-theme-primary font-medium mb-2">
							{isLoading ? 'Fetching chain status...' : 'Not connected to blockchain'}
						</div>
						<div className="text-sm text-theme-secondary">
							{isLoading ? 'Gathering network information' : 'Connect your wallet to view chain status'}
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}