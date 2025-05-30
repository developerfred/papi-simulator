import { useState, useEffect } from 'react';
import type { Network } from '@/lib/types/network';
import { NetworkManager } from '@/lib/networks/networkManager';

export function useNetworks() {
    const [networks, setNetworks] = useState<Network[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initializeNetworks() {
            try {
                setLoading(true);
                const manager = NetworkManager.getInstance();
                await manager.initialize();
                setNetworks(manager.getNetworks());
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load networks');
            } finally {
                setLoading(false);
            }
        }

        initializeNetworks();
    }, []);

    const refreshNetworks = async () => {
        try {
            setLoading(true);
            const manager = NetworkManager.getInstance();
            await manager.refreshNetworks();
            setNetworks(manager.getNetworks());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh networks');
        } finally {
            setLoading(false);
        }
    };

    return {
        networks,
        loading,
        error,
        refreshNetworks
    };
}