/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import type { TransactionArg } from "../types/transaction.types";
import { XCM_DESTINATIONS, detectNetworkType } from "../constants/presets";


interface NetworkAsset {
    assetId: string | number;
    symbol: string;
    decimals: number;
    isNative?: boolean;
}

interface NetworkConfig {
    decimals: number;
    xcmVersion: 'V3' | 'V4';
    assets: Record<string, NetworkAsset>;
    supportedFeatures: {
        teleport: boolean;
        reserveTransfer: boolean;
        hrmp: boolean;
        xcmp: boolean;
    };
}

const ENHANCED_NETWORK_CONFIG: Record<string, NetworkConfig> = {
    polkadot: {
        decimals: 10,
        xcmVersion: 'V4',
        assets: {
            native: { assetId: 'Native', symbol: 'DOT', decimals: 10, isNative: true },
            usdt: { assetId: 1984, symbol: 'USDT', decimals: 6 },
            usdc: { assetId: 1337, symbol: 'USDC', decimals: 6 },
            aca: { assetId: 2000, symbol: 'ACA', decimals: 12 },
            glmr: { assetId: 2004, symbol: 'GLMR', decimals: 18 },
        },
        supportedFeatures: { teleport: true, reserveTransfer: true, hrmp: true, xcmp: true }
    },
    kusama: {
        decimals: 12,
        xcmVersion: 'V4',
        assets: {
            native: { assetId: 'Native', symbol: 'KSM', decimals: 12, isNative: true },
            kar: { assetId: 2000, symbol: 'KAR', decimals: 12 },
            movr: { assetId: 2023, symbol: 'MOVR', decimals: 18 },
        },
        supportedFeatures: { teleport: true, reserveTransfer: true, hrmp: true, xcmp: true }
    },
    paseo: {
        decimals: 10,
        xcmVersion: 'V4',
        assets: {
            native: { assetId: 'Native', symbol: 'PAS', decimals: 10, isNative: true },
            ajun: { assetId: 2000, symbol: 'AJUN', decimals: 12 },
            ampe: { assetId: 2124, symbol: 'AMPE', decimals: 12 },
            pop: { assetId: 4001, symbol: 'POP', decimals: 12 },
        },
        supportedFeatures: { teleport: true, reserveTransfer: false, hrmp: true, xcmp: true }
    },
    westend: {
        decimals: 12,
        xcmVersion: 'V4',
        assets: {
            native: { assetId: 'Native', symbol: 'WND', decimals: 12, isNative: true },
        },
        supportedFeatures: { teleport: true, reserveTransfer: false, hrmp: true, xcmp: true }
    }
};


const detectEnhancedNetwork = (network: any): { type: string; config: NetworkConfig; isParachain: boolean } => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    let baseConfig = ENHANCED_NETWORK_CONFIG[networkType];

    if (!baseConfig) {
        console.warn(`Unknown network: ${networkType}, using polkadot defaults`);
        baseConfig = ENHANCED_NETWORK_CONFIG.polkadot;
    }

    
    const isParachain = network?.genesisHash !== network?.relay?.genesisHash;

    
    if (isParachain) {
        baseConfig = {
            ...baseConfig,
            supportedFeatures: {
                ...baseConfig.supportedFeatures,
                hrmp: false, 
            }
        };
    }

    return { type: networkType, config: baseConfig, isParachain };
};


class ValidationError extends Error {
    constructor(field: string, message: string, suggestion?: string) {
        super(`${field}: ${message}${suggestion ? ` Suggestion: ${suggestion}` : ''}`);
        this.name = 'ValidationError';
    }
}

