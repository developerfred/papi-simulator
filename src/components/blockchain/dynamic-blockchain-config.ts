/*  eslint-disable import/no-anonymous-default-export*/
"use client";

import { z } from "zod";

const NetworkSchema = z.object({
    name: z.string(),
    rpcUrl: z.string().url(),
    symbol: z.string(),
    decimals: z.number().int().positive(),
    ss58Format: z.number().int().min(0),
    type: z.enum(["relay", "system", "parachain", "testnet"]),
    parachainId: z.number().optional(),
    relay: z.string().optional(), 
    category: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    status: z.enum(["live", "testing", "deprecated"]).default("live"),
    features: z.array(z.string()).optional(),
    alternativeRpcs: z.array(z.object({
        provider: z.string(),
        url: z.string().url(),
        status: z.enum(["active", "inactive", "unstable"]).default("active")
    })).optional(),
});

export type Network = z.infer<typeof NetworkSchema>;


export const NETWORKS: Network[] = [    
    {
        name: "Polkadot",
        rpcUrl: "wss://rpc.polkadot.io",
        symbol: "DOT",
        decimals: 10,
        ss58Format: 0,
        type: "relay",
        description: "Polkadot Relay Chain - The main network for enterprise-grade applications",
        website: "https://polkadot.com",
        status: "live",
        features: ["Cross-chain", "Governance", "Staking"],
    },
    {
        name: "Kusama",
        rpcUrl: "wss://kusama-rpc.polkadot.io",
        symbol: "KSM",
        decimals: 12,
        ss58Format: 2,
        type: "relay",
        description: "Kusama - Polkadot's canary network for experimental features",
        website: "https://kusama.network",
        status: "live",
        features: ["Experimental", "Fast-moving", "Governance"],
    },

    // ==================== POLKADOT SYSTEM PARACHAINS ====================
    {
        name: "Polkadot Asset Hub",
        rpcUrl: "wss://polkadot-asset-hub-rpc.polkadot.io",
        symbol: "DOT",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1000,
        relay: "Polkadot",
        category: "Assets",
        description: "Polkadot's system parachain for asset management and transfers",
        status: "live",
        features: ["Asset Management", "NFTs", "Low Fees"],
    },
    {
        name: "Polkadot Collectives",
        rpcUrl: "wss://polkadot-collectives-rpc.polkadot.io",
        symbol: "DOT",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1001,
        relay: "Polkadot",
        category: "Governance",
        description: "Polkadot's system parachain for on-chain collectives and governance",
        status: "live",
        features: ["Governance", "Collectives", "Fellowship"],
    },
    {
        name: "Polkadot Bridge Hub",
        rpcUrl: "wss://polkadot-bridge-hub-rpc.polkadot.io",
        symbol: "DOT",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1002,
        relay: "Polkadot",
        category: "Bridge",
        description: "Polkadot's system parachain for cross-chain bridging",
        status: "live",
        features: ["Bridging", "Cross-chain", "Ethereum Bridge"],
    },
    {
        name: "Polkadot People Chain",
        rpcUrl: "wss://polkadot-people-rpc.polkadot.io",
        symbol: "DOT",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1004,
        relay: "Polkadot",
        category: "Identity",
        description: "Polkadot's system parachain for identity management",
        status: "live",
        features: ["Identity", "People", "Accounts"],
    },
    {
        name: "Polkadot Coretime Chain",
        rpcUrl: "wss://polkadot-coretime-rpc.polkadot.io",
        symbol: "DOT",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1005,
        relay: "Polkadot",
        category: "Coretime",
        description: "Polkadot's system parachain for agile coretime management",
        status: "live",
        features: ["Coretime", "Marketplace", "Agile"],
    },

    // ==================== KUSAMA SYSTEM PARACHAINS ====================
    {
        name: "Kusama Asset Hub",
        rpcUrl: "wss://kusama-asset-hub-rpc.polkadot.io",
        symbol: "KSM",
        decimals: 12,
        ss58Format: 2,
        type: "system",
        parachainId: 1000,
        relay: "Kusama",
        category: "Assets",
        description: "Kusama's system parachain for asset management and transfers",
        status: "live",
        features: ["Asset Management", "NFTs", "Low Fees"],
    },
    {
        name: "Kusama Bridge Hub",
        rpcUrl: "wss://kusama-bridge-hub-rpc.polkadot.io",
        symbol: "KSM",
        decimals: 12,
        ss58Format: 2,
        type: "system",
        parachainId: 1002,
        relay: "Kusama",
        category: "Bridge",
        description: "Kusama's system parachain for cross-chain bridging",
        status: "live",
        features: ["Bridging", "Cross-chain", "Polkadot Bridge"],
    },
    {
        name: "Kusama People Chain",
        rpcUrl: "wss://kusama-people-rpc.polkadot.io",
        symbol: "KSM",
        decimals: 12,
        ss58Format: 2,
        type: "system",
        parachainId: 1004,
        relay: "Kusama",
        category: "Identity",
        description: "Kusama's system parachain for identity management",
        status: "live",
        features: ["Identity", "People", "Accounts"],
    },
    {
        name: "Kusama Coretime Chain",
        rpcUrl: "wss://kusama-coretime-rpc.polkadot.io",
        symbol: "KSM",
        decimals: 12,
        ss58Format: 2,
        type: "system",
        parachainId: 1005,
        relay: "Kusama",
        category: "Coretime",
        description: "Kusama's system parachain for agile coretime management",
        status: "live",
        features: ["Coretime", "Marketplace", "Agile"],
    },
    {
        name: "Encointer",
        rpcUrl: "wss://kusama.api.encointer.org",
        symbol: "KSM",
        decimals: 12,
        ss58Format: 2,
        type: "system",
        parachainId: 1001,
        relay: "Kusama",
        category: "UBI",
        description: "Kusama's system parachain for universal basic income and self-sovereign identity",
        website: "https://encointer.org",
        status: "live",
        features: ["UBI", "Identity", "Community"],
    },

    // ==================== MAJOR POLKADOT PARACHAINS ====================
    {
        name: "Acala",
        rpcUrl: "wss://acala-rpc.aca-api.network",
        symbol: "ACA",
        decimals: 12,
        ss58Format: 10,
        type: "parachain",
        parachainId: 2000,
        relay: "Polkadot",
        category: "DeFi",
        description: "Polkadot's DeFi hub with native stablecoin and EVM compatibility",
        website: "https://acala.network",
        status: "live",
        features: ["DeFi", "Stablecoin", "EVM", "Liquid Staking"],
    },
    {
        name: "Moonbeam",
        rpcUrl: "wss://wss.api.moonbeam.network",
        symbol: "GLMR",
        decimals: 18,
        ss58Format: 1284,
        type: "parachain",
        parachainId: 2004,
        relay: "Polkadot",
        category: "Smart Contracts",
        description: "Ethereum-compatible smart contract platform on Polkadot",
        website: "https://moonbeam.network",
        status: "live",
        features: ["EVM", "Smart Contracts", "Ethereum Compatible"],
    },
    {
        name: "Astar",
        rpcUrl: "wss://rpc.astar.network",
        symbol: "ASTR",
        decimals: 18,
        ss58Format: 5,
        type: "parachain",
        parachainId: 2006,
        relay: "Polkadot",
        category: "Smart Contracts",
        description: "Multi-chain smart contract platform supporting EVM and WASM",
        website: "https://astar.network",
        status: "live",
        features: ["EVM", "WASM", "Smart Contracts", "Multi-chain"],
    },
    {
        name: "Parallel",
        rpcUrl: "wss://parallel.api.onfinality.io/public-ws",
        symbol: "PARA",
        decimals: 12,
        ss58Format: 172,
        type: "parachain",
        parachainId: 2012,
        relay: "Polkadot",
        category: "DeFi",
        description: "Decentralized lending and borrowing protocol",
        website: "https://parallel.fi",
        status: "live",
        features: ["DeFi", "Lending", "Borrowing", "Liquid Staking"],
    },
    {
        name: "Centrifuge",
        rpcUrl: "wss://fullnode.centrifuge.io",
        symbol: "CFG",
        decimals: 18,
        ss58Format: 36,
        type: "parachain",
        parachainId: 2031,
        relay: "Polkadot",
        category: "Real-World Assets",
        description: "Bridge between DeFi and real-world assets",
        website: "https://centrifuge.io",
        status: "live",
        features: ["RWA", "DeFi", "Asset Tokenization"],
    },
    {
        name: "Interlay",
        rpcUrl: "wss://api.interlay.io/parachain",
        symbol: "INTR",
        decimals: 10,
        ss58Format: 2032,
        type: "parachain",
        parachainId: 2032,
        relay: "Polkadot",
        category: "DeFi",
        description: "Bitcoin bridge and DeFi platform",
        website: "https://interlay.io",
        status: "live",
        features: ["Bitcoin Bridge", "DeFi", "Cross-chain"],
    },
    {
        name: "HydraDX",
        rpcUrl: "wss://rpc.hydradx.cloud",
        symbol: "HDX",
        decimals: 12,
        ss58Format: 63,
        type: "parachain",
        parachainId: 2034,
        relay: "Polkadot",
        category: "DeFi",
        description: "Next-gen AMM protocol with omnipool design",
        website: "https://hydradx.io",
        status: "live",
        features: ["DeFi", "AMM", "Omnipool", "Cross-chain"],
    },
    {
        name: "Phala Network",
        rpcUrl: "wss://api.phala.network/ws",
        symbol: "PHA",
        decimals: 12,
        ss58Format: 30,
        type: "parachain",
        parachainId: 2035,
        relay: "Polkadot",
        category: "Privacy",
        description: "Privacy-preserving cloud computing network",
        website: "https://phala.network",
        status: "live",
        features: ["Privacy", "Cloud Computing", "TEE"],
    },
    {
        name: "Unique Network",
        rpcUrl: "wss://ws.unique.network",
        symbol: "UNQ",
        decimals: 18,
        ss58Format: 7391,
        type: "parachain",
        parachainId: 2037,
        relay: "Polkadot",
        category: "NFT",
        description: "NFT infrastructure platform",
        website: "https://unique.network",
        status: "live",
        features: ["NFT", "Gaming", "Customizable"],
    },
    {
        name: "Nodle",
        rpcUrl: "wss://nodle-parachain.api.onfinality.io/public-ws",
        symbol: "NODL",
        decimals: 11,
        ss58Format: 37,
        type: "parachain",
        parachainId: 2026,
        relay: "Polkadot",
        category: "IoT",
        description: "Decentralized IoT network and connectivity protocol",
        website: "https://nodle.com",
        status: "live",
        features: ["IoT", "Connectivity", "Mobile Network"],
    },

    // ==================== MAJOR KUSAMA PARACHAINS ====================
    {
        name: "Karura",
        rpcUrl: "wss://karura-rpc.aca-api.network",
        symbol: "KAR",
        decimals: 12,
        ss58Format: 8,
        type: "parachain",
        parachainId: 2000,
        relay: "Kusama",
        category: "DeFi",
        description: "Kusama's DeFi hub - Acala's sister network",
        website: "https://acala.network/karura",
        status: "live",
        features: ["DeFi", "Stablecoin", "EVM", "Liquid Staking"],
    },
    {
        name: "Moonriver",
        rpcUrl: "wss://wss.api.moonriver.moonbeam.network",
        symbol: "MOVR",
        decimals: 18,
        ss58Format: 1285,
        type: "parachain",
        parachainId: 2023,
        relay: "Kusama",
        category: "Smart Contracts",
        description: "Ethereum-compatible smart contract platform on Kusama",
        website: "https://moonbeam.network/networks/moonriver/",
        status: "live",
        features: ["EVM", "Smart Contracts", "Ethereum Compatible"],
    },
    {
        name: "Shiden",
        rpcUrl: "wss://rpc.shiden.astar.network",
        symbol: "SDN",
        decimals: 18,
        ss58Format: 5,
        type: "parachain",
        parachainId: 2007,
        relay: "Kusama",
        category: "Smart Contracts",
        description: "Multi-chain dApp hub on Kusama - Astar's sister network",
        website: "https://shiden.astar.network",
        status: "live",
        features: ["EVM", "WASM", "Smart Contracts", "Multi-chain"],
    },
    {
        name: "Khala Network",
        rpcUrl: "wss://khala-api.phala.network/ws",
        symbol: "PHA",
        decimals: 12,
        ss58Format: 30,
        type: "parachain",
        parachainId: 2004,
        relay: "Kusama",
        category: "Privacy",
        description: "Privacy-preserving cloud computing on Kusama",
        website: "https://phala.network",
        status: "live",
        features: ["Privacy", "Cloud Computing", "TEE"],
    },
    {
        name: "Bifrost",
        rpcUrl: "wss://bifrost-rpc.liebi.com/ws",
        symbol: "BNC",
        decimals: 12,
        ss58Format: 6,
        type: "parachain",
        parachainId: 2001,
        relay: "Kusama",
        category: "DeFi",
        description: "Liquid staking protocol for Kusama ecosystem",
        website: "https://bifrost.io",
        status: "live",
        features: ["Liquid Staking", "Cross-chain", "DeFi"],
    },
    {
        name: "Kintsugi",
        rpcUrl: "wss://api-kusama.interlay.io/parachain",
        symbol: "KINT",
        decimals: 12,
        ss58Format: 2092,
        type: "parachain",
        parachainId: 2092,
        relay: "Kusama",
        category: "DeFi",
        description: "Bitcoin bridge and DeFi platform on Kusama",
        website: "https://interlay.io",
        status: "live",
        features: ["Bitcoin Bridge", "DeFi", "Cross-chain"],
    },
    {
        name: "Basilisk",
        rpcUrl: "wss://rpc.basilisk.cloud",
        symbol: "BSX",
        decimals: 12,
        ss58Format: 10041,
        type: "parachain",
        parachainId: 2090,
        relay: "Kusama",
        category: "DeFi",
        description: "Liquidity protocol for Kusama ecosystem",
        website: "https://basilisk.cloud",
        status: "live",
        features: ["DeFi", "AMM", "Liquidity"],
    },
    {
        name: "Altair",
        rpcUrl: "wss://fullnode.altair.centrifuge.io",
        symbol: "AIR",
        decimals: 18,
        ss58Format: 136,
        type: "parachain",
        parachainId: 2088,
        relay: "Kusama",
        category: "Real-World Assets",
        description: "Real-world asset financing on Kusama",
        website: "https://centrifuge.io/altair",
        status: "live",
        features: ["RWA", "DeFi", "Asset Tokenization"],
    },
    {
        name: "Picasso",
        rpcUrl: "wss://rpc.composablenodes.tech",
        symbol: "PICA",
        decimals: 12,
        ss58Format: 49,
        type: "parachain",
        parachainId: 2087,
        relay: "Kusama",
        category: "DeFi",
        description: "Cross-chain DeFi infrastructure",
        website: "https://picasso.composable.finance",
        status: "live",
        features: ["Cross-chain", "DeFi", "Infrastructure"],
    },
    {
        name: "Quartz",
        rpcUrl: "wss://ws-quartz.unique.network",
        symbol: "QTZ",
        decimals: 18,
        ss58Format: 255,
        type: "parachain",
        parachainId: 2095,
        relay: "Kusama",
        category: "NFT",
        description: "NFT infrastructure platform on Kusama",
        website: "https://unique.network/quartz/",
        status: "live",
        features: ["NFT", "Gaming", "Customizable"],
    },

    // ==================== TESTNETS ====================
    {
        name: "Westend",
        rpcUrl: "wss://westend-rpc.polkadot.io",
        symbol: "WND",
        decimals: 12,
        ss58Format: 42,
        type: "testnet",
        description: "Polkadot's test network for protocol development",
        status: "live",
        features: ["Testing", "Protocol Development"],
    },

    // ==================== PASEO TESTNET ECOSYSTEM ====================
    {
        name: "Paseo",
        rpcUrl: "wss://pas-rpc.stakeworld.io",
        symbol: "PAS",
        decimals: 10,
        ss58Format: 0,
        type: "testnet",
        description: "Community-run stable testnet for parachain development",
        status: "live",
        features: ["Community", "Parachain Testing", "Stable"],
        alternativeRpcs: [
            { provider: "IBP2", url: "wss://paseo.dotters.network", status: "active" },
            { provider: "IBP1", url: "wss://rpc.ibp.network/paseo", status: "active" },
            { provider: "Amforc", url: "wss://paseo.rpc.amforc.com", status: "active" },
            { provider: "Dwellir", url: "wss://paseo-rpc.dwellir.com", status: "active" },
        ],
    },

    // Paseo System Parachains
    {
        name: "Paseo Asset Hub",
        rpcUrl: "wss://asset-hub-paseo.dotters.network",
        symbol: "PAS",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1000,
        relay: "Paseo",
        category: "Assets",
        description: "Paseo's system parachain for asset management and transfers",
        status: "live",
        features: ["Asset Management", "NFTs", "Low Fees", "Testing"],
        alternativeRpcs: [
            { provider: "TurboFlakes", url: "wss://sys.turboflakes.io/asset-hub-paseo", status: "active" },
            { provider: "IBP1", url: "wss://sys.ibp.network/asset-hub-paseo", status: "active" },
            { provider: "Dwellir", url: "wss://asset-hub-paseo-rpc.dwellir.com", status: "active" },
            { provider: "StakeWorld", url: "wss://pas-rpc.stakeworld.io/assethub", status: "active" },
        ],
    },
    {
        name: "Paseo Bridge Hub",
        rpcUrl: "wss://bridge-hub-paseo.dotters.network",
        symbol: "PAS",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1002,
        relay: "Paseo",
        category: "Bridge",
        description: "Paseo's system parachain for cross-chain bridging",
        status: "live",
        features: ["Bridging", "Cross-chain", "Testing"],
    },
    {
        name: "Paseo Coretime Chain",
        rpcUrl: "wss://coretime-paseo.dotters.network",
        symbol: "PAS",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1005,
        relay: "Paseo",
        category: "Coretime",
        description: "Paseo's system parachain for agile coretime management",
        status: "live",
        features: ["Coretime", "Marketplace", "Agile", "Testing"],
        alternativeRpcs: [
            { provider: "ParaNodes", url: "wss://paseo-coretime.paranodes.io", status: "active" },
        ],
    },
    {
        name: "Paseo People Chain",
        rpcUrl: "wss://people-paseo.dotters.network",
        symbol: "PAS",
        decimals: 10,
        ss58Format: 0,
        type: "system",
        parachainId: 1004,
        relay: "Paseo",
        category: "Identity",
        description: "Paseo's system parachain for identity management",
        status: "live",
        features: ["Identity", "People", "Accounts", "Testing"],
        alternativeRpcs: [
            { provider: "Amforc", url: "wss://people-paseo.rpc.amforc.com", status: "active" },
        ],
    },

    // Paseo Parachains
    {
        name: "Ajuna (Paseo)",
        rpcUrl: "wss://rpc-paseo.ajuna.network",
        symbol: "AJUN",
        decimals: 12,
        ss58Format: 1328,
        type: "parachain",
        relay: "Paseo",
        category: "Gaming",
        description: "Gaming platform on Paseo testnet",
        website: "https://ajuna.network",
        status: "live",
        features: ["Gaming", "NFT", "Testing"],
    },
    {
        name: "Paseo Amplitude",
        rpcUrl: "wss://rpc-foucoco.pendulumchain.tech",
        symbol: "AMPE",
        decimals: 12,
        ss58Format: 57,
        type: "parachain",
        relay: "Paseo",
        category: "DeFi",
        description: "Forex-focused DeFi platform on Paseo testnet",
        website: "https://pendulumchain.tech",
        status: "live",
        features: ["DeFi", "Forex", "Testing"],
    },
    {
        name: "Paseo Aventus",
        rpcUrl: "wss://public-rpc.testnet.aventus.network",
        symbol: "AVT",
        decimals: 18,
        ss58Format: 65,
        type: "parachain",
        relay: "Paseo",
        category: "Enterprise",
        description: "Enterprise blockchain solutions on Paseo testnet",
        website: "https://aventus.network",
        status: "live",
        features: ["Enterprise", "NFT", "Testing"],
    },
    {
        name: "Bajun (Paseo)",
        rpcUrl: "wss://rpc-paseo.bajun.network",
        symbol: "BAJU",
        decimals: 12,
        ss58Format: 1337,
        type: "parachain",
        relay: "Paseo",
        category: "Gaming",
        description: "Gaming infrastructure on Paseo testnet",
        website: "https://bajun.network",
        status: "deprecated", // Listed as inactive
        features: ["Gaming", "NFT", "Testing"],
    },
    {
        name: "Bifrost (Paseo)",
        rpcUrl: "wss://bifrost-rpc.paseo.liebi.com/ws",
        symbol: "BNC",
        decimals: 12,
        ss58Format: 6,
        type: "parachain",
        relay: "Paseo",
        category: "DeFi",
        description: "Liquid staking protocol on Paseo testnet",
        website: "https://bifrost.io",
        status: "live",
        features: ["Liquid Staking", "Cross-chain", "DeFi", "Testing"],
    },
    {
        name: "Darwinia Koi",
        rpcUrl: "wss://koi-rpc.darwinia.network",
        symbol: "KTON",
        decimals: 9,
        ss58Format: 18,
        type: "parachain",
        relay: "Paseo",
        category: "Bridge",
        description: "Cross-chain bridge infrastructure on Paseo testnet",
        website: "https://darwinia.network",
        status: "live",
        features: ["Bridging", "Cross-chain", "Testing"],
    },
    {
        name: "Frequency",
        rpcUrl: "wss://0.rpc.testnet.amplica.io",
        symbol: "FRQCY",
        decimals: 8,
        ss58Format: 90,
        type: "parachain",
        relay: "Paseo",
        category: "Social",
        description: "Social media infrastructure on Paseo testnet",
        website: "https://frequency.xyz",
        status: "live",
        features: ["Social", "Infrastructure", "Testing"],
    },
    {
        name: "Hyperbridge",
        rpcUrl: "wss://hyperbridge-paseo-rpc.blockops.network",
        symbol: "HYP",
        decimals: 12,
        ss58Format: 2032,
        type: "parachain",
        relay: "Paseo",
        category: "Bridge",
        description: "Cross-chain bridge protocol on Paseo testnet",
        status: "live",
        features: ["Bridging", "Cross-chain", "Testing"],
    },
    {
        name: "Integritee",
        rpcUrl: "wss://paseo.api.integritee.network",
        symbol: "TEER",
        decimals: 12,
        ss58Format: 13,
        type: "parachain",
        relay: "Paseo",
        category: "Privacy",
        description: "Privacy-preserving sidechain on Paseo testnet",
        website: "https://integritee.network",
        status: "live",
        features: ["Privacy", "TEE", "Testing"],
    },
    {
        name: "KILT (Paseo)",
        rpcUrl: "wss://peregrine.kilt.io/parachain-public-ws/",
        symbol: "KILT",
        decimals: 15,
        ss58Format: 38,
        type: "parachain",
        relay: "Paseo",
        category: "Identity",
        description: "Decentralized identity protocol on Paseo testnet",
        website: "https://kilt.io",
        status: "testing", // Listed as pending
        features: ["Identity", "Credentials", "Testing"],
    },
    {
        name: "Laos Sigma",
        rpcUrl: "wss://rpc.laossigma.laosfoundation.io",
        symbol: "LAOS",
        decimals: 18,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "NFT",
        description: "Universal NFT protocol on Paseo testnet",
        website: "https://laos.io",
        status: "live",
        features: ["NFT", "Universal", "Testing"],
    },
    {
        name: "Muse",
        rpcUrl: "wss://paseo-muse-rpc.polkadot.io",
        symbol: "MUSE",
        decimals: 12,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Creative",
        description: "Creative economy platform on Paseo testnet",
        status: "live",
        features: ["Creative", "Economy", "Testing"],
    },
    {
        name: "Myriad Social",
        rpcUrl: "wss://ws-rpc.paseo.myriad.social",
        symbol: "MYRIA",
        decimals: 18,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Social",
        description: "Decentralized social media platform on Paseo testnet",
        website: "https://myriad.social",
        status: "live",
        features: ["Social", "Media", "Testing"],
    },
    {
        name: "Niskala",
        rpcUrl: "wss://mlg2.mandalachain.io",
        symbol: "NISK",
        decimals: 12,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Infrastructure",
        description: "Blockchain infrastructure on Paseo testnet",
        status: "live",
        features: ["Infrastructure", "Testing"],
        alternativeRpcs: [
            { provider: "Baliola 1", url: "wss://mlg1.mandalachain.io", status: "active" },
        ],
    },
    {
        name: "Nodle Paradis",
        rpcUrl: "wss://node-6957502816543653888.lh.onfinality.io/ws?apikey=09b04494-3139-4b57-a5d1-e1c4c18748ce",
        symbol: "NODL",
        decimals: 11,
        ss58Format: 37,
        type: "parachain",
        relay: "Paseo",
        category: "IoT",
        description: "IoT network on Paseo testnet",
        website: "https://nodle.com",
        status: "live",
        features: ["IoT", "Connectivity", "Testing"],
    },
    {
        name: "Paseo EWX",
        rpcUrl: "wss://public-rpc.testnet.energywebx.com/",
        symbol: "EWT",
        decimals: 18,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Energy",
        description: "Energy Web Chain on Paseo testnet",
        website: "https://energyweb.org",
        status: "deprecated", // Listed as offline
        features: ["Energy", "Sustainability", "Testing"],
    },
    {
        name: "POP Network",
        rpcUrl: "wss://rpc1.paseo.popnetwork.xyz",
        symbol: "POP",
        decimals: 10,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Infrastructure",
        description: "Pop network infrastructure on Paseo testnet",
        website: "https://popnetwork.xyz",
        status: "live",
        features: ["Infrastructure", "Development", "Testing"],
        alternativeRpcs: [
            { provider: "R0GUE-RPC2", url: "wss://rpc2.paseo.popnetwork.xyz", status: "active" },
            { provider: "R0GUE-RPC3", url: "wss://rpc3.paseo.popnetwork.xyz", status: "active" },
        ],
    },
    {
        name: "RegionX Cocos",
        rpcUrl: "wss://regionx-paseo.regionx.tech",
        symbol: "COCOS",
        decimals: 12,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Coretime",
        description: "Coretime marketplace on Paseo testnet",
        website: "https://regionx.tech",
        status: "deprecated", // Listed as inactive
        features: ["Coretime", "Marketplace", "Testing"],
    },
    {
        name: "Xcavate",
        rpcUrl: "wss://rpc-paseo.xcavate.io:443",
        symbol: "XCAV",
        decimals: 18,
        ss58Format: 42,
        type: "parachain",
        relay: "Paseo",
        category: "Real Estate",
        description: "Real estate platform on Paseo testnet",
        website: "https://xcavate.io",
        status: "live",
        features: ["Real Estate", "NFT", "Testing"],
    },
    {
        name: "Zeitgeist Battery Station",
        rpcUrl: "wss://bsr.zeitgeist.pm",
        symbol: "ZTG",
        decimals: 10,
        ss58Format: 73,
        type: "parachain",
        relay: "Paseo",
        category: "Prediction Markets",
        description: "Prediction markets platform on Paseo testnet",
        website: "https://zeitgeist.pm",
        status: "live",
        features: ["Prediction Markets", "DeFi", "Testing"],
    },
];


