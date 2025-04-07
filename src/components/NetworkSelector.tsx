'use client'

import React from 'react'
import { Network } from '@/lib/types/network'

interface NetworkSelectorProps {
    networks: Network[]
    selectedNetworkId: string
    onNetworkChange: (networkId: string) => void
}

export default function NetworkSelector({
    networks,
    selectedNetworkId,
    onNetworkChange
}: NetworkSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                Select Network
            </label>

            <div className="grid grid-cols-2 gap-2">
                {networks.map((network) => (
                    <button
                        key={network.id}
                        onClick={() => onNetworkChange(network.id)}
                        className={`
              py-2 px-3 text-sm rounded-md flex flex-col items-center justify-center
              border transition-colors
              ${selectedNetworkId === network.id
                                ? 'bg-primary-700 border-primary-600 text-white'
                                : 'border-gray-700 hover:border-primary-600'
                            }
              ${network.isTest ? '' : 'relative overflow-hidden'}
            `}
                    >
                        {!network.isTest && (
                            <div className="absolute top-0 right-0 bg-yellow-600 text-yellow-100 text-xs px-1 py-0.5 rounded-bl">
                                Mainnet
                            </div>
                        )}

                        <span className="font-medium">{network.name}</span>
                        <span className="text-xs opacity-70">{network.tokenSymbol}</span>
                    </button>
                ))}
            </div>

            {/* Network details */}
            {networks.find(n => n.id === selectedNetworkId) && (
                <div className="text-xs rounded border border-gray-700 p-2 space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Endpoint:</span>
                        <span className="font-mono truncate max-w-40" title={networks.find(n => n.id === selectedNetworkId)?.endpoint}>
                            {networks.find(n => n.id === selectedNetworkId)?.endpoint}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Token Decimals:</span>
                        <span>{networks.find(n => n.id === selectedNetworkId)?.tokenDecimals}</span>
                    </div>
                </div>
            )}
        </div>
    )
}