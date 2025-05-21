"use client";

import type React from "react";
import { useEffect, useCallback } from "react";
import { useWallet } from "./WalletProvider";
import { useSignerStore } from "@/store/useSignerStore";
import type { Signer } from "@/lib/types/transaction";
import toast from "react-hot-toast";

export const PolkadotSigner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeAccount, connectionState } = useWallet();
  const { setSelectedSigner, manageSigner } = useSignerStore();

  // Create wallet signer with proper type handling and optimized logic
  const createWalletSigner = useCallback((): Signer | null => {
    if (!activeAccount || connectionState.status !== "connected") {
      return null;
    }

    const { extension } = connectionState;
    
    return {
      address: activeAccount.address,
      name: activeAccount.name || "Polkadot Wallet",
      type: "polkadot-js",
      sign: async (data: Uint8Array) => {
        try {
          if (!extension.signer || !extension.signer.signRaw) {
            throw new Error("Signer interface not available");
          }
          
          const signature = await extension.signer.signRaw({
            address: activeAccount.address,
            data: Array.from(data),
            type: 'bytes'
          });
          
          if (!signature || !signature.signature) {
            throw new Error("No signature returned");
          }
          
          // Return the signature as Uint8Array
          return new Uint8Array(
            typeof signature.signature === 'string' 
              ? Buffer.from(signature.signature.replace('0x', ''), 'hex')
              : signature.signature
          );
        } catch (error) {
          console.error("Signing error:", error);
          toast.error(`Signing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          throw error;
        }
      },
    };
  }, [activeAccount, connectionState]);

  // Manage signer updates when wallet or account changes
  useEffect(() => {
    // Clean up when wallet disconnects
    if (connectionState.status !== "connected" || !activeAccount) {
      // Remove wallet signer if it exists
      const existingSigner = useSignerStore.getState().availableSigners
        .find(s => s.type === "polkadot-js");
        
      if (existingSigner) {
        manageSigner(existingSigner, 'remove');
      }
      
      // Clear selected signer if it's a wallet signer
      const currentSigner = useSignerStore.getState().selectedSigner;
      if (currentSigner?.type === "polkadot-js") {
        setSelectedSigner(null);
      }
      
      return;
    }
    
    // Add wallet signer
    const walletSigner = createWalletSigner();
    if (walletSigner) {
      manageSigner(walletSigner, 'add');
      setSelectedSigner(walletSigner);
    }
  }, [activeAccount, connectionState, createWalletSigner, manageSigner, setSelectedSigner]);

  return <>{children}</>;
};