import { useState, useEffect, useMemo, useCallback } from "react";
import { useChain } from "@/context/ChainProvider";
import { dot, wnd, paseo, roc } from "@polkadot-api/descriptors";

// Tipos para opções de busca de número de bloco
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

	// Configurações padrão
	const { enabled = true, refetchInterval, refetchOnBlock = false } = options;

	// Estados
	const [blockNumber, setBlockNumber] = useState<number | null>(null);
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [error, setError] = useState<Error | null>(null);
	const [timestamp, setTimestamp] = useState<number | null>(null);

	// Função de busca do número de bloco
	const fetchBlockNumber = useCallback(async () => {
		// Validações iniciais
		if (!enabled || !isConnected || !client) {
			return;
		}

		try {
			setStatus("loading");
			setError(null);

			// Obter o descritor da rede
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

			// Criar API tipada
			const typedApi = client.getTypedApi(networkDescriptor);

			// Buscar número do bloco
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

	// Busca inicial
	useEffect(() => {
		if (enabled && isConnected) {
			fetchBlockNumber();
		}
	}, [enabled, isConnected, fetchBlockNumber]);

	// Refetch em intervalo
	useEffect(() => {
		if (!refetchInterval) return;

		const intervalId = setInterval(() => {
			if (enabled && isConnected) {
				fetchBlockNumber();
			}
		}, refetchInterval);

		return () => clearInterval(intervalId);
	}, [refetchInterval, enabled, isConnected, fetchBlockNumber]);

	// Refetch em novo bloco (opcional)
	useEffect(() => {
		if (refetchOnBlock && enabled && isConnected) {
			fetchBlockNumber();
		}
	}, [refetchOnBlock, enabled, isConnected, fetchBlockNumber]);

	// Retorno do hook
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
