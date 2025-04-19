import { useTheme } from "@/lib/theme/ThemeProvider";
import { useEffect, useState } from "react";
import { DEFAULT_NETWORK, NETWORKS } from "../constants/networks";
import type { Network } from "../types/network";
import { useLocalStorageState } from "./useLocalStorageState";

export function useNetwork() {
	const { setCurrentNetworkId } = useTheme();
	const [selectedNetworkId, setSelectedNetworkId] = useLocalStorageState<string>(
		"selectedNetwork",
		DEFAULT_NETWORK.id,
	);
	const [selectedNetwork, setSelectedNetwork] =
		useState<Network>(DEFAULT_NETWORK);

	useEffect(() => {
		const network = NETWORKS[selectedNetworkId] || DEFAULT_NETWORK;
		setSelectedNetwork(network);
		setCurrentNetworkId(selectedNetworkId);
	}, [selectedNetworkId, setCurrentNetworkId]);

	const handleNetworkChange = (networkId: string) => {
		setSelectedNetworkId(networkId);
	};

	return {
		networks: NETWORKS,
		selectedNetwork,
		selectedNetworkId,
		setNetwork: handleNetworkChange,
	};
}
