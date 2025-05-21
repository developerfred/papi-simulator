"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { InjectedExtension, InjectedAccount } from "@polkadot/extension-inject/types";
import { encodeAddress } from "@polkadot/util-crypto";
import toast from "react-hot-toast";
import { NETWORKS, DEFAULT_NETWORK } from "@/lib/constants/networks";
import type { Network } from "@/lib/types/network";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

// Define the wallet platforms
export enum WalletPlatform {
  Browser = "browser",
  Mobile = "mobile",
  Desktop = "desktop",
}

// Define wallet interface
export interface Wallet {
  id: string;
  name: string;
  logo?: string;
  platforms: WalletPlatform[];
  urls: {
    website: string;
    download?: string;
  };
}

// Define supported wallets - extracted to a constant for reuse
export const SUPPORTED_WALLETS: Wallet[] = [
  {
    id: "polkadot-js",
    name: "Polkadot.js",
    platforms: [WalletPlatform.Browser],
    urls: {
      website: "https://polkadot.js.org/extension/",
    },
  },
  {
    id: "talisman",
    name: "Talisman",
    platforms: [WalletPlatform.Browser],
    urls: {
      website: "https://talisman.xyz/",
    },
  },
  {
    id: "subwallet-js",
    name: "SubWallet",
    platforms: [WalletPlatform.Browser],
    urls: {
      website: "https://subwallet.app/",
    },
  },
];

// Connection state type for better type safety
type ConnectionState = 
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected", extension: InjectedExtension }
  | { status: "error", error: Error };

