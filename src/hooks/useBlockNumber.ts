import { useState, useEffect, useMemo, useCallback } from "react";
import { useChain } from "@/context/ChainProvider";
import { dot, wnd, paseo, roc } from "@polkadot-api/descriptors";


interface BlockNumberOptions {
	enabled?: boolean;
	refetchInterval?: number;
	refetchOnBlock?: boolean;
}

export function useBlockNumber(options: BlockNumberOptions = {}) {
	const { connectionState, selectedNetwork } = useChain();
	const isConnected = connectionState.state === "connected";
	const client =
		connectionState.state === "connected" ? connectionState.client : null;

	
	const { enabled = true, refetchInterval, refetchOnBlock = false } = options;

	
	const [blockNumber, setBlockNumber] = useState<number | null>(null);
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [error, setError] = useState<Error | null>(null);
	const [timestamp, setTimestamp] = useState<number | null>(null);

	
	const fetchBlockNumber = useCallback(async () => {	
		if (!enabled || !isConnected || !client) {
			return;
		}

		try {
			setStatus("loading");
			setError(null);

			
			const networkDescriptor = {
				polkadot: dot,
				westend: wnd,
				paseo: paseo,
				rococo: roc,
			}[selectedNetwork.id];

			if (!networkDescriptor) {
				throw new Error(
					`Descritor não encontrado para a rede: ${selectedNetwork.id}`,
				);
			}

			
			const typedApi = client.getTypedApi(networkDescriptor);

			
			const currentBlockNumber = await typedApi.query.System.Number.getValue();

			if (currentBlockNumber === undefined || currentBlockNumber === null) {
				throw new Error("Não foi possível obter o número do bloco");
			}

			setBlockNumber(currentBlockNumber);
			setTimestamp(Date.now());
			setStatus("success");
		} catch (err) {
			const processedError =
				err instanceof Error ? err : new Error(String(err));

			setError(processedError);
			setStatus("error");
			setBlockNumber(null);
		}
	}, [enabled, isConnected, client, selectedNetwork.id]);

	
	useEffect(() => {
		if (enabled && isConnected) {
			fetchBlockNumber();
		}
	}, [enabled, isConnected, fetchBlockNumber]);

	
	useEffect(() => {
		if (!refetchInterval) return;

		const intervalId = setInterval(() => {
			if (enabled && isConnected) {
				fetchBlockNumber();
			}
		}, refetchInterval);

		return () => clearInterval(intervalId);
	}, [refetchInterval, enabled, isConnected, fetchBlockNumber]);

	
	useEffect(() => {
		if (refetchOnBlock && enabled && isConnected) {
			fetchBlockNumber();
		}
	}, [refetchOnBlock, enabled, isConnected, fetchBlockNumber]);

	
	return useMemo(
		() => ({
			blockNumber,
			timestamp,
			isLoading: status === "loading",
			isSuccess: status === "success",
			isError: status === "error",
			error,
			refetch: fetchBlockNumber,
		}),
		[blockNumber, timestamp, status, error, fetchBlockNumber],
	);
}
