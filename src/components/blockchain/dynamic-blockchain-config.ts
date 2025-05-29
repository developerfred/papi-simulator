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
    relay: z.string().optional(), // Parent relay chain
    category: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    status: z.enum(["live", "testing", "deprecated"]).default("live"),
    features: z.array(z.string()).optional(),
});

export type Network = z.infer<typeof NetworkSchema>;

// Comprehensive network configuration with all active Polkadot and Kusama networks
export const NETWORKS: Network[] = [
    // ==================== RELAY CHAINS ====================
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
    },
];

// Helper functions for network management
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

    
    getAllNetworks(): Network[] {
        return this.networks.filter(n => n.status === "live");
    }

    
    getNetworksByType(type: Network["type"]): Network[] {
        return this.networks.filter(n => n.type === type && n.status === "live");
    }

    
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
            "Polkadot", "Kusama",
            "Polkadot Asset Hub", "Kusama Asset Hub",
            "Acala", "Moonbeam", "Astar",
            "Karura", "Moonriver", "Shiden"
        ];

        return this.networks.filter(n =>
            featured.includes(n.name) && n.status === "live"
        );
    }

    getNetworkByName(name: string): Network | undefined {
        return this.networks.find(n => n.name === name);
    }


    addNetwork(network: Omit<Network, "status"> & { status?: Network["status"] }): void {
        try {
            const validatedNetwork = NetworkSchema.parse({
                ...network,
                status: network.status || "live"
            });

            
            if (!this.networks.find(n => n.name === validatedNetwork.name)) {
                this.networks.push(validatedNetwork);
            }
        } catch (error) {
            console.error("Failed to add network:", error);
            throw new Error("Invalid network configuration");
        }
    }

    
    removeNetwork(name: string): void {
        this.networks = this.networks.filter(n => n.name !== name);
    }

    
    updateNetworkStatus(name: string, status: Network["status"]): void {
        const network = this.networks.find(n => n.name === name);
        if (network) {
            network.status = status;
        }
    }

    
    getNetworkGroups(): Record<string, Network[]> {
        const groups: Record<string, Network[]> = {
            "Relay Chains": this.getNetworksByType("relay"),
            "System Parachains": this.getNetworksByType("system"),
            "Polkadot Parachains": this.getNetworksByRelay("Polkadot").filter(n => n.type === "parachain"),
            "Kusama Parachains": this.getNetworksByRelay("Kusama").filter(n => n.type === "parachain"),
            "Testnets": this.getNetworksByType("testnet"),
        };

        
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
                n.features?.some(f => f.toLowerCase().includes(lowerQuery))
            )
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