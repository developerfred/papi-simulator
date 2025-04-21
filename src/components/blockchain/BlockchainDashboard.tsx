"use client";

import React from "react";
import Link from "next/link";
import { useSafeConnection } from "@/hooks/useSafeConnection";
import { useAutoConnectOnMount } from "@/hooks/useAutoConnectOnMount";
import {
	ChainStatus,
	BlockExplorer,
	AccountBalance,
	TransactionForm,
	EventMonitor,
} from "./components";
import { TEST_ACCOUNTS } from "@/lib/constants/accounts";
import { Button, Card, NetworkBadge } from "@/components/ui";
import type { Network } from "@/lib/types/network";

export default function BlockchainDashboard() {
	const {
		isConnected,
		isConnecting,
		connectionError,
		safeConnect,
		safeDisconnect,
		selectedNetwork,
	} = useSafeConnection();

	useAutoConnectOnMount(safeConnect, isConnecting);

	const displayError = connectionError;

	return (
		<div className="container mx-auto p-4">
			<DashboardHeader
				selectedNetwork={selectedNetwork}
				isConnected={isConnected}
				isConnecting={isConnecting}
				onConnect={safeConnect}
				onDisconnect={safeDisconnect}
			/>

			<ChainStatus />

			{displayError && <ErrorDisplay error={displayError} />}

			{isConnected ? (
				<ConnectedDashboardContent selectedNetwork={selectedNetwork} />
			) : (
				<NotConnectedState
					isConnecting={isConnecting}
					error={displayError}
					onConnect={safeConnect}
				/>
			)}
		</div>
	);
}

// Subcomponentes reutilizados

function DashboardHeader({
	selectedNetwork,
	isConnected,
	isConnecting,
	onConnect,
	onDisconnect,
}: {
	selectedNetwork: Network;
	isConnected: boolean;
	isConnecting: boolean;
	onConnect: () => void;
	onDisconnect: () => void;
}) {
	return (
		<div className="mb-6 flex justify-between items-center">
			<div>
				<h1 className="text-2xl font-bold mb-1">Blockchain Dashboard</h1>
				<p className="text-sm opacity-70">
					Interacting with {selectedNetwork.name} using Polkadot-API
				</p>
			</div>

			<div className="flex items-center space-x-4">
				<NetworkBadge network={selectedNetwork} />

				{isConnected ? (
					<Button variant="outline" onClick={onDisconnect} size="sm">
						Disconnect
					</Button>
				) : (
					<Button
						variant="primary"
						onClick={onConnect}
						disabled={isConnecting}
						size="sm"
					>
						{isConnecting ? "Connecting..." : "Connect"}
					</Button>
				)}

				<Link href="/">
					<Button variant="secondary" size="sm">
						Back to Playground
					</Button>
				</Link>
			</div>
		</div>
	);
}

function ErrorDisplay({ error }: { error: Error }) {
	return (
		<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
			<p className="font-medium">Connection Error</p>
			<p>{error.message}</p>
		</div>
	);
}

function ConnectedDashboardContent({ selectedNetwork }: { selectedNetwork: Network }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div className="space-y-6">
				<AccountBalance
					network={selectedNetwork}
					initialAddress={TEST_ACCOUNTS.alice}
				/>
				<TransactionForm
					network={selectedNetwork}
					senderAddress={TEST_ACCOUNTS.alice}
				/>
			</div>
			<div className="md:col-span-2 space-y-6">
				<BlockExplorer network={selectedNetwork} limit={5} />
				<EventMonitor network={selectedNetwork} limit={10} />
			</div>
		</div>
	);
}

function NotConnectedState({
	isConnecting,
	error,
	onConnect,
}: {
	isConnecting: boolean;
	error: Error | null;
	onConnect: () => void;
}) {
	return (
		<Card className="p-8 text-center">
			<div className="max-w-lg mx-auto">
				<div className="mb-4">
					<NetworkDisconnectedIcon />
				</div>

				<h2 className="text-xl font-semibold mb-2">
					{error ? "Connection Error" : "Not Connected to Blockchain"}
				</h2>

				<p className="mb-6 opacity-70">
					{error
						? `Unable to connect: ${error.message}`
						: "Connect to the blockchain to view the dashboard and interact with the network."}
				</p>

				<Button variant="primary" onClick={onConnect} disabled={isConnecting}>
					{isConnecting ? "Connecting..." : "Connect Now"}
				</Button>
			</div>
		</Card>
	);
}

function NetworkDisconnectedIcon() {
	return (
		<svg
			width="64"
			height="64"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="mx-auto opacity-40"
		>
			<rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
			<rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
			<line x1="6" y1="6" x2="6.01" y2="6" />
			<line x1="6" y1="18" x2="6.01" y2="18" />
		</svg>
	);
}
