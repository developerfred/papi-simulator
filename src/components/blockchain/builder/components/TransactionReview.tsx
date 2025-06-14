/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from "react";
import { XCM_DESTINATIONS, XCM_ASSETS } from "../constants/presets";

interface TransactionReviewProps {
    senderAddress: string;
    pallet: string;
    call: string;
    args: Record<string, any>;
    estimatedFee: string | null;
    presetId?: string;
}

export const TransactionReview: React.FC<TransactionReviewProps> = React.memo(({
    senderAddress,
    pallet,
    call,
    args,
    estimatedFee,
    presetId
}) => {

    
    const renderXcmDetails = () => {
        if (!presetId?.startsWith('xcm')) return null;

        const destChain = args.dest ? XCM_DESTINATIONS[args.dest as keyof typeof XCM_DESTINATIONS] : null;
        const assetInfo = args.assets ? (() => {
            const [assetKey, amount] = args.assets.split('|');
            const asset = XCM_ASSETS[assetKey as keyof typeof XCM_ASSETS];
            return { key: assetKey, amount, asset };
        })() : null;

        return (
            <div className="mt-6 p-5 rounded-xl
                          bg-gradient-to-br from-network-primary/5 to-network-primary/10
                          border border-network-primary/20
                          hover:border-network-primary/30 transition-all duration-300
                          dark:from-network-primary/10 dark:to-network-primary/5
                          dark:border-network-primary/30 dark:hover:border-network-primary/40">

                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-network-primary/20 
                                  flex items-center justify-center
                                  group-hover:bg-network-primary/30 transition-colors duration-300">
                        <svg className="w-4 h-4 text-network-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <h5 className="font-semibold text-network-primary text-lg">XCM Transfer Details</h5>
                </div>

                <div className="space-y-4">
                    {destChain && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                            <span className="font-medium text-theme-primary min-w-[140px]">Destination Chain:</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-theme-secondary">{destChain.name}</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md 
                                               bg-theme-surface-variant text-theme-tertiary text-xs font-medium">
                                    Para ID: {destChain.paraId}
                                </span>
                            </div>
                        </div>
                    )}

                    {args.beneficiary && (
                        <div className="flex flex-col space-y-2">
                            <span className="font-medium text-theme-primary">Beneficiary:</span>
                            <code className="text-xs font-mono bg-theme-surface border border-theme 
                                           px-3 py-2 rounded-lg text-theme-secondary
                                           break-all select-all
                                           hover:bg-theme-surface-variant transition-colors duration-200">
                                {args.beneficiary}
                            </code>
                        </div>
                    )}

                    {assetInfo && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                            <span className="font-medium text-theme-primary min-w-[140px]">Asset Transfer:</span>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-network-primary">
                                    {assetInfo.amount}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md 
                                               bg-network-primary/10 text-network-primary text-sm font-medium">
                                    {assetInfo.asset?.symbol || assetInfo.key}
                                </span>
                            </div>
                        </div>
                    )}

                    {args.weightLimit && args.weightLimit !== 'Unlimited' && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                            <span className="font-medium text-theme-primary min-w-[140px]">Weight Limit:</span>
                            <span className="text-theme-secondary font-mono text-sm">
                                {args.weightLimit} ref_time
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-theme-surface border border-theme rounded-xl p-6 space-y-6
                      shadow-sm hover:shadow-md transition-all duration-300
                      dark:shadow-lg dark:hover:shadow-xl
                      network-transition">

            {/* Header Section */}
            <div className="flex items-center space-x-3 pb-4 border-b border-theme">
                <div className="w-10 h-10 rounded-lg bg-theme-surface-variant 
                              flex items-center justify-center">
                    <svg className="w-5 h-5 text-network-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-semibold text-theme-primary text-lg">Transaction Review</h4>
                    <p className="text-theme-tertiary text-sm">Verify transaction details before signing</p>
                </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                    <span className="font-medium text-theme-primary">From Address:</span>
                    <code className="text-sm font-mono bg-theme-surface-variant border border-theme 
                                   px-3 py-2 rounded-lg text-theme-secondary
                                   break-all select-all
                                   hover:bg-theme-surface hover:border-network-primary/30 
                                   transition-all duration-200">
                        {senderAddress}
                    </code>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                    <span className="font-medium text-theme-primary min-w-[120px]">Transaction:</span>
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg 
                                       bg-network-primary/10 text-network-primary font-semibold">
                            {pallet}
                        </span>
                        <span className="text-theme-tertiary">•</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg 
                                       bg-theme-surface-variant text-theme-secondary font-medium">
                            {call}
                        </span>
                    </div>
                </div>

                {estimatedFee && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                        <span className="font-medium text-theme-primary min-w-[120px]">Estimated Fee:</span>
                        <span className="font-semibold text-network-primary">{estimatedFee}</span>
                    </div>
                )}
            </div>

            {/* XCM Details */}
            {renderXcmDetails()}

            {/* Raw Arguments Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-theme-primary">Raw Arguments</span>
                    <button className="text-xs text-theme-tertiary hover:text-network-primary 
                                     transition-colors duration-200 px-2 py-1 rounded
                                     hover:bg-theme-surface-variant"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(args, null, 2))}>
                        Copy JSON
                    </button>
                </div>
                <div className="relative">
                    <pre className="text-xs font-mono bg-theme-surface-variant border border-theme 
                                   p-4 rounded-lg overflow-x-auto
                                   text-theme-secondary leading-relaxed
                                   hover:bg-theme-surface hover:border-network-primary/30 
                                   transition-all duration-300
                                   max-h-64 overflow-y-auto
                                   scrollbar-thin scrollbar-thumb-network-primary scrollbar-track-theme-surface-variant">
                        {JSON.stringify(args, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
});