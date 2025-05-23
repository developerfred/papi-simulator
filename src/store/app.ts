// src/store/app.ts
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { nanoid } from 'nanoid';
import type { Network } from '@/lib/types/network';
import type { Signer, Transaction } from '@/lib/types/transaction';
import { DEFAULT_NETWORK } from '@/lib/constants/networks';
import { TEST_ACCOUNTS } from '@/lib/constants/accounts';

// Types
interface AppState {
 // Chain slice
 network: Network;
 client: any;
 typedApi: any;
 connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
 connectionError: string | null;
 
 // Signer slice  
 selectedSigner: Signer | null;
 availableSigners: Signer[];
 
 // Transaction slice
 transactions: Transaction[];
 currentTransaction: Transaction | null;
 
 // Wallet slice
 activeAccount: any;
 accounts: any[];
 walletConnected: boolean;
 
 // Block slice
 finalizedBlocks: any[];
 bestBlocks: any[];
 
 // Query slice
 queryCache: Record<string, { data: any; timestamp: number; status: string }>;
 
 // Event slice
 events: any[];
 subscriptions: Record<string, boolean>;
 
 // Actions
 chain: ChainActions;
 signer: SignerActions;
 transaction: TransactionActions;
 wallet: WalletActions;
 block: BlockActions;
 query: QueryActions;
 event: EventActions;
}

interface ChainActions {
 connect: (network: Network) => Promise<void>;
 disconnect: () => void;
 setNetwork: (network: Network) => void;
}

interface SignerActions {
 select: (signer: Signer | null) => void;
 add: (signer: Signer) => void;
 remove: (signer: Signer) => void;
 init: () => void;
}

interface TransactionActions {
 create: (tx: Partial<Transaction>) => string;
 update: (id: string, updates: Partial<Transaction>) => void;
 setStatus: (id: string, status: Transaction['status']) => void;
 clear: (id: string) => void;
 clearAll: () => void;
}

interface WalletActions {
 connect: (walletId?: string) => Promise<void>;
 disconnect: () => void;
 setAccount: (account: any) => void;
}

interface BlockActions {
 addFinalized: (block: any) => void;
 addBest: (block: any) => void;
 clear: () => void;
}

interface QueryActions {
 set: (key: string, data: any) => void;
 get: (key: string) => any;
 invalidate: (key: string) => void;
 clear: () => void;
}

interface EventActions {
 add: (event: any) => void;
 subscribe: (key: string) => void;
 unsubscribe: (key: string) => void;
 clear: () => void;
}

