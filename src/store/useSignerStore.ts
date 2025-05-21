import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Signer } from "@/lib/types/transaction";

interface SignerState {
    selectedSigner: Signer | null;
    availableSigners: Signer[];

    // Consolidated actions
    setSelectedSigner: (signer: Signer | null) => void;
    manageSigner: (signer: Signer, action: 'add' | 'remove') => void;
}

export const useSignerStore = create<SignerState>()(
    persist(
        (set) => ({
            selectedSigner: null,
            availableSigners: [],

            setSelectedSigner: (signer: Signer | null) => {
                set({ selectedSigner: signer });
            },

            // Combined function for adding/removing signers
            manageSigner: (signer: Signer, action: 'add' | 'remove') => {
                if (action === 'add') {
                    set(state => ({
                        availableSigners: [
                            ...state.availableSigners.filter(s => s.address !== signer.address),
                            signer
                        ]
                    }));
                } else {
                    set(state => ({
                        availableSigners: state.availableSigners.filter(s => s.address !== signer.address),
                        selectedSigner: state.selectedSigner?.address === signer.address ? null : state.selectedSigner
                    }));
                }
            },
        }),
        {
            name: 'signer-store',
            partialize: (state) => ({ availableSigners: state.availableSigners }),
        }
    )
);