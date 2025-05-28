// constants/presets.ts

import { TransactionPreset } from "../types/transaction.types";

// XCM Destination mapping
export const XCM_DESTINATIONS = {
    // Polkadot Parachains
    acala: { paraId: 2000, name: 'Acala', symbol: 'ACA' },
    moonbeam: { paraId: 2004, name: 'Moonbeam', symbol: 'GLMR' },
    astar: { paraId: 2006, name: 'Astar', symbol: 'ASTR' },
    parallel: { paraId: 2012, name: 'Parallel', symbol: 'PARA' },
    composable: { paraId: 2019, name: 'Composable', symbol: 'LAYR' },
    centrifuge: { paraId: 2031, name: 'Centrifuge', symbol: 'CFG' },
    interlay: { paraId: 2032, name: 'Interlay', symbol: 'INTR' },
    hydradx: { paraId: 2034, name: 'HydraDX', symbol: 'HDX' },
    bifrost: { paraId: 2030, name: 'Bifrost', symbol: 'BNC' },
    phala: { paraId: 2035, name: 'Phala', symbol: 'PHA' },
    // Kusama Parachains
    karura: { paraId: 2000, name: 'Karura', symbol: 'KAR' },
    moonriver: { paraId: 2023, name: 'Moonriver', symbol: 'MOVR' },
    shiden: { paraId: 2007, name: 'Shiden', symbol: 'SDN' },
    khala: { paraId: 2004, name: 'Khala', symbol: 'PHA' },
    kintsugi: { paraId: 2092, name: 'Kintsugi', symbol: 'KINT' },
    basilisk: { paraId: 2090, name: 'Basilisk', symbol: 'BSX' },
    // Relay Chains
    polkadot: { paraId: 0, name: 'Polkadot Relay', symbol: 'DOT' },
    kusama: { paraId: 0, name: 'Kusama Relay', symbol: 'KSM' },
} as const;

// Asset mapping for XCM transfers
export const XCM_ASSETS = {
    native: { assetId: 'Native', symbol: 'DOT/KSM' },
    usdt: { assetId: '1984', symbol: 'USDT' },
    usdc: { assetId: '1337', symbol: 'USDC' },
    aca: { assetId: '2000', symbol: 'ACA' },
    glmr: { assetId: '2004', symbol: 'GLMR' },
    astr: { assetId: '2006', symbol: 'ASTR' },
} as const;

export const STEP_STATUS_CLASSES = {
    completed: 'bg-green-500 text-white',
    active: 'bg-blue-500 text-white',
    error: 'bg-red-500 text-white',
    pending: 'bg-gray-200 text-gray-600'
} as const;

export const TX_STATUS_CONFIG = {
    finalized: { bg: 'bg-green-100', text: 'text-green-800', label: 'Finalized' },
    inBlock: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Block' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' },
    default: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' }
} as const;

export const TRANSACTION_PRESETS: TransactionPreset[] = [
    {
        id: 'balance_transfer',
        name: 'Transfer Tokens',
        description: 'Send tokens to another address on the same chain',
        pallet: 'balances',
        call: 'transferKeepAlive',
        args: [
            { name: 'dest', type: 'AccountId', description: 'Destination address', required: true },
            { name: 'value', type: 'Balance', description: 'Amount to transfer', required: true }
        ]
    },
    {
        id: 'xcm_reserve_transfer',
        name: 'XCM Reserve Transfer',
        description: 'Transfer assets via XCM using reserve transfer',
        pallet: 'xcmPallet',
        call: 'reserveTransferAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to transfer', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index (usually 0)', required: true, defaultValue: '0' }
        ]
    },
    {
        id: 'xcm_teleport',
        name: 'XCM Teleport',
        description: 'Teleport assets via XCM (trusted chains only)',
        pallet: 'xcmPallet',
        call: 'teleportAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to teleport', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index (usually 0)', required: true, defaultValue: '0' }
        ]
    },
    {
        id: 'xcm_limited_reserve_transfer',
        name: 'XCM Limited Reserve Transfer',
        description: 'Reserve transfer with weight/fee limits',
        pallet: 'xcmPallet',
        call: 'limitedReserveTransferAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to transfer', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index', required: true, defaultValue: '0' },
            { name: 'weightLimit', type: 'XcmWeightLimit', description: 'Weight limit', required: true, defaultValue: 'Unlimited' }
        ]
    },
    {
        id: 'xcmp_queue_send',
        name: 'XCMP Queue Send',
        description: 'Send XCM message via XCMP queue',
        pallet: 'xcmpQueue',
        call: 'sendXcmMessage',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'message', type: 'XcmMessage', description: 'XCM message', required: true }
        ]
    },
    {
        id: 'hrmp_channel_request',
        name: 'HRMP Channel Request',
        description: 'Request HRMP channel opening',
        pallet: 'hrmp',
        call: 'hrmpInitOpenChannel',
        args: [
            { name: 'recipient', type: 'u32', description: 'Recipient parachain ID', required: true },
            { name: 'proposedMaxCapacity', type: 'u32', description: 'Proposed max capacity', required: true, defaultValue: '1000' },
            { name: 'proposedMaxMessageSize', type: 'u32', description: 'Proposed max message size', required: true, defaultValue: '102400' }
        ]
    },
    {
        id: 'staking_bond',
        name: 'Stake Tokens',
        description: 'Bond tokens for staking',
        pallet: 'staking',
        call: 'bond',
        args: [
            { name: 'value', type: 'Balance', description: 'Amount to bond', required: true },
            { name: 'payee', type: 'RewardDestination', description: 'Reward destination', required: true, defaultValue: 'Staked' }
        ]
    },
    {
        id: 'staking_nominate',
        name: 'Nominate Validators',
        description: 'Nominate validators for staking',
        pallet: 'staking',
        call: 'nominate',
        args: [
            { name: 'targets', type: 'Vec<AccountId>', description: 'List of validators (one per line)', required: true }
        ]
    },
    {
        id: 'democracy_propose',
        name: 'Propose Referendum',
        description: 'Create a new governance proposal',
        pallet: 'democracy',
        call: 'propose',
        args: [
            { name: 'proposal', type: 'Proposal', description: 'Proposal hash', required: true },
            { name: 'value', type: 'Balance', description: 'Deposit value', required: true }
        ]
    },
    {
        id: 'custom',
        name: 'Custom Transaction',
        description: 'Build a custom transaction',
        pallet: '',
        call: '',
        args: []
    }
];