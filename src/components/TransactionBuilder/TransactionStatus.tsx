"use client";

import type React from "react";
import { useEffect } from "react";
import Card from "@/components/ui/Card";
import { useTransaction } from "@/hooks/useTransaction";
import { formatDistance } from "date-fns";
import { motion } from "framer-motion";

interface TransactionStatusProps {
    transactionId: string;
    onComplete?: () => void;
    className?: string;
}

// Define visual mapping for transaction statuses in a single place
const STATUS_CONFIG = {
    idle: { color: "#9ca3af", label: "Not Started", icon: "circle", progress: 0 },
    preparing: { color: "#6366f1", label: "Preparing", icon: "loader", progress: 15 },
    signed: { color: "#8b5cf6", label: "Signed", icon: "edit", progress: 35 },
    broadcasting: { color: "#3b82f6", label: "Broadcasting", icon: "radio", progress: 50 },
    inBlock: { color: "#0ea5e9", label: "In Block", icon: "box", progress: 75 },
    finalized: { color: "#10b981", label: "Finalized", icon: "check-circle", progress: 100 },
    error: { color: "#ef4444", label: "Error", icon: "x-circle", progress: 100 },
};

// Icons component to reduce duplication
const StatusIcon = ({ type }: { type: string }) => {
    const iconMap = {
        "check-circle": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        ),
        "x-circle": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        ),
        "loader": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
        ),
        "radio": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
            </svg>
        ),
        "box": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
        ),
        "edit": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        ),
        "circle": (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
        ),
    };

    return iconMap[type] || iconMap.circle;
};

// Format timestamp for display
const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    try {
        return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch {
        return "N/A";
    }
};

// Transaction detail field component
const DetailField = ({ label, value, monospace = false }: { label: string, value: string, monospace?: boolean }) => (
    <div className="pt-2">
        <div className="text-sm mb-1">{label}:</div>
        <div className={`${monospace ? 'font-mono' : ''} text-xs break-all p-2 rounded bg-surface-variant`}>
            {value}
        </div>
    </div>
);

const TransactionStatus: React.FC<TransactionStatusProps> = ({
    transactionId,
    onComplete,
    className = ""
}) => {
    const { transaction, isIdle, isFinalized, isError } = useTransaction(transactionId);

    // Call onComplete callback when transaction is finalized or errored
    useEffect(() => {
        if ((isFinalized || isError) && onComplete) {
            onComplete();
        }
    }, [isFinalized, isError, onComplete]);

    // If idle and no transaction, don't show anything
    if (isIdle && !transaction.txHash) {
        return null;
    }

    const status = transaction.status;
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

    return (
        <Card className={className}>
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div style={{ color: config.color }}>
                        <StatusIcon type={config.icon} />
                    </div>
                    <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-sm text-theme-tertiary">
                            {formatTime(transaction.timestamp)}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: config.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${config.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Transaction details */}
                {transaction.txHash && (
                    <DetailField label="Transaction Hash" value={transaction.txHash} monospace={true} />
                )}

                {/* Block information */}
                {transaction.blockInfo?.blockHash && (
                    <DetailField label="Block Hash" value={transaction.blockInfo.blockHash} monospace={true} />
                )}

                {/* Error message */}
                {transaction.error && (
                    <div className="pt-2">
                        <div className="text-sm mb-1 text-red-500">Error:</div>
                        <div className="font-mono text-xs break-all p-2 rounded bg-red-50 text-red-500">
                            {transaction.error.message}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TransactionStatus;