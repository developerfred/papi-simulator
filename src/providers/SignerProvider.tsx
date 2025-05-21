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
    addSigner: (signer: Signer) => void;
    removeSigner: (signer: Signer) => void;
    getSigner: (address: string) => Signer | undefined;
}

const SignerContext = createContext<SignerContextType>({} as SignerContextType);

export const SignerProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        selectedSigner,
        availableSigners,
        setSelectedSigner,
        manageSigner
    } = useSignerStore();

    // Initialize test accounts upon mounting
    useEffect(() => {
        // Convert test accounts to signer objects with mock signing capabilities
        const testSigners = Object.entries(TEST_ACCOUNTS).map(([name, address]) => ({
            address,
            name,
            type: "test" as const,
            sign: async (data: Uint8Array) => {
                console.log(`Test signature for ${name}`);
                // Return mock signature (64 bytes of zeros)
                return new Uint8Array(64).fill(0);
            }
        }));

        // Add each test signer to available signers
        testSigners.forEach(signer => {
            manageSigner(signer, 'add');
        });
    }, [manageSigner]);

    // Create memoized context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        signers: availableSigners,
        selectedSigner,
        isConnected: !!selectedSigner,
        selectSigner: setSelectedSigner,
        addSigner: (signer: Signer) => manageSigner(signer, 'add'),
        removeSigner: (signer: Signer) => manageSigner(signer, 'remove'),
        getSigner: (address: string) => availableSigners.find(s => s.address === address),
    }), [availableSigners, selectedSigner, setSelectedSigner, manageSigner]);

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