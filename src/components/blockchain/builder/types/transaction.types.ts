// types/transaction.types.ts

import { ApiPromise } from "@polkadot/api";

export type TransactionStatus = 'pending' | 'active' | 'completed' | 'error';
export type TxStatus = 'inBlock' | 'finalized' | 'error' | null;

export interface TransactionStep {
    id: string;
    title: string;
    description: string;
    status: TransactionStatus;
}

export interface TransactionArg {
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: any;
}

export interface TransactionPreset {
    id: string;
    name: string;
    description: string;
    pallet: string;
    call: string;
    args: TransactionArg[];
}

export interface Network {
    name: string;
    symbol: string;
    decimals: number;
}

export interface WalletAccount {
    address: string;
    meta?: { name?: string };
}

export interface TransactionBuilderProps {
    api: ApiPromise;
    network: Network;
    senderAccount: WalletAccount;
}

export interface TransactionState {
    selectedPreset: TransactionPreset | null;
    customPallet: string;
    customCall: string;
    args: Record<string, any>;
    builtTx: any;
    estimatedFee: string | null;
    txHash: string | null;
    txStatus: TxStatus;
    isBuilding: boolean;
    isSigning: boolean;
    isSending: boolean;
}

export interface XcmDestination {
    paraId: number;
    name: string;
    symbol: string;
}

export interface XcmAsset {
    assetId: string;
    symbol: string;
}