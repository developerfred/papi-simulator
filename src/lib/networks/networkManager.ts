/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment  */
// @ts-nocheck
import type { Network } from '@/lib/types/network';
import { type ChainMetadata, CHAIN_CONFIG } from './chainConfig';

export class NetworkManager {
    private static instance: NetworkManager;
    private networks: Network[] = [];
    private initialized = false;

    private constructor() { }

    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {

            const availableChains = await this.getAvailableChains();


            this.networks = availableChains
                .filter(chainId => CHAIN_CONFIG[chainId])
                .map(chainId => this.chainMetadataToNetwork(CHAIN_CONFIG[chainId]));


            this.networks.sort((a, b) => {
                const categoryOrder = { relay: 0, system: 1, defi: 2, 'smart-contract': 3, other: 4 };
                const aCat = CHAIN_CONFIG[a.id]?.category || 'other';
                const bCat = CHAIN_CONFIG[b.id]?.category || 'other';

                if (categoryOrder[aCat] !== categoryOrder[bCat]) {
                    return categoryOrder[aCat] - categoryOrder[bCat];
                }

                return a.name.localeCompare(b.name);
            });

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize NetworkManager:', error);

            this.networks = this.getFallbackNetworks();
            this.initialized = true;
        }
    }

    private async getAvailableChains(): Promise<string[]> {
        try {

            const fs = await import('fs/promises');
            const path = await import('path');

            const metadataDir = path.join(process.cwd(), '.papi', 'metadata');
            const files = await fs.readdir(metadataDir);

            return files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
        } catch (error) {
            console.warn('Could not read PAPI metadata, using default chains');
            return Object.keys(CHAIN_CONFIG);
        }
    }

    private getFallbackNetworks(): Network[] {
        const fallbackChains = ['polkadot', 'ksmcc3', 'westend2', 'acala', 'moonbeam'];
        return fallbackChains
            .filter(chainId => CHAIN_CONFIG[chainId])
            .map(chainId => this.chainMetadataToNetwork(CHAIN_CONFIG[chainId]));
    }

    private chainMetadataToNetwork(metadata: ChainMetadata): Network {
        return {
            id: metadata.id,
            name: metadata.displayName,
            tokenSymbol: metadata.tokenSymbol,
            tokenDecimals: metadata.tokenDecimals,
            endpoint: metadata.endpoint,
            explorer: metadata.explorer || '',
            faucet: metadata.faucet || '',
            isTest: metadata.isTest,
            color: this.getNetworkColor(metadata.category),
            rpcHealthy: true 
        };
    }

    private getNetworkColor(category: string): string {
        const colors = {
            relay: '#E6007A',
            system: '#00B4D8',
            defi: '#F77F00',
            'smart-contract': '#7209B7',
            other: '#6C757D'
        };
        return colors[category] || colors.other;
    }

    getNetworks(): Network[] {
        return [...this.networks];
    }

    getNetworkById(id: string): Network | undefined {
        return this.networks.find(network => network.id === id);
    }

    getNetworksByCategory(category: string): Network[] {
        return this.networks.filter(network => {
            const metadata = CHAIN_CONFIG[network.id];
            return metadata?.category === category;
        });
    }

    async refreshNetworks(): Promise<void> {
        this.initialized = false;
        await this.initialize();
    }


    async checkNetworkHealth(networkId: string): Promise<boolean> {
        const network = this.getNetworkById(networkId);
        if (!network) return false;

        try {            
            // todo: add RPC heatlh feature            
            return true;
        } catch {
            return false;
        }
    }
}