export class NetworkManager {
    private static instance: NetworkManager;
    private networks: Network[] = [...NETWORKS];

    private constructor() { }

    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    // Get all live networks
    getAllNetworks(): Network[] {
        return this.networks.filter(n => n.status === "live");
    }

    // Get networks by type
    getNetworksByType(type: Network["type"]): Network[] {
        return this.networks.filter(n => n.type === type && n.status === "live");
    }

    // Get networks by relay chain
    getNetworksByRelay(relay: string): Network[] {
        return this.networks.filter(n => n.relay === relay && n.status === "live");
    }

    // Get networks by category
    getNetworksByCategory(category: string): Network[] {
        return this.networks.filter(n => n.category === category && n.status === "live");
    }

    // Get featured networks (major ones for default selection)
    getFeaturedNetworks(): Network[] {
        const featured = [
            "Polkadot", "Kusama", "Paseo",
            "Polkadot Asset Hub", "Kusama Asset Hub", "Paseo Asset Hub",
            "Acala", "Moonbeam", "Astar",
            "Karura", "Moonriver", "Shiden"
        ];

        return this.networks.filter(n =>
            featured.includes(n.name) && n.status === "live"
        );
    }

    // Get testnet networks (including Paseo ecosystem)
    getTestnetNetworks(): Network[] {
        return this.networks.filter(n =>
            (n.type === "testnet" || n.relay === "Paseo") && n.status === "live"
        );
    }

