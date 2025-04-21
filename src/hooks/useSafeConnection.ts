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

    const safeSetState = useCallback(
        <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
            if (isMountedRef.current) {
                setter(value);
            }
        },
        []
    );

    const safePromise = async <T,>(promise: Promise<T>): Promise<T | null> => {
        try {
            return await promise;
        } catch (err) {
            console.error("Promise error:", err);
            return null;
        }
    };

    const safeConnect = useCallback(async () => {
        try {
            safeSetState(setIsLocalConnecting, true);
            connectionRef.current.isAttemptingConnection = true;
            safeSetState(setConnectionError, null);
            await safePromise(connect(selectedNetwork));
        } catch (err) {
            let errorMessage = 'Erro desconhecido';
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                if (err.message) {
                    errorMessage = err.message;
                } else if (err.error && err.error.message) {
                    errorMessage = err.error.message;
                } else {
                    errorMessage = JSON.stringify(err);
                }
            } else {
                errorMessage = String(err);
            }
            safeSetState(setConnectionError, new Error(errorMessage));
        } finally {
            connectionRef.current.isAttemptingConnection = false;
            safeSetState(setIsLocalConnecting, false);
        }
    }, [connect, selectedNetwork, isConnecting, isLocalConnecting, safeSetState]);

    const safeDisconnect = useCallback(() => {
        try {
            disconnect();
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            safeSetState(setConnectionError, e);
        }
    }, [disconnect, safeSetState]);


    return {
        isConnecting: isConnecting || isLocalConnecting,
        isConnected,
        connectionError: error || connectionError,
        safeConnect,
        safeDisconnect,
        selectedNetwork,
    };
}