// Store implementation
export const useAppStore = create<AppState>()(
 subscribeWithSelector(
   devtools(
     persist(
       (set, get) => ({
         // Initial state
         network: DEFAULT_NETWORK,
         client: null,
         typedApi: null,
         connectionStatus: 'idle',
         connectionError: null,
         selectedSigner: null,
         availableSigners: [],
         transactions: [],
         currentTransaction: null,
         activeAccount: null,
         accounts: [],
         walletConnected: false,
         finalizedBlocks: [],
         bestBlocks: [],
         queryCache: {},
         events: [],
         subscriptions: {},

         // Chain actions
         chain: {
           connect: async (network: Network) => {
             set({ connectionStatus: 'connecting', network, connectionError: null });
             
             try {
               const provider = withPolkadotSdkCompat(getWsProvider(network.endpoint));
               const client = createClient(provider);
               
               // Import descriptors dynamically
               const descriptors = await import('@polkadot-api/descriptors');
               const descriptor = descriptors[network.descriptorKey];
               
               if (!descriptor) {
                 throw new Error(`Descriptor not found: ${network.descriptorKey}`);
               }
               
               const typedApi = client.getTypedApi(descriptor);
               
               set({ 
                 client, 
                 typedApi, 
                 connectionStatus: 'connected',
                 connectionError: null 
               });
               
               // Setup subscriptions automatically
               if (client.finalizedBlock$) {
                 client.finalizedBlock$.subscribe({
                   next: (block: any) => get().block.addFinalized(block),
                   error: (err: any) => console.error('Block subscription error:', err)
                 });
               }
               
             } catch (error) {
               const errorMsg = error instanceof Error ? error.message : String(error);
               set({ 
                 connectionStatus: 'error', 
                 connectionError: errorMsg,
                 client: null,
                 typedApi: null
               });
               throw error;
             }
           },

           disconnect: () => {
             const { client } = get();
             client?.destroy?.();
             set({ 
               client: null, 
               typedApi: null, 
               connectionStatus: 'idle',
               connectionError: null,
               finalizedBlocks: [],
               bestBlocks: [],
               events: [],
               subscriptions: {}
             });
           },

           setNetwork: (network: Network) => set({ network })
         },

         // Signer actions
         signer: {
           select: (signer: Signer | null) => set({ selectedSigner: signer }),
           
           add: (signer: Signer) => set(state => ({
             availableSigners: [
               ...state.availableSigners.filter(s => s.address !== signer.address),
               signer
             ]
           })),

           remove: (signer: Signer) => set(state => ({
             availableSigners: state.availableSigners.filter(s => s.address !== signer.address),
             selectedSigner: state.selectedSigner?.address === signer.address ? null : state.selectedSigner
           })),

           init: () => {
             const testSigners = Object.entries(TEST_ACCOUNTS).map(([name, address]) => ({
               address,
               name,
               type: 'test' as const,
               sign: async () => new Uint8Array(64).fill(0)
             }));
             
             set(state => ({
               availableSigners: [...state.availableSigners, ...testSigners]
             }));
           }
         },

         // Transaction actions
         transaction: {
           create: (txData: Partial<Transaction>) => {
             const id = nanoid();
             const transaction: Transaction = {
               id,
               status: 'idle',
               timestamp: Date.now(),
               txHash: '',
               blockInfo: null,
               error: null,
               metadata: {},
               ...txData
             };
             
             set(state => ({
               transactions: [transaction, ...state.transactions.slice(0, 49)], // Keep max 50
               currentTransaction: transaction
             }));
             
             return id;
           },

           update: (id: string, updates: Partial<Transaction>) => set(state => ({
             transactions: state.transactions.map(tx => 
               tx.id === id ? { ...tx, ...updates, timestamp: Date.now() } : tx
             ),
             currentTransaction: state.currentTransaction?.id === id 
               ? { ...state.currentTransaction, ...updates, timestamp: Date.now() }
               : state.currentTransaction
           })),

           setStatus: (id: string, status: Transaction['status']) => 
             get().transaction.update(id, { status }),

           clear: (id: string) => set(state => ({
             transactions: state.transactions.filter(tx => tx.id !== id),
             currentTransaction: state.currentTransaction?.id === id ? null : state.currentTransaction
           })),

           clearAll: () => set({ transactions: [], currentTransaction: null })
         },

         // Wallet actions
         wallet: {
           connect: async (walletId?: string) => {
             if (!window.injectedWeb3) {
               throw new Error('No wallet extensions found');
             }
             
             const selectedWallet = walletId || Object.keys(window.injectedWeb3)[0];
             
             try {
               const extension = await window.injectedWeb3[selectedWallet].enable('Polkadot API Playground');
               const accounts = await extension.accounts.get();
               
               if (accounts.length === 0) {
                 throw new Error('No accounts found');
               }
               
               set({ 
                 accounts, 
                 activeAccount: accounts[0], 
                 walletConnected: true 
               });

               // Auto-add wallet signer
               const walletSigner: Signer = {
                 address: accounts[0].address,
                 name: accounts[0].name || 'Wallet Account',
                 type: 'polkadot-js',
                 sign: async (data: Uint8Array) => {
                   const signature = await extension.signer.signRaw({
                     address: accounts[0].address,
                     data: Array.from(data),
                     type: 'bytes'
                   });
                   return new Uint8Array(Buffer.from(signature.signature.replace('0x', ''), 'hex'));
                 }
               };
               
               get().signer.add(walletSigner);
               get().signer.select(walletSigner);
               
             } catch (error) {
               throw new Error(`Failed to connect wallet: ${error.message}`);
             }
           },

           disconnect: () => {
             const { activeAccount } = get();
             if (activeAccount) {
               get().signer.remove({ address: activeAccount.address } as Signer);
             }
             set({ 
               accounts: [], 
               activeAccount: null, 
               walletConnected: false 
             });
           },

           setAccount: (account: any) => set({ activeAccount: account })
         },

         // Block actions
         block: {
           addFinalized: (block: any) => set(state => ({
             finalizedBlocks: [
               { ...block, timestamp: Date.now(), type: 'finalized' },
               ...state.finalizedBlocks.slice(0, 49)
             ]
           })),

           addBest: (block: any) => set(state => ({
             bestBlocks: [
               { ...block, timestamp: Date.now(), type: 'best' },
               ...state.bestBlocks.slice(0, 49)
             ]
           })),

           clear: () => set({ finalizedBlocks: [], bestBlocks: [] })
         },

         // Query actions
         query: {
           set: (key: string, data: any) => set(state => ({
             queryCache: {
               ...state.queryCache,
               [key]: {
                 data,
                 timestamp: Date.now(),
                 status: 'success'
               }
             }
           })),

           get: (key: string) => {
             const cached = get().queryCache[key];
             const isStale = cached && (Date.now() - cached.timestamp > 30000); // 30s TTL
             return isStale ? null : cached?.data;
           },

           invalidate: (key: string) => set(state => {
             const { [key]: _, ...rest } = state.queryCache;
             return { queryCache: rest };
           }),

           clear: () => set({ queryCache: {} })
         },

         // Event actions
         event: {
           add: (event: any) => set(state => ({
             events: [
               { ...event, id: nanoid(), timestamp: Date.now() },
               ...state.events.slice(0, 99)
             ]
           })),

           subscribe: (key: string) => set(state => ({
             subscriptions: { ...state.subscriptions, [key]: true }
           })),

           unsubscribe: (key: string) => set(state => {
             const { [key]: _, ...rest } = state.subscriptions;
             return { subscriptions: rest };
           }),

           clear: () => set({ events: [], subscriptions: {} })
         }
       }),
       {
         name: 'polkadot-app-store',
         partialize: (state) => ({
           network: state.network,
           availableSigners: state.availableSigners.filter(s => s.type === 'test'),
           transactions: state.transactions.filter(tx => tx.status === 'finalized').slice(0, 10)
         })
       }
     ),
     { name: 'polkadot-app-store' }
   )
 )
);

