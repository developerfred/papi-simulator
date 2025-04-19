import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Network } from '../types/network';
import { DEFAULT_NETWORK, NETWORKS } from '../constants/networks';
import { useTheme } from '@/lib/theme/ThemeProvider';

export function useNetwork() {
    const { setCurrentNetworkId } = useTheme();
    const [selectedNetworkId, setSelectedNetworkId] = useLocalStorage<string>('selectedNetwork', DEFAULT_NETWORK.id);
    const [selectedNetwork, setSelectedNetwork] = useState<Network>(DEFAULT_NETWORK);

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
        setNetwork: handleNetworkChange
    };
}