
import { useWalletStore } from "@/stores/walletStore";
import React, { useEffect } from "react";

export const useWallet = () => {
    const store = useWalletStore();

    
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        useEffect(() => {
        let mounted = true;

        const autoConnect = async () => {
            if (store.connectedWalletId && store.status === "disconnected") {
                if (store.isWalletInstalled(store.connectedWalletId)) {
                    if (mounted) {
                        await store.connect(store.connectedWalletId);
                    }
                }
            }
        };

        const timeoutId = setTimeout(autoConnect, 100);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return store;
};
