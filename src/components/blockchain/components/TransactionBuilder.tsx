/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
// @ts-nocheck
"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, X, Info, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

import { useTransactionState } from "../builder/hooks/useTransactionState";
import { ProgressSteps } from "../builder/components/ProgressSteps";
import { PresetSelector } from "../builder/components/PresetSelector";
import { TransactionConfig } from "../builder/components/TransactionConfig";
import { TransactionReview } from "../builder/components/TransactionReview";
import { TransactionStatus } from "../builder/components/TransactionStatus";
import { XcmNetworkStatus } from "../builder/components/XcmNetworkStatus";

import {
  type TransactionStep,
  Network,
  WalletAccount,
  type TransactionBuilderProps,
} from "../builder/types/transaction.types";

import { TRANSACTION_PRESETS, XCM_DESTINATIONS } from "../builder/constants/presets";
import { validateXcmArguments, processArgument } from "../builder/utils/transaction.utils";

interface ExtensionSigner {
  signer: {
    signPayload: (payload: any) => Promise<any>;
    signAndSend?: (address: string, options: any, callback: any) => Promise<any>;
  };
}

interface TransactionBuilderEnhancedProps extends TransactionBuilderProps {
  onMinimize?: () => void;
  isFullscreen?: boolean;
  preferPapi?: boolean;
}

// Componentized Status Components
const StatusIndicator: React.FC<{ isReady: boolean; title: string; subtitle?: string }> = ({
  isReady, title, subtitle
}) => (
  <div className={`flex items-center space-x-3 p-5 rounded-xl border-2 transition-all duration-300 
                 hover:shadow-lg hover:-translate-y-0.5 network-transition cursor-pointer group ${isReady
      ? 'bg-theme-surface border-green-500/70 dark:border-green-400/70 hover:border-green-500 dark:hover:border-green-400 shadow-green-500/20 dark:shadow-green-400/20'
      : 'bg-theme-surface border-amber-500/70 dark:border-amber-400/70 hover:border-amber-500 dark:hover:border-amber-400 shadow-amber-500/20 dark:shadow-amber-400/20'
    }`}>
    <div className={`w-4 h-4 rounded-full transition-all duration-300 group-hover:scale-110 ${isReady ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'
      }`} />
    <div className="flex-1">
      <div className={`font-bold text-base transition-colors duration-300 ${isReady
          ? 'text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200'
          : 'text-amber-700 dark:text-amber-300 group-hover:text-amber-800 dark:group-hover:text-amber-200'
        }`}>
        {title}
      </div>
      {subtitle && (
        <div className={`text-sm mt-1 transition-colors duration-300 ${isReady
            ? 'text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300'
            : 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300'
          }`}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

const InfoCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-5 rounded-xl border-2 border-theme bg-theme-surface 
                 shadow-lg backdrop-blur-sm transition-all duration-300 
                 hover:bg-theme-surface-variant hover:border-network-primary/60
                 hover:shadow-xl hover:-translate-y-1 network-transition 
                 group cursor-pointer">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-10 h-10 rounded-xl bg-network-primary/20 flex items-center justify-center 
                    group-hover:bg-network-primary/30 transition-all duration-300
                    group-hover:scale-110 shadow-lg">
        <Info className="w-5 h-5 text-network-primary group-hover:text-network-secondary transition-colors duration-300" />
      </div>
      <h3 className="text-base font-bold text-theme-primary 
                   group-hover:text-network-primary transition-colors duration-300">
        XCM Cross-Chain Support
      </h3>
    </div>
    {children}
  </div>
);

const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, loading, variant = 'primary', children, className = '' }) => {
  const variants = {
    primary: 'bg-network-primary hover:bg-network-secondary text-white',
    secondary: 'bg-theme-surface-variant hover:bg-theme-surface border border-theme text-theme-primary',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white'
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full h-12 rounded-xl font-bold transition-all duration-300 
                 transform hover:scale-[1.02] active:scale-[0.98] 
                 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed
                 shadow-lg hover:shadow-xl network-transition
                 ${variants[variant]} ${className}`}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white 
                      rounded-full animate-spin mr-2" />
      )}
      {children}
    </Button>
  );
};

const StatusMessage: React.FC<{
  type: 'success' | 'error';
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}> = ({ type, title, subtitle, children }) => (
  <div className={`p-6 rounded-xl text-center backdrop-blur-md transition-all duration-300
                 border-2 shadow-xl hover:shadow-2xl hover:-translate-y-1
                 ${type === 'success'
      ? 'bg-theme-surface border-green-500/70 dark:border-green-400/70 hover:border-green-500 dark:hover:border-green-400 shadow-green-500/20 dark:shadow-green-400/30'
      : 'bg-theme-surface border-red-500/70 dark:border-red-400/70 hover:border-red-500 dark:hover:border-red-400 shadow-red-500/20 dark:shadow-red-400/30'
    }`}>
    <div className="flex items-center justify-center space-x-4 mb-3">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                     ${type === 'success'
          ? 'bg-green-500 shadow-green-500/50'
          : 'bg-red-500 shadow-red-500/50'
        }`}>
        <span className="text-2xl text-white font-bold">
          {type === 'success' ? '✓' : '✕'}
        </span>
      </div>
      <div className="text-left">
        <p className={`text-lg font-bold ${type === 'success'
            ? 'text-green-700 dark:text-green-300'
            : 'text-red-700 dark:text-red-300'
          }`}>
          {title}
        </p>
        <p className={`text-sm font-medium ${type === 'success'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
          }`}>
          {subtitle}
        </p>
      </div>
    </div>
    {children}
  </div>
);