    // Get Paseo ecosystem networks
    getPaseoNetworks(): Network[] {
        return this.networks.filter(n =>
            (n.name === "Paseo" || n.relay === "Paseo") && n.status === "live"
        );
    }

    // Get network by name
    getNetworkByName(name: string): Network | undefined {
        return this.networks.find(n => n.name === name);
    }

    // Add new network with validation
    addNetwork(network: Omit<Network, "status"> & { status?: Network["status"] }): void {
        try {
            const validatedNetwork = NetworkSchema.parse({
                ...network,
                status: network.status || "live"
            });

            // Check for duplicates
            if (!this.networks.find(n => n.name === validatedNetwork.name)) {
                this.networks.push(validatedNetwork);
            }
        } catch (error) {
            console.error("Failed to add network:", error);
            throw new Error("Invalid network configuration");
        }
    }

    // Remove network
    removeNetwork(name: string): void {
        this.networks = this.networks.filter(n => n.name !== name);
    }

    // Update network status
    updateNetworkStatus(name: string, status: Network["status"]): void {
        const network = this.networks.find(n => n.name === name);
        if (network) {
            network.status = status;
        }
    }

    // Get alternative RPC for a network
    getAlternativeRpcs(networkName: string): Array<{ provider: string, url: string, status: string }> {
        const network = this.getNetworkByName(networkName);
        return network?.alternativeRpcs || [];
    }

