/* eslint-disable  @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment*/
// @ts-nocheck
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

// Types
export interface Network {
  name: string;
  rpcUrl: string;
  symbol: string;
  decimals: number;
  ss58Format: number;
}

export interface WalletAccount {
  address: string;
  meta?: {
    name?: string;
    source?: string;
  };
  name?: string;
}

export interface BlockInfo {
  number: string;
  hash: string;
  timestamp: number;
  extrinsicsCount: number;
}

export interface ChainInfo {
  name: string;
  version: string;
  tokenSymbol: string;
  tokenDecimals: number;
  ss58Format: number;
}

interface BlockchainState {
  // Network state
  selectedNetwork: Network;
  availableNetworks: Network[];
  
  // Wallet state
  walletConnected: boolean;
  walletConnecting: boolean;
  availableAccounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
  walletError: string | null;
  
  // API state
  api: ApiPromise | null;
  apiConnected: boolean;
  apiConnecting: boolean;
  apiError: string | null;
  
  // Chain data
  chainInfo: ChainInfo | null;
  latestBlocks: BlockInfo[];
  currentBlock: number;
  balance: string;
  
  // Actions
  setSelectedNetwork: (network: Network) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setSelectedAccount: (account: WalletAccount) => void;
  connectToChain: () => Promise<void>;
  disconnectFromChain: () => void;
  fetchLatestBlocks: () => Promise<void>;
  fetchBalance: (address: string) => Promise<void>;
  reset: () => void;
}

const NETWORKS: Network[] = [
  {
    name: "Polkadot",
    rpcUrl: "wss://rpc.polkadot.io",
    symbol: "DOT",
    decimals: 10,
    ss58Format: 0,
  },
  {
    name: "Kusama", 
    rpcUrl: "wss://kusama-rpc.polkadot.io",
    symbol: "KSM",
    decimals: 12,
    ss58Format: 2,
  },
  {
    name: "Westend",
    rpcUrl: "wss://westend-rpc.polkadot.io", 
    symbol: "WND",
    decimals: 12,
    ss58Format: 42,
  },
];

