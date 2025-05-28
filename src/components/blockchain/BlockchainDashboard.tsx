"use client";

import type React from "react";
import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import Link from "next/link";
import { z } from "zod";
import { useWallet } from "@/hooks/useWallet";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Button, Card, NetworkBadge } from "@/components/ui";
import { NotificationContainer, NotificationProvider } from "@/blockchain/Notification";
import { Minimize2, Maximize2, Layout, Zap } from "lucide-react";
import dynamic from "next/dynamic";

// Schemas
const NetworkSchema = z.object({
	name: z.string(),
	rpcUrl: z.string().url(),
	symbol: z.string(),
	decimals: z.number().int().positive(),
	ss58Format: z.number().int().min(0),
});

const WalletAccountSchema = z.object({
	address: z.string(),
	meta: z.object({
		name: z.string().optional(),
		source: z.string().optional(),
	}).optional(),
	name: z.string().optional(),
}).passthrough();

// Types
type Network = z.infer<typeof NetworkSchema>;
type WalletAccount = z.infer<typeof WalletAccountSchema>;
type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

interface ChainConnectionState {
	api: ApiPromise | null;
	status: ConnectionStatus;
	error: string | null;
}

// Layout modes for better UX
type LayoutMode = "normal" | "transaction-focused" | "transaction-fullscreen";

// Constants
const NETWORKS: Network[] = [
	{ name: "Polkadot", rpcUrl: "wss://rpc.polkadot.io", symbol: "DOT", decimals: 10, ss58Format: 0 },
	{ name: "Kusama", rpcUrl: "wss://kusama-rpc.polkadot.io", symbol: "KSM", decimals: 12, ss58Format: 2 },
	{ name: "Westend", rpcUrl: "wss://westend-rpc.polkadot.io", symbol: "WND", decimals: 12, ss58Format: 42 },
];

const STATUS_CONFIG = {
	connected: { color: "bg-green-500", label: "Connected" },
	connecting: { color: "bg-yellow-500", label: "Connecting" },
	disconnected: { color: "bg-gray-400", label: "Disconnected" },
	error: { color: "bg-red-500", label: "Error" },
} as const;

