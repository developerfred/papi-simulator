"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { useTransactionStore } from "@/store/useTransactionStore";
import { StatusBadge } from "@/components/ui/StatusDisplay";
import { formatDistance } from "date-fns";
import { motion } from "framer-motion";
import { UI_CLASSES } from "@/lib/constants/ui";

const formatAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-4)}`;
const formatTime = (timestamp: number | string | undefined) => {
  if (!timestamp) return "Unknown";
  try {
    return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
  } catch {
    return "Invalid date";
  }
};

const TransactionItem: React.FC<{ tx: any; onClear: (id: string) => void }> = ({ tx, onClear }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className={UI_CLASSES.card}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">{tx.metadata?.title || "Transaction"}</h3>
            <StatusBadge status={tx.status} />
          </div>
          <div className="text-sm text-theme-tertiary mt-1">{formatTime(tx.timestamp)}</div>
        </div>
        <button
          className="text-theme-tertiary hover:text-theme-secondary p-1"
          onClick={() => onClear(tx.id)}
          title="Remove"
        >
          ×
        </button>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        {tx.metadata?.recipient && (
          <div><span className="text-theme-tertiary">To:</span> {formatAddress(tx.metadata.recipient)}</div>
        )}
        {tx.metadata?.amount && (
          <div><span className="text-theme-tertiary">Amount:</span> {tx.metadata.amount}</div>
        )}
        {tx.txHash && (
          <div><span className="text-theme-tertiary">Hash:</span> {formatAddress(tx.txHash)}</div>
        )}
        {tx.error && (
          <div className="text-red-500 bg-red-50 p-2 rounded">{tx.error.message}</div>
        )}
      </div>
    </Card>
  </motion.div>
);

const EmptyState: React.FC = () => (
  <div className="p-8 text-center">
    <div className="text-4xl mb-4">📝</div>
    <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
    <p className="text-theme-secondary">Your transaction history will appear here.</p>
  </div>
);

const TransactionHistory: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { transactions, loadTransactions, clearTransaction } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadTransactions();
      setIsLoading(false);
    };
    load();
  }, [loadTransactions]);

  const handleClear = (txId: string) => {
    if (confirm("Remove this transaction from history?")) {
      clearTransaction(txId);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (transactions.length === 0) return <EmptyState />;

  return (
    <div className={`space-y-4 ${className}`}>
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} tx={tx} onClear={handleClear} />
      ))}
    </div>
  );
};

export default TransactionHistory;