    // Get all RPCs for a network (primary + alternatives)
    getAllRpcsForNetwork(networkName: string): Array<{ provider: string, url: string, status: string, isPrimary: boolean }> {
        const network = this.getNetworkByName(networkName);
        if (!network) return [];

        const rpcs = [
            { provider: "Primary", url: network.rpcUrl, status: "active", isPrimary: true }
        ];

        if (network.alternativeRpcs) {
            rpcs.push(...network.alternativeRpcs.map(rpc => ({ ...rpc, isPrimary: false })));
        }

        return rpcs;
    }

    
    getNetworkGroups(): Record<string, Network[]> {
        const groups: Record<string, Network[]> = {
            "Relay Chains": this.getNetworksByType("relay"),
            "System Parachains": this.getNetworksByType("system"),
            "Polkadot Parachains": this.getNetworksByRelay("Polkadot").filter(n => n.type === "parachain"),
            "Kusama Parachains": this.getNetworksByRelay("Kusama").filter(n => n.type === "parachain"),
            "Paseo Testnet": this.getPaseoNetworks(),
            "Other Testnets": this.getNetworksByType("testnet").filter(n => !n.relay || n.relay !== "Paseo"),
        };
        
        // biome-ignore lint/complexity/noForEach: <explanation>
                Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) {
                delete groups[key];
            }
        });

        return groups;
    }

    // Get category groups
    getCategoryGroups(): Record<string, Network[]> {
        const categories = new Set(
            this.networks
                .filter(n => n.category && n.status === "live")
                .map(n => n.category!)
        );

        const groups: Record<string, Network[]> = {};

        // biome-ignore lint/complexity/noForEach: <explanation>
        categories.forEach(category => {
            groups[category] = this.getNetworksByCategory(category);
        });

        return groups;
    }
    
    searchNetworks(query: string): Network[] {
        const lowerQuery = query.toLowerCase();
        return this.networks.filter(n =>
            n.status === "live" && (
                n.name.toLowerCase().includes(lowerQuery) ||
                n.description?.toLowerCase().includes(lowerQuery) ||
                n.symbol.toLowerCase().includes(lowerQuery) ||
                n.category?.toLowerCase().includes(lowerQuery) ||
                n.relay?.toLowerCase().includes(lowerQuery) ||
                n.features?.some(f => f.toLowerCase().includes(lowerQuery))
            )
        );
    }

    
    getNetworksWithRpcStatus(): Array<Network & { rpcHealth?: 'healthy' | 'slow' | 'offline' }> {        
        return this.getAllNetworks().map(network => ({
            ...network,
            rpcHealth: 'healthy' as const 
        }));
    }

    
    getDevelopmentNetworks(): Network[] {
        const devNetworks = this.networks.filter(n =>
            n.status === "live" && (
                n.type === "testnet" ||
                n.relay === "Paseo" ||
                n.features?.includes("Testing") ||
                ["Westend", "Paseo"].includes(n.name)
            )
        );

        return devNetworks;
    }

    
    getProductionNetworks(): Network[] {
        return this.networks.filter(n =>
            n.status === "live" &&
            n.type !== "testnet" &&
            n.relay !== "Paseo" &&
            !["Westend", "Paseo"].includes(n.name)
        );
    }
}


export const networkManager = NetworkManager.getInstance();


export { NetworkSchema };


export { NETWORKS as BLOCKCHAIN_NETWORKS };


export default {
    NETWORKS,
    NetworkManager,
    networkManager,
    NetworkSchema,
};