"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useChain } from "@/context/ChainProvider";

export function useSafeConnection() {
	
	const { connectionState, selectedNetwork } = useChain();

	const isConnected = connectionState.state === "connected";
	const isConnecting = connectionState.state === "connecting";
	const connectionError = connectionState.error || null;

	const [localError, setLocalError] = useState<Error | null>(null);
	const [isLocalConnecting, setIsLocalConnecting] = useState(false);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const safeConnect = useCallback(async () => {
		try {
			if (!isMountedRef.current) return;

			setIsLocalConnecting(true);
			setLocalError(null);

			// Access the connect function from the context
			if (connectionState.connect) {
				await connectionState.connect();
			}
		} catch (error) {
			if (!isMountedRef.current) return;

			const err = error instanceof Error
				? error
				: new Error(typeof error === "string" ? error : "Unknown error");
			setLocalError(err);
		} finally {
			if (isMountedRef.current) {
				setIsLocalConnecting(false);
			}
		}
	}, [connectionState]);

	const safeDisconnect = useCallback(() => {
		try {
			if (connectionState.disconnect) {
				connectionState.disconnect();
			}
			setLocalError(null);
		} catch (error) {
			const err = error instanceof Error
				? error
				: new Error(typeof error === "string" ? error : "Disconnection failed");
			setLocalError(err);
		}
	}, [connectionState]);

	return {
		isConnecting: isConnecting || isLocalConnecting,
		isConnected,
		connectionError: connectionError || localError,
		safeConnect,
		safeDisconnect,
		selectedNetwork
	};
}