// Optimized selectors with shallow comparison
export const useChain = () => useAppStore(
 state => ({
   network: state.network,
   client: state.client,
   typedApi: state.typedApi,
   connectionStatus: state.connectionStatus,
   connectionError: state.connectionError,
   isConnected: state.connectionStatus === 'connected',
   isConnecting: state.connectionStatus === 'connecting',
   ...state.chain
 }),
 shallow
);

export const useSigner = () => useAppStore(
 state => ({
   selectedSigner: state.selectedSigner,
   availableSigners: state.availableSigners,
   hasSelected: !!state.selectedSigner,
   testSigners: state.availableSigners.filter(s => s.type === 'test'),
   walletSigners: state.availableSigners.filter(s => s.type === 'polkadot-js'),
   ...state.signer
 }),
 shallow
);

export const useTransaction = () => useAppStore(
 state => ({
   transactions: state.transactions,
   currentTransaction: state.currentTransaction,
   pendingTransactions: state.transactions.filter(tx => 
     ['preparing', 'signed', 'broadcasting', 'inBlock'].includes(tx.status)
   ),
   completedTransactions: state.transactions.filter(tx => 
     ['finalized', 'error'].includes(tx.status)
   ),
   ...state.transaction
 }),
 shallow
);

export const useWallet = () => useAppStore(
 state => ({
   activeAccount: state.activeAccount,
   accounts: state.accounts,
   walletConnected: state.walletConnected,
   hasAccounts: state.accounts.length > 0,
   ...state.wallet
 }),
 shallow
);

export const useBlocks = () => useAppStore(
 state => ({
   finalizedBlocks: state.finalizedBlocks,
   bestBlocks: state.bestBlocks,
   latestFinalized: state.finalizedBlocks[0],
   latestBest: state.bestBlocks[0],
   totalBlocks: state.finalizedBlocks.length + state.bestBlocks.length,
   ...state.block
 }),
 shallow
);

export const useQuery = () => useAppStore(
 state => ({
   cache: state.queryCache,
   ...state.query
 }),
 shallow
);

export const useEvents = () => useAppStore(
 state => ({
   events: state.events,
   subscriptions: state.subscriptions,
   activeSubscriptions: Object.keys(state.subscriptions).filter(k => state.subscriptions[k]),
   latestEvent: state.events[0],
   ...state.event
 }),
 shallow
);

// Initialize store
useAppStore.getState().signer.init();

// Store instance for external access
export const appStore = useAppStore;
