"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useChain } from "@/hooks/useChain";

export function useSafeConnection() {
	const {
		isConnecting,
		isConnected,
		connect,
		disconnect,
		error: contextError,
		network
	} = useChain();

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

			if (network) {
				await connect(network);
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
	}, [connect, network]);

	const safeDisconnect = useCallback(() => {
		try {
			disconnect();
			setLocalError(null);
		} catch (error) {
			const err = error instanceof Error
				? error
				: new Error(typeof error === "string" ? error : "Disconnection failed");
			setLocalError(err);
		}
	}, [disconnect]);

	return {
		isConnecting: isConnecting || isLocalConnecting,
		isConnected,
		error: contextError || localError,
		safeConnect,
		safeDisconnect,
		network
	};
}