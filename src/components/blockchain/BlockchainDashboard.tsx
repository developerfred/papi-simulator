/* eslint-disable  @typescript-eslint/no-unused-vars, react/display-name, react-hooks/exhaustive-deps, prefer-const, @typescript-eslint/no-explicit-any */

"use client";

import type React from "react";
import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import Link from "next/link";
import { z } from "zod";
import { useWallet } from "@/hooks/useWallet";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Button, Card, NetworkBadge } from "@/components/ui";
import { NotificationContainer, NotificationProvider } from "@/blockchain/Notification";
import {
	Minimize2,
	Maximize2,
	Layout,
	Zap,
	Search,
	Filter,
	Globe,
	Layers,
	TestTube,
	Coins,
	Sun,
	Moon,
	Command,
	Option,
	Monitor,
	Smartphone,
	Check,
	X,
	Wifi,
	WifiOff,
	AlertCircle
} from "lucide-react";
import dynamic from "next/dynamic";

// Import the dynamic network configuration
import { networkManager, type Network, NetworkSchema } from "./dynamic-blockchain-config";

// Types
const WalletAccountSchema = z.object({
	address: z.string(),
	meta: z.object({
		name: z.string().optional(),
		source: z.string().optional(),
	}).optional(),
	name: z.string().optional(),
}).passthrough();

type WalletAccount = z.infer<typeof WalletAccountSchema>;
type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

interface ChainConnectionState {
	api: ApiPromise | null;
	status: ConnectionStatus;
	error: string | null;
}

// Layout modes for better UX
type LayoutMode = "normal" | "transaction-focused" | "transaction-fullscreen";

// Platform detection
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifierKey = isMac ? '⌘' : 'Ctrl';
const optionKey = isMac ? '⌥' : 'Alt';

// Enhanced dynamic imports with better loading states
const createDynamicComponent = (importFn: () => Promise<any>, height = "200px") =>
	dynamic(importFn, {
		loading: () => (
			<div className={`min-h-[${height}] flex items-center justify-center bg-theme-surface rounded-lg border border-theme`}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-network-primary border-t-transparent mx-auto" />
					<p className="mt-3 text-theme-secondary text-sm">Loading component...</p>
				</div>
			</div>
		),
		ssr: false,
	});

const ChainStatus = createDynamicComponent(() => import("./components/ChainStatus"));
const EventMonitor = createDynamicComponent(() => import("./EventMonitor"), "300px");
const AccountBalance = createDynamicComponent(() => import("./components/AccountBalance"), "150px");
const BlockExplorer = createDynamicComponent(() => import("./components/BlockExplorer"), "400px");
const TransactionMonitor = createDynamicComponent(() => import("./components/TransactionMonitor"), "300px");
const TransactionBuilder = createDynamicComponent(() => import("./components/TransactionBuilder"), "500px");

// Enhanced Polkadot API hook with better connection management
const usePolkadotApi = (network: Network, isWalletConnected: boolean): ChainConnectionState => {
	const [state, setState] = useState<ChainConnectionState>({
		api: null,
		status: "disconnected",
		error: null,
	});

	const mountedRef = useRef(true);
	const connectionAttemptRef = useRef<string | null>(null);
	const { isDarkTheme } = useTheme();

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !isWalletConnected) {
			setState({ api: null, status: "disconnected", error: null });
			return;
		}

		const connectionKey = `${network.rpcUrl}-${isWalletConnected}`;

		if (connectionAttemptRef.current === connectionKey) {
			return;
		}

		connectionAttemptRef.current = connectionKey;

		let isMounted = true;
		let apiInstance: ApiPromise | null = null;
		let provider: WsProvider | null = null;
		let timeoutId: NodeJS.Timeout;
		let connectionTimeout: NodeJS.Timeout;

		const connectToChain = async () => {
			try {
				if (!isMounted || !mountedRef.current) return;

				setState(prev => ({ ...prev, status: "connecting", error: null }));

				connectionTimeout = setTimeout(() => {
					if (isMounted && mountedRef.current) {
						setState(prev => ({ ...prev, status: "error", error: "Connection timeout - please check network settings" }));
					}
				}, 15000);

				provider = new WsProvider(network.rpcUrl, 1000);

				// Enhanced provider event listeners
				provider.on('connected', () => {
					if (connectionTimeout) clearTimeout(connectionTimeout);
				});

				provider.on('disconnected', () => {
					if (isMounted && mountedRef.current) {
						setState(prev => ({ ...prev, status: "disconnected" }));
					}
				});

				provider.on('error', (error) => {
					console.warn('Provider error:', error);
					if (isMounted && mountedRef.current) {
						setState(prev => ({ ...prev, status: "error", error: error.message }));
					}
				});

				apiInstance = await Promise.race([
					ApiPromise.create({
						provider,
						noInitWarn: true,
						throwOnUnknown: false,
						types: {},
					}),
					new Promise<never>((_, reject) =>
						setTimeout(() => reject(new Error("API creation timeout")), 12000)
					)
				]);

				if (connectionTimeout) clearTimeout(connectionTimeout);

				if (isMounted && mountedRef.current) {
					setState({ api: apiInstance, status: "connected", error: null });
				}
			} catch (err) {
				if (connectionTimeout) clearTimeout(connectionTimeout);

				if (isMounted && mountedRef.current) {
					const error = err instanceof Error ? err.message : "Failed to connect to network";
					setState({ api: null, status: "error", error });
				}
			}
		};

		timeoutId = setTimeout(connectToChain, 100);

		return () => {
			isMounted = false;
			clearTimeout(timeoutId);
			clearTimeout(connectionTimeout);

			if (connectionAttemptRef.current === connectionKey) {
				connectionAttemptRef.current = null;
			}

			const cleanup = async () => {
				try {
					if (provider) {
						provider.removeAllListeners();
					}

					await Promise.all([
						apiInstance?.disconnect().catch(() => { }),
						provider?.disconnect().catch(() => { })
					]);
				} catch (error) {
					console.warn("Cleanup error:", error);
				}
			};

			cleanup();
		};
	}, [network.rpcUrl, isWalletConnected, isDarkTheme]);

	return state;
};

