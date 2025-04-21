import {
	useState,
	useEffect,
	useRef,
	useCallback,
	Dispatch,
	SetStateAction,
} from "react";

export function useAutoConnectOnMount(
	connectFn: () => Promise<void> | void,
	isConnecting: boolean,
) {
	const [autoConnectAttempted, setAutoConnectAttempted] =
		useState<boolean>(false);
	const isMountedRef = useRef(true);

	const safeSetState = useCallback(
		<T>(setter: Dispatch<SetStateAction<T>>, value: T) => {
			if (isMountedRef.current) {
				setter(value);
			}
		},
		[],
	);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (isConnecting || autoConnectAttempted) return;

		const attemptConnect = async () => {
			try {
				await connectFn();
				// Usar um cast explícito para SetStateAction<boolean>
				safeSetState<boolean>(
					setAutoConnectAttempted as Dispatch<SetStateAction<boolean>>,
					true,
				);
			} catch (error) {
				console.error("Auto connect failed:", error);
				safeSetState<boolean>(
					setAutoConnectAttempted as Dispatch<SetStateAction<boolean>>,
					false,
				);
			}
		};

		attemptConnect();
	}, [connectFn, isConnecting, autoConnectAttempted, safeSetState]);
}
