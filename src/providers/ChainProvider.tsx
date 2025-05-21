"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";
import { useChainStore } from "@/store/useChainStore";
import type { Network } from "@/lib/types/network";
import type { ApiPromise } from "@polkadot/api";

interface ChainContextType {
    api: ApiPromise | null;
    network: Network | null;
    status: "disconnected" | "connecting" | "connected" | "error";
    error: string | null;
    connect: (network: Network) => Promise<void>;
    disconnect: () => void;
    switchNetwork: (network: Network) => Promise<void>;
}

const ChainContext = createContext<ChainContextType>({} as ChainContextType);

export const ChainProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        typedApi: api,
        network,
        connectionStatus,
        error,
        connect,
        disconnect,
        switchNetwork
    } = useChainStore();

    const value = {
        api,
        network,
        status: connectionStatus.state,
        error: connectionStatus.error || error,
        connect,
        disconnect,
        switchNetwork
    };

    return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
};

export const useChain = () => {
    const context = useContext(ChainContext);
    if (!context) {
        throw new Error("useChain must be used within a ChainProvider");
    }
    return context;
};