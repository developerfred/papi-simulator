"use client";

import TransactionBuilder  from "@/components/TransactionBuilder";
import { SignerProvider } from "@/providers/SignerProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import NetworkSelector from "@/components/NetworkSelector";
import { useChain } from "@/hooks/useChain";
import { NETWORKS } from "@/lib/constants/networks";
import { useEffect } from "react";
import { PolkadotProvider } from "@/components/PolkadotProvider";

export default function TransactionBuilderPage() {
    const { network, connect, disconnect, connectionStatus } = useChain();
    const selectedNetworkId = network?.id || NETWORKS[0].id;
    const isConnected = connectionStatus === "connected";

    const handleNetworkChange = async (networkId: string) => {
        const newNetwork = NETWORKS.find(n => n.id === networkId);
        if (newNetwork) {
            await disconnect();
            connect(newNetwork);
        }
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Transaction Builder</h1>
                        <NetworkSelector
                            networks={NETWORKS}
                            selectedNetworkId={selectedNetworkId}
                            onNetworkChange={handleNetworkChange}
                        />
                    </div>

                    <PolkadotProvider>
                        <SignerProvider>
                            {isConnected ? (
                                <TransactionBuilder />
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="mb-4 text-orange-500">
                                        {/* Ícone de aviso */}
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">Not Connected</h3>
                                    <p className="text-theme-secondary">
                                        Connecting to {network?.name}...
                                    </p>
                                </div>
                            )}
                        </SignerProvider>
                    </PolkadotProvider>
                </div>
            </div>
        </ThemeProvider>
    );
}