// Utility functions
const getAccountDisplayName = (account: WalletAccount | null): string =>
	account?.meta?.name ||
	account?.name ||
	(account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "Connect Wallet");

const getStatusMessage = (walletStatus: string, chainStatus: ConnectionStatus): string => {
	const messages = {
		error: "Connection error detected. Check your wallet and network settings.",
		disconnected: "Connect your wallet to start exploring the blockchain.",
		connecting: "Wallet connected. Establishing blockchain connection...",
		default: "Initializing secure connections..."
	};

	if (chainStatus === "error") return messages.error;
	if (walletStatus === "disconnected") return messages.disconnected;
	if (walletStatus === "connected" && chainStatus !== "connected") return messages.connecting;
	return messages.default;
};

// Enhanced reusable components with theme support
const StatusIndicator = memo<{ status: ConnectionStatus; showLabel?: boolean }>(({ status, showLabel = true }) => {
	const colors = {
		connected: "bg-success",
		connecting: "bg-warning animate-pulse",
		disconnected: "bg-gray-400",
		error: "bg-error",
	};

	const labels = {
		connected: "Connected",
		connecting: "Connecting",
		disconnected: "Disconnected",
		error: "Error",
	};

	const icons = {
		connected: <Wifi className="w-3 h-3" />,
		connecting: <div className="w-3 h-3 animate-spin rounded-full border border-gray-300 border-t-white" />,
		disconnected: <WifiOff className="w-3 h-3" />,
		error: <AlertCircle className="w-3 h-3" />,
	};

	return (
		<div className="flex items-center space-x-2">
			<div className={`w-2 h-2 rounded-full ${colors[status]} relative overflow-hidden`}>
				{status === "connecting" && (
					<div className="absolute inset-0 bg-warning animate-ping" />
				)}
			</div>
			{showLabel && (
				<div className="flex items-center space-x-1">
					<span className="text-xs text-theme-secondary">{labels[status]}</span>
					<span className="text-theme-tertiary">{icons[status]}</span>
				</div>
			)}
		</div>
	);
});

const ErrorDisplay = memo<{ error: string; onRetry?: () => void }>(({ error, onRetry }) => (
	<div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error animate-slideInDown">
		<div className="flex items-start justify-between">
			<div className="flex items-start space-x-3">
				<AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
				<div>
					<p className="font-medium">Connection Error</p>
					<p className="text-sm text-error/80 mt-1">{error}</p>
				</div>
			</div>
			{onRetry && (
				<Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
					Retry
				</Button>
			)}
		</div>
	</div>
));

const LoadingSpinner = memo<{ message?: string }>(({ message = "Initializing blockchain connection..." }) => (
	<div className="flex justify-center items-center min-h-[300px]">
		<div className="text-center">
			<div className="relative">
				<div className="animate-spin rounded-full h-12 w-12 border-2 border-network-primary border-t-transparent mx-auto" />
				<div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-network-primary/20" />
			</div>
			<p className="mt-4 text-theme-secondary animate-pulse">{message}</p>
		</div>
	</div>
));

const NetworkDisconnectedIcon = memo(() => (
	<div className="relative">
		<Monitor className="w-16 h-16 mx-auto text-theme-tertiary" />
		<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-error rounded-full flex items-center justify-center">
			<X className="w-3 h-3 text-white" />
		</div>
	</div>
));