// Enhanced dynamic imports with better loading states
const createDynamicComponent = (importFn: () => Promise<any>, height = "200px") =>
	dynamic(importFn, {
		loading: () => (
			<div className={`min-h-[${height}] flex items-center justify-center`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
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
						setState(prev => ({ ...prev, status: "error", error: "Connection timeout" }));
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
					const error = err instanceof Error ? err.message : "Failed to connect";
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
	}, [network.rpcUrl, isWalletConnected]);

	return state;
};

// Utility functions
const getAccountDisplayName = (account: WalletAccount | null): string =>
	account?.meta?.name ||
	account?.name ||
	(account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "Connect");

const getStatusMessage = (walletStatus: string, chainStatus: ConnectionStatus): string => {
	const messages = {
		error: "Connection error detected. Check your wallet and network settings.",
		disconnected: "Connect your wallet to start exploring the blockchain.",
		connecting: "Wallet connected. Connecting to blockchain...",
		default: "Initializing connections..."
	};

	if (chainStatus === "error") return messages.error;
	if (walletStatus === "disconnected") return messages.disconnected;
	if (walletStatus === "connected" && chainStatus !== "connected") return messages.connecting;
	return messages.default;
};

// Enhanced reusable components
const StatusIndicator = memo<{ status: ConnectionStatus }>(({ status }) => {
	const config = STATUS_CONFIG[status];
	return (
		<div className="flex items-center space-x-2">
			<div className={`w-2 h-2 rounded-full ${config.color}`} />
			<span className="text-xs text-gray-600">{config.label}</span>
		</div>
	);
});

const ErrorDisplay = memo<{ error: string }>(({ error }) => (
	<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
		<p className="font-medium">Connection Error</p>
		<p className="text-sm">{error}</p>
	</div>
));

const LoadingSpinner = memo(() => (
	<div className="flex justify-center items-center min-h-[300px]">
		<div className="text-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
			<p className="mt-3 text-gray-600">Initializing blockchain connection...</p>
		</div>
	</div>
));

const NetworkDisconnectedIcon = memo(() => (
	<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
		strokeWidth="1" className="mx-auto opacity-40">
		<rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
		<rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
		<line x1="6" y1="6" x2="6.01" y2="6" />
		<line x1="6" y1="18" x2="6.01" y2="18" />
	</svg>
));

// Enhanced Dashboard Header with layout controls
const DashboardHeader = memo<{
	selectedNetwork: Network;
	wallet: ReturnType<typeof useWallet>;
	layoutMode: LayoutMode;
	onNetworkChange: (network: Network) => void;
	onLayoutToggle: () => void;
}>(({ selectedNetwork, wallet, layoutMode, onNetworkChange, onLayoutToggle }) => {
	const handleNetworkChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const network = NETWORKS.find(n => n.name === e.target.value);
		if (network) onNetworkChange(network);
	}, [onNetworkChange]);

	const WalletButton = useMemo(() => {
		if (wallet.status === "connected") {
			return (
				<div className="flex items-center space-x-2">
					<span className="text-sm text-green-600">
						{getAccountDisplayName(wallet.activeAccount)}
					</span>
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
			>
				{wallet.status === "connecting" ? "Connecting..." : "Connect Wallet"}
			</Button>
		);
	}, [wallet.status, wallet.activeAccount, wallet.disconnect, wallet.connect]);

	// Don't show header in fullscreen mode
	if (layoutMode === "transaction-fullscreen") return null;

	return (
		<div className={`mb-6 flex justify-between items-center transition-all duration-300 ${layoutMode === "transaction-focused" ? "opacity-75 scale-95" : ""
			}`}>
			<div>
				<h1 className="text-2xl font-bold mb-1 flex items-center space-x-2">
					<Layout className="w-6 h-6 text-blue-500" />
					<span>Blockchain Explorer</span>
				</h1>
				<p className="text-sm opacity-70">Exploring {selectedNetwork.name} with Polkadot-JS API</p>
			</div>

			<div className="flex items-center space-x-4">
				{/* Layout Toggle Button */}
				<Button
					variant="outline"
					size="sm"
					onClick={onLayoutToggle}
					className="flex items-center space-x-1"
					title="Toggle Transaction Builder Focus"
				>
					{layoutMode === "normal" ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
				</Button>

				<select
					value={selectedNetwork.name}
					onChange={handleNetworkChange}
					className="px-3 py-1 border rounded-md text-sm"
				>
					{NETWORKS.map(network => (
						<option key={network.name} value={network.name}>
							{network.name}
						</option>
					))}
				</select>

				<NetworkBadge network={selectedNetwork} />
				{WalletButton}

				<Link href="/">
					<Button variant="secondary" size="sm">Back to Playground</Button>
				</Link>
			</div>
		</div>
	);
});

const ConnectionStatusDisplay = memo<{
	walletStatus: string;
	chainStatus: ConnectionStatus;
	layoutMode: LayoutMode;
}>(({ walletStatus, chainStatus, layoutMode }) => {
	// Hide or minimize in focused modes
	if (layoutMode === "transaction-fullscreen") return null;

	return (
		<div className={`mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${layoutMode === "transaction-focused" ? "opacity-50 scale-95" : ""
			}`}>
			<Card className="p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium">Wallet Status</h3>
					<StatusIndicator status={walletStatus as ConnectionStatus} />
				</div>
			</Card>

			<Card className="p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium">Blockchain Status</h3>
					<StatusIndicator status={chainStatus} />
				</div>
			</Card>
		</div>
	);
});

const NotConnectedState = memo<{
	walletStatus: string;
	chainStatus: ConnectionStatus;
	onWalletConnect: () => void;
}>(({ walletStatus, chainStatus, onWalletConnect }) => {
	const statusMessage = useMemo(() =>
		getStatusMessage(walletStatus, chainStatus),
		[walletStatus, chainStatus]
	);

	const showConnectButton = walletStatus === "disconnected";

	return (
		<Card className="p-8 text-center">
			<div className="max-w-lg mx-auto">
				<div className="mb-4">
					<NetworkDisconnectedIcon />
				</div>
				<h2 className="text-xl font-semibold mb-2">Blockchain Explorer</h2>
				<p className="mb-6 opacity-70">{statusMessage}</p>
				{showConnectButton && (
					<Button variant="primary" onClick={onWalletConnect}>
						Connect Wallet
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
			<div className="fixed inset-0 z-50 bg-white">
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

				{/* Minimized explorer components */}
				<details className="group">
					<summary className="cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
						<span className="font-medium">Show Advanced Tools</span>
						<span className="ml-2 text-sm text-gray-500 group-open:hidden">
							(Block Explorer, Events, Transactions)
						</span>
					</summary>
					<div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
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
				<div className="relative">
					<TransactionBuilder {...transactionBuilderProps} />
					{/* Focus button overlay */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => onTransactionFocus(true)}
						className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center space-x-1"
						title="Focus Transaction Builder"
					>
						<Zap className="w-4 h-4" />
						<span>Focus</span>
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

// Main Dashboard Component with Enhanced Layout Management
function BlockchainDashboard() {
	const wallet = useWallet();
	const [selectedNetwork, setSelectedNetwork] = useState<Network>(NETWORKS[0]);
	const [layoutMode, setLayoutMode] = useState<LayoutMode>("normal");

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
		} catch (error) {
			console.error('Invalid network:', error);
		}
	}, []);

	// Keyboard shortcuts for layout
	useEffect(() => {
		const handleKeyboard = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key) {
					case 'f':
						e.preventDefault();
						handleLayoutToggle();
						break;
					case 'Escape':
						e.preventDefault();
						setLayoutMode("normal");
						break;
				}
			}
		};

		window.addEventListener('keydown', handleKeyboard);
		return () => window.removeEventListener('keydown', handleKeyboard);
	}, [handleLayoutToggle]);

	// Memoized computed values
	const displayError = useMemo(() => error || wallet.error, [error, wallet.error]);
	const isFullyConnected = useMemo(() =>
		wallet.status === "connected" && chainStatus === "connected" && api,
		[wallet.status, chainStatus, api]
	);

	const MainContent = useMemo(() => {
		if (!isFullyConnected || !wallet.activeAccount) {
			return (
				<NotConnectedState
					walletStatus={wallet.status}
					chainStatus={chainStatus}
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

	// Container classes based on layout mode
	const containerClasses = useMemo(() => {
		const base = "transition-all duration-300 ease-in-out";

		if (layoutMode === "transaction-fullscreen") {
			return `${base} fixed inset-0 z-40 bg-white overflow-y-auto`;
		}

		return `${base} container mx-auto p-4`;
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
				/>

				{displayError && layoutMode !== "transaction-fullscreen" && (
					<ErrorDisplay error={displayError} />
				)}

				{shouldShowSpinner ? <LoadingSpinner /> : MainContent}

				{/* Keyboard shortcuts help - only in normal mode */}
				{layoutMode === "normal" && (
					<div className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white text-xs rounded opacity-75 hover:opacity-100 transition-opacity">
						<div>Ctrl+F: Focus Transaction Builder</div>
						<div>Esc: Reset Layout</div>
					</div>
				)}
			</div>
			<NotificationContainer />
		</NotificationProvider>
	);
}

export default memo(BlockchainDashboard);