class WalletConnector {
  private static instance: WalletConnector;
  private extensionsEnabled = false;
  private availableExtensions: string[] = [];

  static getInstance(): WalletConnector {
    if (!WalletConnector.instance) {
      WalletConnector.instance = new WalletConnector();
    }
    return WalletConnector.instance;
  }

  async enableExtensions(dappName: string = 'Polkadot Transaction Builder'): Promise<boolean> {
    try {
      const extensions = await web3Enable(dappName);
      if (extensions.length === 0) return false;
      this.extensionsEnabled = true;
      this.availableExtensions = extensions.map(ext => ext.name);
      return true;
    } catch {
      return false;
    }
  }

  async getSigner(address: string): Promise<ExtensionSigner> {
    if (!this.extensionsEnabled) {
      throw new Error('Extensions not enabled. Call enableExtensions() first.');
    }
    const injector = await web3FromAddress(address);
    return injector as ExtensionSigner;
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
}) => {
  const { state, updateState, resetState, getCurrentState } = useTransactionState();
  const walletConnector = WalletConnector.getInstance();

  // Refs for state management
  const mountedRef = useRef(true);
  const buildingRef = useRef(false);
  const lastPresetIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastIdRef = useRef<string | null>(null);
  const notificationCooldownRef = useRef<boolean>(false);

  // UI state
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [walletReady, setWalletReady] = React.useState(false);

  // Toast helper with deduplication
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    if (notificationCooldownRef.current) return;
    notificationCooldownRef.current = true;
    if (lastToastIdRef.current) toast.dismiss(lastToastIdRef.current);
    const toastId = toast[type](message);
    lastToastIdRef.current = toastId;
    setTimeout(() => { notificationCooldownRef.current = false; }, 1000);
    return toastId;
  }, []);

  // Initialize wallet
  useEffect(() => {
    const initWallet = async () => {
      const enabled = await walletConnector.enableExtensions();
      setWalletReady(enabled);
      if (!enabled && !notificationCooldownRef.current) {
        showToast('No wallet extension found. Please install Polkadot.js extension.', 'error');
      }
    };
    initWallet();
  }, [showToast]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      notificationCooldownRef.current = false;
      if (lastToastIdRef.current) {
        toast.dismiss(lastToastIdRef.current);
        lastToastIdRef.current = null;
      }
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  // Computed values
  const currentPhase = useMemo(() => {
    if (!state.selectedPreset) return 'selection';
    if (state.selectedPreset && !state.builtTx) return 'configuration';
    if (state.builtTx && !state.txHash) return 'review';
    if (state.txHash) return 'status';
    return 'selection';
  }, [state.selectedPreset, state.builtTx, state.txHash]);

  const availablePallets = useMemo(() => {
    return api?.tx ? Object.keys(api.tx).sort() : [];
  }, [api?.tx]);

  const availableCalls = useMemo(() => {
    return api?.tx?.[state.customPallet] ? Object.keys(api.tx[state.customPallet]).sort() : [];
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
  }, [state]);

  // Effects
  useEffect(() => {
    setIsExpanded(currentPhase !== 'selection');
  }, [currentPhase, state.txStatus]);

  useEffect(() => {
    const currentPresetId = state.selectedPreset?.id || null;
    if (currentPresetId !== lastPresetIdRef.current && !buildingRef.current) {
      lastPresetIdRef.current = currentPresetId;
      if (currentPresetId) {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
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

  // Handlers
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
      if (mountedRef.current) updateState(updates);
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
    if (lastToastIdRef.current) {
      toast.dismiss(lastToastIdRef.current);
      lastToastIdRef.current = null;
    }
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
    notificationCooldownRef.current = false;
    setIsExpanded(false);
    setTimeout(() => {
      if (mountedRef.current) resetState();
    }, 100);
  }, [resetState]);

  // Build transaction with optimized error handling
  const buildTransaction = useCallback(async () => {
    if (!api || !state.selectedPreset || buildingRef.current || !mountedRef.current) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    buildingRef.current = true;
    updateState({ isBuilding: true });

    try {
      const pallet = state.selectedPreset.id === 'custom' ? state.customPallet : state.selectedPreset.pallet;
      const call = state.selectedPreset.id === 'custom' ? state.customCall : state.selectedPreset.call;

      if (!pallet || !call) throw new Error('Pallet and call are required');
      if (signal.aborted || !mountedRef.current) return;

      // Resolve pallet
      let actualPallet;
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

      if (signal.aborted || !mountedRef.current) return;

      // Process arguments with enhanced XCM handling
      const processedArgs: any[] = [];
      const argDefs = state.selectedPreset.id === 'custom' ? [] : state.selectedPreset.args;

      if (state.selectedPreset.id === 'custom') {
        Object.values(state.args).forEach(value => {
          if (value !== undefined && value !== '') processedArgs.push(value);
        });
      } else {
        await validateXcmArguments(state.args, argDefs, network);
        for (const argDef of argDefs) {
          if (signal.aborted) return;
          const value = state.args[argDef.name];
          if (value === undefined || value === '') continue;

          // Enhanced XCM argument processing with proper error handling
          try {
            let processedValue;

            // Intelligent XCM encoding based on research findings
            if (argDef.type === 'XcmBeneficiary') {
              const cleanAddress = value.trim().replace(/\s/g, '');
              try {
                const { decodeAddress, isAddress } = await import('@polkadot/util-crypto');
                if (!isAddress(cleanAddress)) {
                  throw new Error(`Invalid SS58 address format: ${cleanAddress}`);
                }
                const publicKey = decodeAddress(cleanAddress);
                if (publicKey.length !== 32) {
                  throw new Error(`Address must decode to exactly 32 bytes, got ${publicKey.length}`);
                }
                processedValue = {
                  V4: { // Use V4 instead of V3
                    parents: 0,
                    interior: {
                      X1: {
                        AccountId32: {
                          network: null,
                          id: publicKey // Uint8Array
                        }
                      }
                    }
                  }
                };
                // Validate structure
                try {
                  await api.registry.createType('StagingXcmV4Location', processedValue);
                } catch (v4Error) {
                  console.error('XCM V4 validation failed for beneficiary:', v4Error.message);
                  throw new Error(`Invalid XCM V4 beneficiary structure: ${v4Error.message}`);
                }
                console.log('XcmBeneficiary processed:', {
                  original: cleanAddress,
                  publicKeyLength: publicKey.length,
                  publicKeyHex: Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join(''),
                  structure: JSON.stringify(processedValue)
                });
              } catch (decodeError) {
                throw new Error(`Invalid SS58 address: ${cleanAddress}. Error: ${decodeError.message}`);
              }
            } else if (argDef.type === 'XcmDestination') {
            const destination = XCM_DESTINATIONS[value as keyof typeof XCM_DESTINATIONS];
            if (!destination) {
              throw new Error(`Unknown destination: ${value}`);
            }
            processedValue = {
              V4: {
                parents: destination.paraId === 0 ? 1 : 1,
                interior: destination.paraId === 0
                  ? "Here"
                  : {
                    X1: {
                      Parachain: destination.paraId
                    }
                  }
              }
            };
            console.log('XcmDestination processed:', {
              destination: value,
              paraId: destination.paraId,
              structure: processedValue
            });
            } else if (argDef.type === 'XcmAssets') {
            const [assetKey, amount] = value.split('|');
            if (!assetKey || !amount) {
              throw new Error('XCM assets must be in format: asset|amount');
            }
            const numAmount = parseFloat(amount.trim());
            if (isNaN(numAmount) || numAmount <= 0) {
              throw new Error('Amount must be a positive number');
            }
            const decimals = network.decimals || 12; // Paseo Asset Hub uses 12 decimals
            const parsedAmount = Math.floor(numAmount * Math.pow(10, decimals));
            processedValue = {
              V4: [{
                id: {
                  parents: 0,
                  interior: assetKey.toLowerCase() === 'native' ? "Here" : {
                    X1: {
                      GeneralIndex: 0
                    }
                  }
                },
                fun: {
                  Fungible: parsedAmount.toString()
                }
              }]
            };
            console.log('XcmAssets processed:', {
              assetKey,
              amount: numAmount,
              decimals,
              parsedAmount,
              structure: JSON.stringify(processedValue)
            });
          } else if (argDef.type === 'XcmWeightLimit') {
              if (value === 'Unlimited') {
                processedValue = 'Unlimited';
              } else {
                // Research shows this format for Limited weight
                processedValue = {
                  Limited: {
                    refTime: parseInt(value) || 10000000000,
                    proofSize: 65536
                  }
                };
              }

              console.log('XcmWeightLimit processed:', processedValue);

            } else if (argDef.type === 'u32') {
              processedValue = parseInt(value) || 0;
              console.log('u32 processed:', processedValue);
            } else {
              processedValue = await processArgument(value, argDef.type, network);
            }

            // Debug logging for XCM types
            if (argDef.type.startsWith('Xcm')) {
              console.log(`Processed ${argDef.type} for ${argDef.name}:`, {
                input: value,
                output: processedValue,
                type: typeof processedValue
              });
            }

            processedArgs.push(processedValue);
          } catch (processingError) {
            throw new Error(`Failed to process ${argDef.name}: ${processingError instanceof Error ? processingError.message : processingError}`);
          }

          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Enhanced validation and debug logging for final arguments
      console.log('🔍 Final processed arguments for XCM transaction:', {
        pallet,
        call,
        totalArgs: processedArgs.length,
        arguments: processedArgs.map((arg, index) => {
          const argDef = state.selectedPreset.args[index];
          return {
            index,
            name: argDef?.name || `arg${index}`,
            type: argDef?.type || 'unknown',
            dataType: typeof arg,
            isXcmType: argDef?.type?.startsWith('Xcm') || false,
            hasV4: JSON.stringify(arg).includes('V4'),
            preview: argDef?.type === 'XcmBeneficiary' ?
              `AccountId32 with ${arg?.V4?.interior?.X1?.AccountId32?.id?.length || 'unknown'} bytes` :
              argDef?.type === 'XcmDestination' ?
                `Destination to ${arg?.V4?.interior === 'Here' ? 'relay' : `para ${arg?.V4?.interior?.X1?.Parachain}`}` :
                argDef?.type === 'XcmAssets' ?
                  `${arg?.V4?.length || 0} asset(s)` :
                  String(arg).substring(0, 50)
          };
        })
      });

      // Validate that all XCM arguments have the correct structure
      const xcmArgs = processedArgs.filter((_, index) => {
        const argDef = state.selectedPreset.args[index];
        return argDef?.type?.startsWith('Xcm');
      });

      if (xcmArgs.length > 0) {
        console.log('✅ XCM arguments validation:', {
          xcmArgsCount: xcmArgs.length,
          allHaveV4: xcmArgs.every(arg => JSON.stringify(arg).includes('V4')),
          beneficiaryOk: xcmArgs.some(arg =>
            arg?.V4?.interior?.X1?.AccountId32?.id?.length === 32 ||
            (Array.isArray(arg?.V4?.interior?.X1?.AccountId32?.id) && arg.V4.interior.X1.AccountId32.id.length === 32)
          )
        });
      }

      if (signal.aborted || !mountedRef.current) return;

      // Build transaction
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

      // Estimate fee
      try {
        const info = await Promise.race([
          tx.paymentInfo(senderAccount.address),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Fee estimation timeout')), 3000))
        ]);

        if (mountedRef.current && !signal.aborted) {
          const fee = formatBalance(info.partialFee, {
            withUnit: network.symbol,
            decimals: network.decimals
          });
          updateState({ estimatedFee: fee });
        }
      } catch {
        if (mountedRef.current && !signal.aborted) {
          updateState({ estimatedFee: 'Unable to estimate' });
        }
      }

      if (mountedRef.current && !signal.aborted) {
        showToast('Transaction built successfully!', 'success');
      }
    } catch (error) {
      if (mountedRef.current && !signal.aborted) {
        const message = error instanceof Error ? error.message : 'Error building transaction';
        showToast(message, 'error');
        console.error('Build error:', error);
      }
    } finally {
      buildingRef.current = false;
      if (mountedRef.current) updateState({ isBuilding: false });
    }
  }, [api, state.selectedPreset, state.customPallet, state.customCall, state.args, network, senderAccount.address, updateState, showToast]);

  // Sign and send transaction
  const signAndSendTransaction = useCallback(async () => {
    if (!state.builtTx || !api || !mountedRef.current) return;

    if (!walletReady || !walletConnector.isExtensionsEnabled()) {
      showToast('Wallet extension not available. Please install and enable a Polkadot wallet.', 'error');
      return;
    }

    updateState({ isSigning: true });

    try {
      const extensionSigner = await walletConnector.getSigner(senderAccount.address);
      if (!extensionSigner || !mountedRef.current) {
        throw new Error("Unable to connect to wallet extension");
      }

      updateState({ isSending: true, isSigning: false });
      const broadcastToastId = showToast('Broadcasting transaction...', 'loading');

      let unsubscribed = false;
      let statusUpdateCount = 0;

      const unsub = await state.builtTx.signAndSend(
        senderAccount.address,
        { signer: extensionSigner.signer },
        (result: any) => {
          if (!mountedRef.current || unsubscribed) return;

          statusUpdateCount++;
          updateState({ txHash: result.txHash.toHex() });

          if (result.status.isInBlock && statusUpdateCount <= 2) {
            if (broadcastToastId) toast.dismiss(broadcastToastId);
            updateState({ txStatus: 'inBlock' });
            showToast('Transaction included in block!', 'success');
          } else if (result.status.isFinalized) {
            updateState({ txStatus: 'finalized', isSending: false });
            showToast('Transaction finalized successfully!', 'success');
            unsubscribed = true;
            unsub();
          } else if (result.status.isDropped || result.status.isInvalid) {
            updateState({ txStatus: 'error', isSending: false });
            showToast('Transaction failed', 'error');
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
                  showToast(errorMessage, 'error');
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
        showToast(message, 'error');
        updateState({ isSigning: false, isSending: false });
        console.error('Transaction error:', error);
      }
    }
  }, [state.builtTx, api, senderAccount.address, updateState, walletReady, walletConnector, showToast]);

  // Container classes with improved dark mode support
  const containerClasses = useMemo(() => {
    const base = "transition-all duration-500 ease-in-out";
    return isFullscreen || isExpanded
      ? `${base} fixed inset-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto`
      : `${base} relative`;
  }, [isFullscreen, isExpanded]);

  const cardClasses = useMemo(() => {
    const base = "relative transition-all duration-500 ease-in-out";
    return isExpanded
      ? `${base} p-8 shadow-2xl border-2 bg-theme-surface backdrop-blur-xl
         border-network-primary/50 hover:shadow-3xl network-transition`
      : `${base} p-6 shadow-xl bg-theme-surface backdrop-blur-lg
         border-theme hover:shadow-2xl hover:border-network-primary/50 network-transition`;
  }, [isExpanded]);

  const phaseDescriptions = {
    selection: 'Choose your transaction type to get started',
    configuration: 'Configure transaction parameters and arguments',
    review: 'Review transaction details and confirm',
    status: 'Monitor transaction status and progress'
  };

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {isExpanded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoBack}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                           bg-theme-surface border-theme 
                           hover:bg-theme-surface-variant hover:border-network-primary
                           transition-all duration-300 shadow-sm hover:shadow-md
                           text-theme-secondary hover:text-theme-primary
                           network-transition font-medium group"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  <span>Back</span>
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-3 text-theme-primary">
                  <div className="w-8 h-8 rounded-lg bg-network-primary flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span>Transaction Builder</span>
                </h2>
                <p className="text-sm text-theme-secondary mt-1 font-medium">
                  {phaseDescriptions[currentPhase]}
                </p>
              </div>
            </div>

            {(isExpanded || isFullscreen) && onMinimize && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMinimize}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg
                         bg-theme-surface border-theme 
                         hover:bg-red-50/80 dark:hover:bg-red-900/40
                         hover:border-red-300/70 dark:hover:border-red-600/70
                         transition-all duration-300 shadow-sm hover:shadow-md
                         text-theme-secondary hover:text-red-500
                         network-transition group"
              >
                <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            )}
          </div>

          <StatusIndicator
            isReady={walletReady}
            title={walletReady ? 'Wallet Connected' : 'Wallet Extension Required'}
            subtitle={walletReady ? walletConnector.getAvailableExtensions().join(', ') : undefined}
          />

          {(currentPhase === 'selection' || state.selectedPreset?.id?.includes('xcm')) && (
            <div className="mt-4">
              <InfoCard>
                <p className="text-sm text-theme-secondary leading-relaxed font-medium
                           group-hover:text-theme-primary transition-colors duration-300">
                  Advanced XCM transactions available: Reserve Transfer, Teleport, HRMP channels, and XCMP messages.
                </p>
              </InfoCard>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mb-8">
            <ProgressSteps steps={steps} />
          </div>
        )}

        <div className="space-y-8">
          {!state.selectedPreset && (
            <PresetSelector presets={TRANSACTION_PRESETS} onSelect={handlePresetSelect} />
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
            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 rounded-xl 
                            bg-theme-surface border-2 border-theme backdrop-blur-sm 
                            shadow-lg hover:shadow-xl hover:border-network-primary/60
                            transition-all duration-300 ease-out network-transition
                            hover:-translate-y-0.5">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-10 bg-gradient-to-b from-network-primary to-network-secondary 
                                rounded-full opacity-90 shadow-lg"></div>
                  <h3 className="text-xl font-bold text-theme-primary">
                    Review Transaction
                  </h3>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  size="sm"
                  className="px-6 py-3 rounded-xl font-semibold
                           bg-theme-surface border-2 border-theme 
                           hover:bg-theme-surface-variant hover:border-network-primary
                           active:scale-95 transition-all duration-300 ease-out
                           shadow-md hover:shadow-lg hover:-translate-y-0.5
                           text-theme-secondary hover:text-network-primary
                           network-transition group
                           focus:outline-none focus:ring-2 focus:ring-network-primary/30"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Rebuild</span>
                  </span>
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

              <ActionButton
                onClick={signAndSendTransaction}
                disabled={!walletReady}
                loading={state.isSigning || state.isSending}
                variant="primary"
              >
                {!walletReady ? (
                  'Wallet Required'
                ) : state.isSigning ? (
                  'Signing Transaction...'
                ) : state.isSending ? (
                  'Broadcasting...'
                ) : (
                  'Sign & Send Transaction'
                )}
              </ActionButton>
            </div>
          )}

          {state.txHash && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-5 rounded-xl 
                            bg-theme-surface border-2 border-theme backdrop-blur-sm 
                            network-transition shadow-lg hover:shadow-xl
                            hover:border-network-primary/60 transition-all duration-300
                            hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-theme-surface-variant flex items-center justify-center
                               hover:bg-network-primary/20 transition-colors duration-300 shadow-md">
                  <svg className="w-5 h-5 text-network-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-theme-primary">Transaction Status</h3>
              </div>

              <TransactionStatus txHash={state.txHash} txStatus={state.txStatus} />

              {state.txStatus === 'finalized' && (
                <div className="space-y-4">
                  <StatusMessage
                    type="success"
                    title="Transaction Completed Successfully!"
                    subtitle="Your transaction has been finalized on the blockchain"
                  />
                  <ActionButton
                    onClick={handleGoBack}
                    variant="success"
                    className="group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span className="transition-transform duration-300 group-hover:rotate-12">✨</span>
                      <span>Create New Transaction</span>
                    </span>
                  </ActionButton>
                </div>
              )}

              {(state.txStatus === 'error' || state.txStatus === 'dropped') && (
                <div className="space-y-4">
                  <StatusMessage
                    type="error"
                    title="Transaction Failed"
                    subtitle="Please check the transaction details and try again"
                  />
                  <ActionButton
                    onClick={handleGoBack}
                    variant="error"
                    className="group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span className="transition-transform duration-300 group-hover:rotate-180">🔄</span>
                      <span>Try Again</span>
                    </span>
                  </ActionButton>
                </div>
              )}
            </div>
          )}

          {(currentPhase === 'selection' || currentPhase === 'configuration') && (
            <div className="mt-6">
              <XcmNetworkStatus network={network} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(TransactionBuilder);