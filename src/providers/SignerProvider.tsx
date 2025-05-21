"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useSignerStore } from "@/store/useSignerStore";
import type { Signer } from "@/lib/types/transaction";
import { TEST_ACCOUNTS } from "@/lib/constants/accounts";

interface SignerContextType {
    signers: Signer[];
    selectedSigner: Signer | null;
    isConnected: boolean;
    selectSigner: (signer: Signer | null) => void;
    getSigner: (address: string) => Signer | undefined;
    refreshSigners: () => void;
}

const SignerContext = createContext<SignerContextType>({} as SignerContextType);

export const SignerProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        selectedSigner,
        availableSigners,
        setSelectedSigner,
        refreshAvailableSigners // Nome corrigido
    } = useSignerStore();

    // Carrega contas de teste no mount
    useEffect(() => {
        const testSigners = Object.entries(TEST_ACCOUNTS).map(([name, address]) => ({
            address,
            name,
            type: "test" as const,
            sign: async (data: Uint8Array) => {
                console.log(`Test sign for ${name}`);
                return new Uint8Array(64).fill(0);
            }
        }));

        refreshAvailableSigners([...testSigners]);
    }, [refreshAvailableSigners]);

    const value = useMemo(() => ({
        signers: availableSigners,
        selectedSigner,
        isConnected: !!selectedSigner,
        selectSigner: setSelectedSigner,
        getSigner: (address: string) =>
            availableSigners.find(s => s.address === address),
        refreshSigners: () => refreshAvailableSigners() // Atualização opcional
    }), [availableSigners, selectedSigner, setSelectedSigner, refreshAvailableSigners]);

    return (
        <SignerContext.Provider value={value}>
            {children}
        </SignerContext.Provider>
    );
};

export const useSigner = () => {
    const context = useContext(SignerContext);
    if (!context) {
        throw new Error("useSigner must be used within a SignerProvider");
    }
    return context;
};