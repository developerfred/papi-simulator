/* eslint-disable   @typescript-eslint/no-explicit-any */

import type { TransactionArg } from "../types/transaction.types";
import { XCM_DESTINATIONS, XCM_ASSETS } from "../constants/presets";


export const getWeb3FromAddress = async () => {
    if (typeof window !== "undefined") {
        const { web3FromAddress } = await import("@polkadot/extension-dapp");
        return web3FromAddress;
    }
    return null;
};


export const createXcmDestination = (chainKey: string) => {
    const destination = XCM_DESTINATIONS[chainKey as keyof typeof XCM_DESTINATIONS];
    if (!destination) throw new Error(`Unknown destination: ${chainKey}`);

    if (destination.paraId === 0) {
        return { V3: { parents: 1, interior: 'Here' } };
    } else {
        return {
            V3: {
                parents: 1,
                interior: { X1: { Parachain: destination.paraId } }
            }
        };
    }
};

export const createXcmBeneficiary = (address: string) => ({
    V3: {
        parents: 0,
        interior: {
            X1: {
                AccountId32: {
                    network: null,
                    id: address
                }
            }
        }
    }
});

export const createXcmAssets = (assetKey: string, amount: string, decimals: number) => {
    const asset = XCM_ASSETS[assetKey as keyof typeof XCM_ASSETS];
    if (!asset) throw new Error(`Unknown asset: ${assetKey}`);

    const parsedAmount = (parseFloat(amount) * Math.pow(10, decimals)).toString();

    return {
        V3: [
            {
                id: {
                    Concrete: asset.assetId === 'Native'
                        ? { parents: 0, interior: 'Here' }
                        : { parents: 0, interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: asset.assetId }] } }
                },
                fun: { Fungible: parsedAmount }
            }
        ]
    };
};

export const createXcmWeightLimit = (limit: string) => {
    if (limit === 'Unlimited') return 'Unlimited';
    return { Limited: { refTime: limit, proofSize: '65536' } };
};


export const processArgument = (value: any, type: string, decimals: number): any => {
    if (value === undefined || value === '') return value;
    
    if (type === 'Address' && typeof value === 'string') {
        return value.trim().replace(/\s/g, '');
    }

    switch (type) {
        case 'Balance':
            return (parseFloat(value) * Math.pow(10, decimals)).toString();
        case 'Vec<AccountId>':
            return value.split('\n').filter((addr: string) => addr.trim());
        case 'XcmDestination':
            return createXcmDestination(value);
        case 'XcmBeneficiary':
            return createXcmBeneficiary(value);
        case 'XcmAssets':
            const [assetKey, amount] = value.split('|');
            return createXcmAssets(assetKey, amount, decimals);
        case 'XcmWeightLimit':
            return createXcmWeightLimit(value);
        case 'XcmMessage':
            try {
                return JSON.parse(value);
            } catch {
                throw new Error('Invalid XCM message format');
            }
        default:
            return value;
    }
};

// Enhanced argument validation for XCM
export const validateXcmArguments = (args: Record<string, any>, argDefs: TransactionArg[]): void => {
    for (const argDef of argDefs) {
        const value = args[argDef.name];

        if (argDef.required && (value === undefined || value === '')) {
            throw new Error(`Argument ${argDef.name} is required`);
        }

        // XCM-specific validations
        switch (argDef.type) {
            case 'XcmDestination':
                if (value && !XCM_DESTINATIONS[value as keyof typeof XCM_DESTINATIONS]) {
                    throw new Error(`Invalid XCM destination: ${value}`);
                }
                break;
            case 'XcmBeneficiary':
                if (value && value.length < 47) {
                    throw new Error('Beneficiary address must be a valid ss58 address');
                }
                break;
            case 'XcmAssets':
                if (value) {
                    const parts = value.split('|');
                    if (parts.length !== 2) {
                        throw new Error('Invalid asset format. Use: asset_key|amount');
                    }
                    const [assetKey, amount] = parts;
                    if (!XCM_ASSETS[assetKey as keyof typeof XCM_ASSETS]) {
                        throw new Error(`Unknown asset: ${assetKey}`);
                    }
                    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                        throw new Error('Amount must be a positive number');
                    }
                }
                break;
        }
    }
};