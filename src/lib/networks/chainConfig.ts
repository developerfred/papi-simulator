
export interface ChainMetadata {
    id: string;
    name: string;
    displayName: string;
    tokenSymbol: string;
    tokenDecimals: number;
    endpoint: string;
    explorer?: string;
    faucet?: string;
    isTest: boolean;
    category: 'relay' | 'system' | 'defi' | 'smart-contract' | 'other';
    description?: string;
    logo?: string;
    parentChain?: string; 
}


export const CHAIN_CONFIG: Record<string, ChainMetadata> = {
    polkadot: {
        id: 'polkadot',
        name: 'Polkadot',
        displayName: 'Polkadot',
        tokenSymbol: 'DOT',
        tokenDecimals: 10,
        endpoint: 'wss://rpc.polkadot.io',
        explorer: 'https://polkadot.subscan.io',
        faucet: '',
        isTest: false,
        category: 'relay',
        description: 'Polkadot relay chain'
    },

    ksmcc3: {
        id: 'ksmcc3',
        name: 'Kusama',
        displayName: 'Kusama',
        tokenSymbol: 'KSM',
        tokenDecimals: 12,
        endpoint: 'wss://kusama-rpc.polkadot.io',
        explorer: 'https://kusama.subscan.io',
        faucet: '',
        isTest: false,
        category: 'relay',
        description: 'Kusama canary network'
    },

    westend2: {
        id: 'westend2',
        name: 'Westend',
        displayName: 'Westend Testnet',
        tokenSymbol: 'WND',
        tokenDecimals: 12,
        endpoint: 'wss://westend-rpc.polkadot.io',
        explorer: 'https://westend.subscan.io',
        faucet: 'https://faucet.polkadot.io',
        isTest: true,
        category: 'relay',
        description: 'Westend test network'
    },

    rococo_v2_2: {
        id: 'rococo_v2_2',
        name: 'Rococo',
        displayName: 'Rococo Testnet',
        tokenSymbol: 'ROC',
        tokenDecimals: 12,
        endpoint: 'wss://rococo-rpc.polkadot.io',
        explorer: 'https://rococo.subscan.io',
        faucet: 'https://faucet.polkadot.io',
        isTest: true,
        category: 'relay',
        description: 'Rococo test network'
    },

    paseo: {
        id: 'paseo',
        name: 'Paseo',
        displayName: 'Paseo Testnet',
        tokenSymbol: 'PAS',
        tokenDecimals: 10,
        endpoint: 'wss://paseo-rpc.polkadot.io',
        explorer: 'https://paseo.subscan.io',
        faucet: 'https://faucet.polkadot.io',
        isTest: true,
        category: 'relay',
        description: 'Paseo community test network'
    },

    // System Parachains
    polkadot_asset_hub: {
        id: 'polkadot_asset_hub',
        name: 'Asset Hub',
        displayName: 'Polkadot Asset Hub',
        tokenSymbol: 'DOT',
        tokenDecimals: 10,
        endpoint: 'wss://polkadot-asset-hub-rpc.polkadot.io',
        explorer: 'https://assethub-polkadot.subscan.io',
        faucet: '',
        isTest: false,
        category: 'system',
        description: 'Asset Hub parachain on Polkadot',
        parentChain: 'polkadot'
    },

    ksmcc3_asset_hub: {
        id: 'ksmcc3_asset_hub',
        name: 'Asset Hub',
        displayName: 'Kusama Asset Hub',
        tokenSymbol: 'KSM',
        tokenDecimals: 12,
        endpoint: 'wss://kusama-asset-hub-rpc.polkadot.io',
        explorer: 'https://assethub-kusama.subscan.io',
        faucet: '',
        isTest: false,
        category: 'system',
        description: 'Asset Hub parachain on Kusama',
        parentChain: 'ksmcc3'
    },

    polkadot_bridge_hub: {
        id: 'polkadot_bridge_hub',
        name: 'Bridge Hub',
        displayName: 'Polkadot Bridge Hub',
        tokenSymbol: 'DOT',
        tokenDecimals: 10,
        endpoint: 'wss://polkadot-bridge-hub-rpc.polkadot.io',
        explorer: 'https://bridgehub-polkadot.subscan.io',
        faucet: '',
        isTest: false,
        category: 'system',
        description: 'Bridge Hub parachain on Polkadot',
        parentChain: 'polkadot'
    },

    polkadot_collectives: {
        id: 'polkadot_collectives',
        name: 'Collectives',
        displayName: 'Polkadot Collectives',
        tokenSymbol: 'DOT',
        tokenDecimals: 10,
        endpoint: 'wss://polkadot-collectives-rpc.polkadot.io',
        explorer: 'https://collectives-polkadot.subscan.io',
        faucet: '',
        isTest: false,
        category: 'system',
        description: 'Collectives parachain on Polkadot',
        parentChain: 'polkadot'
    },

    // Major DeFi Parachains
    acala: {
        id: 'acala',
        name: 'Acala',
        displayName: 'Acala Network',
        tokenSymbol: 'ACA',
        tokenDecimals: 12,
        endpoint: 'wss://acala-rpc-0.aca-api.network',
        explorer: 'https://acala.subscan.io',
        faucet: '',
        isTest: false,
        category: 'defi',
        description: 'DeFi hub with native stablecoin',
        parentChain: 'polkadot'
    },

    moonbeam: {
        id: 'moonbeam',
        name: 'Moonbeam',
        displayName: 'Moonbeam Network',
        tokenSymbol: 'GLMR',
        tokenDecimals: 18,
        endpoint: 'wss://wss.api.moonbeam.network',
        explorer: 'https://moonbeam.subscan.io',
        faucet: '',
        isTest: false,
        category: 'smart-contract',
        description: 'Ethereum-compatible smart contract platform',
        parentChain: 'polkadot'
    },

    astar: {
        id: 'astar',
        name: 'Astar',
        displayName: 'Astar Network',
        tokenSymbol: 'ASTR',
        tokenDecimals: 18,
        endpoint: 'wss://rpc.astar.network',
        explorer: 'https://astar.subscan.io',
        faucet: '',
        isTest: false,
        category: 'smart-contract',
        description: 'Multi-chain dApp hub',
        parentChain: 'polkadot'
    },

    hydradx: {
        id: 'hydradx',
        name: 'HydraDX',
        displayName: 'HydraDX',
        tokenSymbol: 'HDX',
        tokenDecimals: 12,
        endpoint: 'wss://rpc.hydradx.io',
        explorer: 'https://hydradx.subscan.io',
        faucet: '',
        isTest: false,
        category: 'defi',
        description: 'Omnipool DEX protocol',
        parentChain: 'polkadot'
    },

    interlay: {
        id: 'interlay',
        name: 'Interlay',
        displayName: 'Interlay',
        tokenSymbol: 'INTR',
        tokenDecimals: 10,
        endpoint: 'wss://api.interlay.io/parachain',
        explorer: 'https://interlay.subscan.io',
        faucet: '',
        isTest: false,
        category: 'defi',
        description: 'Bitcoin bridge to Polkadot',
        parentChain: 'polkadot'
    },

    // Kusama Ecosystem
    moonriver: {
        id: 'moonriver',
        name: 'Moonriver',
        displayName: 'Moonriver Network',
        tokenSymbol: 'MOVR',
        tokenDecimals: 18,
        endpoint: 'wss://wss.api.moonriver.moonbeam.network',
        explorer: 'https://moonriver.subscan.io',
        faucet: '',
        isTest: false,
        category: 'smart-contract',
        description: 'Ethereum-compatible on Kusama',
        parentChain: 'ksmcc3'
    },

    karura: {
        id: 'karura',
        name: 'Karura',
        displayName: 'Karura Network',
        tokenSymbol: 'KAR',
        tokenDecimals: 12,
        endpoint: 'wss://karura.api.onfinality.io/public-ws',
        explorer: 'https://karura.subscan.io',
        faucet: '',
        isTest: false,
        category: 'defi',
        description: 'DeFi hub on Kusama',
        parentChain: 'ksmcc3'
    },

    shiden: {
        id: 'shiden',
        name: 'Shiden',
        displayName: 'Shiden Network',
        tokenSymbol: 'SDN',
        tokenDecimals: 18,
        endpoint: 'wss://shiden.api.onfinality.io/public-ws',
        explorer: 'https://shiden.subscan.io',
        faucet: '',
        isTest: false,
        category: 'smart-contract',
        description: 'Multi-chain dApp hub on Kusama',
        parentChain: 'ksmcc3'
    }
};

