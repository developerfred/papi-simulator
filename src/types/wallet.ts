/* eslint-disable   @typescript-eslint/ban-ts-comment  */
// @ts-nocheck

import { z } from 'zod';

// Zod schemas for validation
export const InjectedAccountSchema = z.object({
    address: z.string(),
    meta: z.object({
        name: z.string().optional(),
        source: z.string(),
    }),
    type: z.string().optional(),
});

export const WalletSchema = z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().optional(),
    website: z.string().url(),
});

export const ConnectionStatusSchema = z.enum(['disconnected', 'connecting', 'connected', 'error']);

export const InjectedExtensionSchema = z.object({
    name: z.string().optional(),
    version: z.string().optional(),
    accounts: z.object({
        get: z.function().returns(z.promise(z.array(InjectedAccountSchema))),
        subscribe: z.function().optional(),
    }),
    signer: z.object({
        signPayload: z.function(),
        signRaw: z.function().optional(),
    }),
    metadata: z.object({
        get: z.function().optional(),
        provide: z.function().optional(),
    }).optional(),
}).passthrough(); // Allow additional properties that might exist

// TypeScript types inferred from Zod schemas
export type InjectedAccount = z.infer<typeof InjectedAccountSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export type InjectedExtension = z.infer<typeof InjectedExtensionSchema>;

// Enhanced wallet state interface
export interface WalletState {
    // Core state
    readonly status: ConnectionStatus;
    readonly activeAccount: InjectedAccount | null;
    readonly accounts: readonly InjectedAccount[];
    readonly wallets: readonly Wallet[];
    readonly extension: InjectedExtension | null;
    readonly error: string | null;
    readonly connectedWalletId: string | null;

    // Actions
    connect: (walletId?: string) => Promise<void>;
    disconnect: () => void;
    setActiveAccount: (account: InjectedAccount) => void;
    refreshWallets: () => void;

    // Computed getters
    readonly isWalletInstalled: (walletId: string) => boolean;
    readonly isWalletConnected: (walletId: string) => boolean;
    readonly isConnected: boolean;
    readonly isConnecting: boolean;
    readonly hasError: boolean;
}

// Window interface for injected wallets
declare global {
    interface Window {
        injectedWeb3?: Record<string, {
            enable: (appName: string) => Promise<InjectedExtension>;
            version: string;
        }>;
    }
}