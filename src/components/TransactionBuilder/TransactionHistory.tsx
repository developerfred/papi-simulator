"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { useTransactionStore } from "@/store/useTransactionStore";
import { formatDistance } from "date-fns";
import { motion } from "framer-motion";
import { Transaction } from "@/lib/types/transaction";

interface TransactionHistoryProps {
    className?: string;
}

// Status badge component - reusable
const StatusBadge = ({ status }: { status: string }) => {
    const statusColors = {
        idle: "bg-gray-100 text-gray-600",
        preparing: "bg-indigo-100 text-indigo-600",
        signed: "bg-purple-100 text-purple-600",
        broadcasting: "bg-blue-100 text-blue-600",
        inBlock: "bg-sky-100 text-sky-600",
        finalized: "bg-green-100 text-green-600",
        error: "bg-red-100 text-red-600",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors.idle}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Transaction item component - extract to reduce complexity
const TransactionItem = ({ tx, onClear }: { tx: Transaction, onClear: (id: string) => void }) => {
    const formatTime = (timestamp: number | string | undefined) => {
        if (!timestamp) return "Unknown";
        try {
            return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
        } catch {
            return "Invalid date";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{tx.metadata?.title || "Transaction"}</h3>
                            <StatusBadge status={tx.status} />
                        </div>
                        <div className="text-sm text-theme-tertiary mt-1">
                            {formatTime(tx.timestamp)}
                        </div>
                    </div>
                    <button
                        className="text-theme-tertiary hover:text-theme-secondary p-1"
                        onClick={() => onClear(tx.id)}
                        title="Remove from history"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Transaction details */}
                <div className="mt-3 space-y-1">
                    {tx.metadata?.recipient && (
                        <div className="text-sm">
                            <span className="text-theme-tertiary">Recipient:</span>
                            <span className="font-mono ml-1">{tx.metadata.recipient.slice(0, 10)}...{tx.metadata.recipient.slice(-4)}</span>
                        </div>
                    )}

                    {tx.metadata?.amount && (
                        <div className="text-sm">
                            <span className="text-theme-tertiary">Amount:</span>
                            <span className="ml-1">{tx.metadata.amount}</span>
                        </div>
                    )}

                    {tx.txHash && (
                        <div className="text-sm">
                            <span className="text-theme-tertiary">Hash:</span>
                            <span className="font-mono ml-1">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-4)}</span>
                        </div>
                    )}

                    {tx.error && (
                        <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
                            {tx.error.message}
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

// Empty state component - reusable
const EmptyState = ({ title, message }: { title: string, message: string }) => (
    <div className="p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-theme-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-theme-secondary">{message}</p>
    </div>
);

// Loading component - reusable
const Loading = () => (
    <div className="p-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full" role="status">
            <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2 text-theme-secondary">Loading transaction history...</p>
    </div>
);

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ className = "" }) => {
    const { transactions, loadTransactions, clearTransaction } = useTransactionStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            await loadTransactions();
            setIsLoading(false);
        };

        fetchTransactions();
    }, [loadTransactions]);

    // Handle transaction clearing with confirmation
    const handleClearTransaction = (txId: string) => {
        if (confirm("Are you sure you want to remove this transaction from history?")) {
            clearTransaction(txId);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (transactions.length === 0) {
        return (
            <EmptyState
                title="No Transactions Yet"
                message="Your transaction history will appear here once you start making transactions."
            />
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {transactions.map((tx) => (
                <TransactionItem
                    key={tx.id}
                    tx={tx}
                    onClear={handleClearTransaction}
                />
            ))}
        </div>
    );
};

export default TransactionHistory;