// Network Type Icons with enhanced styling
const getNetworkTypeIcon = (type: Network["type"], className = "w-4 h-4") => {
	const icons = {
		relay: <Globe className={className} />,
		system: <Layers className={className} />,
		parachain: <Coins className={className} />,
		testnet: <TestTube className={className} />,
	};
	return icons[type] || <Globe className={className} />;
};

// Theme Toggle Component
const ThemeToggle = memo(() => {
	const { isDarkTheme, toggleTheme } = useTheme();

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={toggleTheme}
			className="flex items-center space-x-2 network-transition"
			title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
		>
			{isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
			<span className="hidden sm:inline">
				{isDarkTheme ? 'Light' : 'Dark'}
			</span>
		</Button>
	);
});

// Enhanced Network Selector with improved UX
const NetworkSelector = memo<{
	selectedNetwork: Network;
	onNetworkChange: (network: Network) => void;
	layoutMode: LayoutMode;
}>(({ selectedNetwork, onNetworkChange, layoutMode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState<"all" | Network["type"]>("all");
	const { isDarkTheme } = useTheme();

	const networks = useMemo(() => {
		let filtered = networkManager.getAllNetworks();

		if (selectedFilter !== "all") {
			filtered = networkManager.getNetworksByType(selectedFilter);
		}

		if (searchQuery) {
			filtered = networkManager.searchNetworks(searchQuery);
		}

		return filtered;
	}, [searchQuery, selectedFilter]);

	const networkGroups = useMemo(() => {
		if (selectedFilter !== "all") {
			return { [selectedFilter]: networks };
		}

		const groups = networkManager.getNetworkGroups();

		if (searchQuery) {
			Object.keys(groups).forEach(key => {
				groups[key] = groups[key].filter(network =>
					networks.some(n => n.name === network.name)
				);
				if (groups[key].length === 0) {
					delete groups[key];
				}
			});
		}

		return groups;
	}, [networks, selectedFilter, searchQuery]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
				setSearchQuery("");
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		}
	}, [isOpen]);

	if (layoutMode === "transaction-fullscreen") return null;

	return (
		<div className="relative">
			<Button
				variant="outline"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 min-w-[220px] justify-between network-transition hover:border-network-primary/50"
			>
				<div className="flex items-center space-x-2">
					{getNetworkTypeIcon(selectedNetwork.type)}
					<span className="truncate font-medium">{selectedNetwork.name}</span>
					{selectedNetwork.relay && (
						<span className="text-xs text-theme-tertiary px-1 bg-theme-surface-variant rounded">
							{selectedNetwork.relay}
						</span>
					)}
				</div>
				<span className="text-xs text-theme-tertiary transform transition-transform duration-200"
					style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
					▼
				</span>
			</Button>

			{isOpen && (
				<>
					<div className="absolute top-full mt-2 left-0 z-50 w-96 bg-theme-surface border border-theme rounded-lg shadow-lg max-h-96 overflow-hidden animate-slideInDown">
						{/* Enhanced Search and Filter Header */}
						<div className="p-4 border-b border-theme bg-theme-surface-variant">
							<div className="flex items-center space-x-2 mb-3">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
									<input
										type="text"
										placeholder="Search networks..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full pl-10 pr-4 py-2 text-sm bg-theme-surface border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-network-primary/50 focus:border-network-primary network-transition"
										autoFocus
									/>
								</div>
								<select
									value={selectedFilter}
									onChange={(e) => setSelectedFilter(e.target.value as any)}
									className="text-sm bg-theme-surface border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-network-primary/50 network-transition"
								>
									<option value="all">All Types</option>
									<option value="relay">Relay Chains</option>
									<option value="system">System Chains</option>
									<option value="parachain">Parachains</option>
									<option value="testnet">Testnets</option>
								</select>
							</div>
							<div className="flex items-center justify-between text-xs text-theme-secondary">
								<span>{networks.length} network{networks.length !== 1 ? 's' : ''} found</span>
								<span className="flex items-center space-x-1">
									<kbd className="px-1 py-0.5 bg-theme-surface border border-theme rounded text-xs">Esc</kbd>
									<span>to close</span>
								</span>
							</div>
						</div>

						{/* Network Groups */}
						<div className="max-h-72 overflow-y-auto">
							{Object.entries(networkGroups).map(([groupName, groupNetworks]) => (
								<div key={groupName} className="border-b border-theme last:border-b-0">
									<div className="px-4 py-3 bg-theme-surface-variant text-sm font-medium text-theme-primary flex items-center space-x-2 sticky top-0">
										{getNetworkTypeIcon(groupNetworks[0]?.type, "w-4 h-4")}
										<span>{groupName}</span>
										<span className="text-xs text-theme-tertiary bg-theme-surface px-2 py-1 rounded-full">
											{groupNetworks.length}
										</span>
									</div>
									{groupNetworks.map((network) => (
										<button
											key={network.name}
											onClick={() => {
												onNetworkChange(network);
												setIsOpen(false);
												setSearchQuery("");
											}}
											className={`w-full px-4 py-3 text-left hover:bg-theme-surface-variant flex items-center justify-between transition-colors network-transition group ${selectedNetwork.name === network.name
													? 'bg-network-primary/10 border-r-2 border-network-primary'
													: ''
												}`}
										>
											<div className="flex items-center space-x-3 flex-1 min-w-0">
												{getNetworkTypeIcon(network.type)}
												<div className="min-w-0 flex-1">
													<div className="font-medium text-sm text-theme-primary flex items-center space-x-2">
														<span className="truncate">{network.name}</span>
														{selectedNetwork.name === network.name && (
															<Check className="w-4 h-4 text-network-primary flex-shrink-0" />
														)}
													</div>
													<div className="text-xs text-theme-secondary truncate">
														{network.description || `${network.symbol} • ${network.type}`}
													</div>
												</div>
											</div>
											<div className="flex flex-col items-end space-y-1 ml-2">
												<span className="text-xs font-mono bg-theme-surface px-2 py-1 rounded border">
													{network.symbol}
												</span>
												{network.features && (
													<div className="flex space-x-1">
														{network.features.slice(0, 2).map((feature) => (
															<span key={feature} className="text-xs bg-network-primary/20 text-network-primary px-1 rounded">
																{feature}
															</span>
														))}
													</div>
												)}
											</div>
										</button>
									))}
								</div>
							))}

							{networks.length === 0 && (
								<div className="p-8 text-center text-theme-secondary">
									<Filter className="w-8 h-8 mx-auto mb-3 opacity-50" />
									<p className="text-sm font-medium">No networks found</p>
									<p className="text-xs text-theme-tertiary mt-1">Try adjusting your search or filter</p>
								</div>
							)}
						</div>
					</div>

					{/* Enhanced backdrop */}
					<div
						className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
						onClick={() => {
							setIsOpen(false);
							setSearchQuery("");
						}}
					/>
				</>
			)}
		</div>
	);
});

