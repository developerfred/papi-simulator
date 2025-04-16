'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Network } from '@/lib/types/network'
import { useTheme } from '@/lib/theme/ThemeProvider'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import NetworkBadge from '@/components/ui/NetworkBadge'

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
    const { isDarkTheme, setCurrentNetworkId, getColor, getNetworkColor } = useTheme();
    const [mounted, setMounted] = useState(false);

    
    useEffect(() => {
        setMounted(true);
    }, []);

    
    const handleNetworkChange = (networkId: string) => {
        onNetworkChange(networkId);
        setCurrentNetworkId(networkId); 
    };

    const selectedNetwork = useMemo(() =>
        networks.find(n => n.id === selectedNetworkId),
        [networks, selectedNetworkId]
    );

    if (!mounted) {
        return <Card className="space-y-2 h-64"><div className="animate-pulse">Loading networks...</div></Card>;
    }

    return (
        <Card className="space-y-2">
            <h2 className="text-sm font-medium mb-3">Select Network</h2>

            <div className="grid grid-cols-2 gap-2">
                {networks.map((network) => {
                    const isSelected = selectedNetworkId === network.id;

                    const networkColor = getNetworkColor('primary');

                    const buttonStyle = {
                        backgroundColor: isSelected
                            ? `${networkColor}${isDarkTheme ? '20' : '10'}` // Hex opacity
                            : (isDarkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                        borderColor: isSelected
                            ? networkColor
                            : getColor('border'),
                        boxShadow: isSelected
                            ? `0 0 0 1px ${networkColor}`
                            : 'none',
                        transition: 'all 0.2s ease'
                    };

                    return (
                        <button
                            key={network.id}
                            onClick={() => handleNetworkChange(network.id)}
                            className="relative flex flex-col items-center justify-center rounded-md border p-3 hover:brightness-95 active:scale-[0.98]"
                            style={buttonStyle}
                        >
                            {!network.isTest && (
                                <Badge
                                    variant="warning"
                                    className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4"
                                    rounded
                                >
                                    Mainnet
                                </Badge>
                            )}

                            <NetworkBadge
                                network={network}
                                size="sm"
                                showName={false}
                            />

                            <span
                                className="font-medium text-sm mt-2"
                                style={{ color: isSelected ? networkColor : getColor('textPrimary') }}
                            >
                                {network.name}
                            </span>
                            <span
                                className="text-xs opacity-70 mt-0.5"
                                style={{ color: getColor('textSecondary') }}
                            >
                                {network.tokenSymbol}
                            </span>
                        </button>
                    );
                })}
            </div>

            {selectedNetwork && (
                <div className="mt-4 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span style={{ color: getColor('textSecondary') }}>Endpoint:</span>
                        <span className="font-mono truncate max-w-40" title={selectedNetwork.endpoint}>
                            {selectedNetwork.endpoint}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span style={{ color: getColor('textSecondary') }}>Token Decimals:</span>
                        <span>{selectedNetwork.tokenDecimals}</span>
                    </div>
                    <div className="flex justify-between">
                        <span style={{ color: getColor('textSecondary') }}>Resources:</span>
                        <div className="flex space-x-2">
                            <a
                                href={selectedNetwork.explorer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                style={{ color: getNetworkColor('primary') }}
                            >
                                Explorer
                            </a>
                            <a
                                href={selectedNetwork.faucet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                style={{ color: getNetworkColor('primary') }}
                            >
                                Faucet
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}