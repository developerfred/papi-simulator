"use client";

import React, { useEffect } from "react";
import Card from "@/components/ui/Card";
import { useTransaction } from "@/hooks/useTransaction";
import { StatusProgress } from "@/components/ui/StatusDisplay";
import { formatDistance } from "date-fns";

interface TransactionStatusProps {
  transactionId: string;
  onComplete?: () => void;
  className?: string;
}

const DetailField: React.FC<{ label: string; value: string; mono?: boolean }> = ({ 
  label, value, mono = false 
}) => (
  <div className="pt-2">
    <div className="text-sm mb-1">{label}:</div>
    <div className={`${mono ? 'font-mono' : ''} text-xs break-all p-2 rounded bg-surface-variant`}>
      {value}
    </div>
  </div>
);

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  transactionId, onComplete, className = ""
}) => {
  const { transaction, isIdle, isFinalized, isError } = useTransaction(transactionId);

  useEffect(() => {
    if ((isFinalized || isError) && onComplete) onComplete();
  }, [isFinalized, isError, onComplete]);

  if (isIdle && !transaction.txHash) return null;

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-4">
        <StatusProgress status={transaction.status} />
        <div className="text-sm text-theme-tertiary">{formatTime(transaction.timestamp)}</div>
        
        {transaction.txHash && <DetailField label="TX Hash" value={transaction.txHash} mono />}
        {transaction.blockInfo?.blockHash && (
          <DetailField label="Block Hash" value={transaction.blockInfo.blockHash} mono />
        )}
        {transaction.error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {transaction.error.message}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionStatus;

