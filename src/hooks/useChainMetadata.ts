/* eslint-disable  @typescript-eslint/no-explicit-any */
import { dot, wnd, paseo, roc } from "@polkadot-api/descriptors";
import type { PolkadotClient } from "polkadot-api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useChain } from "@/context/ChainProvider";

// Map of network descriptors
const NETWORK_DESCRIPTORS = {
	polkadot: dot,
	westend: wnd,
	paseo: paseo,
	rococo: roc,
};

export function useChainMetadata() {
	const { connectionState, selectedNetwork } = useChain() as {
		connectionState:
			| { state: "connected"; client: PolkadotClient }
			| { state: "disconnected" };
		selectedNetwork: { id: string };
	};

	const [metadata, setMetadata] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchMetadata = useCallback(async () => {
		if (connectionState.state !== "connected") return;

		try {
			setIsLoading(true);

			// Get the correct descriptor based on the selected network
			const networkDescriptor =
				NETWORK_DESCRIPTORS[
					selectedNetwork.id as keyof typeof NETWORK_DESCRIPTORS
				];

			if (!networkDescriptor) {
				throw new Error(
					`No descriptor found for network: ${selectedNetwork.id}`,
				);
			}

			// Use the network-specific descriptor
			const typedApi = connectionState.client.getTypedApi(networkDescriptor);
			const metadataResult = await typedApi.apis.Metadata.metadata();

			setMetadata(metadataResult);
			setIsLoading(false);
		} catch (err) {
			const processedError =
				err instanceof Error ? err : new Error(String(err));

			setError(processedError);
			setIsLoading(false);
		}
	}, [connectionState, selectedNetwork.id]);

	useEffect(() => {
		if (connectionState.state === "connected") {
			fetchMetadata();
		}
	}, [connectionState, fetchMetadata]);

	return useMemo(
		() => ({
			metadata,
			isLoading,
			error,
		}),
		[metadata, isLoading, error],
	);
}
