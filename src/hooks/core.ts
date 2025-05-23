import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useAppStore, useChain, useSigner, useTransaction } from '@/store';
import { nanoid } from 'nanoid';


export function useQuery<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
    retry?: number;
  } = {}
) {
  const { enabled = true, staleTime = 30000, refetchInterval, retry = 2 } = options;
  const { isConnected } = useChain();
  const { get: getCache, set: setCache } = useQuery();
  
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });

  const queryKey = useMemo(() => 
    Array.isArray(key) ? key.join(':') : key, 
    [key]
  );

  const execute = useCallback(async (attempt = 0): Promise<void> => {
    if (!enabled || !isConnected) return;

    // Check cache first
    const cached = getCache(queryKey);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setState({
        data: cached.data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await queryFn();
      setCache(queryKey, data);
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retry) {
        setTimeout(() => execute(attempt + 1), Math.pow(2, attempt) * 1000);
        return;
      }

      setState({
        data: null,
        error: err,
        isLoading: false,
        isSuccess: false,
        isError: true
      });
    }
  }, [queryFn, enabled, isConnected, queryKey, getCache, setCache, staleTime, retry]);

  const refetch = useCallback(() => execute(), [execute]);

  useEffect(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    const interval = setInterval(execute, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, execute]);

  return { ...state, refetch };
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  } = {}
) {
  const [state, setState] = useState<{
    data: TData | null;
    error: Error | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false
    });

    try {
      const data = await mutationFn(variables);
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false
      });
      
      options.onSuccess?.(data, variables);
      options.onSettled?.(data, null, variables);
      
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({
        data: null,
        error: err,
        isLoading: false,
        isSuccess: false,
        isError: true
      });
      
      options.onError?.(err, variables);
      options.onSettled?.(null, err, variables);
      
      throw err;
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false
    });
  }, []);

  return { ...state, mutate, mutateAsync: mutate, reset };
}

export function usePolkadotApi() {
  const { typedApi, client, isConnected, network } = useChain();

  const api = useMemo(() => {
    if (!typedApi || !isConnected) return null;

    return {
      query: (path: string, ...params: any[]) => {
        const [pallet, method] = path.split('.');
        return typedApi.query[pallet][method].getValue(...params);
      },
      
      tx: (path: string, params: any) => {
        const [pallet, method] = path.split('.');
        return typedApi.tx[pallet][method](params);
      },
      
      constants: (path: string) => {
        const [pallet, constant] = path.split('.');
        return typedApi.constants[pallet][constant];
      },
      
      rpc: client.rpc,
      client,
      network
    };
  }, [typedApi, client, isConnected, network]);

  return api;
}

export function useSafeAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({ data: null, error: null, loading: false });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });
    
    try {
      const result = await asyncFn();
      if (isMountedRef.current) {
        setState({ data: result, error: null, loading: false });
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState({ 
          data: null, 
          error: error instanceof Error ? error : new Error(String(error)), 
          loading: false 
        });
      }
    }
  }, [...deps]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