const validators = {
    required: (value: any, name: string) => {
        if (value === undefined || value === null || value === '') {
            throw new ValidationError(name, 'is required');
        }
    },

    address: (address: string, name: string = 'Address') => {
        const clean = address.trim().replace(/\s/g, '');

        if (clean.length < 47) {
            throw new ValidationError(name, 'must be at least 47 characters (SS58 format)');
        }

        const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]*$/;
        if (!base58Regex.test(clean)) {
            throw new ValidationError(name, 'contains invalid characters for SS58 format');
        }

        return clean;
    },

    number: (value: any, name: string, min = 0, max?: number) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || (max && num > max)) {
            const range = max ? `${min} - ${max}` : `>= ${min}`;
            throw new ValidationError(name, `must be a valid number in range: ${range}`);
        }
        return num;
    },

    integer: (value: any, name: string, bitSize: number) => {
        const maxValue = Math.pow(2, bitSize) - 1;
        const num = parseInt(value);
        if (isNaN(num) || num < 0 || num > maxValue) {
            throw new ValidationError(name, `must be a valid ${bitSize}-bit unsigned integer (0 - ${maxValue.toLocaleString()})`);
        }
        return num;
    }
};

// XCM factory functions with proper version handling
class XcmFactory {
    constructor(private version: 'V3' | 'V4' = 'V4') { }

    createDestination(chainKey: string) {
        const destination = XCM_DESTINATIONS[chainKey as keyof typeof XCM_DESTINATIONS];
        if (!destination) {
            const available = Object.keys(XCM_DESTINATIONS).slice(0, 10).join(', ');
            throw new ValidationError('destination', `Unknown destination: ${chainKey}`, `Available: ${available}...`);
        }

        return {
            [this.version]: {
                parents: destination.paraId === 0 ? 1 : 1,
                interior: destination.paraId === 0
                    ? "Here"
                    : { X1: [{ Parachain: destination.paraId }] }
            }
        };
    }

    async createBeneficiary(address: string) {
        const cleanAddress = validators.address(address);

        try {
            // Dynamic import for better tree-shaking
            const { decodeAddress } = await import('@polkadot/util-crypto');
            const publicKey = decodeAddress(cleanAddress);

            if (publicKey.length !== 32) {
                throw new Error(`Invalid key length: ${publicKey.length}, expected 32`);
            }

            return {
                [this.version]: {
                    parents: 0,
                    interior: {
                        X1: {
                            AccountId32: {
                                network: null,
                                id: publicKey
                            }
                        }
                    }
                }
            };
        } catch (error) {
            throw new ValidationError('beneficiary', `Invalid SS58 address: ${error.message}`);
        }
    }

    createAssets(assetKey: string, amount: string, config: NetworkConfig) {
        const asset = config.assets[assetKey.toLowerCase()];
        if (!asset) {
            const available = Object.keys(config.assets).join(', ');
            throw new ValidationError('asset', `"${assetKey}" not available`, `Available: ${available}`);
        }

        const numAmount = validators.number(amount, 'amount');
        const parsedAmount = Math.floor(numAmount * Math.pow(10, asset.decimals)).toString();

        return {
            [this.version]: [{
                id: {
                    parents: 0,
                    interior: asset.isNative
                        ? "Here"
                        : { X2: [{ PalletInstance: 50 }, { GeneralIndex: asset.assetId }] }
                },
                fun: { Fungible: parsedAmount }
            }]
        };
    }

    createWeightLimit(limit: string) {
        if (limit === 'Unlimited') return 'Unlimited';

        const refTime = limit || '10000000000';
        return {
            Limited: {
                refTime,
                proofSize: '65536'
            }
        };
    }
}

// Argument processor with enhanced type support
class ArgumentProcessor {
    private xcmFactory: XcmFactory;
    private networkInfo: ReturnType<typeof detectEnhancedNetwork>;

    constructor(private network: any) {
        this.networkInfo = detectEnhancedNetwork(network);
        this.xcmFactory = new XcmFactory(this.networkInfo.config.xcmVersion);
    }

    async process(value: any, type: string): Promise<any> {
        if (value === undefined || value === '') return value;

        const { config } = this.networkInfo;

        try {
            return await this.processType(value, type, config);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError(type, error instanceof Error ? error.message : String(error));
        }
    }

