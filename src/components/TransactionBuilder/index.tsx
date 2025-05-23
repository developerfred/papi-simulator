"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import { useChainStore } from "@/store/useChainStore";
import { useIdGenerator } from "@/hooks/useIdGenerator";
import NetworkStatus from "@/components/ui/NetworkStatus";
import TransactionForm from "./TransactionForm";
import TransactionStatus from "./TransactionStatus";
import SignerSelector from "./SignerSelector";
import TransactionHistory from "./TransactionHistory";

const Tabs: React.FC<{ active: string; onChange: (tab: string) => void }> = ({ active, onChange }) => (
  <div className="flex space-x-2">
    {[
      { key: "build", label: "Build Transaction" },
      { key: "history", label: "History" }
    ].map(({ key, label }) => (
      <button
        key={key}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          active === key ? "bg-network-primary text-white" : "bg-surface-variant"
        }`}
        onClick={() => onChange(key)}
      >
        {label}
      </button>
    ))}
  </div>
);

const TransactionBuilder: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { connectionStatus } = useChainStore();
  const [activeTab, setActiveTab] = useState<"build" | "history">("build");
  const { id: transactionId, regenerate } = useIdGenerator();

  const header = (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-medium">Transaction Builder</h2>
        <NetworkStatus size="sm" />
      </div>
      <Tabs active={activeTab} onChange={setActiveTab} />
    </div>
  );

  if (connectionStatus.state !== "connected") {
    return (
      <Card header={header} className={className}>
        <NetworkStatus.Disconnected message="Please connect to a blockchain network." />
      </Card>
    );
  }

  return (
    <Card header={header} className={className}>
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
