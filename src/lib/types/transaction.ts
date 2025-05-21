// Simplified core transaction types
export type TransactionStatus =
    | "idle"
    | "preparing"
    | "signed"
    | "broadcasting"
    | "inBlock"
    | "finalized"
    | "error";

export interface TransactionError {
    message: string;
    code?: number;
}

export interface BlockInfo {
    blockHash: string;
    blockNumber: number;
}

export interface TransactionMetadata {
    title?: string;
    recipient?: string;
    amount?: string;
    remark?: string;
    params?: string;
    [key: string]: any;
}

export interface Transaction {
    id: string;
    status: TransactionStatus;
    timestamp: number | null;
    txHash: string;
    blockInfo: BlockInfo | null;
    error: TransactionError | null;
    metadata: TransactionMetadata;
    archived?: boolean;
}

export interface Signer {
    address: string;
    name?: string;
    type: "polkadot-js" | "walletconnect" | "test" | string;
    sign: (data: Uint8Array) => Promise<Uint8Array>;
}