    private async processType(value: any, type: string, config: NetworkConfig): Promise<any> {
        const typeHandlers: Record<string, () => any | Promise<any>> = {
            // Address types
            'Address': () => validators.address(value),
            'AccountId': () => validators.address(value),

            // Numeric types
            'Balance': () => {
                const balanceNum = validators.number(value, 'Balance');
                return (balanceNum * Math.pow(10, config.decimals)).toString();
            },
            'u32': () => validators.integer(value, 'u32', 32),
            'u64': () => validators.integer(value, 'u64', 64),
            'u128': () => this.processLargeInteger(value),
            'Compact<u128>': () => this.processLargeInteger(value),

            // Array types
            'Vec<AccountId>': () => this.processAddressArray(value),
            'Vec<u8>': () => this.processBytes(value),

            // XCM types
            'XcmDestination': () => this.xcmFactory.createDestination(value),
            'XcmBeneficiary': () => this.xcmFactory.createBeneficiary(value),
            'XcmAssets': () => this.processXcmAssets(value, config),
            'XcmWeightLimit': () => this.xcmFactory.createWeightLimit(value),
            'XcmMessage': () => this.processXcmMessage(value),

            // Enum types
            'RewardDestination': () => this.processEnum(value, ['Staked', 'Stash', 'Controller']),
            'ProxyType': () => this.processEnum(value, ['Any', 'NonTransfer', 'Governance', 'Staking', 'Identity', 'CancelProxy']),

            // Governance types
            'Proposal': () => this.processHash(value),
            'Hash': () => this.processHash(value),
            'AccountVote': () => this.processAccountVote(value),

            // Other types
            'IdentityInfo': () => typeof value === 'string' ? JSON.parse(value) : value,
            'BlockNumber': () => validators.integer(value, 'BlockNumber', 32),
            'Vec<Call>': () => typeof value === 'string' ? JSON.parse(value) : value,
        };

        const handler = typeHandlers[type];
        if (!handler) {
            console.warn(`Unknown type: ${type}, returning value as-is`);
            return value;
        }

        return await handler();
    }

    private processLargeInteger(value: any) {
        if (!/^\d+$/.test(value)) {
            throw new Error('Value must be a positive integer');
        }
        return value;
    }

    private processAddressArray(value: any) {
        return value.split('\n')
            .map((addr: string) => addr.trim())
            .filter((addr: string) => addr.length > 0)
            .map((addr: string, index: number) => {
                try {
                    return validators.address(addr);
                } catch (error) {
                    throw new Error(`Line ${index + 1}: ${error.message}`);
                }
            });
    }

