/* eslint-disable  @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import type { TransactionPreset } from "../types/transaction.types";


export const XCM_DESTINATIONS = {
    // ==================== RELAY CHAINS ====================
    polkadot: { paraId: 0, name: 'Polkadot Relay', symbol: 'DOT', network: 'polkadot' },
    kusama: { paraId: 0, name: 'Kusama Relay', symbol: 'KSM', network: 'kusama' },
    paseo: { paraId: 0, name: 'Paseo Testnet', symbol: 'PAS', network: 'paseo' },
    westend: { paraId: 0, name: 'Westend Testnet', symbol: 'WND', network: 'westend' },

    // ==================== POLKADOT SYSTEM PARACHAINS ====================
    polkadot_asset_hub: { paraId: 1000, name: 'Polkadot Asset Hub', symbol: 'DOT', network: 'polkadot' },
    polkadot_collectives: { paraId: 1001, name: 'Polkadot Collectives', symbol: 'DOT', network: 'polkadot' },
    polkadot_bridge_hub: { paraId: 1002, name: 'Polkadot Bridge Hub', symbol: 'DOT', network: 'polkadot' },
    polkadot_people: { paraId: 1004, name: 'Polkadot People Chain', symbol: 'DOT', network: 'polkadot' },
    polkadot_coretime: { paraId: 1005, name: 'Polkadot Coretime Chain', symbol: 'DOT', network: 'polkadot' },

    // ==================== KUSAMA SYSTEM PARACHAINS ====================
    kusama_asset_hub: { paraId: 1000, name: 'Kusama Asset Hub', symbol: 'KSM', network: 'kusama' },
    kusama_bridge_hub: { paraId: 1002, name: 'Kusama Bridge Hub', symbol: 'KSM', network: 'kusama' },
    kusama_people: { paraId: 1004, name: 'Kusama People Chain', symbol: 'KSM', network: 'kusama' },
    kusama_coretime: { paraId: 1005, name: 'Kusama Coretime Chain', symbol: 'KSM', network: 'kusama' },
    encointer: { paraId: 1001, name: 'Encointer', symbol: 'KSM', network: 'kusama' },

    // ==================== PASEO SYSTEM PARACHAINS ====================
    paseo_asset_hub: { paraId: 1000, name: 'Paseo Asset Hub', symbol: 'PAS', network: 'paseo' },
    paseo_bridge_hub: { paraId: 1002, name: 'Paseo Bridge Hub', symbol: 'PAS', network: 'paseo' },
    paseo_people: { paraId: 1004, name: 'Paseo People Chain', symbol: 'PAS', network: 'paseo' },
    paseo_coretime: { paraId: 1005, name: 'Paseo Coretime Chain', symbol: 'PAS', network: 'paseo' },

    // ==================== POLKADOT PARACHAINS ====================
    acala: { paraId: 2000, name: 'Acala', symbol: 'ACA', network: 'polkadot' },
    moonbeam: { paraId: 2004, name: 'Moonbeam', symbol: 'GLMR', network: 'polkadot' },
    astar: { paraId: 2006, name: 'Astar', symbol: 'ASTR', network: 'polkadot' },
    parallel: { paraId: 2012, name: 'Parallel', symbol: 'PARA', network: 'polkadot' },
    nodle: { paraId: 2026, name: 'Nodle', symbol: 'NODL', network: 'polkadot' },
    bifrost_polkadot: { paraId: 2030, name: 'Bifrost', symbol: 'BNC', network: 'polkadot' },
    centrifuge: { paraId: 2031, name: 'Centrifuge', symbol: 'CFG', network: 'polkadot' },
    interlay: { paraId: 2032, name: 'Interlay', symbol: 'INTR', network: 'polkadot' },
    hydradx: { paraId: 2034, name: 'HydraDX', symbol: 'HDX', network: 'polkadot' },
    phala: { paraId: 2035, name: 'Phala Network', symbol: 'PHA', network: 'polkadot' },
    unique: { paraId: 2037, name: 'Unique Network', symbol: 'UNQ', network: 'polkadot' },

    // ==================== KUSAMA PARACHAINS ====================
    karura: { paraId: 2000, name: 'Karura', symbol: 'KAR', network: 'kusama' },
    bifrost_kusama: { paraId: 2001, name: 'Bifrost', symbol: 'BNC', network: 'kusama' },
    khala: { paraId: 2004, name: 'Khala Network', symbol: 'PHA', network: 'kusama' },
    shiden: { paraId: 2007, name: 'Shiden', symbol: 'SDN', network: 'kusama' },
    moonriver: { paraId: 2023, name: 'Moonriver', symbol: 'MOVR', network: 'kusama' },
    picasso: { paraId: 2087, name: 'Picasso', symbol: 'PICA', network: 'kusama' },
    altair: { paraId: 2088, name: 'Altair', symbol: 'AIR', network: 'kusama' },
    basilisk: { paraId: 2090, name: 'Basilisk', symbol: 'BSX', network: 'kusama' },
    kintsugi: { paraId: 2092, name: 'Kintsugi', symbol: 'KINT', network: 'kusama' },
    quartz: { paraId: 2095, name: 'Quartz', symbol: 'QTZ', network: 'kusama' },

    // ==================== PASEO PARACHAINS ====================
    ajuna_paseo: { paraId: 2000, name: 'Ajuna (Paseo)', symbol: 'AJUN', network: 'paseo' },
    amplitude_paseo: { paraId: 2124, name: 'Amplitude (Paseo)', symbol: 'AMPE', network: 'paseo' },
    aventus_paseo: { paraId: 2056, name: 'Aventus (Paseo)', symbol: 'AVT', network: 'paseo' },
    bajun_paseo: { paraId: 2119, name: 'Bajun (Paseo)', symbol: 'BAJU', network: 'paseo' },
    bifrost_paseo: { paraId: 2030, name: 'Bifrost (Paseo)', symbol: 'BNC', network: 'paseo' },
    darwinia_koi: { paraId: 2105, name: 'Darwinia Koi', symbol: 'KTON', network: 'paseo' },
    frequency: { paraId: 4000, name: 'Frequency', symbol: 'FRQCY', network: 'paseo' },
    hyperbridge: { paraId: 4374, name: 'Hyperbridge', symbol: 'HYP', network: 'paseo' },
    integritee_paseo: { paraId: 3002, name: 'Integritee', symbol: 'TEER', network: 'paseo' },
    kilt_paseo: { paraId: 2000, name: 'KILT (Paseo)', symbol: 'KILT', network: 'paseo' },
    laos_sigma: { paraId: 3369, name: 'Laos Sigma', symbol: 'LAOS', network: 'paseo' },
    muse: { paraId: 3369, name: 'Muse', symbol: 'MUSE', network: 'paseo' },
    myriad_social: { paraId: 4002, name: 'Myriad Social', symbol: 'MYRIA', network: 'paseo' },
    niskala: { paraId: 3888, name: 'Niskala', symbol: 'NISK', network: 'paseo' },
    nodle_paradis: { paraId: 3888, name: 'Nodle Paradis', symbol: 'NODL', network: 'paseo' },
    pop_network: { paraId: 4001, name: 'POP Network', symbol: 'POP', network: 'paseo' },
    regionx_cocos: { paraId: 4019, name: 'RegionX Cocos', symbol: 'COCOS', network: 'paseo' },
    xcavate: { paraId: 2021, name: 'Xcavate', symbol: 'XCAV', network: 'paseo' },
    zeitgeist_battery: { paraId: 2101, name: 'Zeitgeist Battery Station', symbol: 'ZTG', network: 'paseo' },
} as const;


const NETWORK_PATTERNS = {
    polkadot: ['polkadot', 'dot', 'polkadot relay', 'polkadot-relay'],
    kusama: ['kusama', 'ksm', 'kusama relay', 'kusama-relay'],
    paseo: ['paseo', 'pas', 'paseo testnet', 'paseo-testnet', 'paseo network', 'paseo-network'],
    westend: ['westend', 'wnd', 'westend testnet', 'westend-testnet']
};


export const detectNetworkType = (networkName: string, networkSymbol?: string, relay?: string): string => {
    if (!networkName && !networkSymbol && !relay) return 'unknown';

    const searchTerms = [
        networkName?.toLowerCase(),
        networkSymbol?.toLowerCase(),
        relay?.toLowerCase()
    ].filter(Boolean);

    
    for (const [networkType, patterns] of Object.entries(NETWORK_PATTERNS)) {
        for (const term of searchTerms) {
            if (patterns.some(pattern => term.includes(pattern))) {
                console.log(`🎯 Detected network: ${networkType} from "${term}"`);
                return networkType;
            }
        }
    }
    
    if (networkSymbol === 'PAS' || networkName?.includes('Paseo')) return 'paseo';
    if (networkSymbol === 'DOT' || networkName?.includes('Polkadot')) return 'polkadot';
    if (networkSymbol === 'KSM' || networkName?.includes('Kusama')) return 'kusama';
    if (networkSymbol === 'WND' || networkName?.includes('Westend')) return 'westend';

    console.warn(`⚠️ Unknown network type for: name="${networkName}", symbol="${networkSymbol}", relay="${relay}"`);
    return 'unknown';
};

export const XCM_ASSETS = {
    native: { assetId: 'Native', symbol: 'Native Token', description: 'Native chain token', decimals: 10 },

    polkadot: {
        dot: { assetId: 'Native', symbol: 'DOT', description: 'Polkadot native token', decimals: 10 },
        usdt: { assetId: '1984', symbol: 'USDT', description: 'Tether USD', decimals: 6 },
        usdc: { assetId: '1337', symbol: 'USDC', description: 'USD Coin', decimals: 6 },
        aca: { assetId: '2000', symbol: 'ACA', description: 'Acala token', decimals: 12 },
        glmr: { assetId: '2004', symbol: 'GLMR', description: 'Moonbeam token', decimals: 18 },
        astr: { assetId: '2006', symbol: 'ASTR', description: 'Astar token', decimals: 18 },
        hdx: { assetId: '2034', symbol: 'HDX', description: 'HydraDX token', decimals: 12 },
        pha: { assetId: '2035', symbol: 'PHA', description: 'Phala token', decimals: 12 },
    },

    
    kusama: {
        ksm: { assetId: 'Native', symbol: 'KSM', description: 'Kusama native token', decimals: 12 },
        kar: { assetId: '2000', symbol: 'KAR', description: 'Karura token', decimals: 12 },
        movr: { assetId: '2023', symbol: 'MOVR', description: 'Moonriver token', decimals: 18 },
        sdn: { assetId: '2007', symbol: 'SDN', description: 'Shiden token', decimals: 18 },
        bnc: { assetId: '2001', symbol: 'BNC', description: 'Bifrost token', decimals: 12 },
        bsx: { assetId: '2090', symbol: 'BSX', description: 'Basilisk token', decimals: 12 },
        kint: { assetId: '2092', symbol: 'KINT', description: 'Kintsugi token', decimals: 12 },
    },

    
    paseo: {
        pas: { assetId: 'Native', symbol: 'PAS', description: 'Paseo testnet token', decimals: 10 },
        ajun: { assetId: '2000', symbol: 'AJUN', description: 'Ajuna testnet token', decimals: 12 },
        ampe: { assetId: '2124', symbol: 'AMPE', description: 'Amplitude testnet token', decimals: 12 },
        avt: { assetId: '2056', symbol: 'AVT', description: 'Aventus testnet token', decimals: 18 },
        frqcy: { assetId: '4000', symbol: 'FRQCY', description: 'Frequency testnet token', decimals: 12 },
        teer: { assetId: '3002', symbol: 'TEER', description: 'Integritee testnet token', decimals: 12 },
        laos: { assetId: '3369', symbol: 'LAOS', description: 'Laos testnet token', decimals: 12 },
        pop: { assetId: '4001', symbol: 'POP', description: 'POP Network testnet token', decimals: 12 },
        ztg: { assetId: '2101', symbol: 'ZTG', description: 'Zeitgeist testnet token', decimals: 10 },
    },
} as const;


export const XCM_NETWORK_CONFIG = {
    polkadot: {
        version: 'V4',
        supportedMethods: ['reserveTransferAssets', 'limitedReserveTransferAssets', 'teleportAssets'],
        defaultWeightLimit: 'Unlimited',
        maxMessageSize: 102400,
        fullySupported: true,
        xcmEnabled: true,
    },
    kusama: {
        version: 'V4',
        supportedMethods: ['reserveTransferAssets', 'limitedReserveTransferAssets', 'teleportAssets'],
        defaultWeightLimit: 'Unlimited',
        maxMessageSize: 102400,
        fullySupported: true,
        xcmEnabled: true,
    },
    paseo: {
        version: 'V4',
        supportedMethods: ['teleportAssets', 'limitedTeleportAssets'],
        defaultWeightLimit: 'Limited',
        maxMessageSize: 51200,
        isTestnet: true,
        fullySupported: false,
        xcmEnabled: true,
        limitations: [
            'Limited parachain ecosystem',
            'Teleport mainly between system parachains and trusted chains',
            'Reserve transfers may not work reliably between arbitrary parachains',
            'Trust relationships must be explicitly configured',
            'HRMP channels need manual setup between parachains',
            'Testing environment - expect occasional instability'
        ],
        supportedRoutes: [
            'Paseo Relay <-> Paseo Asset Hub (teleport)',
            'Paseo Relay <-> Paseo Bridge Hub (teleport)',
            'Paseo Asset Hub <-> Paseo Bridge Hub (HRMP + trust config)',
            'Limited support for custom parachains with proper trust setup'
        ],
        notes: [
            'XcmPaymentApi and DryRunApi recently added',
            'Follows Polkadot releases for stability',
            'HRMP channels can be established but require configuration',
            'Focus on parachain development rather than XCM ecosystem testing'
        ]
    },
    westend: {
        version: 'V4',
        supportedMethods: ['teleportAssets', 'reserveTransferAssets'],
        defaultWeightLimit: 'Unlimited',
        maxMessageSize: 102400,
        isTestnet: true,
        fullySupported: false,
        xcmEnabled: true,
        limitations: [
            'Testing network - features may be unstable',
            'Limited parachain ecosystem',
            'Mainly for protocol testing'
        ]
    }
} as const;

export const STEP_STATUS_CLASSES = {
    completed: 'bg-green-500 dark:bg-green-600 text-white',
    active: 'bg-blue-500 dark:bg-blue-600 text-white',
    error: 'bg-red-500 dark:bg-red-600 text-white',
    pending: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
} as const;

export const TX_STATUS_CONFIG = {
    finalized: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        label: 'Finalized',
        border: 'border-green-200 dark:border-green-800'
    },
    inBlock: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        label: 'In Block',
        border: 'border-yellow-200 dark:border-yellow-800'
    },
    error: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        label: 'Error',
        border: 'border-red-200 dark:border-red-800'
    },
    broadcasting: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-300',
        label: 'Broadcasting',
        border: 'border-purple-200 dark:border-purple-800'
    },
    ready: {
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-800 dark:text-cyan-300',
        label: 'Ready',
        border: 'border-cyan-200 dark:border-cyan-800'
    },
    default: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        label: 'Processing',
        border: 'border-blue-200 dark:border-blue-800'
    }
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
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'balance_transfer_allow_death',
        name: 'Transfer All Tokens',
        description: 'Send tokens allowing account closure',
        pallet: 'balances',
        call: 'transferAllowDeath',
        args: [
            { name: 'dest', type: 'AccountId', description: 'Destination address', required: true },
            { name: 'value', type: 'Balance', description: 'Amount to transfer', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
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
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'Reserve transfers may not work reliably on Paseo testnet'
        }
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
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend'],
        limitations: {
            paseo: 'Limited to system parachains and specific routes'
        }
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
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'Limited reserve transfer support on Paseo testnet'
        }
    },
    {
        id: 'xcm_limited_teleport',
        name: 'XCM Limited Teleport',
        description: 'Teleport assets with weight/fee limits',
        pallet: 'xcmPallet',
        call: 'limitedTeleportAssets',
        args: [
            { name: 'dest', type: 'XcmDestination', description: 'Destination chain', required: true },
            { name: 'beneficiary', type: 'XcmBeneficiary', description: 'Destination account', required: true },
            { name: 'assets', type: 'XcmAssets', description: 'Assets to teleport', required: true },
            { name: 'feeAssetItem', type: 'u32', description: 'Fee asset index', required: true, defaultValue: '0' },
            { name: 'weightLimit', type: 'XcmWeightLimit', description: 'Weight limit', required: true, defaultValue: 'Unlimited' }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend'],
        limitations: {
            paseo: 'Limited to specific system parachain routes'
        }
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
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'XCMP functionality may be limited or unavailable'
        }
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
        ],
        supportedNetworks: ['polkadot', 'kusama'],
        limitations: {
            paseo: 'HRMP channels may not be fully functional on testnet'
        }
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
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'staking_nominate',
        name: 'Nominate Validators',
        description: 'Nominate validators for staking',
        pallet: 'staking',
        call: 'nominate',
        args: [
            { name: 'targets', type: 'Vec<AccountId>', description: 'List of validators (one per line)', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'staking_unbond',
        name: 'Unbond Tokens',
        description: 'Unbond staked tokens',
        pallet: 'staking',
        call: 'unbond',
        args: [
            { name: 'value', type: 'Balance', description: 'Amount to unbond', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
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
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'democracy_vote',
        name: 'Vote on Referendum',
        description: 'Vote on an active referendum',
        pallet: 'democracy',
        call: 'vote',
        args: [
            { name: 'refIndex', type: 'u32', description: 'Referendum index', required: true },
            { name: 'vote', type: 'AccountVote', description: 'Vote (Aye/Nay with conviction)', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'utility_batch',
        name: 'Batch Transactions',
        description: 'Execute multiple transactions in one batch',
        pallet: 'utility',
        call: 'batch',
        args: [
            { name: 'calls', type: 'Vec<Call>', description: 'List of calls to batch', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'utility_batch_all',
        name: 'Batch All Transactions',
        description: 'Execute multiple transactions atomically',
        pallet: 'utility',
        call: 'batchAll',
        args: [
            { name: 'calls', type: 'Vec<Call>', description: 'List of calls to batch (all must succeed)', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'proxy_add_proxy',
        name: 'Add Proxy',
        description: 'Add a proxy account',
        pallet: 'proxy',
        call: 'addProxy',
        args: [
            { name: 'delegate', type: 'AccountId', description: 'Proxy account address', required: true },
            { name: 'proxyType', type: 'ProxyType', description: 'Type of proxy', required: true },
            { name: 'delay', type: 'BlockNumber', description: 'Delay in blocks', required: true, defaultValue: '0' }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'proxy_remove_proxy',
        name: 'Remove Proxy',
        description: 'Remove a proxy account',
        pallet: 'proxy',
        call: 'removeProxy',
        args: [
            { name: 'delegate', type: 'AccountId', description: 'Proxy account address', required: true },
            { name: 'proxyType', type: 'ProxyType', description: 'Type of proxy', required: true },
            { name: 'delay', type: 'BlockNumber', description: 'Delay in blocks', required: true, defaultValue: '0' }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'identity_set_identity',
        name: 'Set Identity',
        description: 'Set on-chain identity information',
        pallet: 'identity',
        call: 'setIdentity',
        args: [
            { name: 'info', type: 'IdentityInfo', description: 'Identity information', required: true }
        ],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    },
    {
        id: 'custom',
        name: 'Custom Transaction',
        description: 'Build a custom transaction',
        pallet: '',
        call: '',
        args: [],
        supportedNetworks: ['polkadot', 'kusama', 'paseo', 'westend']
    }
];

export const getCompatiblePallets = (api: ApiPromise, palletName: string) => {
  const variants = [
    palletName,
    palletName.toLowerCase(),
    palletName.replace(/([a-z])([A-Z])/g, '$1$2'), 
    palletName.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1) 
  ];

  
  const uniqueVariants = [...new Set(variants)];

  for (const variant of uniqueVariants) {
    if (api.tx[variant]) {
      return variant;
    }
  }
  
  return null;
};


const getActualPallet = (api: ApiPromise, pallet: string) => {
  const palletVariants: Record<string, string[]> = {
    xcmPallet: ['xcmPallet', 'polkadotXcm', 'xTokens', 'xtokens'],
    xcmpQueue: ['xcmpQueue', 'cumulusXcm'],
    hrmp: ['hrmp']
  };

  const variants = palletVariants[pallet] || [pallet];

  for (const variant of variants) {
    const found = api.tx[variant];
    if (found) {
      return found;
    }
  }
   
  return getCompatiblePallets(api, pallet) || null;
};


export const getDestinationsByNetwork = (network: any) => {
    console.log(`🔍 Getting destinations for network:`, {
        name: network?.name,
        symbol: network?.symbol,
        relay: network?.relay
    });

    // Detect network type using enhanced detection
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);

    console.log(`📍 Detected network type: ${networkType}`);

    const destinations = Object.entries(XCM_DESTINATIONS)
        .filter(([_, dest]) => dest.network === networkType)
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

    console.log(`✅ Found ${Object.keys(destinations).length} destinations for ${networkType}:`, Object.keys(destinations));

    return destinations;
};

export const getSystemParachains = (network: any) => {
    const networkDestinations = getDestinationsByNetwork(network);
    return Object.entries(networkDestinations)
        .filter(([key, _]) => key.includes('_asset_hub') || key.includes('_bridge_hub') ||
            key.includes('_people') || key.includes('_coretime') ||
            key.includes('_collectives') || key === 'encointer')
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});
};

export const getParachains = (network: any) => {
    const networkDestinations = getDestinationsByNetwork(network);
    const systemParachains = getSystemParachains(network);
    return Object.entries(networkDestinations)
        .filter(([key, dest]) => dest.paraId > 0 && !systemParachains.hasOwnProperty(key))
        .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});
};

export const getAssetsByNetwork = (network: keyof typeof XCM_ASSETS) => {
    return XCM_ASSETS[network] || {};
};

export const getTransactionPresetsByNetwork = (network: any) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    return TRANSACTION_PRESETS.filter(preset =>
        !preset.supportedNetworks || preset.supportedNetworks.includes(networkType)
    );
};

export const isTestnet = (network: any) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    const config = XCM_NETWORK_CONFIG[networkType as keyof typeof XCM_NETWORK_CONFIG];
    return config?.isTestnet || false;
};

// Helper function to check XCM support for a network
export const getXcmSupport = (network: any) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    const config = XCM_NETWORK_CONFIG[networkType as keyof typeof XCM_NETWORK_CONFIG];

    console.log(`🔧 XCM Support for ${networkType}:`, {
        enabled: config?.xcmEnabled || false,
        fullySupported: config?.fullySupported || false,
        supportedMethods: config?.supportedMethods || [],
        limitations: config?.limitations || []
    });

    return {
        enabled: config?.xcmEnabled || false,
        fullySupported: config?.fullySupported || false,
        supportedMethods: config?.supportedMethods || [],
        limitations: config?.limitations || [],
        supportedRoutes: config?.supportedRoutes || []
    };
};

// Helper function to get available XCM destinations for a network
export const getAvailableXcmDestinations = (network: any) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    const networkDestinations = getDestinationsByNetwork(network);
    const xcmSupport = getXcmSupport(network);

    console.log(`🎯 Getting available XCM destinations for ${networkType}:`, {
        xcmEnabled: xcmSupport.enabled,
        destinationsFound: Object.keys(networkDestinations).length
    });

    if (!xcmSupport.enabled) {
        console.warn(`❌ XCM not enabled for ${networkType}`);
        return {};
    }

    // For Paseo, filter to only supported destinations
    if (networkType === 'paseo') {
        const supportedPaseoDestinations = [
            'paseo',
            'paseo_asset_hub',
            'paseo_bridge_hub',
            'paseo_people',
            'paseo_coretime'
        ];

        const filteredDestinations = Object.entries(networkDestinations)
            .filter(([key, _]) => supportedPaseoDestinations.includes(key))
            .reduce((acc, [key, dest]) => ({ ...acc, [key]: dest }), {});

        console.log(`🔄 Filtered Paseo destinations:`, Object.keys(filteredDestinations));
        return filteredDestinations;
    }

    return networkDestinations;
};

// Helper function to check if XCM transaction is supported between networks
export const isXcmTransactionSupported = (sourceNetwork: any, destNetwork: string, method: string) => {
    const sourceNetworkType = detectNetworkType(sourceNetwork?.name, sourceNetwork?.symbol, sourceNetwork?.relay);
    const sourceConfig = XCM_NETWORK_CONFIG[sourceNetworkType as keyof typeof XCM_NETWORK_CONFIG];

    if (!sourceConfig?.xcmEnabled) {
        return { supported: false, reason: 'XCM not enabled on source network' };
    }

    if (!sourceConfig.supportedMethods.includes(method)) {
        return { supported: false, reason: `Method ${method} not supported on ${sourceNetworkType}` };
    }

    // Special restrictions for Paseo
    if (sourceNetworkType === 'paseo') {
        const supportedRoutes = ['paseo', 'paseo_asset_hub', 'paseo_bridge_hub', 'paseo_people', 'paseo_coretime'];

        if (!supportedRoutes.some(route => destNetwork.includes(route))) {
            return {
                supported: false,
                reason: 'Destination not supported on Paseo testnet. Limited to system parachains.'
            };
        }

        if (method === 'reserveTransferAssets') {
            return {
                supported: false,
                reason: 'Reserve transfers may not work reliably on Paseo testnet. Use teleport instead.'
            };
        }
    }

    return { supported: true, reason: null };
};

// Debug helper function to test network detection
export const debugNetworkDetection = (network: any) => {
    console.group(`🔍 Debug Network Detection`);
    console.log('Input:', { name: network?.name, symbol: network?.symbol, relay: network?.relay });

    const detected = detectNetworkType(network?.name, network?.symbol, network?.relay);
    console.log('Detected Type:', detected);

    const destinations = getDestinationsByNetwork(network);
    console.log('Available Destinations:', Object.keys(destinations));

    const xcmDestinations = getAvailableXcmDestinations(network);
    console.log('XCM Destinations:', Object.keys(xcmDestinations));

    const xcmSupport = getXcmSupport(network);
    console.log('XCM Support:', xcmSupport);

    console.groupEnd();

    return {
        detected,
        destinations: Object.keys(destinations),
        xcmDestinations: Object.keys(xcmDestinations),
        xcmSupport
    };
};

// Additional UI theme configurations for dark mode support
export const UI_THEME_CONFIG = {
    // Card and container styles
    card: {
        background: 'bg-white dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        shadow: 'shadow-sm dark:shadow-gray-900/20',
        hover: 'hover:bg-gray-50 dark:hover:bg-gray-700'
    },

    // Input and form styles
    input: {
        background: 'bg-white dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-600',
        text: 'text-gray-900 dark:text-gray-100',
        placeholder: 'placeholder-gray-500 dark:placeholder-gray-400',
        focus: 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
    },

    // Button styles
    button: {
        primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
        danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
    },

    // Text styles
    text: {
        primary: 'text-gray-900 dark:text-gray-100',
        secondary: 'text-gray-600 dark:text-gray-400',
        muted: 'text-gray-500 dark:text-gray-500',
        accent: 'text-blue-600 dark:text-blue-400',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        error: 'text-red-600 dark:text-red-400'
    },

    // Navigation and menu styles
    navigation: {
        background: 'bg-white dark:bg-gray-900',
        border: 'border-gray-200 dark:border-gray-800',
        item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
        activeItem: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
    },

    // Modal and overlay styles
    modal: {
        backdrop: 'bg-black/50 dark:bg-black/70',
        container: 'bg-white dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        shadow: 'shadow-xl dark:shadow-2xl'
    },

    // Table styles
    table: {
        container: 'bg-white dark:bg-gray-800',
        header: 'bg-gray-50 dark:bg-gray-900',
        headerText: 'text-gray-900 dark:text-gray-100',
        row: 'border-gray-200 dark:border-gray-700',
        rowHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        cell: 'text-gray-900 dark:text-gray-100'
    },

    // Alert and notification styles
    alert: {
        info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
        success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
        warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
        error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
    },

    // Badge and tag styles
    badge: {
        default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    },

    // Loading and skeleton styles
    loading: {
        spinner: 'text-blue-600 dark:text-blue-400',
        skeleton: 'bg-gray-200 dark:bg-gray-700 animate-pulse',
        overlay: 'bg-white/80 dark:bg-gray-900/80'
    },

    // Dropdown and select styles
    dropdown: {
        container: 'bg-white dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-600',
        shadow: 'shadow-lg dark:shadow-gray-900/20',
        item: 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
        separator: 'border-gray-200 dark:border-gray-700'
    },

    // Code and monospace styles
    code: {
        background: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-900 dark:text-gray-100',
        border: 'border-gray-300 dark:border-gray-600'
    }
} as const;

// Network status indicator styles
export const NETWORK_STATUS_STYLES = {
    live: {
        indicator: 'bg-green-500 dark:bg-green-400',
        text: 'text-green-700 dark:text-green-300',
        background: 'bg-green-50 dark:bg-green-900/20'
    },
    testing: {
        indicator: 'bg-yellow-500 dark:bg-yellow-400',
        text: 'text-yellow-700 dark:text-yellow-300',
        background: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    deprecated: {
        indicator: 'bg-red-500 dark:bg-red-400',
        text: 'text-red-700 dark:text-red-300',
        background: 'bg-red-50 dark:bg-red-900/20'
    }
} as const;

// RPC health status styles
export const RPC_HEALTH_STYLES = {
    healthy: {
        indicator: 'bg-green-500 dark:bg-green-400',
        text: 'text-green-700 dark:text-green-300',
        icon: 'text-green-600 dark:text-green-400'
    },
    slow: {
        indicator: 'bg-yellow-500 dark:bg-yellow-400',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: 'text-yellow-600 dark:text-yellow-400'
    },
    offline: {
        indicator: 'bg-red-500 dark:bg-red-400',
        text: 'text-red-700 dark:text-red-300',
        icon: 'text-red-600 dark:text-red-400'
    }
} as const;