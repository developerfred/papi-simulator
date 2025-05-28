// components/TransactionStatus.tsx

import React from "react";
import { TxStatus } from "../types/transaction.types";
import { TX_STATUS_CONFIG } from "../constants/presets";

interface TransactionStatusProps {
    txHash: string;
    txStatus: TxStatus;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = React.memo(({
    txHash,
    txStatus
}) => {
    const statusConfig = txStatus ? TX_STATUS_CONFIG[txStatus] || TX_STATUS_CONFIG.default : TX_STATUS_CONFIG.default;

    return (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
                <span className="font-medium">Hash:</span>
                <code className="ml-2 text-xs bg-white px-2 py-1 rounded">{txHash}</code>
            </div>
            <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.label}
                </span>
            </div>
        </div>
    );
});