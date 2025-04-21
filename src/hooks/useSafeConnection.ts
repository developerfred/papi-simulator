import { useCallback, useRef, useEffect, useState } from "react";
import { useChain } from "@/hooks";

export function useSafeConnection() {
	const {
		isConnecting,
		isConnected,
		error,
		selectedNetwork,
		connect,
		disconnect,
	} = useChain();

	const [connectionError, setConnectionError] = useState<Error | null>(null);
	const [isLocalConnecting, setIsLocalConnecting] = useState(false);

	const isMountedRef = useRef(true);

	const connectionRef = useRef({ isAttemptingConnection: false });

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Use a generic type that works with boolean values
	const safeBooleanSetState = useCallback(
		(setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
			if (isMountedRef.current) {
				setter(value);
			}
		},
		[],
	);

	// Use a separate function for setting null values
	const safeErrorSetState = useCallback(
		(
			setter: React.Dispatch<React.SetStateAction<Error | null>>,
			value: Error | null,
		) => {
			if (isMountedRef.current) {
				setter(value);
			}
		},
		[],
	);

	const safePromise = async <T>(promise: Promise<T>): Promise<T | null> => {
		try {
			return await promise;
		} catch (err) {
			console.error("Promise error:", err);
			return null;
		}
	};

	const safeConnect = useCallback(async () => {
		try {
			safeBooleanSetState(setIsLocalConnecting, true);
			connectionRef.current.isAttemptingConnection = true;
			safeErrorSetState(setConnectionError, null);
			await safePromise(connect(selectedNetwork));
		} catch (err) {
			let errorMessage = "Erro desconhecido";
			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (typeof err === "object" && err !== null) {
				if ("message" in err) {
					errorMessage = String(err.message);
				} else if (
					"error" in err &&
					err.error &&
					typeof err.error === "object" &&
					"message" in err.error
				) {
					errorMessage = String(err.error.message);
				} else {
					errorMessage = JSON.stringify(err);
				}
			} else {
				errorMessage = String(err);
			}
			safeErrorSetState(setConnectionError, new Error(errorMessage));
		} finally {
			connectionRef.current.isAttemptingConnection = false;
			safeBooleanSetState(setIsLocalConnecting, false);
		}
	}, [connect, selectedNetwork, safeBooleanSetState, safeErrorSetState]);

	const safeDisconnect = useCallback(() => {
		try {
			disconnect();
		} catch (err) {
			const e = err instanceof Error ? err : new Error(String(err));
			safeErrorSetState(setConnectionError, e);
		}
	}, [disconnect, safeErrorSetState]);

	return {
		isConnecting: isConnecting || isLocalConnecting,
		isConnected,
		connectionError: error || connectionError,
		safeConnect,
		safeDisconnect,
		selectedNetwork,
	};
}
