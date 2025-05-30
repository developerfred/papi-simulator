import type { Wallet } from "@/types/wallet";

export const SUPPORTED_WALLETS: Wallet[] = [
    {
        id: "polkadot-js",
        name: "Polkadot.js",
        website: "https://polkadot.js.org/extension/",
    },
    {
        id: "talisman",
        name: "Talisman",
        website: "https://talisman.xyz/",
    },
    {
        id: "subwallet-js",
        name: "SubWallet",
        website: "https://subwallet.app/",
    },
];