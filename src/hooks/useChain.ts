"use client";

import { useContext } from "react";
import { PolkadotContext } from "@/components/PolkadotProvider";

export const useChain = () => {
    const context = useContext(PolkadotContext);
    if (!context) {
        throw new Error("useChain must be used within a PolkadotProvider");
    }
