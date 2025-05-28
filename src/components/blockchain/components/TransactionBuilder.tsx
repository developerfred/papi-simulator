"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, X, Info, Zap } from "lucide-react";
import toast from "react-hot-toast";

// Custom hook import  
import { useTransactionState } from "../builder/hooks/useTransactionState";

// Component imports
import { ProgressSteps } from "../builder/components/ProgressSteps";
import { PresetSelector } from "../builder/components/PresetSelector";
import { TransactionConfig } from "../builder/components/TransactionConfig";
import { TransactionReview } from "../builder/components/TransactionReview";
import { TransactionStatus } from "../builder/components/TransactionStatus";
import { XcmNetworkStatus } from "../builder/components/XcmNetworkStatus";

// Types and constants
import {
  type TransactionStep,
  Network,
  WalletAccount,
  type TransactionBuilderProps,
} from "../builder/types/transaction.types";

import { TRANSACTION_PRESETS } from "../builder/constants/presets";
import {
  validateXcmArguments,
  processArgument,
  getWeb3FromAddress
} from "../builder/utils/transaction.utils";

interface TransactionBuilderEnhancedProps extends TransactionBuilderProps {
  onMinimize?: () => void;
  isFullscreen?: boolean;
}

const TransactionBuilder: React.FC<TransactionBuilderEnhancedProps> = ({
  api,
  network,
  senderAccount,
  onMinimize,
  isFullscreen = false
}) => {
  const { state, updateState, resetState, getCurrentState } = useTransactionState();

  // Enhanced refs for better state management
  const mountedRef = useRef(true);
  const buildingRef = useRef(false);
  const lastPresetIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI state for elastic behavior
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showMiniPreview, setShowMiniPreview] = React.useState(false);

  // Cleanup on unmount with enhanced cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Determine current phase for elastic UI
  const currentPhase = useMemo(() => {
    if (!state.selectedPreset) return 'selection';
    if (state.selectedPreset && !state.builtTx) return 'configuration';
    if (state.builtTx && !state.txHash) return 'review';
    if (state.txHash) return 'status';
    return 'selection';
  }, [state.selectedPreset, state.builtTx, state.txHash]);

  // Auto-expand based on phase
  useEffect(() => {
    const shouldExpand = currentPhase !== 'selection';
    setIsExpanded(shouldExpand);
    setShowMiniPreview(currentPhase === 'status' && state.txStatus === 'finalized');
  }, [currentPhase, state.txStatus]);

  // Memoized computed values with stability
  const availablePallets = useMemo(() => {
    if (!api?.tx) return [];
    return Object.keys(api.tx).sort();
  }, [api?.tx]);

  const availableCalls = useMemo(() => {
    if (!api?.tx || !state.customPallet || !api.tx[state.customPallet]) return [];
    return Object.keys(api.tx[state.customPallet]).sort();
  }, [api?.tx, state.customPallet]);

  // Enhanced steps calculation with phase awareness
  const steps: TransactionStep[] = useMemo(() => {
    const { selectedPreset, builtTx, estimatedFee, isSigning, txHash, txStatus, isSending } = state;

    return [
      {
        id: 'build',
        title: 'Build',
        description: 'Configure parameters',
        status: builtTx ? 'completed' : selectedPreset ? 'active' : 'pending'
      },
      {
        id: 'review',
        title: 'Review',
        description: 'Verify & estimate',
        status: builtTx ? (estimatedFee ? 'completed' : 'active') : 'pending'
      },
      {
        id: 'sign',
        title: 'Sign',
        description: 'Wallet signature',
        status: isSigning ? 'active' : txHash ? 'completed' : 'pending'
      },
      {
        id: 'broadcast',
        title: 'Send',
        description: 'Network broadcast',
        status: isSending ? 'active' : txStatus === 'finalized' ? 'completed' : 'pending'
      }
    ];
  }, [state.selectedPreset, state.builtTx, state.estimatedFee, state.isSigning, state.txHash, state.txStatus, state.isSending]);

  // FIXED: Enhanced preset change handling to prevent freezing
  useEffect(() => {
    const currentPresetId = state.selectedPreset?.id || null;

    // Only reset if preset actually changed and we're not in the middle of building
    if (currentPresetId !== lastPresetIdRef.current && !buildingRef.current) {
      lastPresetIdRef.current = currentPresetId;

      if (currentPresetId) {
        // Clear any existing timeout
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }

        // Use longer timeout and check mount status
        resetTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && !buildingRef.current) {
            updateState({
              args: {},
              builtTx: null,
              estimatedFee: null,
              txHash: null,
              txStatus: null
            });
          }
          resetTimeoutRef.current = null;
        }, 50); // Slightly longer timeout for stability
      }
    }
  }, [state.selectedPreset?.id, updateState]);

  // FIXED: Enhanced preset selection with debouncing
  const handlePresetSelect = useCallback((preset) => {
    if (buildingRef.current || !mountedRef.current) return;

    // Immediate UI feedback
    setIsExpanded(true);

    // Debounced state update
    const updates: any = { selectedPreset: preset };

    if (preset.id === 'custom') {
      updates.customPallet = '';
      updates.customCall = '';
      updates.args = {};
    } else {
      updates.customPallet = preset.pallet;
      updates.customCall = preset.call;

      const defaultArgs: Record<string, any> = {};
      preset.args?.forEach(arg => {
        if (arg.defaultValue !== undefined) {
          defaultArgs[arg.name] = arg.defaultValue;
        }
      });
      updates.args = defaultArgs;
    }

    // Use requestAnimationFrame for smooth update
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        updateState(updates);
      }
    });
  }, [updateState]);

  // Enhanced argument change handler with debouncing
  const handleArgChange = useCallback((argName: string, value: any) => {
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        const currentState = getCurrentState();
        updateState({
          args: { ...currentState.args, [argName]: value }
        });
      }
    });
  }, [getCurrentState, updateState]);

  // FIXED: Go back handler with proper cleanup
  const handleGoBack = useCallback(() => {
    if (buildingRef.current) return;

    // Clear any pending timeouts
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    // Cancel any ongoing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    buildingRef.current = false;
    lastPresetIdRef.current = null;

    // Smooth transition back
    setIsExpanded(false);

    // Delayed state reset to prevent freezing
    setTimeout(() => {
      if (mountedRef.current) {
        resetState();
      }
    }, 100);
  }, [resetState]);

  // Enhanced build transaction with better error handling
  const buildTransaction = useCallback(async () => {
    if (!api || !state.selectedPreset || buildingRef.current || !mountedRef.current) return;

    // Cancel any previous build attempt
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    buildingRef.current = true;
    updateState({ isBuilding: true });

    try {
      const pallet = state.selectedPreset.id === 'custom' ? state.customPallet : state.selectedPreset.pallet;
      const call = state.selectedPreset.id === 'custom' ? state.customCall : state.selectedPreset.call;

      if (!pallet || !call) {
        throw new Error('Pallet and call are required');
      }

      if (signal.aborted || !mountedRef.current) return;

      // Enhanced XCM pallet resolution
      let actualPallet;
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Pallet resolution timeout')), 3000);

        try {
          if (pallet === 'xcmPallet') {
            actualPallet = api.tx.xcmPallet || api.tx.polkadotXcm || api.tx.xTokens || api.tx.xtokens;
            if (!actualPallet) throw new Error('XCM pallet not found. This chain may not support XCM operations.');
          } else if (pallet === 'xcmpQueue') {
            actualPallet = api.tx.xcmpQueue || api.tx.cumulusXcm;
            if (!actualPallet) throw new Error('XCMP Queue not available.');
          } else if (pallet === 'hrmp') {
            if (!api.tx.hrmp) throw new Error('HRMP not available. Connect to Polkadot/Kusama relay chain.');
            actualPallet = api.tx.hrmp;
          } else {
            actualPallet = api.tx[pallet];
          }

          if (!actualPallet?.[call]) {
            const availableCalls = actualPallet ? Object.keys(actualPallet).slice(0, 5).join(', ') : 'none';
            throw new Error(`Call ${pallet}.${call} not found. Available: ${availableCalls}`);
          }

          clearTimeout(timeoutId);
          resolve(actualPallet);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      if (signal.aborted || !mountedRef.current) return;

      // Process arguments with progress indication
      const processedArgs: any[] = [];
      const argDefs = state.selectedPreset.id === 'custom' ? [] : state.selectedPreset.args;

      if (state.selectedPreset.id === 'custom') {
        Object.values(state.args).forEach(value => {
          if (value !== undefined && value !== '') {
            processedArgs.push(value);
          }
        });
      } else {
        await validateXcmArguments(state.args, argDefs);

        for (const argDef of argDefs) {
          if (signal.aborted) return;

          const value = state.args[argDef.name];
          if (value === undefined || value === '') continue;

          const processedValue = await processArgument(value, argDef.type, network.decimals);
          processedArgs.push(processedValue);

          // Yield control for smooth UI
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      if (signal.aborted || !mountedRef.current) return;

      // Build transaction with enhanced error handling
      const tx = await Promise.race([
        actualPallet[call](...processedArgs),
        new Promise((_, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Transaction build timeout (8s)')), 8000);
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Build cancelled'));
          });
        })
      ]);

      if (signal.aborted || !mountedRef.current) return;

      updateState({ builtTx: tx });

      // Fee estimation with better UX
      try {
        const feePromise = tx.paymentInfo(senderAccount.address);
        const info = await Promise.race([
          feePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fee estimation timeout')), 3000)
          )
        ]);

        if (mountedRef.current && !signal.aborted) {
          const fee = formatBalance(info.partialFee, {
            withUnit: network.symbol,
            decimals: network.decimals
          });
          updateState({ estimatedFee: fee });
        }
      } catch (feeError) {
        if (mountedRef.current && !signal.aborted) {
          updateState({ estimatedFee: 'Unable to estimate' });
        }
      }

      if (mountedRef.current && !signal.aborted) {
        toast.success('🎉 Transaction built successfully!');
      }
    } catch (error) {
      if (mountedRef.current && !signal.aborted) {
        const message = error instanceof Error ? error.message : 'Error building transaction';
        toast.error(`❌ ${message}`);
        console.error('Build error:', error);
      }
    } finally {
      buildingRef.current = false;
      if (mountedRef.current) {
        updateState({ isBuilding: false });
      }
    }
  }, [api, state.selectedPreset, state.customPallet, state.customCall, state.args, network, senderAccount.address, updateState]);

  // Enhanced sign and send with better UX
  const signAndSendTransaction = useCallback(async () => {
    if (!state.builtTx || !api || !mountedRef.current) return;

    updateState({ isSigning: true });

    try {
      const web3FromAddress = await Promise.race([
        getWeb3FromAddress(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Wallet extension timeout')), 5000)
        )
      ]);

      if (!web3FromAddress || !mountedRef.current) {
        throw new Error("Wallet extension not available");
      }

      const injector = await web3FromAddress(senderAccount.address);

      if (!mountedRef.current) return;

      updateState({ isSending: true, isSigning: false });

      let unsubscribed = false;
      const unsub = await state.builtTx.signAndSend(
        senderAccount.address,
        { signer: injector.signer },
        (result: any) => {
          if (!mountedRef.current || unsubscribed) return;

          updateState({ txHash: result.txHash.toHex() });

          if (result.status.isInBlock) {
            updateState({ txStatus: 'inBlock' });
            toast.success(`📦 Transaction included in block!`);
          } else if (result.status.isFinalized) {
            updateState({ txStatus: 'finalized', isSending: false });
            toast.success(`✅ Transaction finalized successfully!`);
            unsubscribed = true;
            unsub();
          } else if (result.status.isDropped || result.status.isInvalid) {
            updateState({ txStatus: 'error', isSending: false });
            toast.error('❌ Transaction failed');
            unsubscribed = true;
            unsub();
          }

          // Enhanced event processing
          if (result.events?.length > 0) {
            result.events.forEach((event: any) => {
              try {
                if (api.events.system.ExtrinsicFailed.is(event.event)) {
                  const [dispatchError] = event.event.data;
                  let errorMessage = 'Transaction failed';

                  if (dispatchError.isModule) {
                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                    errorMessage = `${decoded.section}.${decoded.name}`;
                  }

                  toast.error(`❌ ${errorMessage}`);
                  updateState({ txStatus: 'error', isSending: false });
                  unsubscribed = true;
                  unsub();
                }
              } catch (eventError) {
                console.warn('Event processing error:', eventError);
              }
            });
          }
        }
      );

      // Enhanced cleanup with timeout
      setTimeout(() => {
        if (!unsubscribed && mountedRef.current) {
          try {
            unsub();
          } catch (error) {
            console.warn('Unsubscribe error:', error);
          }
        }
      }, 300000);

    } catch (error) {
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : 'Error sending transaction';
        toast.error(`❌ ${message}`);
        updateState({ isSigning: false, isSending: false });
        console.error('Transaction error:', error);
      }
    }
  }, [state.builtTx, api, senderAccount.address, updateState]);

  // Enhanced layout classes based on phase
  const containerClasses = useMemo(() => {
    const base = "transition-all duration-300 ease-in-out";

    if (isFullscreen || isExpanded) {
      return `${base} fixed inset-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto`;
    }

    return `${base} relative`;
  }, [isFullscreen, isExpanded]);

  const cardClasses = useMemo(() => {
    const base = "relative transition-all duration-300 ease-in-out";

    if (isExpanded) {
      return `${base} p-6 shadow-2xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm`;
    }

    return `${base} p-6`;
  }, [isExpanded]);

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        {/* Enhanced Header with Context */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isExpanded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoBack}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              )}
              <div>
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>Transaction Builder</span>
                </h2>
                <p className="text-sm text-gray-600">
                  {currentPhase === 'selection' && 'Choose your transaction type'}
                  {currentPhase === 'configuration' && 'Configure transaction parameters'}
                  {currentPhase === 'review' && 'Review and confirm transaction'}
                  {currentPhase === 'status' && 'Track transaction status'}
                </p>
              </div>
            </div>

            {(isExpanded || isFullscreen) && onMinimize && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMinimize}
                className="flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* XCM Info Panel - Only show when relevant */}
          {(currentPhase === 'selection' || state.selectedPreset?.id?.includes('xcm')) && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-medium text-blue-900">XCM Cross-Chain Support</h3>
              </div>
              <p className="text-xs text-blue-700">
                Advanced XCM transactions available: Reserve Transfer, Teleport, HRMP channels, and XCMP messages.
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps - Compact when not expanded */}
        {isExpanded && <ProgressSteps steps={steps} />}

        {/* Dynamic Content Area */}
        <div className="space-y-6">
          {/* Step 1: Selection */}
          {!state.selectedPreset && (
            <PresetSelector
              presets={TRANSACTION_PRESETS}
              onSelect={handlePresetSelect}
            />
          )}

          {/* Step 2: Configuration */}
          {state.selectedPreset && !state.builtTx && (
            <TransactionConfig
              preset={state.selectedPreset}
              customPallet={state.customPallet}
              customCall={state.customCall}
              args={state.args}
              availablePallets={availablePallets}
              availableCalls={availableCalls}
              network={network}
              isBuilding={state.isBuilding}
              onCustomPalletChange={(pallet) => updateState({ customPallet: pallet })}
              onCustomCallChange={(call) => updateState({ customCall: call })}
              onArgChange={handleArgChange}
              onBuild={buildTransaction}
              onReset={handleGoBack}
            />
          )}

          {/* Step 3: Review */}
          {state.builtTx && !state.txHash && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Review Transaction</h3>
                <Button variant="outline" onClick={handleGoBack} size="sm">
                  Rebuild
                </Button>
              </div>

              <TransactionReview
                senderAddress={senderAccount.address}
                pallet={state.customPallet || state.selectedPreset?.pallet || ''}
                call={state.customCall || state.selectedPreset?.call || ''}
                args={state.args}
                estimatedFee={state.estimatedFee}
                presetId={state.selectedPreset?.id}
              />

              <Button
                onClick={signAndSendTransaction}
                disabled={state.isSigning || state.isSending}
                className="w-full h-12 text-lg font-medium"
                variant="primary"
              >
                {state.isSigning ? '✍️ Signing...' : state.isSending ? '📡 Broadcasting...' : '🚀 Sign & Send Transaction'}
              </Button>
            </div>
          )}

          {/* Step 4: Status */}
          {state.txHash && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Transaction Status</h3>

              <TransactionStatus txHash={state.txHash} txStatus={state.txStatus} />

              {state.txStatus === 'finalized' && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-800 font-medium">🎉 Transaction completed successfully!</p>
                  </div>
                  <Button onClick={handleGoBack} className="w-full">
                    Create New Transaction
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Network Status - Only show when relevant */}
          {(currentPhase === 'selection' || currentPhase === 'configuration') && (
            <XcmNetworkStatus network={network} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(TransactionBuilder);