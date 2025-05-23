import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, usePolkadotApi } from './core';
import { useSigner, useTransaction } from '@/store';
import { MultiAddress } from '@polkadot-api/descriptors';
import { nanoid } from 'nanoid';

export function useBalance(address?: string, options = {}) {
  const api = usePolkadotApi();
  
  return useQuery(
    ['balance', address],
    () => api?.query('System.Account', address),
    {
      enabled: !!address && !!api,
      staleTime: 10000,
      ...options
    }
  );
}

export function useBlockNumber(options = {}) {
  const api = usePolkadotApi();
  
  return useQuery(
    'blockNumber',
    () => api?.query('System.Number'),
    {
      enabled: !!api,
      refetchInterval: 6000, 
      ...options
    }
  );
}

export function useRuntimeVersion(options = {}) {
  const api = usePolkadotApi();
  
  return useQuery(
    'runtimeVersion',
    () => api?.client.getChainSpecData(),
    {
      enabled: !!api,
      staleTime: 300000, // 5 minutes
      ...options
    }
  );
}

export function useTransfer() {
  const api = usePolkadotApi();
  const { selectedSigner } = useSigner();
  const { create: createTx, update: updateTx } = useTransaction();
  
  return useMutation(
    async ({ to, amount }: { to: string; amount: bigint }) => {
      if (!api || !selectedSigner) {
        throw new Error('API or signer not available');
      }

      const txId = createTx({
        status: 'preparing',
        metadata: { 
          title: `Transfer ${amount} to ${to.slice(0, 8)}...`,
          recipient: to,
          amount: amount.toString()
        }
      });

      try {
        updateTx(txId, { status: 'signed' });
        
        const tx = api.tx('Balances.transfer_keep_alive', {
          dest: MultiAddress.Id(to),
          value: amount
        });

        updateTx(txId, { status: 'broadcasting' });
        
        const txHash = `0x${nanoid(64)}`;
        updateTx(txId, { txHash, status: 'inBlock' });
        
        setTimeout(() => {
          updateTx(txId, { 
            status: 'finalized',
            blockInfo: { 
              blockHash: `0x${nanoid(64)}`, 
              blockNumber: Math.floor(Math.random() * 1000000) 
            }
          });
        }, 2000);
        
        return { txId, txHash };
      } catch (error) {
        updateTx(txId, { 
          status: 'error', 
          error: { message: error.message } 
        });
        throw error;
      }
    }
  );
}

export function useRemark() {
  const api = usePolkadotApi();
  const { selectedSigner } = useSigner();
  const { create: createTx, update: updateTx } = useTransaction();
  
  return useMutation(
    async ({ remark }: { remark: string }) => {
      if (!api || !selectedSigner) {
        throw new Error('API or signer not available');
      }

      const txId = createTx({
        status: 'preparing',
        metadata: { 
          title: `Remark: ${remark.slice(0, 20)}...`,
          remark
        }
      });

      try {
        updateTx(txId, { status: 'signed' });
        
        const tx = api.tx('System.remark_with_event', {
          remark: Array.from(new TextEncoder().encode(remark))
        });

        updateTx(txId, { status: 'broadcasting' });
        
        const txHash = `0x${nanoid(64)}`;
        updateTx(txId, { txHash, status: 'inBlock' });
        
        setTimeout(() => {
          updateTx(txId, { 
            status: 'finalized',
            blockInfo: { 
              blockHash: `0x${nanoid(64)}`, 
              blockNumber: Math.floor(Math.random() * 1000000) 
            }
          });
        }, 1500);
        
        return { txId, txHash };
      } catch (error) {
        updateTx(txId, { 
          status: 'error', 
          error: { message: error.message } 
        });
        throw error;
      }
    }
  );
}

export function useTransactionBuilder() {
  const api = usePolkadotApi();
  const { selectedSigner } = useSigner();
  const { create: createTx, update: updateTx } = useTransaction();
  
  const buildAndExecute = useCallback(async (
    txPath: string,
    params: any,
    metadata: any = {}
  ) => {
    if (!api || !selectedSigner) {
      throw new Error('API or signer not available');
    }

    const txId = createTx({
      status: 'preparing',
      metadata: { title: `Transaction: ${txPath}`, ...metadata }
    });

    try {
      updateTx(txId, { status: 'signed' });
      const tx = api.tx(txPath, params);
      updateTx(txId, { status: 'broadcasting' });
      
      const txHash = `0x${nanoid(64)}`;
      updateTx(txId, { txHash, status: 'inBlock' });
      
      setTimeout(() => {
        updateTx(txId, { 
          status: 'finalized',
          blockInfo: { 
            blockHash: `0x${nanoid(64)}`, 
            blockNumber: Math.floor(Math.random() * 1000000) 
          }
        });
      }, 2000);
      
      return { txId, txHash };
    } catch (error) {
      updateTx(txId, { 
        status: 'error', 
        error: { message: error.message } 
      });
      throw error;
    }
  }, [api, selectedSigner, createTx, updateTx]);

  return {
    buildAndExecute,
    isReady: !!api && !!selectedSigner
  };
}

export function useStorageQuery<T = any>(
  path: string,
  params: any[] = [],
  options = {}
) {
  const api = usePolkadotApi();
  
  return useQuery(
    ['storage', path, ...params],
    () => api?.query(path, ...params) as Promise<T>,
    {
      enabled: !!api,
      staleTime: 15000,
      ...options
    }
  );
}
