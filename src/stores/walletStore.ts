/* eslint-disable  @typescript-eslint/ban-ts-comment  */
// @ts-nocheck
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import toast from 'react-hot-toast';
import type { WalletState } from '@/types/wallet';
import { SUPPORTED_WALLETS } from '@/constants/wallets';



const isWalletInstalled = (walletId: string): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.injectedWeb3?.[walletId]);
};
    
const getInstalledWallets = () => {
  if (typeof window === "undefined") return SUPPORTED_WALLETS;
  
  return SUPPORTED_WALLETS.sort((a, b) => {
    const aInstalled = isWalletInstalled(a.id);
    const bInstalled = isWalletInstalled(b.id);
    return bInstalled ? 1 : aInstalled ? -1 : 0;
  });
};

// Create the store
export const useWalletStore = create<WalletState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      status: "disconnected",
      activeAccount: null,
      accounts: [],
      wallets: getInstalledWallets(),
      extension: null,
      error: null,
      connectedWalletId: null, 

      // Internal setters
      _setStatus: (status) => set((state) => {
        state.status = status;
      }),

      _setError: (error) => set((state) => {
        state.error = error;
        if (error) state.status = "error";
      }),

      _setAccounts: (accounts) => set((state) => {
        state.accounts = accounts;
      }),

      _setExtension: (extension) => set((state) => {
        state.extension = extension;
      }),

      _setConnectedWalletId: (walletId) => set((state) => {
        state.connectedWalletId = walletId;
      }),

      
      refreshWallets: () => set((state) => {
        state.wallets = getInstalledWallets();
      }),

      isWalletInstalled: (walletId: string) => isWalletInstalled(walletId),
      
      isWalletConnected: (walletId: string) => {
        const state = get();
        return state.status === "connected" && state.connectedWalletId === walletId;
      },

      setActiveAccount: (account) => set((state) => {
        state.activeAccount = account;
      }),

      disconnect: () => set((state) => {
        state.status = "disconnected";
        state.activeAccount = null;
        state.accounts = [];
        state.extension = null;
        state.error = null;
        state.connectedWalletId = null; 
        toast.success("Wallet disconnected");
      }),

      connect: async (walletId?: string) => {
        const state = get();
        
        // Prevent multiple simultaneous connections
        if (state.status === "connecting") return;

        if (typeof window === "undefined" || !window.injectedWeb3) {
          state._setError("No wallet extensions found");
          toast.error("No wallet extensions found");
          return;
        }

        const targetWalletId = walletId || Object.keys(window.injectedWeb3)[0];
        if (!targetWalletId || !window.injectedWeb3[targetWalletId]) {
          state._setError("Wallet not found");
          toast.error("Wallet not found");
          return;
        }

        state._setStatus("connecting");
        state._setError(null);

        try {
          // Enable wallet
          const extension = await window.injectedWeb3[targetWalletId].enable("Polkadot API Playground");
          
          // Get accounts
          const accounts = await extension.accounts.get();
          
          if (accounts.length === 0) {
            throw new Error("No accounts found in wallet");
          }

          
          set((state) => {
            state.status = "connected";
            state.extension = extension;
            state.accounts = accounts;
            state.activeAccount = accounts[0];
            state.error = null;
            state.connectedWalletId = targetWalletId; 
          });

          const walletName = SUPPORTED_WALLETS.find(w => w.id === targetWalletId)?.name || 'Wallet';
          toast.success(`${walletName} connected successfully`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Connection failed";
          state._setError(errorMessage);
          toast.error(`Failed to connect: ${errorMessage}`);
        }
      },
    })),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeAccount: state.activeAccount,
        connectedWalletId: state.connectedWalletId, 
      }),
    }
  )
);