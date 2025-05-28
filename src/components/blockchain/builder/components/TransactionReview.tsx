// components/TransactionReview.tsx

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

    // Enhanced display for XCM transactions
    const renderXcmDetails = () => {
        if (!presetId?.startsWith('xcm')) return null;

        const destChain = args.dest ? XCM_DESTINATIONS[args.dest as keyof typeof XCM_DESTINATIONS] : null;
        const assetInfo = args.assets ? (() => {
            const [assetKey, amount] = args.assets.split('|');
            const asset = XCM_ASSETS[assetKey as keyof typeof XCM_ASSETS];
            return { key: assetKey, amount, asset };
        })() : null;

        return (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">XCM Details</h5>
                <div className="space-y-2 text-sm">
                    {destChain && (
                        <div>
                            <span className="font-medium text-blue-800">Destination Chain:</span>
                            <span className="ml-2">{destChain.name} (Para ID: {destChain.paraId})</span>
                        </div>
                    )}
                    {args.beneficiary && (
                        <div>
                            <span className="font-medium text-blue-800">Beneficiary:</span>
                            <code className="ml-2 text-xs bg-white px-1 py-0.5 rounded">{args.beneficiary}</code>
                        </div>
                    )}
                    {assetInfo && (
                        <div>
                            <span className="font-medium text-blue-800">Asset:</span>
                            <span className="ml-2">{assetInfo.amount} {assetInfo.asset?.symbol || assetInfo.key}</span>
                        </div>
                    )}
                    {args.weightLimit && args.weightLimit !== 'Unlimited' && (
                        <div>
                            <span className="font-medium text-blue-800">Weight Limit:</span>
                            <span className="ml-2">{args.weightLimit} ref_time</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div><span className="font-medium">From:</span> {senderAddress}</div>
            <div><span className="font-medium">Transaction:</span> {pallet}.{call}</div>
            {estimatedFee && (
                <div><span className="font-medium">Estimated Fee:</span> {estimatedFee}</div>
            )}

            {renderXcmDetails()}

            <div>
                <span className="font-medium">Raw Arguments:</span>
                <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(args, null, 2)}
                </pre>
            </div>
        </div>
    );
});