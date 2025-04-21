/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import type { PolkadotClient } from "polkadot-api";
import type { Network } from "@/lib/types/network";
import { DEFAULT_NETWORK } from "@/lib/constants/networks";

import { setupGlobalPromiseErrorHandler } from "@/lib/utils/PromiseErrorHandler";
import { createPolkadotClient } from "@/lib/utils/polkadotClientFactory";

// Define the connection states more precisely
type ConnectionState =
	| { state: 'idle' }
	| { state: 'connecting' }
	| { state: 'connected', client: PolkadotClient }
	| { state: 'error', error: Error };

interface ChainContextType {
	connectionState: ConnectionState;
	selectedNetwork: Network;
	connect: (network: Network) => Promise<void>;
	disconnect: () => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{
	children: React.ReactNode;
	initialNetwork?: Network;
}> = ({ children, initialNetwork = DEFAULT_NETWORK }) => {
	const [connectionState, setConnectionState] = useState<ConnectionState>({
		state: 'idle'
	});
	const [selectedNetwork, setSelectedNetwork] = useState<Network>(initialNetwork);

	const connect = useCallback(async (networkToConnect: Network) => {
		try {
			// Set connecting state
			setConnectionState({ state: 'connecting' });
			setSelectedNetwork(networkToConnect);

			// Create the client
			const client = await createPolkadotClient(networkToConnect);

			// Set connected state with the client
			setConnectionState({
				state: 'connected',
				client
			});
		} catch (err) {
			// Handle connection errors
			const error = err instanceof Error
				? err
				: new Error('Failed to connect to network');

			setConnectionState({
				state: 'error',
				error
			});

			// Rethrow to allow caller to handle
			throw error;
		}
	}, []);

	const disconnect = useCallback(() => {
		if (connectionState.state === 'connected') {
			try {
				// Properly destroy the client if possible
				connectionState.client.destroy();
			} catch (err) {
				console.error('Error during disconnection:', err);
			}
		}

		// Reset to idle state
		setConnectionState({ state: 'idle' });
	}, [connectionState]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

	// Setup global error handler
	useEffect(() => {
		setupGlobalPromiseErrorHandler();
	}, []);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo<ChainContextType>(() => ({
		connectionState,
		selectedNetwork,
		connect,
		disconnect
	}), [connectionState, selectedNetwork, connect, disconnect]);

	return (
		<ChainContext.Provider value={contextValue}>
			{children}
		</ChainContext.Provider>
	);
};

// Custom hook to use the chain context
export const useChain = () => {
	const context = useContext(ChainContext);

	if (context === undefined) {
		throw new Error("useChain must be used within a ChainProvider");
	}

	// Destructure and add helpful properties
	const { connectionState, selectedNetwork, connect, disconnect } = context;

	return {
		...context,
		isConnecting: connectionState.state === 'connecting',
		isConnected: connectionState.state === 'connected',
		error: connectionState.state === 'error' ? connectionState.error : null,
		client: connectionState.state === 'connected' ? connectionState.client : null,
	};
};