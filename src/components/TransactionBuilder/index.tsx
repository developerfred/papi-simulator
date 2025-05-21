"use client";

import type React from "react";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { useChainStore } from "@/store/useChainStore";
import TransactionForm from "./TransactionForm";
import TransactionStatus from "./TransactionStatus";
import SignerSelector from "./SignerSelector";
import TransactionHistory from "./TransactionHistory";
import { useIdGenerator } from "@/hooks/useIdGenerator";
import NetworkStatus from "@/components/ui/NetworkStatus";

export interface TransactionBuilderProps {
    className?: string;
}

const TransactionBuilder: React.FC<TransactionBuilderProps> = ({ className = "" }) => {
    const { connectionStatus } = useChainStore();
    const isConnected = connectionStatus.state === "connected";
    const [activeTab, setActiveTab] = useState<"build" | "history">("build");
    const { id: transactionId, regenerate } = useIdGenerator();

    // Tabs component to reduce duplication
    const Tabs = () => (
        <div className="flex space-x-2">
            {["build", "history"].map((tab) => (
                <button
                    key={tab}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === tab ? "bg-network-primary text-white" : "bg-surface-variant"
                        }`}
                    onClick={() => setActiveTab(tab as "build" | "history")}
                >
                    {tab === "build" ? "Build Transaction" : "History"}
                </button>
            ))}
        </div>
    );

    // Header component with title and tabs
    const Header = () => (
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium">Transaction Builder</h2>
                <NetworkStatus size="sm" />
            </div>
            <Tabs />
        </div>
    );

    // Not connected state (reused pattern)
    if (!isConnected) {
        return (
            <Card header={<Header />} className={className}>
                <NetworkStatus.Disconnected
                    message="Please connect to a blockchain network to use the transaction builder."
                />
            </Card>
        );
    }

    return (
        <Card header={<Header />} className={className}>
            {activeTab === "build" ? (
                <div className="space-y-4">
                    <SignerSelector />
                    <TransactionForm transactionId={transactionId} />
                    <TransactionStatus transactionId={transactionId} onComplete={regenerate} />
                </div>
            ) : (
                <TransactionHistory />
            )}
        </Card>
    );
};

export default TransactionBuilder;