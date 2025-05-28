// components/XcmNetworkStatus.tsx

import React from "react";
import { Network } from "../types/transaction.types";

interface XcmNetworkStatusProps {
    network: Network;
}

export const XcmNetworkStatus: React.FC<XcmNetworkStatusProps> = React.memo(({ network }) => {
    const getSupportedFeatures = () => {
        const isPolkadot = network.name.toLowerCase().includes('polkadot');
        const isKusama = network.name.toLowerCase().includes('kusama');

        if (isPolkadot || isKusama) {
            return {
                reserveTransfer: true,
                teleport: true,
                hrmp: true,
                xcmp: true,
                supportedParachains: isPolkadot ?
                    ['Acala', 'Moonbeam', 'Astar', 'Parallel', 'Centrifuge', 'Interlay', 'HydraDX'] :
                    ['Karura', 'Moonriver', 'Shiden', 'Khala', 'Kintsugi', 'Basilisk']
            };
        }

        return {
            reserveTransfer: false,
            teleport: false,
            hrmp: false,
            xcmp: false,
            supportedParachains: []
        };
    };

    const features = getSupportedFeatures();

    if (!features.reserveTransfer) {
        return (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    XCM is not available on this network. Connect to Polkadot or Kusama to use XCM features.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Network XCM Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-medium text-green-800">Available Features:</p>
                    <ul className="text-green-700 text-xs mt-1 space-y-1">
                        <li>✓ Reserve Transfer</li>
                        <li>✓ Teleport Assets</li>
                        <li>✓ HRMP Channels</li>
                        <li>✓ XCMP Messages</li>
                    </ul>
                </div>
                <div>
                    <p className="font-medium text-green-800">Compatible Parachains:</p>
                    <div className="text-green-700 text-xs mt-1">
                        {features.supportedParachains.slice(0, 4).map((chain, index) => (
                            <span key={chain}>
                                {chain}{index < 3 && index < features.supportedParachains.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                        {features.supportedParachains.length > 4 && (
                            <span className="text-green-600"> +{features.supportedParachains.length - 4} more</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});