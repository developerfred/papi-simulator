import React from 'react';
import { Network } from '@/lib/types/network';
import { NETWORKS, TEST_NETWORKS } from '@/lib/constants/networks';

interface NetworkSelectorProps {
    selectedNetwork: Network;
    onNetworkChange: (network: Network) => void;
    showTestnetsOnly?: boolean;
}

/**
 * Component for selecting a network to interact with
 */
const NetworkSelector: React.FC<NetworkSelectorProps> = ({
    selectedNetwork,
    onNetworkChange,
    showTestnetsOnly = true,
}) => {
    // Determine which networks to show
    const networksToShow = showTestnetsOnly ? TEST_NETWORKS : Object.values(NETWORKS);

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Select Network</h3>
            </div>
            <div className="p-4 space-y-3">
                {networksToShow.map((network) => (
                    <div
                        key={network.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${selectedNetwork.id === network.id
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                        onClick={() => onNetworkChange(network)}
                    >
                        <div className="flex-1">
                            <div className="flex items-center">
                                <span className="font-medium text-gray-800">{network.name}</span>
                                {network.isTest && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                        Testnet
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Token: {network.tokenSymbol} ({network.tokenDecimals} decimals)
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 text-xs">
                            <a
                                href={network.explorer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Explorer
                            </a>
                            {network.isTest && (
                                <a
                                    href={network.faucet}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Get Tokens
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NetworkSelector;