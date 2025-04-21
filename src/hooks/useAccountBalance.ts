import { useState, useEffect, useMemo, useCallback } from "react";
import { useChain } from "@/context/ChainProvider";
import { dot, wnd, paseo, roc } from "@polkadot-api/descriptors";



interface AccountBalanceOptions {
    enabled?: boolean;
    refetchInterval?: number;
    refetchOnBlock?: boolean;
}


interface AccountBalance {
    free: bigint;
    reserved: bigint;
    frozen: bigint;
    total: bigint;
}

export function useAccountBalance(
    address: string | null | undefined, 
    options: AccountBalanceOptions = {}
) {
    const { connectionState, selectedNetwork } = useChain();
    const isConnected = connectionState.state === 'connected';
    const client = connectionState.state === 'connected' ? connectionState.client : null;

    
    const {
        enabled = true,
        refetchInterval,
        refetchOnBlock = false
    } = options;

    
    const [balance, setBalance] = useState<AccountBalance>({
        free: 0n,
        reserved: 0n,
        frozen: 0n,
        total: 0n
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<Error | null>(null);

    
    const fetchBalance = useCallback(async () => {
    
        if (!enabled || !isConnected || !client || !address) {
            return;
        }

        try {
            setStatus('loading');
            setError(null);

            
            const networkDescriptor = {
                'polkadot': dot,
                'westend': wnd,
                'paseo': paseo,
                'rococo': roc
            }[selectedNetwork.id];

            if (!networkDescriptor) {
                throw new Error(`Descritor não encontrado para a rede: ${selectedNetwork.id}`);
            }

            
            const typedApi = client.getTypedApi(networkDescriptor);

            
            const accountData = await typedApi.query.System.Account.getValue(address);

            
            if (!accountData?.data) {
                throw new Error('Dados da conta não encontrados');
            }

            const { free, reserved, frozen } = accountData.data;
            const balanceData: AccountBalance = {
                free: free ?? 0n,
                reserved: reserved ?? 0n,
                frozen: frozen ?? 0n,
                total: (free ?? 0n) + (reserved ?? 0n)
            };

            setBalance(balanceData);
            setStatus('success');
        } catch (err) {
            const processedError = err instanceof Error 
                ? err 
                : new Error(String(err));

            setError(processedError);
            setStatus('error');
        }
    }, [
        enabled, 
        isConnected, 
        client, 
        address, 
        selectedNetwork.id
    ]);

    
    useEffect(() => {
        if (enabled && isConnected) {
            fetchBalance();
        }
    }, [enabled, isConnected, fetchBalance]);

    
    useEffect(() => {
        if (!refetchInterval) return;

        const intervalId = setInterval(() => {
            if (enabled && isConnected) {
                fetchBalance();
            }
        }, refetchInterval);

        return () => clearInterval(intervalId);
    }, [refetchInterval, enabled, isConnected, fetchBalance]);

    
    useEffect(() => {
        if (refetchOnBlock && enabled && isConnected) {
            fetchBalance();
        }
    }, [refetchOnBlock, enabled, isConnected, fetchBalance]);

    
    return useMemo(() => ({
        ...balance,
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        isError: status === 'error',
        error,
        refetch: fetchBalance
    }), [balance, status, error, fetchBalance]);
}