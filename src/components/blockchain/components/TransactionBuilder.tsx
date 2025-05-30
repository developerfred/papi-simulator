/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
// @ts-nocheck
"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, X, Info, Zap } from "lucide-react";
import toast from "react-hot-toast";

// Polkadot.js imports
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

// PAPI imports (conditional - only if available)
// import { getInjectedExtensions, connectInjectedExtension } from "polkadot-api/pjs-signer";
// import { createClient } from "polkadot-api";

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
} from "../builder/utils/transaction.utils";

// Enhanced types for dual API support
interface SignerResult {
  signature: string;
  signedTransaction?: any;
}

interface ExtensionSigner {
  signer: {
    signPayload: (payload: any) => Promise<SignerResult>;
    signAndSend?: (address: string, options: any, callback: any) => Promise<any>;
  };
}

interface TransactionBuilderEnhancedProps extends TransactionBuilderProps {
  onMinimize?: () => void;
  isFullscreen?: boolean;
  preferPapi?: boolean; // New prop to prefer PAPI over Polkadot.js
}

// Enhanced wallet connection utilities
class WalletConnector {
  private static instance: WalletConnector;
  private extensionsEnabled = false;
  private availableExtensions: string[] = [];
  private connectedAccount: WalletAccount | null = null;

  static getInstance(): WalletConnector {
    if (!WalletConnector.instance) {
      WalletConnector.instance = new WalletConnector();
    }
    return WalletConnector.instance;
  }

  async enableExtensions(dappName: string = 'Polkadot Transaction Builder'): Promise<boolean> {
    try {
      // Enable Polkadot.js extensions
      const extensions = await web3Enable(dappName);

      if (extensions.length === 0) {
        console.warn('No wallet extensions found. Please install Polkadot.js extension or compatible wallet.');
        return false;
      }

      this.extensionsEnabled = true;
      this.availableExtensions = extensions.map(ext => ext.name);

      console.log(`✅ Enabled ${extensions.length} wallet extension(s):`, this.availableExtensions);
      return true;
    } catch (error) {
      console.error('Failed to enable wallet extensions:', error);
      return false;
    }
  }

  async getAccounts(): Promise<WalletAccount[]> {
    if (!this.extensionsEnabled) {
      throw new Error('Extensions not enabled. Call enableExtensions() first.');
    }

    try {
      const accounts = await web3Accounts();
      return accounts.map(account => ({
        address: account.address,
        meta: {
          name: account.meta.name || 'Unknown',
          source: account.meta.source
        }
      }));
    } catch (error) {
      console.error('Failed to get accounts:', error);
      throw error;
    }
  }

  async getSigner(address: string): Promise<ExtensionSigner> {
    if (!this.extensionsEnabled) {
      throw new Error('Extensions not enabled. Call enableExtensions() first.');
    }

    try {
      const injector = await web3FromAddress(address);
      return injector as ExtensionSigner;
    } catch (error) {
      console.error('Failed to get signer for address:', address, error);
      throw new Error(`Unable to get signer for address ${address}. Make sure the account exists in your wallet extension.`);
    }
  }

  // PAPI support methods (to be implemented when PAPI is available)
  async getPapiSigner(address: string): Promise<any> {
    // This would be implemented when PAPI is available
    // const extensions = getInjectedExtensions();
    // const selectedExtension = await connectInjectedExtension(extensions[0]);
    // const accounts = selectedExtension.getAccounts();
    // return accounts.find(acc => acc.address === address)?.polkadotSigner;

    throw new Error('PAPI support not yet implemented');
  }

  isExtensionsEnabled(): boolean {
    return this.extensionsEnabled;
  }

  getAvailableExtensions(): string[] {
    return this.availableExtensions;
  }
}