export const useBlockchainStore = create<BlockchainState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedNetwork: NETWORKS[0],
        availableNetworks: NETWORKS,
        walletConnected: false,
        walletConnecting: false,
        availableAccounts: [],
        selectedAccount: null,
        walletError: null,
        api: null,
        apiConnected: false,
        apiConnecting: false,
        apiError: null,
        chainInfo: null,
        latestBlocks: [],
        currentBlock: 0,
        balance: '0',

        // Actions
        setSelectedNetwork: (network: Network) => {
          const state = get();
          if (state.selectedNetwork.name !== network.name) {
            set({ selectedNetwork: network });
            // Reconnect to new network
            state.connectToChain();
          }
        },

        connectWallet: async () => {
          set({ walletConnecting: true, walletError: null });
          
          try {
            // Enable wallet extensions
            const extensions = await web3Enable('Blockchain Explorer');
            
            if (extensions.length === 0) {
              throw new Error('Nenhuma wallet encontrada. Instale Polkadot{.js} ou Talisman.');
            }

            // Get all accounts
            const accounts = await web3Accounts();
            
            if (accounts.length === 0) {
              throw new Error('Nenhuma conta encontrada. Crie uma conta em sua wallet.');
            }

            set({
              walletConnected: true,
              walletConnecting: false,
              availableAccounts: accounts,
              selectedAccount: accounts[0],
              walletError: null,
            });

            // Auto connect to chain after wallet connection
            get().connectToChain();
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar wallet';
            set({
              walletConnected: false,
              walletConnecting: false,
              walletError: errorMessage,
            });
          }
        },

        disconnectWallet: () => {
          const state = get();
          if (state.api) {
            state.api.disconnect();
          }
          
          set({
            walletConnected: false,
            availableAccounts: [],
            selectedAccount: null,
            walletError: null,
            api: null,
            apiConnected: false,
            apiError: null,
            chainInfo: null,
            latestBlocks: [],
            balance: '0',
          });
        },

        setSelectedAccount: (account: WalletAccount) => {
          set({ selectedAccount: account });
          // Fetch balance for new account
          if (get().apiConnected) {
            get().fetchBalance(account.address);
          }
        },

        connectToChain: async () => {
          const state = get();
          
          if (!state.walletConnected) {
            set({ apiError: 'Wallet não conectada' });
            return;
          }

          set({ apiConnecting: true, apiError: null });

          try {
            // Create WebSocket provider
            const wsProvider = new WsProvider(state.selectedNetwork.rpcUrl);
            
            // Create API instance
            const api = await ApiPromise.create({ provider: wsProvider });
            
            // Wait for API to be ready
            await api.isReady;

            // Get chain info
            const [chain, version, properties] = await Promise.all([
              api.rpc.system.chain(),
              api.rpc.system.version(),
              api.rpc.system.properties(),
            ]);

            const chainInfo: ChainInfo = {
              name: chain.toString(),
              version: version.toString(),
              tokenSymbol: properties.tokenSymbol.toString(),
              tokenDecimals: properties.tokenDecimals.toNumber(),
              ss58Format: properties.ss58Format.toNumber(),
            };

            set({
              api,
              apiConnected: true,
              apiConnecting: false,
              apiError: null,
              chainInfo,
            });

            // Subscribe to new blocks
            api.rpc.chain.subscribeNewHeads((header) => {
              set({ currentBlock: header.number.toNumber() });
              get().fetchLatestBlocks();
            });

            // Fetch initial data
            get().fetchLatestBlocks();
            if (state.selectedAccount) {
              get().fetchBalance(state.selectedAccount.address);
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar à blockchain';
            console.error('Chain connection error:', error);
            
            set({
              api: null,
              apiConnected: false,
              apiConnecting: false,
              apiError: errorMessage,
            });
          }
        },

        disconnectFromChain: () => {
          const state = get();
          if (state.api) {
            state.api.disconnect();
          }
          
          set({
            api: null,
            apiConnected: false,
            apiError: null,
            chainInfo: null,
            latestBlocks: [],
            currentBlock: 0,
          });
        },

        fetchLatestBlocks: async () => {
          const state = get();
          if (!state.api || !state.apiConnected) return;

          try {
            const latestHeader = await state.api.rpc.chain.getHeader();
            const latestBlockNumber = latestHeader.number.toNumber();
            
            const blockPromises = [];
            const blockCount = Math.min(5, latestBlockNumber);
            
            for (let i = 0; i < blockCount; i++) {
              const blockNumber = latestBlockNumber - i;
              blockPromises.push(
                Promise.all([
                  state.api.rpc.chain.getBlockHash(blockNumber),
                  state.api.rpc.chain.getBlock(state.api.rpc.chain.getBlockHash(blockNumber)),
                ]).then(async ([hash, block]) => {
                  const blockData = await state.api!.rpc.chain.getBlock(hash);
                  return {
                    number: blockNumber.toString(),
                    hash: hash.toString(),
                    timestamp: Date.now() - (i * 6000), // Approximate timestamp
                    extrinsicsCount: blockData.block.extrinsics.length,
                  };
                })
              );
            }

            const blocks = await Promise.all(blockPromises);
            set({ latestBlocks: blocks });

          } catch (error) {
            console.error('Error fetching blocks:', error);
          }
        },

        fetchBalance: async (address: string) => {
          const state = get();
          if (!state.api || !state.apiConnected) return;

          try {
            const balance = await state.api.query.system.account(address);
            const freeBalance = balance.data.free.toString();
            
            // Convert from smallest unit to main unit
            const decimals = state.selectedNetwork.decimals;
            const balanceInMainUnit = (parseInt(freeBalance) / Math.pow(10, decimals)).toFixed(4);
            
            set({ balance: balanceInMainUnit });
          } catch (error) {
            console.error('Error fetching balance:', error);
            set({ balance: '0' });
          }
        },

        reset: () => {
          const state = get();
          if (state.api) {
            state.api.disconnect();
          }
          
          set({
            selectedNetwork: NETWORKS[0],
            walletConnected: false,
            walletConnecting: false,
            availableAccounts: [],
            selectedAccount: null,
            walletError: null,
            api: null,
            apiConnected: false,
            apiConnecting: false,
            apiError: null,
            chainInfo: null,
            latestBlocks: [],
            currentBlock: 0,
            balance: '0',
          });
        },
      }),
      {
        name: 'blockchain-storage',
        partialize: (state) => ({
          selectedNetwork: state.selectedNetwork,
        }),
      }
    ),
    { name: 'blockchain-store' }
  )
);