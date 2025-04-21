import { useEffect, useRef, useState } from "react";

export function useAutoConnectOnMount(connectFn: () => void, isConnecting: boolean) {
	const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (isConnecting || autoConnectAttempted) return;

		connectFn();
		setAutoConnectAttempted(true);
	}, [connectFn, isConnecting, autoConnectAttempted]);
}
