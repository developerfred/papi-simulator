import { useState, useCallback, useRef, useEffect } from 'react';
import type { TransactionState } from '../types/transaction.types';

const initialState: TransactionState = {
    selectedPreset: null,
    customPallet: '',
    customCall: '',
    args: {},
    builtTx: null,
    estimatedFee: null,
    txHash: null,
    txStatus: null,
    isBuilding: false,
    isSigning: false,
    isSending: false,
};

export const useTransactionState = () => {
    const [state, setState] = useState<TransactionState>(initialState);
    const stateRef = useRef(state);
    const updateQueueRef = useRef<Partial<TransactionState>[]>([]);
    const isProcessingRef = useRef(false);

    // Keep state ref in sync
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Batch state updates to prevent rapid re-renders
    const processBatchedUpdates = useCallback(() => {
        if (isProcessingRef.current || updateQueueRef.current.length === 0) {
            return;
        }

        isProcessingRef.current = true;

        // Use requestAnimationFrame to batch updates efficiently
        requestAnimationFrame(() => {
            const updates = updateQueueRef.current.splice(0);

            if (updates.length > 0) {
                // Merge all updates into a single state change
                const mergedUpdates = updates.reduce((acc, update) => ({ ...acc, ...update }), {});

                setState(prevState => {
                    // Only update if there are actual changes
                    const hasChanges = Object.keys(mergedUpdates).some(
                        key => prevState[key as keyof TransactionState] !== mergedUpdates[key as keyof TransactionState]
                    );

                    return hasChanges ? { ...prevState, ...mergedUpdates } : prevState;
                });
            }

            isProcessingRef.current = false;

            // Process any queued updates
            if (updateQueueRef.current.length > 0) {
                processBatchedUpdates();
            }
        });
    }, []);

    // Optimized update function with batching
    const updateState = useCallback((updates: Partial<TransactionState>) => {
        updateQueueRef.current.push(updates);
        processBatchedUpdates();
    }, [processBatchedUpdates]);

    // Immediate update for critical changes (bypass batching)
    const updateStateImmediate = useCallback((updates: Partial<TransactionState>) => {
        setState(prevState => ({ ...prevState, ...updates }));
    }, []);

    // Reset state
    const resetState = useCallback(() => {
        updateQueueRef.current = [];
        setState(initialState);
    }, []);

    // Get current state (useful for callbacks that need fresh state)
    const getCurrentState = useCallback(() => stateRef.current, []);

    return {
        state,
        updateState,
        updateStateImmediate,
        resetState,
        getCurrentState,
    };
};