/* eslint-disable  @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useChain } from "@/context/ChainProvider";
import { useRuntimeVersion } from "@/hooks/useChainSubscriptions";
import { useBlockNumber} from "@/hooks/useBlockNumber";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useTheme } from "@/lib/theme/ThemeProvider";
import NetworkBadge from "@/components/ui/NetworkBadge";

/**
 * Component that displays the current blockchain connection status
 */
export default function ChainStatus() {
	const { getColor, getNetworkColor } = useTheme();
	const { isConnecting, isConnected, error, selectedNetwork } = useChain();

	// Get runtime version when connected
	const { version } = useRuntimeVersion();

	// Get current block number when connected
	const { blockNumber } = useBlockNumber({
		enabled: isConnected,
		refetchInterval: 10000, // Refresh every 10 seconds
	});

	return (
		<Card className="overflow-hidden">
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<NetworkBadge network={selectedNetwork} size="sm" />
						<span className="font-medium">{selectedNetwork.name} Network</span>
					</div>

					<ConnectionStatus
						isConnecting={isConnecting}
						isConnected={isConnected}
						error={error}
					/>
				</div>

				{isConnected && (
					<div className="mt-4 space-y-3 text-sm">
						<div className="flex justify-between items-center">
							<span style={{ color: getColor("textSecondary") }}>
								Current Block:
							</span>
							<span className="font-mono">
								{blockNumber !== null
									? blockNumber.toLocaleString()
									: "Loading..."}
							</span>
						</div>

						{version && (
							<>
								<div className="flex justify-between items-center">
									<span style={{ color: getColor("textSecondary") }}>
										Runtime:
									</span>
									<span className="font-mono">
										{version.specName} v{version.specVersion}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span style={{ color: getColor("textSecondary") }}>
										Transaction Version:
									</span>
									<span className="font-mono">
										{version.transactionVersion}
									</span>
								</div>
							</>
						)}

						<div className="flex justify-between items-center">
							<span style={{ color: getColor("textSecondary") }}>
								Endpoint:
							</span>
							<span
								className="font-mono text-xs truncate max-w-44"
								title={selectedNetwork.endpoint}
							>
								{selectedNetwork.endpoint}
							</span>
						</div>
					</div>
				)}

				{error && (
					<div
						className="mt-2 text-sm p-2 rounded"
						style={{
							backgroundColor: `${getColor("error")}20`,
							color: getColor("error"),
						}}
					>
						{error.message}
					</div>
				)}
			</div>
		</Card>
	);
}

/**
 * Connection status indicator component
 */
function ConnectionStatus({
	isConnecting,
	isConnected,
	error,
}: {
	isConnecting: boolean;
	isConnected: boolean;
	error: Error | null;
}) {
	if (isConnecting) {
		return <Badge variant="warning">Connecting...</Badge>;
	}

	if (error) {
		return <Badge variant="error">Error</Badge>;
	}

	if (isConnected) {
		return <Badge variant="success">Connected</Badge>;
	}

	return <Badge variant="default">Disconnected</Badge>;
}
