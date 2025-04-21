/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useChain } from "@/context/ChainProvider";
import type { PolkadotClient } from "polkadot-api";
import { dot, wnd, paseo, roc } from "@polkadot-api/descriptors";

const NETWORK_DESCRIPTORS = {
    polkadot: dot,
    westend: wnd,
    paseo: paseo,
    rococo: roc    
};



interface ChainStateOptions {
    enabled?: boolean;
    refetchInterval?: number;
    refetchOnBlock?: boolean; 
}

export function useChainState<T>(
    path: string,
    params: unknown[] = [],
    options?: ChainStateOptions
) {
    const { connectionState, selectedNetwork } = useChain();
    const isConnected = connectionState.state === 'connected';
    const client = connectionState.state === 'connected' ? connectionState.client : null;


    const {
        enabled = true,
        refetchInterval,
        refetchOnBlock = false,
    } = options || {};

    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<Error | null>(null);

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
            const result = await typedApi.query[pallet as keyof typeof typedApi.query][storage as string].getValue(...params);

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
    }, [connectionState.state, path, params, isConnected, selectedNetwork]);

    useEffect(() => {
        if (enabled && isConnected) {
            refetch();
        }
    }, [enabled, isConnected, refetch]);

    
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

export function useBlockNumber(options?: ChainStateOptions) {
    const result = useChainState<number>("System.Number", [], options);

    return useMemo(() => ({
        blockNumber: result.data,
        isLoading: result.status === 'loading',
        error: result.error,
        refetch: result.refetch,
    }), [result.data, result.status, result.error, result.refetch]);
}

export function useChainMetadata() {
    const { connectionState, selectedNetwork } = useChain();
    const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const fetchMetadata = useCallback(async () => {
        if (connectionState.state !== 'connected') return;

        try {
            setIsLoading(true);

            const networkDescriptor = NETWORK_DESCRIPTORS[selectedNetwork.id as keyof typeof NETWORK_DESCRIPTORS];
            
            if (!networkDescriptor) {
                throw new Error(`No descriptor found for network: ${selectedNetwork.id}`);
            }
                        
            const typedApi = connectionState.client.getTypedApi(networkDescriptor);
            const metadataResult = await typedApi.apis.Metadata.metadata();

            setMetadata(metadataResult as Record<string, unknown>);
            setIsLoading(false);
        } catch (err) {
            const processedError = err instanceof Error
                ? err
                : new Error(String(err));

            setError(processedError);
            setIsLoading(false);
        }
    }, [connectionState.state, selectedNetwork]);

    useEffect(() => {
        if (connectionState.state) {
            fetchMetadata();
        }
    }, [connectionState.state, fetchMetadata]);

    return useMemo(() => ({
        metadata,
        isLoading,
        error,
    }), [metadata, isLoading, error]);
}