    private processBytes(value: any) {
        if (value.startsWith('0x')) {
            const hex = value.slice(2);
            if (!/^[0-9a-fA-F]*$/.test(hex)) {
                throw new Error('Invalid hexadecimal format');
            }
            return value;
        }
        const bytes = new TextEncoder().encode(value);
        return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private processXcmAssets(value: any, config: NetworkConfig) {
        const [assetKey, amount] = value.split('|');
        if (!assetKey || !amount) {
            throw new Error('Format must be: asset_key|amount (e.g., native|10.5)');
        }
        return this.xcmFactory.createAssets(assetKey.trim(), amount.trim(), config);
    }

    private processXcmMessage(value: any) {
        const parsed = JSON.parse(value);
        if (!parsed.V3 && !parsed.V4) {
            throw new Error('XCM message must have V3 or V4 version');
        }
        return parsed;
    }

    private processEnum(value: any, validValues: string[]) {
        if (!validValues.includes(value)) {
            throw new Error(`Must be one of: ${validValues.join(', ')}`);
        }
        return value;
    }

    private processHash(value: any) {
        if (!value.startsWith('0x') || !/^0x[0-9a-fA-F]{64}$/.test(value)) {
            throw new Error('Must be a valid 32-byte hex hash (0x...)');
        }
        return value;
    }

    private processAccountVote(value: any) {
        if (value.includes('{')) {
            return JSON.parse(value);
        }
        const [vote, conviction] = value.split('|');
        return {
            Standard: {
                vote: vote === 'Aye' ? { aye: true } : { nay: true },
                balance: conviction || '1'
            }
        };
    }
}


export const processArgument = async (value: any, type: string, network?: any): Promise<any> => {
    if (!network) {
        throw new ValidationError('network', 'Network information is required');
    }

    const processor = new ArgumentProcessor(network);
    return processor.process(value, type);
};


export const validateXcmArguments = async (
    args: Record<string, any>,
    argDefs: TransactionArg[],
    network?: any
): Promise<void> => {
    if (!network) {
        throw new ValidationError('network', 'Network information is required for XCM validation');
    }

    const processor = new ArgumentProcessor(network);
    const { config, isParachain } = detectEnhancedNetwork(network);

    for (const argDef of argDefs) {
        const value = args[argDef.name];

        
        if (argDef.required && (value === undefined || value === '')) {
            throw new ValidationError(argDef.name, 'is required');
        }

        if (!value) continue;
        
        if (argDef.type === 'XcmDestination' && isParachain) {
            
            const destination = XCM_DESTINATIONS[value as keyof typeof XCM_DESTINATIONS];
            if (destination && !config.supportedFeatures.teleport && !config.supportedFeatures.reserveTransfer) {
                throw new ValidationError(argDef.name, 'XCM not supported on this network');
            }
        }
        
        await processor.process(value, argDef.type);
    }
};


export const checkNetworkCompatibility = (presetId: string, network?: any) => {
    if (!network) {
        return { compatible: false, warnings: ['Network information required'] };
    }

    const { config, isParachain } = detectEnhancedNetwork(network);
    const warnings: string[] = [];
    let compatible = true;

    if (presetId.startsWith('xcm_')) {
        if (presetId.includes('reserve_transfer') && !config.supportedFeatures.reserveTransfer) {
            warnings.push(`Reserve transfers not supported on ${network.name || 'this network'} - use teleport instead`);
            compatible = false;
        }

        if (presetId.includes('teleport') && !config.supportedFeatures.teleport) {
            warnings.push(`Teleports not supported on ${network.name || 'this network'}`);
            compatible = false;
        }
    }

    if (presetId.startsWith('hrmp_') && (!config.supportedFeatures.hrmp || isParachain)) {
        warnings.push('HRMP management only available on relay chains');
        compatible = false;
    }

    return { compatible, warnings };
};


export const getPresetDefaultValues = (presetId: string, network?: any): Record<string, any> => {
    const { config } = network ? detectEnhancedNetwork(network) : { config: ENHANCED_NETWORK_CONFIG.polkadot };

    const baseDefaults: Record<string, Record<string, any>> = {
        xcm_teleport: {
            feeAssetItem: '0',
            weightLimit: config.xcmVersion === 'V4' ? 'Unlimited' : '10000000000'
        },
        xcm_reserve_transfer: {
            feeAssetItem: '0',
            weightLimit: config.xcmVersion === 'V4' ? 'Unlimited' : '10000000000'
        },
        staking_bond: { payee: 'Staked' },
        democracy_vote: { vote: 'Aye|1' },
        proxy_add_proxy: { delay: '0' },
    };

    return baseDefaults[presetId] || {};
};


export const getArgumentSuggestions = (argType: string, network?: any): string[] => {
    if (!network) return [];

    const { config } = detectEnhancedNetwork(network);

    const suggestionHandlers: Record<string, () => string[]> = {
        'XcmDestination': () => Object.entries(XCM_DESTINATIONS)
            .filter(([_, dest]) => dest.network === detectNetworkType(network?.name, network?.symbol, network?.relay))
            .slice(0, 10)
            .map(([key, dest]) => `${key} (${dest.name})`),

        'XcmAssets': () => Object.entries(config.assets)
            .map(([key, asset]) => `${key}|1.0 (${asset.symbol})`),

        'RewardDestination': () => ['Staked', 'Stash', 'Controller'],
        'XcmWeightLimit': () => ['Unlimited', '5000000000', '10000000000', '20000000000'],
        'ProxyType': () => ['Any', 'NonTransfer', 'Governance', 'Staking', 'Identity'],
        'AccountVote': () => ['Aye|1', 'Nay|1', 'Aye|2', 'Nay|6'],
    };

    const handler = suggestionHandlers[argType];
    return handler ? handler() : [];
};


export const getWeb3FromAddress = async () => {
    if (typeof window !== "undefined") {
        const { web3FromAddress } = await import("@polkadot/extension-dapp");
        return web3FromAddress;
    }
    return null;
};

export { ENHANCED_NETWORK_CONFIG as NETWORK_CONFIG };