interface WalletContextType {
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => void;
  connectionState: ConnectionState;
  activeAccount: InjectedAccount | null;
  accounts: InjectedAccount[];
  setActiveAccount: (account: InjectedAccount) => void;
  activeNetwork: Network;
  switchNetwork: (network: Network) => void;
  wallets: Wallet[];
  isWalletInstalled: (wallet: Wallet) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Storage keys as constants to prevent duplication
const STORAGE_KEYS = {
  WALLET_ID: "wallet_connected_id",
  ACCOUNT_ADDRESS: "wallet_active_account",
  NETWORK_ID: "wallet_active_network",
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use custom hooks for persistence with proper typing
  const [persistedWalletId, setPersistedWalletId] = useLocalStorage<string | null>(STORAGE_KEYS.WALLET_ID, null);
  const [persistedAccountAddress, setPersistedAccountAddress] = useLocalStorage<string | null>(STORAGE_KEYS.ACCOUNT_ADDRESS, null);
  const [persistedNetworkId, setPersistedNetworkId] = useLocalStorage<string>(STORAGE_KEYS.NETWORK_ID, DEFAULT_NETWORK.id);
  
  // State with proper typing
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "disconnected" });
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<InjectedAccount | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<Network>(
    () => NETWORKS[persistedNetworkId] || DEFAULT_NETWORK
  );

  // Optimized function to check if a wallet is installed
  const isWalletInstalled = useCallback((wallet: Wallet): boolean => {
    if (typeof window === "undefined") return false;
    
    return wallet.platforms.includes(WalletPlatform.Browser) && 
           !!window.injectedWeb3 && 
           !!window.injectedWeb3[wallet.id];
  }, []);

  // Memoized list of wallets with installed ones first
  const wallets = useMemo(() => {
    const installed = SUPPORTED_WALLETS.filter(isWalletInstalled);
    const notInstalled = SUPPORTED_WALLETS.filter(w => !isWalletInstalled(w));
    return [...installed, ...notInstalled];
  }, [isWalletInstalled]);

  // Helper to get extension from window
  const getInjectedExtension = useCallback(async (walletId: string): Promise<InjectedExtension> => {
    if (typeof window === "undefined" || !window.injectedWeb3 || !window.injectedWeb3[walletId]) {
      throw new Error(`Wallet ${walletId} not found or not installed`);
    }
    
    try {
      return await window.injectedWeb3[walletId].enable("Polkadot API Playground");
    } catch (error) {
      console.error("Failed to enable wallet extension:", error);
      throw new Error(`Failed to enable wallet: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, []);

  // Enhanced connect function with error handling and persistence
  const connect = useCallback(async (walletId?: string): Promise<void> => {
    if (typeof window === "undefined") return;
    
    if (!window.injectedWeb3 || Object.keys(window.injectedWeb3).length === 0) {
      toast.error("No wallet extensions found. Please install a Polkadot wallet extension.");
      return;
    }

    // Use the first available wallet if none specified
    const selectedWalletId = walletId || Object.keys(window.injectedWeb3)[0];
    
    // Update connection state
    setConnectionState({ status: "connecting" });

    try {
      // Get extension
      const extensionInstance = await getInjectedExtension(selectedWalletId);
      
      // Get accounts with proper error handling
      let injectedAccounts: InjectedAccount[] = [];
      try {
        injectedAccounts = await extensionInstance.accounts.get();
      } catch (error) {
        console.error("Failed to get accounts:", error);
        throw new Error("Failed to access accounts. Please check wallet permissions.");
      }

      if (injectedAccounts.length === 0) {
        throw new Error("No accounts found in the wallet. Please create or import an account first.");
      }

      // Update state
      setAccounts(injectedAccounts);
      setConnectionState({ status: "connected", extension: extensionInstance });
      
      // Set active account (previously selected or first one)
      const savedAccount = persistedAccountAddress 
        ? injectedAccounts.find(acc => acc.address === persistedAccountAddress)
        : null;
      
      const accountToActivate = savedAccount || injectedAccounts[0];
      setActiveAccount(accountToActivate);
      
      // Persist wallet selection
      setPersistedWalletId(selectedWalletId);
      setPersistedAccountAddress(accountToActivate.address);
      
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setConnectionState({ 
        status: "error", 
        error: error instanceof Error ? error : new Error(String(error))
      });
      toast.error(`Failed to connect wallet: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [getInjectedExtension, persistedAccountAddress, setPersistedWalletId, setPersistedAccountAddress]);

  // Clean disconnect function
  const disconnect = useCallback((): void => {
    setConnectionState({ status: "disconnected" });
    setAccounts([]);
    setActiveAccount(null);
    
    // Clear persistence
    setPersistedWalletId(null);
    setPersistedAccountAddress(null);
    
    toast.success("Wallet disconnected");
  }, [setPersistedWalletId, setPersistedAccountAddress]);

  // Handle account changes within the same wallet
  const handleSetActiveAccount = useCallback((account: InjectedAccount): void => {
    setActiveAccount(account);
    setPersistedAccountAddress(account.address);
  }, [setPersistedAccountAddress]);

  // Enhanced network switching
  const switchNetwork = useCallback((network: Network): void => {
    setActiveNetwork(network);
    setPersistedNetworkId(network.id);
    toast.success(`Switched to ${network.name}`);
  }, [setPersistedNetworkId]);

  // Auto-connect on mount using persisted data
  useEffect(() => {
    const autoConnect = async () => {
      if (!persistedWalletId) return;
      
      try {
        await connect(persistedWalletId);
      } catch (error) {
        console.error("Failed to auto-connect wallet:", error);
        // Clear persistence on failure
        setPersistedWalletId(null);
        setPersistedAccountAddress(null);
      }
    };
    
    autoConnect();
  }, [connect, persistedWalletId, setPersistedWalletId, setPersistedAccountAddress]);

  // Subscribe to account changes from extension
  useEffect(() => {
    if (connectionState.status !== "connected") return;
    
    const { extension } = connectionState;
    
    const unsubscribe = extension.accounts.subscribe((newAccounts) => {
      setAccounts(newAccounts);
      
      // If active account was removed, select first available or disconnect
      if (activeAccount && !newAccounts.some(acc => acc.address === activeAccount.address)) {
        if (newAccounts.length > 0) {
          handleSetActiveAccount(newAccounts[0]);
        } else {
          disconnect();
          toast.warn("All accounts were removed from the wallet.");
        }
      }
    });
    
    return () => {
      unsubscribe?.();
    };
  }, [connectionState, activeAccount, handleSetActiveAccount, disconnect]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    connect,
    disconnect,
    connectionState,
    activeAccount,
    accounts,
    setActiveAccount: handleSetActiveAccount,
    activeNetwork,
    switchNetwork,
    wallets,
    isWalletInstalled,
  }), [
    connect, 
    disconnect, 
    connectionState, 
    activeAccount, 
    accounts, 
    handleSetActiveAccount,
    activeNetwork, 
    switchNetwork,
    wallets,
    isWalletInstalled
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Custom hook with proper error handling
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};