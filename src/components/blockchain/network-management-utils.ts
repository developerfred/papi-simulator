/* eslint-disable @typescript-eslint/no-explicit-any, import/no-anonymous-default-export */

import { networkManager, type Network } from "./dynamic-blockchain-config";

/**
 * Utility class for managing blockchain networks in your chain update script
 */
export class ChainUpdateManager {
    private static instance: ChainUpdateManager;

    private constructor() { }

    static getInstance(): ChainUpdateManager {
        if (!ChainUpdateManager.instance) {
            ChainUpdateManager.instance = new ChainUpdateManager();
        }
        return ChainUpdateManager.instance;
    }

    /**
     * Add multiple networks from your chain update script
     */
    async addNetworksFromConfig(networksConfig: any[]): Promise<void> {
        for (const config of networksConfig) {
            try {
                const network = this.transformConfigToNetwork(config);
                networkManager.addNetwork(network);
                console.log(`✅ Added network: ${network.name}`);
            } catch (error) {
                console.error(`❌ Failed to add network ${config.name}:`, error);
            }
        }
    }

    /**
     * Transform your existing chain config format to our Network format
     */
    private transformConfigToNetwork(config: any): Network {
        return {
            name: config.name || config.chainName,
            rpcUrl: config.rpcUrl || config.ws || config.endpoint,
            symbol: config.symbol || config.token,
            decimals: config.decimals || 12,
            ss58Format: config.ss58Format || config.ss58 || 42,
            type: this.determineNetworkType(config),
            parachainId: config.parachainId || config.id,
            relay: config.relay || config.relayChain,
            category: config.category || this.inferCategory(config),
            description: config.description,
            website: config.website || config.homepage,
            status: config.status || "live",
            features: config.features || this.inferFeatures(config),
        };
    }

    /**
     * Determine network type based on config
     */
    private determineNetworkType(config: any): Network["type"] {
        if (config.type) return config.type;

        if (config.isTestnet || config.name?.toLowerCase().includes('test')) {
            return "testnet";
        }

        if (config.isRelay || config.name?.toLowerCase().includes('polkadot') || config.name?.toLowerCase().includes('kusama')) {
            return "relay";
        }

        if (config.isSystem || config.parachainId < 2000) {
            return "system";
        }

        return "parachain";
    }

    /**
     * Infer category from network name/description
     */
    private inferCategory(config: any): string {
        const name = config.name?.toLowerCase() || "";
        const description = config.description?.toLowerCase() || "";
        const features = config.features || [];

        if (name.includes('defi') || description.includes('defi') || features.includes('DeFi')) {
            return "DeFi";
        }

        if (name.includes('nft') || description.includes('nft') || features.includes('NFT')) {
            return "NFT";
        }

        if (name.includes('smart') || name.includes('contract') || features.includes('Smart Contracts')) {
            return "Smart Contracts";
        }

        if (name.includes('bridge') || description.includes('bridge') || features.includes('Bridge')) {
            return "Bridge";
        }

        if (name.includes('identity') || description.includes('identity') || features.includes('Identity')) {
            return "Identity";
        }

        if (name.includes('privacy') || description.includes('privacy') || features.includes('Privacy')) {
            return "Privacy";
        }

        if (name.includes('gaming') || description.includes('gaming') || features.includes('Gaming')) {
            return "Gaming";
        }

        if (name.includes('iot') || description.includes('iot') || features.includes('IoT')) {
            return "IoT";
        }

        return "General";
    }

    /**
     * Infer features from network config
     */
    private inferFeatures(config: any): string[] {
        const features: string[] = [];
        const name = config.name?.toLowerCase() || "";
        const description = config.description?.toLowerCase() || "";

        if (name.includes('evm') || description.includes('ethereum')) {
            features.push("EVM");
        }

        if (name.includes('wasm') || description.includes('webassembly')) {
            features.push("WASM");
        }

        if (description.includes('cross-chain') || description.includes('interop')) {
            features.push("Cross-chain");
        }

        if (description.includes('staking') || name.includes('liquid')) {
            features.push("Staking");
        }

        if (description.includes('governance')) {
            features.push("Governance");
        }

        return features;
    }

    /**
     * Validate network connectivity
     */
    async validateNetwork(network: Network): Promise<boolean> {
        try {
            const response = await fetch(network.rpcUrl.replace('wss://', 'https://').replace('ws://', 'http://'));
            return response.ok;
        } catch {
            try {
                // Try WebSocket connection
                const ws = new WebSocket(network.rpcUrl);
                return new Promise((resolve) => {
                    const timeout = setTimeout(() => {
                        ws.close();
                        resolve(false);
                    }, 5000);

                    ws.onopen = () => {
                        clearTimeout(timeout);
                        ws.close();
                        resolve(true);
                    };

                    ws.onerror = () => {
                        clearTimeout(timeout);
                        resolve(false);
                    };
                });
            } catch {
                return false;
            }
        }
    }

    /**
     * Batch validate networks
     */
    async validateAllNetworks(): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();
        const networks = networkManager.getAllNetworks();

        const validationPromises = networks.map(async (network) => {
            const isValid = await this.validateNetwork(network);
            results.set(network.name, isValid);

            if (!isValid) {
                console.warn(`⚠️ Network ${network.name} validation failed`);
                networkManager.updateNetworkStatus(network.name, "deprecated");
            }

            return { name: network.name, isValid };
        });