const TransactionBuilder: React.FC<TransactionBuilderEnhancedProps> = ({
  api,
  network,
  senderAccount,
  onMinimize,
  isFullscreen = false,
  preferPapi = false
}) => {
  const { state, updateState, resetState, getCurrentState } = useTransactionState();
  const walletConnector = WalletConnector.getInstance();

  // Enhanced refs for better state management
  const mountedRef = useRef(true);
  const buildingRef = useRef(false);
  const lastPresetIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI state for elastic behavior
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showMiniPreview, setShowMiniPreview] = React.useState(false);
  const [walletReady, setWalletReady] = React.useState(false);

  // Initialize wallet connection on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const enabled = await walletConnector.enableExtensions();
        setWalletReady(enabled);

        if (!enabled) {
          toast.error('⚠️ No wallet extension found. Please install Polkadot.js extension.');
        }
      } catch (error) {
        console.error('Wallet initialization failed:', error);
        setWalletReady(false);
      }
    };

    initializeWallet();
  }, []);

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

  
  const availablePallets = useMemo(() => {
    if (!api?.tx) return [];
    return Object.keys(api.tx).sort();
  }, [api?.tx]);

  const availableCalls = useMemo(() => {
    if (!api?.tx || !state.customPallet || !api.tx[state.customPallet]) return [];
    return Object.keys(api.tx[state.customPallet]).sort();
  }, [api?.tx, state.customPallet]);

  
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


  useEffect(() => {
    const currentPresetId = state.selectedPreset?.id || null;


    if (currentPresetId !== lastPresetIdRef.current && !buildingRef.current) {
      lastPresetIdRef.current = currentPresetId;

      if (currentPresetId) {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
        
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
        }, 50);
      }
    }
  }, [state.selectedPreset?.id, updateState]);

  
  const handlePresetSelect = useCallback((preset) => {
    if (buildingRef.current || !mountedRef.current) return;

  
    setIsExpanded(true);

  
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

    
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        updateState(updates);
      }
    });
  }, [updateState]);

  
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
  
  const handleGoBack = useCallback(() => {
    if (buildingRef.current) return;

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    buildingRef.current = false;
    lastPresetIdRef.current = null;

    setIsExpanded(false);

    setTimeout(() => {
      if (mountedRef.current) {
        resetState();
      }
    }, 100);
  }, [resetState]);


  const buildTransaction = useCallback(async () => {
    if (!api || !state.selectedPreset || buildingRef.current || !mountedRef.current) return;

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

          
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      if (signal.aborted || !mountedRef.current) return;

      
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

  
  const signAndSendTransaction = useCallback(async () => {
    if (!state.builtTx || !api || !mountedRef.current) return;

    if (!walletReady || !walletConnector.isExtensionsEnabled()) {
      toast.error('❌ Wallet extension not available. Please install and enable a Polkadot wallet.');
      return;
    }

    updateState({ isSigning: true });

    try {
      const extensionSigner = await walletConnector.getSigner(senderAccount.address);

      if (!extensionSigner || !mountedRef.current) {
        throw new Error("Unable to connect to wallet extension");
      }

      updateState({ isSending: true, isSigning: false });
      toast('📝 Broadcasting transaction...');

      let unsubscribed = false;
      const unsub = await state.builtTx.signAndSend(
        senderAccount.address,
        { signer: extensionSigner.signer },
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
  }, [state.builtTx, api, senderAccount.address, updateState, walletReady, walletConnector]);

  
  const containerClasses = useMemo(() => {
    const base = " transition-all duration-300 ease-in-out";

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

          
          <div className={`p-3 rounded-lg border ${walletReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${walletReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm font-medium">
                {walletReady
                  ? `✅ Wallet Connected (${walletConnector.getAvailableExtensions().join(', ')})`
                  : '⚠️ Wallet Extension Required'
                }
              </span>
            </div>
          </div>

          
          {(currentPhase === 'selection' || state.selectedPreset?.id?.includes('xcm')) && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mt-3">
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

        
        {isExpanded && <ProgressSteps steps={steps} />}

        
        <div className="space-y-6">
          
          {!state.selectedPreset && (
            <PresetSelector
              presets={TRANSACTION_PRESETS}
              onSelect={handlePresetSelect}
            />
          )}

          
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
                disabled={state.isSigning || state.isSending || !walletReady}
                className="w-full h-12 text-lg font-medium"
                variant="primary"
              >
                {!walletReady ? '⚠️ Wallet Required' :
                  state.isSigning ? '✍️ Signing...' :
                    state.isSending ? '📡 Broadcasting...' :
                      '🚀 Sign & Send Transaction'}
              </Button>
            </div>
          )}

          
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

          {(currentPhase === 'selection' || currentPhase === 'configuration') && (
            <XcmNetworkStatus network={network} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(TransactionBuilder);