// Enhanced Dashboard Header with theme integration
const DashboardHeader = memo<{
	selectedNetwork: Network;
	wallet: ReturnType<typeof useWallet>;
	layoutMode: LayoutMode;
	onNetworkChange: (network: Network) => void;
	onLayoutToggle: () => void;
}>(({ selectedNetwork, wallet, layoutMode, onNetworkChange, onLayoutToggle }) => {
	const { isDarkTheme } = useTheme();

	const WalletButton = useMemo(() => {
		if (wallet.status === "connected") {
			return (
				<div className="flex items-center space-x-2">
					<div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-success/10 border border-success/20 rounded-lg">
						<div className="w-2 h-2 bg-success rounded-full animate-pulse" />
						<span className="text-sm text-success font-medium">
							{getAccountDisplayName(wallet.activeAccount)}
						</span>
					</div>
					<Button variant="outline" onClick={wallet.disconnect} size="sm">
						Disconnect
					</Button>
				</div>
			);
		}

		return (
			<Button
				variant="primary"
				onClick={() => wallet.connect()}
				disabled={wallet.status === "connecting"}
				size="sm"
				className="flex items-center space-x-2"
			>
				{wallet.status === "connecting" && (
					<div className="w-4 h-4 animate-spin rounded-full border border-white border-t-transparent" />
				)}
				<span>{wallet.status === "connecting" ? "Connecting..." : "Connect Wallet"}</span>
			</Button>
		);
	}, [wallet.status, wallet.activeAccount, wallet.disconnect, wallet.connect]);

	if (layoutMode === "transaction-fullscreen") return null;

	return (
		<div className={`dashboard-header mb-6 p-4 bg-theme-surface/80 backdrop-blur-sm border-b border-theme rounded-lg transition-all duration-300 ${layoutMode === "transaction-focused" ? "opacity-75 scale-95" : ""
			}`}>
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<div>
						<h1 className="text-2xl font-bold mb-1 flex items-center space-x-2 text-theme-primary">
							<Layout className="w-6 h-6 text-network-primary" />
							<span>Blockchain Explorer</span>
						</h1>
						<div className="flex items-center space-x-2 text-sm text-theme-secondary">
							<span>Exploring</span>
							{getNetworkTypeIcon(selectedNetwork.type, "w-4 h-4")}
							<span className="font-medium text-network-primary">{selectedNetwork.name}</span>
							{selectedNetwork.relay && (
								<>
									<span>on</span>
									<span className="font-medium">{selectedNetwork.relay}</span>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					{/* Layout Toggle Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={onLayoutToggle}
						className="flex items-center space-x-1 group"
						title={`Toggle layout mode (${modifierKey}+F)`}
					>
						{layoutMode === "normal" ? (
							<Maximize2 className="w-4 h-4 group-hover:text-network-primary transition-colors" />
						) : (
							<Minimize2 className="w-4 h-4 group-hover:text-network-primary transition-colors" />
						)}
						<span className="hidden lg:inline">Layout</span>
					</Button>

					{/* Theme Toggle */}
					<ThemeToggle />

					{/* Network Selector */}
					<NetworkSelector
						selectedNetwork={selectedNetwork}
						onNetworkChange={onNetworkChange}
						layoutMode={layoutMode}
					/>

					{/* Network Badge */}
					<div className="hidden md:block">
						<NetworkBadge network={selectedNetwork} />
					</div>

					{/* Wallet Button */}
					{WalletButton}

					<Link href="/">
						<Button variant="secondary" size="sm">
							Back to Playground
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
});

// Enhanced Connection Status Display
const ConnectionStatusDisplay = memo<{
	walletStatus: string;
	chainStatus: ConnectionStatus;
	layoutMode: LayoutMode;
	selectedNetwork: Network;
}>(({ walletStatus, chainStatus, layoutMode, selectedNetwork }) => {
	if (layoutMode === "transaction-fullscreen") return null;

	const getStatusColor = (status: string) => {
		switch (status) {
			case "connected": return "border-success/20 bg-success/5";
			case "connecting": return "border-warning/20 bg-warning/5";
			case "error": return "border-error/20 bg-error/5";
			default: return "border-theme bg-theme-surface";
		}
	};

	return (
		<div className={`mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300 ${layoutMode === "transaction-focused" ? "opacity-50 scale-95" : ""
			}`}>
			<Card className={`p-4 ${getStatusColor(walletStatus)} border network-transition`}>
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium text-theme-primary flex items-center space-x-2">
						<span>Wallet Status</span>
					</h3>
					<StatusIndicator status={walletStatus as ConnectionStatus} />
				</div>
			</Card>

			<Card className={`p-4 ${getStatusColor(chainStatus)} border network-transition`}>
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium text-theme-primary">Network Status</h3>
					<StatusIndicator status={chainStatus} />
				</div>
			</Card>

			<Card className="p-4 border border-theme bg-theme-surface network-transition">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium text-theme-primary">Network Info</h3>
					<div className="text-right">
						<div className="text-xs text-theme-secondary uppercase tracking-wide">
							{selectedNetwork.type}
						</div>
						<div className="text-xs font-mono text-network-primary font-medium">
							{selectedNetwork.symbol}
						</div>
						{selectedNetwork.parachainId && (
							<div className="text-xs text-theme-tertiary">
								ID: {selectedNetwork.parachainId}
							</div>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
});

// Enhanced Not Connected State
const NotConnectedState = memo<{
	walletStatus: string;
	chainStatus: ConnectionStatus;
	selectedNetwork: Network;
	onWalletConnect: () => void;
}>(({ walletStatus, chainStatus, selectedNetwork, onWalletConnect }) => {
	const statusMessage = useMemo(() =>
		getStatusMessage(walletStatus, chainStatus),
		[walletStatus, chainStatus]
	);

	const showConnectButton = walletStatus === "disconnected";

	return (
		<Card className="p-8 text-center bg-theme-surface border border-theme animate-fadeIn">
			<div className="max-w-lg mx-auto">
				<div className="mb-6">
					<NetworkDisconnectedIcon />
				</div>

				<h2 className="text-xl font-semibold mb-3 text-theme-primary">Blockchain Explorer</h2>

				<div className="mb-4 flex items-center justify-center space-x-2 p-3 bg-theme-surface-variant rounded-lg border border-theme">
					{getNetworkTypeIcon(selectedNetwork.type)}
					<span className="font-medium text-theme-primary">{selectedNetwork.name}</span>
					{selectedNetwork.relay && (
						<>
							<span className="text-theme-tertiary">•</span>
							<span className="text-theme-secondary">{selectedNetwork.relay}</span>
						</>
					)}
				</div>

				<p className="mb-6 text-theme-secondary">{statusMessage}</p>

				{selectedNetwork.description && (
					<p className="mb-6 text-sm text-theme-tertiary italic bg-theme-surface-variant p-3 rounded-lg border border-theme">
						{selectedNetwork.description}
					</p>
				)}

				{selectedNetwork.features && selectedNetwork.features.length > 0 && (
					<div className="mb-6">
						<p className="text-xs text-theme-tertiary mb-2">Network Features:</p>
						<div className="flex flex-wrap justify-center gap-2">
							{selectedNetwork.features.map((feature) => (
								<span
									key={feature}
									className="text-xs bg-network-primary/10 text-network-primary px-2 py-1 rounded-full border border-network-primary/20"
								>
									{feature}
								</span>
							))}
						</div>
					</div>
				)}

				{showConnectButton && (
					<Button
						variant="primary"
						onClick={onWalletConnect}
						className="flex items-center space-x-2 mx-auto"
					>
						<span>Connect Wallet</span>
					</Button>
				)}
			</div>
		</Card>
	);
});

// Enhanced main content with elastic layout support
const MainDashboardContent = memo<{
	api: ApiPromise;
	network: Network;
	account: WalletAccount;
	layoutMode: LayoutMode;
	onTransactionFocus: (focused: boolean) => void;
}>(({ api, network, account, layoutMode, onTransactionFocus }) => {
	// Transaction Builder Props
	const transactionBuilderProps = {
		api,
		network,
		senderAccount: account,
		isFullscreen: layoutMode === "transaction-fullscreen",
		onMinimize: () => onTransactionFocus(false),
	};

	// Fullscreen Transaction Builder
	if (layoutMode === "transaction-fullscreen") {
		return (
			<div className="fixed inset-0 z-50 bg-theme-surface">
				<TransactionBuilder {...transactionBuilderProps} />
			</div>
		);
	}

	// Focused Layout - Transaction Builder takes most space
	if (layoutMode === "transaction-focused") {
		return (
			<div className="space-y-6">
				{/* Transaction Builder - Full width, enhanced */}
				<div className="w-full">
					<TransactionBuilder {...transactionBuilderProps} />
				</div>

				{/* Compact secondary components */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 opacity-75">
					<AccountBalance network={network} api={api} account={account} />
					<div className="lg:col-span-2">
						<ChainStatus api={api} network={network} />
					</div>
				</div>

				{/* Collapsible advanced tools */}
				<details className="group bg-theme-surface border border-theme rounded-lg overflow-hidden">
					<summary className="cursor-pointer p-4 bg-theme-surface-variant hover:bg-theme-surface-variant/80 transition-colors flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="font-medium text-theme-primary">Advanced Tools</span>
							<span className="text-xs text-theme-tertiary bg-theme-surface px-2 py-1 rounded-full">
								Explorer, Events, Transactions
							</span>
						</div>
						<span className="text-theme-tertiary group-open:rotate-180 transition-transform duration-200">
							▼
						</span>
					</summary>
					<div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
						<BlockExplorer api={api} network={network} limit={3} />
						<div className="space-y-4">
							<EventMonitor api={api} network={network} limit={5} />
							<TransactionMonitor api={api} network={network} userAddress={account.address} limit={5} />
						</div>
					</div>
				</details>
			</div>
		);
	}

	// Normal Layout - Standard grid
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="space-y-6">
				<AccountBalance network={network} api={api} account={account} />
				<div className="relative group">
					<TransactionBuilder {...transactionBuilderProps} />
					{/* Enhanced focus button overlay */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => onTransactionFocus(true)}
						className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center space-x-1 bg-theme-surface/90 backdrop-blur-sm border-network-primary/50 hover:border-network-primary"
						title={`Focus Transaction Builder (${modifierKey}+F)`}
					>
						<Zap className="w-4 h-4" />
						<span className="hidden sm:inline">Focus</span>
					</Button>
				</div>
			</div>

			<div className="lg:col-span-2 space-y-6">
				<ChainStatus api={api} network={network} />
				<BlockExplorer api={api} network={network} limit={5} />
				<EventMonitor api={api} network={network} limit={10} />
				<TransactionMonitor api={api} network={network} userAddress={account.address} limit={10} />
			</div>
		</div>
	);
});

// Enhanced Keyboard Shortcuts Help
const KeyboardShortcutsHelp = memo<{ layoutMode: LayoutMode; selectedNetwork: Network }>(({ layoutMode, selectedNetwork }) => {
	const [isVisible, setIsVisible] = useState(true);
	const { isDarkTheme } = useTheme();

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(false), 5000);
		return () => clearTimeout(timer);
	}, []);

	if (layoutMode !== "normal" || !isVisible) return null;

	return (
		<div className="fixed bottom-4 right-4 space-y-2 z-10">
			{/* Network info pill */}
			<div className="bg-theme-surface/90 backdrop-blur-sm border border-theme text-theme-primary px-3 py-2 rounded-lg text-xs opacity-75 hover:opacity-100 transition-all duration-300 group">
				<div className="flex items-center space-x-2">
					{getNetworkTypeIcon(selectedNetwork.type)}
					<span className="font-medium">{selectedNetwork.name}</span>
					<span className="text-theme-tertiary">•</span>
					<span className="font-mono text-network-primary">{selectedNetwork.symbol}</span>
				</div>
				{selectedNetwork.features && selectedNetwork.features.length > 0 && (
					<div className="mt-1 flex flex-wrap gap-1">
						{selectedNetwork.features.slice(0, 3).map((feature) => (
							<span key={feature} className="bg-network-primary/20 text-network-primary px-1 rounded text-xs">
								{feature}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Keyboard shortcuts help */}
			<div className="bg-theme-surface/90 backdrop-blur-sm border border-theme text-theme-primary text-xs rounded-lg opacity-75 hover:opacity-100 transition-all duration-300 overflow-hidden">
				<div className="p-3 space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-theme-secondary">Focus Mode:</span>
						<kbd className="bg-theme-surface-variant px-2 py-1 rounded border text-theme-primary font-mono">
							{modifierKey}+F
						</kbd>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-theme-secondary">Reset Layout:</span>
						<kbd className="bg-theme-surface-variant px-2 py-1 rounded border text-theme-primary font-mono">
							Esc
						</kbd>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-theme-secondary">Search Networks:</span>
						<kbd className="bg-theme-surface-variant px-2 py-1 rounded border text-theme-primary font-mono">
							{modifierKey}+K
						</kbd>
					</div>
				</div>
				<button
					onClick={() => setIsVisible(false)}
					className="w-full p-2 bg-theme-surface-variant hover:bg-theme-surface-variant/80 transition-colors text-center text-theme-tertiary"
				>
					<X className="w-3 h-3 mx-auto" />
				</button>
			</div>
		</div>
	);
});

// Main Dashboard Component with Enhanced Theme Support
function BlockchainDashboard() {
	const wallet = useWallet();
	const { isDarkTheme } = useTheme();
	const [selectedNetwork, setSelectedNetwork] = useState<Network>(() =>
		networkManager.getNetworkByName("Polkadot") || networkManager.getFeaturedNetworks()[0]
	);
	const [layoutMode, setLayoutMode] = useState<LayoutMode>("normal");
	const [networkSelectorOpen, setNetworkSelectorOpen] = useState(false);

	const mountedRef = useRef(true);
	const autoConnectAttemptedRef = useRef(false);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const { api, status: chainStatus, error } = usePolkadotApi(
		selectedNetwork,
		wallet.status === "connected"
	);

	// Auto-connect wallet on mount with enhanced logic
	useEffect(() => {
		if (!autoConnectAttemptedRef.current &&
			wallet.status === "disconnected" &&
			wallet.connectedWalletId &&
			mountedRef.current) {
			autoConnectAttemptedRef.current = true;

			const timeoutId = setTimeout(() => {
				if (mountedRef.current && wallet.status === "disconnected") {
					wallet.connect(wallet.connectedWalletId);
				}
			}, 100);

			return () => clearTimeout(timeoutId);
		}
	}, [wallet.status, wallet.connectedWalletId, wallet.connect]);

	useEffect(() => {
		if (wallet.status !== "disconnected") {
			autoConnectAttemptedRef.current = false;
		}
	}, [wallet.status]);

	// Enhanced layout management
	const handleLayoutToggle = useCallback(() => {
		setLayoutMode(prev => {
			switch (prev) {
				case "normal": return "transaction-focused";
				case "transaction-focused": return "transaction-fullscreen";
				case "transaction-fullscreen": return "normal";
				default: return "normal";
			}
		});
	}, []);

	const handleTransactionFocus = useCallback((focused: boolean) => {
		setLayoutMode(focused ? "transaction-focused" : "normal");
	}, []);

	const handleNetworkChange = useCallback((network: Network) => {
		try {
			const validatedNetwork = NetworkSchema.parse(network);
			setSelectedNetwork(validatedNetwork);

			// Update document data attribute for network-specific theming
			document.documentElement.setAttribute('data-network', network.name.toLowerCase().replace(/\s+/g, '-'));
		} catch (error) {
			console.error('Invalid network:', error);
		}
	}, []);

	// Enhanced keyboard shortcuts with Mac support
	useEffect(() => {
		const handleKeyboard = (e: KeyboardEvent) => {
			const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

			if (isCmdOrCtrl) {
				switch (e.key.toLowerCase()) {
					case 'f':
						e.preventDefault();
						handleLayoutToggle();
						break;
					case 'k':
						e.preventDefault();
						setNetworkSelectorOpen(true);
						break;
				}
			}

			if (e.key === 'Escape') {
				e.preventDefault();
				setLayoutMode("normal");
				setNetworkSelectorOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyboard);
		return () => window.removeEventListener('keydown', handleKeyboard);
	}, [handleLayoutToggle]);

	// Update network-specific CSS variables
	useEffect(() => {
		const networkColors = {
			polkadot: { primary: '#e6007a', secondary: '#bc318f', light: '#fae6f2', dark: '#9c0054' },
			kusama: { primary: '#000000', secondary: '#333333', light: '#f5f5f5', dark: '#000000' },
			westend: { primary: '#46ddd2', secondary: '#37b3aa', light: '#e0faf8', dark: '#2c8c85' },
			paseo: { primary: '#ff7b00', secondary: '#d98a37', light: '#fff0e0', dark: '#b35600' },
		};

		const networkKey = selectedNetwork.name.toLowerCase() as keyof typeof networkColors;
		const colors = networkColors[networkKey] || networkColors.polkadot;

		Object.entries(colors).forEach(([key, value]) => {
			document.documentElement.style.setProperty(`--network-${key}`, value);
		});
	}, [selectedNetwork.name]);

	// Memoized computed values
	const displayError = useMemo(() => error || wallet.error, [error, wallet.error]);
	const isFullyConnected = useMemo(() =>
		wallet.status === "connected" && chainStatus === "connected" && api,
		[wallet.status, chainStatus, api]
	);

	const handleRetry = useCallback(() => {
		if (wallet.status === "disconnected") {
			wallet.connect();
		}
	}, [wallet.status, wallet.connect]);

	const MainContent = useMemo(() => {
		if (!isFullyConnected || !wallet.activeAccount) {
			return (
				<NotConnectedState
					walletStatus={wallet.status}
					chainStatus={chainStatus}
					selectedNetwork={selectedNetwork}
					onWalletConnect={() => wallet.connect()}
				/>
			);
		}

		return (
			<MainDashboardContent
				api={api}
				network={selectedNetwork}
				account={wallet.activeAccount}
				layoutMode={layoutMode}
				onTransactionFocus={handleTransactionFocus}
			/>
		);
	}, [isFullyConnected, wallet.activeAccount, wallet.status, chainStatus, api, selectedNetwork, wallet.connect, layoutMode, handleTransactionFocus]);

	const shouldShowSpinner = useMemo(() =>
		chainStatus === "connecting" && wallet.status === "connected",
		[chainStatus, wallet.status]
	);

	// Container classes based on layout mode and theme
	const containerClasses = useMemo(() => {
		const base = "transition-all duration-300 ease-in-out min-h-screen bg-background";

		if (layoutMode === "transaction-fullscreen") {
			return `${base} fixed inset-0 z-40 overflow-y-auto`;
		}

		return `${base} container mx-auto p-4 max-w-7xl`;
	}, [layoutMode]);

	return (
		<NotificationProvider>
			<div className={containerClasses}>
				<DashboardHeader
					selectedNetwork={selectedNetwork}
					wallet={wallet}
					layoutMode={layoutMode}
					onNetworkChange={handleNetworkChange}
					onLayoutToggle={handleLayoutToggle}
				/>

				<ConnectionStatusDisplay
					walletStatus={wallet.status}
					chainStatus={chainStatus}
					layoutMode={layoutMode}
					selectedNetwork={selectedNetwork}
				/>

				{displayError && layoutMode !== "transaction-fullscreen" && (
					<ErrorDisplay error={displayError} onRetry={handleRetry} />
				)}

				{shouldShowSpinner ? (
					<LoadingSpinner message="Establishing secure connection to blockchain..." />
				) : (
					MainContent
				)}

				{/* Keyboard shortcuts help */}
				<KeyboardShortcutsHelp layoutMode={layoutMode} selectedNetwork={selectedNetwork} />

				{/* Enhanced fullscreen mode indicator */}
				{layoutMode === "transaction-fullscreen" && (
					<div className="fixed top-4 left-4 z-50 animate-slideInDown">
						<div className="bg-network-primary text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-3 shadow-lg">
							<Maximize2 className="w-4 h-4" />
							<span className="font-medium">Transaction Builder - Fullscreen Mode</span>
							<button
								onClick={() => setLayoutMode("normal")}
								className="ml-3 hover:bg-white/20 p-1 rounded transition-colors"
								title={`Exit Fullscreen (${modifierKey}+F)`}
							>
								<Minimize2 className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}

				{/* Mobile responsiveness indicator */}
				{typeof window !== 'undefined' && window.innerWidth < 768 && (
					<div className="fixed bottom-4 left-4 z-10">
						<div className="bg-info/20 border border-info/40 text-info px-3 py-2 rounded-lg text-xs flex items-center space-x-2">
							<Smartphone className="w-4 h-4" />
							<span>Mobile optimized</span>
						</div>
					</div>
				)}
			</div>
			<NotificationContainer />
		</NotificationProvider>
	);
}

export default memo(BlockchainDashboard);