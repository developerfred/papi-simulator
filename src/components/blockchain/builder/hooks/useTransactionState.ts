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

    
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    
    const processBatchedUpdates = useCallback(() => {
        if (isProcessingRef.current || updateQueueRef.current.length === 0) {
            return;
        }

        isProcessingRef.current = true;

        
        requestAnimationFrame(() => {
            const updates = updateQueueRef.current.splice(0);

            if (updates.length > 0) {
                
                const mergedUpdates = updates.reduce((acc, update) => ({ ...acc, ...update }), {});

                setState(prevState => {                    
                    const hasChanges = Object.keys(mergedUpdates).some(
                        key => prevState[key as keyof TransactionState] !== mergedUpdates[key as keyof TransactionState]
                    );

                    return hasChanges ? { ...prevState, ...mergedUpdates } : prevState;
                });
            }

            isProcessingRef.current = false;
            
            if (updateQueueRef.current.length > 0) {
                processBatchedUpdates();
            }
        });
    }, []);
    
    const updateState = useCallback((updates: Partial<TransactionState>) => {
        updateQueueRef.current.push(updates);
        processBatchedUpdates();
    }, [processBatchedUpdates]);
    
    const updateStateImmediate = useCallback((updates: Partial<TransactionState>) => {
        setState(prevState => ({ ...prevState, ...updates }));
    }, []);

    const resetState = useCallback(() => {
        updateQueueRef.current = [];
        setState(initialState);
    }, []);
    
    const getCurrentState = useCallback(() => stateRef.current, []);

    return {
        state,
        updateState,
        updateStateImmediate,
        resetState,
        getCurrentState,
    };
};