/* eslint-disable react/display-name */

import React from "react";
import type { TxStatus } from "../types/transaction.types";
import { TX_STATUS_CONFIG } from "../constants/presets";

interface TransactionStatusProps {
    txHash: string;
    txStatus: TxStatus;
}


const StatusBadge: React.FC<{ status: TxStatus }> = ({ status }) => {    
    const config = status ? TX_STATUS_CONFIG[status] : TX_STATUS_CONFIG.default;
    return (
        <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg 
                       bg-theme-surface-variant border border-theme
                       transition-all duration-200 hover:border-network-primary/30">
            <div className={`w-2 h-2 rounded-full ${config.bg} animate-pulse`} />
            <span className={`font-medium text-sm ${config.text}`}>
                {config.label}
            </span>
        </span>
    );
};


const HashDisplay: React.FC<{ hash: string }> = ({ hash }) => (
    <div className="flex flex-col space-y-2">
        <span className="font-medium text-theme-primary text-sm">Transaction Hash:</span>
        <code className="text-xs font-mono bg-theme-surface-variant border border-theme 
                       px-3 py-2 rounded-lg text-theme-secondary
                       break-all select-all cursor-pointer
                       hover:bg-theme-surface hover:border-network-primary/30 
                       transition-all duration-200 group"
            onClick={() => navigator.clipboard.writeText(hash)}
            title="Click to copy">
            {hash}
            <span className="ml-2 opacity-0 group-hover:opacity-100 text-network-primary 
                           transition-opacity duration-200">
                📋
            </span>
        </code>
    </div>
);

export const TransactionStatus: React.FC<TransactionStatusProps> = React.memo(({
    txHash,
    txStatus
}) => {
    return (
        <div className="bg-theme-surface border border-theme rounded-xl p-5 space-y-4
                      shadow-sm hover:shadow-md transition-all duration-300
                      dark:shadow-lg dark:hover:shadow-xl network-transition">

            
            <div className="flex items-center space-x-3 pb-3 border-b border-theme">
                <div className="w-8 h-8 rounded-lg bg-theme-surface-variant 
                              flex items-center justify-center">
                    <svg className="w-4 h-4 text-network-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h4 className="font-semibold text-theme-primary">Transaction Status</h4>
            </div>

            
            <div className="space-y-4">
                <HashDisplay hash={txHash} />

                <div className="flex items-center justify-between">
                    <span className="font-medium text-theme-primary text-sm">Current Status:</span>
                    <StatusBadge status={txStatus} />
                </div>
            </div>
        </div>
    );
});