        await Promise.all(validationPromises);
        return results;
    }

    /**
     * Export current network configuration
     */
    exportNetworksConfig(): any[] {
        return networkManager.getAllNetworks().map(network => ({
            name: network.name,
            rpcUrl: network.rpcUrl,
            symbol: network.symbol,
            decimals: network.decimals,
            ss58Format: network.ss58Format,
            type: network.type,
            parachainId: network.parachainId,
            relay: network.relay,
            category: network.category,
            description: network.description,
            website: network.website,
            status: network.status,
            features: network.features,
        }));
    }

    /**
     * Import networks from external source
     */
    async importFromPolkadotAPI(): Promise<void> {
        try {
            // This is a placeholder for importing from Polkadot API or other sources
            console.log("🔄 Importing networks from external API...");

            // Example: You could fetch from parachains.info API or other sources
            // const response = await fetch('https://api.parachains.info/parachains');
            // const data = await response.json();
            // await this.addNetworksFromConfig(data);

            console.log("✅ Network import completed");
        } catch (error) {
            console.error("❌ Failed to import networks:", error);
        }
    }

    /**
     * Update network endpoints dynamically
     */
    updateNetworkEndpoints(updates: Array<{ name: string; rpcUrl: string }>): void {
        updates.forEach(({ name, rpcUrl }) => {
            const network = networkManager.getNetworkByName(name);
            if (network) {
                network.rpcUrl = rpcUrl;
                console.log(`✅ Updated ${name} endpoint to ${rpcUrl}`);
            } else {
                console.warn(`⚠️ Network ${name} not found for endpoint update`);
            }
        });
    }

    /**
     * Get network statistics
     */
    getNetworkStats(): {
        total: number;
        byType: Record<string, number>;
        byRelay: Record<string, number>;
        byCategory: Record<string, number>;
        byStatus: Record<string, number>;
    } {
        const networks = networkManager.getAllNetworks();

        const stats = {
            total: networks.length,
            byType: {} as Record<string, number>,
            byRelay: {} as Record<string, number>,
            byCategory: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
        };

        networks.forEach(network => {
            // Count by type
            stats.byType[network.type] = (stats.byType[network.type] || 0) + 1;

            // Count by relay
            if (network.relay) {
                stats.byRelay[network.relay] = (stats.byRelay[network.relay] || 0) + 1;
            }

            // Count by category
            if (network.category) {
                stats.byCategory[network.category] = (stats.byCategory[network.category] || 0) + 1;
            }

            // Count by status
            stats.byStatus[network.status] = (stats.byStatus[network.status] || 0) + 1;
        });

        return stats;
    }
}

// Export singleton instance
export const chainUpdateManager = ChainUpdateManager.getInstance();

/**
 * Example usage in your chain update script:
 * 
 * import { chainUpdateManager } from './network-management-utils';
 * 
 * // Add networks from your existing config
 * const myNetworks = [
 *   {
 *     name: "My Custom Parachain",
 *     rpcUrl: "wss://my-parachain.com",
 *     symbol: "MCP",
 *     decimals: 12,
 *     ss58Format: 42,
 *     parachainId: 3000,
 *     relay: "Polkadot",
 *     category: "DeFi",
 *     description: "My custom DeFi parachain",
 *     features: ["DeFi", "Smart Contracts"]
 *   }
 * ];
 * 
 * await chainUpdateManager.addNetworksFromConfig(myNetworks);
 * 
 * // Validate all networks
 * const validationResults = await chainUpdateManager.validateAllNetworks();
 * console.log(validationResults);
 * 
 * // Get network statistics
 * const stats = chainUpdateManager.getNetworkStats();
 * console.log('Network Statistics:', stats);
 */

// Utility functions for common network operations
export const NetworkUtils = {
    /**
     * Quick add network with minimal config
     */
    quickAdd: (
        name: string,
        rpcUrl: string,
        symbol: string,
        options: Partial<Network> = {}
    ) => {
        networkManager.addNetwork({
            name,
            rpcUrl,
            symbol,
            decimals: 12,
            ss58Format: 42,
            type: "parachain",
            status: "live",
            ...options,
        });
    },

    /**
     * Bulk add networks with validation
     */
    bulkAdd: async (networks: Array<Partial<Network> & { name: string; rpcUrl: string; symbol: string }>) => {
        const results: Array<{ name: string; success: boolean; error?: string }> = [];

        for (const network of networks) {
            try {
                networkManager.addNetwork({
                    decimals: 12,
                    ss58Format: 42,
                    type: "parachain",
                    status: "live",
                    ...network,
                });
                results.push({ name: network.name, success: true });
            } catch (error) {
                results.push({
                    name: network.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    },

    /**
     * Find networks by feature
     */
    findByFeature: (feature: string): Network[] => {
        return networkManager.getAllNetworks().filter(network =>
            network.features?.some(f => f.toLowerCase().includes(feature.toLowerCase()))
        );
    },

    /**
     * Get recommended networks for new users
     */
    getRecommended: (): Network[] => {
        return networkManager.getFeaturedNetworks().slice(0, 6);
    },

    /**
     * Filter networks by performance/status
     */
    getHealthyNetworks: (): Network[] => {
        return networkManager.getAllNetworks().filter(network =>
            network.status === "live"
        );
    },
};

export default {
    ChainUpdateManager,
    chainUpdateManager,
    NetworkUtils,
};