/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useChain } from "@/context/ChainProvider";
import { dot, wnd, paseo, roc } from "@polkadot-api/descriptors";
import type { PolkadotClient } from "polkadot-api";

/**
 * Map of network descriptors by network ID
 */
const NETWORK_DESCRIPTORS = {
    polkadot: dot,
    westend: wnd,
    paseo: paseo,
    rococo: roc
};

/**
 * Options for chain state queries
 */
interface ChainStateOptions {
    enabled?: boolean;
    refetchInterval?: number;
    refetchOnBlock?: boolean;
}

/**
 * Generic hook to query chain state
 */
export function useChainState<T>(
    path: string,
    params: unknown[] = [],
    options?: ChainStateOptions
) {
    const { connectionState, selectedNetwork } = useChain() as {
        connectionState: { state: string; client?: PolkadotClient; error?: Error };
        selectedNetwork: { id: string };
    };

    // Extract connection status
    const isConnected = connectionState.state === 'connected';
    const client = isConnected && connectionState.client ? connectionState.client : null;

    const {
        enabled = true,
        refetchInterval,
        // Keep the parameter even if unused to maintain the interface consistency
    } = options || {};

    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetch data from chain
     */
    const refetch = useCallback(async () => {
        if (!isConnected || !client || !path.includes('.')) return;

        try {
            setStatus('loading');
            const [pallet, storage] = path.split('.');

            if (!pallet || !storage) {
                throw new Error(`Invalid path: ${path}`);
            }

            const networkDescriptor = NETWORK_DESCRIPTORS[selectedNetwork.id as keyof typeof NETWORK_DESCRIPTORS];

            if (!networkDescriptor) {
                throw new Error(`No descriptor found for network: ${selectedNetwork.id}`);
            }

            const typedApi = client.getTypedApi(networkDescriptor);
            
            // Verifica se o pallet existe
            const palletStorage = typedApi.query[pallet as keyof typeof typedApi.query];
            if (!palletStorage) {
                throw new Error(`Pallet not found: ${pallet}`);
            }

            // Acessa o método de storage de forma segura para tipagem
            type StorageKey = keyof typeof palletStorage;
            const storageMethod = palletStorage[storage as StorageKey];
            
            if (!storageMethod) {
                throw new Error(`Storage method not found: ${storage}`);
            }
            
            // Verifica a existência do método de forma segura para tipagem
            if (typeof (storageMethod as any).getValue !== 'function') {
                throw new Error(`Storage method getValue not available for: ${storage}`);
            }

            // Chama o método getValue com os parâmetros
            const result = await (storageMethod as any).getValue(...params);

            setData(result as T);
            setStatus('success');
            setError(null);
        } catch (err) {
            const processedError = err instanceof Error
                ? err
                : new Error(String(err));

            setError(processedError);
            setStatus('error');
        }
    }, [client, path, params, isConnected, selectedNetwork.id]);

    // Initial fetch when enabled
    useEffect(() => {
        if (enabled && isConnected) {
            refetch();
        }
    }, [enabled, isConnected, refetch]);

    // Set up interval if requested
    useEffect(() => {
        if (!refetchInterval) return;

        const intervalId = setInterval(() => {
            if (enabled && isConnected) {
                refetch();
            }
        }, refetchInterval);

        return () => clearInterval(intervalId);
    }, [refetchInterval, enabled, isConnected, refetch]);

    return useMemo(() => ({
        data,
        status,
        error,
        refetch,
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        isError: status === 'error',
    }), [data, status, error, refetch]);
}

/**
 * Hook to query account balances
 */
export function useAccountBalance(
    address: string | null | undefined,
    options?: ChainStateOptions
) {
    const defaultBalance = useMemo(() => ({
        free: 0n,
        reserved: 0n,
        frozen: 0n,
        total: 0n,
    }), []);

    const enabled = options?.enabled !== false && !!address;
    const params = useMemo(() => address ? [address] : [], [address]);

    // Query System.Account storage
    const result = useChainState<{
        data: {
            free: bigint;
            reserved: bigint;
            frozen: bigint;
        };
    }>("System.Account", params, {
        ...options,
        enabled,
    });

    // Format balance data
    const balance = useMemo(() => {
        if (result.data?.data) {
            const { free, reserved, frozen } = result.data.data;
            return {
                free,
                reserved,
                frozen,
                total: free + reserved,
            };
        }
        return defaultBalance;
    }, [result.data, defaultBalance]);

    return useMemo(() => ({
        ...balance,
        isLoading: result.status === 'loading',
        error: result.error,
        refetch: result.refetch,
    }), [balance, result.status, result.error, result.refetch]);
}

/**
 * Hook to get current block number
 */
export function useBlockNumber(options?: ChainStateOptions) {
    const result = useChainState<number>("System.Number", [], options);

    return useMemo(() => ({
        blockNumber: result.data,
        isLoading: result.status === 'loading',
        error: result.error,
        refetch: result.refetch,
    }), [result.data, result.status, result.error, result.refetch]);
}

/**
 * Hook to get chain metadata
 */
export function useChainMetadata() {
    const { connectionState, selectedNetwork } = useChain() as {
        connectionState: { state: string; client?: PolkadotClient };
        selectedNetwork: { id: string };
    };

    const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchMetadata = useCallback(async () => {
        if (connectionState.state !== 'connected' || !connectionState.client) return;

        try {
            setIsLoading(true);
            const networkDescriptor = NETWORK_DESCRIPTORS[selectedNetwork.id as keyof typeof NETWORK_DESCRIPTORS];

            if (!networkDescriptor) {
                throw new Error(`No descriptor found for network: ${selectedNetwork.id}`);
            }

            const typedApi = connectionState.client.getTypedApi(networkDescriptor);
            const metadataResult = await typedApi.apis.Metadata.metadata();

            setMetadata(metadataResult as unknown as Record<string, unknown>);
            setIsLoading(false);
        } catch (err) {
            const processedError = err instanceof Error
                ? err
                : new Error(String(err));

            setError(processedError);
            setIsLoading(false);
        }
    }, [connectionState, selectedNetwork.id]);

    useEffect(() => {
        if (connectionState.state === 'connected') {
            fetchMetadata();
        }
    }, [connectionState.state, fetchMetadata]);

    return useMemo(() => ({
        metadata,
        isLoading,
        error,
    }), [metadata, isLoading, error]);
}