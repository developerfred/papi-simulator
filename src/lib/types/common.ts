import type { PolkadotClient } from "polkadot-api";

/**
 * Common types for Polkadot API hooks
 */

/**
 * Supported networks for Polkadot API
 */
export type SupportedNetwork =
    | "westend"
    | "polkadot"
    | "paseo"
    | "rococo"
    | "kusama";

/**
 * Connection status types
 */
export type ConnectionStatus =
    | { state: 'idle' }
    | { state: 'connecting' }
    | { state: 'connected', client: PolkadotClient }
    | { state: 'error', error: Error };

/**
 * Status for data operations
 */
export type QueryStatus = "idle" | "loading" | "success" | "error";

/**
 * Common options for data queries
 */
export interface QueryOptions {
    /** Whether the query should execute */
    enabled?: boolean;
    /** Interval in ms to refetch data */
    refetchInterval?: number;
    /** Whether to refetch when new blocks arrive */
    refetchOnBlock?: boolean;
    /** Time in ms before query is considered timed out */
    timeout?: number;
}

/**
 * Block information structure
 */
export interface BlockInfo {
    /** Block hash */
    hash: string;
    /** Block number */
    number: number;
    /** Parent block hash */
    parent: string;
    /** Timestamp when the block was received */
    timestamp: number;
    /** Optional extrinsics list */
    extrinsics?: string[];
}

/**
 * Event data structure
 */
export interface BlockchainEvent<T = unknown> {
    /** Unique event identifier */
    id: string;
    /** Event type */
    type: string;
    /** Event section (pallet) */
    section: string;
    /** Event method */
    method: string;
    /** Event data payload */
    data: T;
    /** Timestamp when event was received */
    timestamp: number;
    /** Hash of the block containing this event */
    blockHash: string;
    /** Number of the block containing this event */
    blockNumber: number;
}

/**
 * Runtime version information
 */
export interface RuntimeVersion {
    specName?: string;
    implName?: string;
    specVersion?: number;
    implVersion?: number;
    transactionVersion?: number;
    apis?: Array<[string, number]>;
}

/**
 * Balance information
 */
export interface BalanceInfo {
    /** Free balance that can be used */
    free: bigint;
    /** Reserved balance (locked for specific purposes) */
    reserved: bigint;
    /** Frozen balance (cannot be used for fees) */
    frozen: bigint;
    /** Total balance (free + reserved) */
    total: bigint;
}

/**
 * Transaction status types
 */
export type TransactionStatus =
    | "idle"
    | "preparing"
    | "signed"
    | "broadcasting"
    | "inBlock"
    | "finalized"
    | "error";

/**
 * Subscription status
 */
export interface SubscriptionStatus {
    active: boolean;
    error: Error | null;
}