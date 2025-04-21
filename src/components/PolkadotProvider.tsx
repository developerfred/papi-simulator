"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useChainStore } from "@/store/useChainStore";
import { DEFAULT_NETWORK } from "@/lib/constants/networks";
import type { Network } from "@/lib/types/network";


export const PolkadotContext = createContext<{
	isConnecting: boolean;
	isConnected: boolean;
	connect: (network?: Network) => void;
	disconnect: () => void;
	error: Error | null;
}>({
	isConnecting: false,
	isConnected: false,
	connect: () => {},
	disconnect: () => {},
	error: null,
});

export const PolkadotProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const connectionStatus = useChainStore((state) => state.connectionStatus);
	const connect = useChainStore((state) => state.connect);
	const disconnect = useChainStore((state) => state.disconnect);
	const network = useChainStore((state) => state.network);

	
	const isConnected = connectionStatus.state === "connected";

	
	useEffect(() => {
		handleConnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	
	const handleConnect = (customNetwork?: Network) => {
		setIsConnecting(true);
		setError(null);

		const targetNetwork = customNetwork || network || DEFAULT_NETWORK;

		const subscription = connect(targetNetwork).subscribe({
			next: () => {
				setIsConnecting(false);
			},
			error: (err) => {
				console.error("Connection error:", err);
				setError(err instanceof Error ? err : new Error(String(err)));
				setIsConnecting(false);
			},
			complete: () => {
				setIsConnecting(false);
			},
		});

		return () => subscription.unsubscribe();
	};

	return (
		<PolkadotContext.Provider
			value={{
				isConnecting,
				isConnected,
				connect: handleConnect,
				disconnect,
				error,
			}}
		>
			{children}
		</PolkadotContext.Provider>
	);
};


export const usePolkadot = () => useContext(PolkadotContext);
